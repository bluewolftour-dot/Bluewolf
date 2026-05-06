import { NextResponse } from "next/server";
import { type CommunityTab, type Locale } from "@/lib/bluewolf-data";
import { getCurrentKstIso } from "@/lib/kst-time";
import { getCmsCommunityContent, saveCmsCommunityContent } from "@/lib/cms-crm-db";
import { normalizeCmsImageList } from "@/lib/cms-image";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";

export const runtime = "nodejs";

const SESSION_COOKIE = "bluewolf_session";

type CreateCommunityPostRequest = {
    locale?: Locale;
    type?: Exclude<CommunityTab, "all">;
    text?: string;
    tourTitle?: string;
    travelDate?: string;
    maxPeople?: number;
    rating?: number;
    photos?: string[];
};

type UpdateCommunityPostRequest = {
    locale?: Locale;
    id?: number;
    text?: string;
    tourTitle?: string;
    travelDate?: string;
    maxPeople?: number;
    rating?: number;
};

function isLocale(value: string | undefined): value is Locale {
    return value === "ko" || value === "ja" || value === "en";
}

function isPostType(value: string | undefined): value is Exclude<CommunityTab, "all"> {
    return value === "review" || value === "mate" || value === "qna";
}

function badRequest(error: string) {
    return NextResponse.json({ error }, { status: 400 });
}

function canEditPost(item: { author: string; authorId?: string }, user: { id: string; name: string }) {
    const userId = user.id.trim().toLowerCase();
    const userName = user.name.trim();
    return (
        item.authorId?.trim().toLowerCase() === userId ||
        item.author.trim().toLowerCase() === userId ||
        item.author.trim() === userName
    );
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const body = (await request.json()) as CreateCommunityPostRequest;

    if (!isLocale(body.locale)) {
        return badRequest("INVALID_LOCALE");
    }

    if (!isPostType(body.type)) {
        return badRequest("INVALID_TYPE");
    }

    const text = body.text?.trim() ?? "";
    if (!text || text.length < 5) {
        return badRequest("TEXT_TOO_SHORT");
    }
    if (text.length > 2000) {
        return badRequest("TEXT_TOO_LONG");
    }

    const type = body.type;
    const tourTitle = body.tourTitle?.trim() ?? "";

    if ((type === "review" || type === "mate") && !tourTitle) {
        return badRequest("TOUR_TITLE_REQUIRED");
    }

    if (type === "mate" && !(body.travelDate?.trim())) {
        return badRequest("TRAVEL_DATE_REQUIRED");
    }

    const locale = body.locale;
    const current = await getCmsCommunityContent();
    const nextId =
        current.items[locale].reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

    const createdItem = {
        id: nextId,
        type,
        author: user.name || user.id, // 세션 정보 사용
        authorId: user.id,
        date: getCurrentKstIso(),
        text,
        likes: 0,
        comments: [],
        rating:
            type === "review"
                ? Math.min(5, Math.max(1, Number(body.rating ?? 5)))
                : undefined,
        tourTitle: type === "review" || type === "mate" ? tourTitle : undefined,
        travelDate: type === "mate" ? body.travelDate?.trim() || undefined : undefined,
        maxPeople:
            type === "mate"
                ? Math.max(2, Number.isFinite(Number(body.maxPeople)) ? Number(body.maxPeople) : 4)
                : undefined,
        currentPeople: type === "mate" ? 1 : undefined,
        answered: type === "qna" ? false : undefined,
        photos:
            type === "review" && Array.isArray(body.photos) && body.photos.length > 0
                ? normalizeCmsImageList(body.photos, body.photos.length)
                : undefined,
    };

    const saved = await saveCmsCommunityContent({
        ...current,
        items: {
            ...current.items,
            [locale]: [createdItem, ...current.items[locale]],
        },
    });

    return NextResponse.json({
        item: saved.items[locale].find((item) => item.id === nextId) ?? createdItem,
        community: saved,
    });
}

export async function PATCH(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateCommunityPostRequest;

    if (!isLocale(body.locale)) {
        return badRequest("INVALID_LOCALE");
    }

    const id = Number(body.id);
    if (!Number.isFinite(id)) {
        return badRequest("INVALID_ID");
    }

    const text = body.text?.trim() ?? "";
    if (!text || text.length < 5) {
        return badRequest("TEXT_TOO_SHORT");
    }
    if (text.length > 2000) {
        return badRequest("TEXT_TOO_LONG");
    }

    const current = await getCmsCommunityContent();
    const localeItems = current.items[body.locale];
    const target = localeItems.find((item) => item.id === id);

    if (!target) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    if (!canEditPost(target, user)) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const tourTitle = body.tourTitle?.trim() ?? "";
    if ((target.type === "review" || target.type === "mate") && !tourTitle) {
        return badRequest("TOUR_TITLE_REQUIRED");
    }

    const travelDate = body.travelDate?.trim() ?? "";
    if (target.type === "mate" && !travelDate) {
        return badRequest("TRAVEL_DATE_REQUIRED");
    }

    if (target.type === "mate" && travelDate && !/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
        return badRequest("INVALID_TRAVEL_DATE");
    }

    const updatedItems = localeItems.map((item) => {
        if (item.id !== id) return item;

        return {
            ...item,
            text,
            authorId: item.authorId ?? user.id,
            rating:
                item.type === "review"
                    ? Math.min(5, Math.max(1, Number(body.rating ?? item.rating ?? 5)))
                    : item.rating,
            tourTitle: item.type === "review" || item.type === "mate" ? tourTitle : item.tourTitle,
            travelDate: item.type === "mate" ? travelDate : item.travelDate,
            maxPeople:
                item.type === "mate"
                    ? Math.max(2, Number.isFinite(Number(body.maxPeople)) ? Number(body.maxPeople) : item.maxPeople ?? 4)
                    : item.maxPeople,
        };
    });

    const saved = await saveCmsCommunityContent({
        ...current,
        items: {
            ...current.items,
            [body.locale]: updatedItems,
        },
    });

    return NextResponse.json({
        item: saved.items[body.locale].find((item) => item.id === id),
        community: saved,
    });
}
