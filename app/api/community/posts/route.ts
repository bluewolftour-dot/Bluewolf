import { NextResponse } from "next/server";
import { type CommunityTab, type Locale } from "@/lib/bluewolf-data";
import { getCurrentKstIso } from "@/lib/kst-time";
import { getCmsCommunityContent, saveCmsCommunityContent } from "@/lib/cms-crm-db";
import { normalizeCmsImageList } from "@/lib/cms-image";

export const runtime = "nodejs";

type CreateCommunityPostRequest = {
    locale?: Locale;
    type?: Exclude<CommunityTab, "all">;
    author?: string;
    text?: string;
    tourTitle?: string;
    travelDate?: string;
    maxPeople?: number;
    rating?: number;
    photos?: string[];
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

export async function POST(request: Request) {
    const body = (await request.json()) as CreateCommunityPostRequest;

    if (!isLocale(body.locale)) {
        return badRequest("INVALID_LOCALE");
    }

    if (!isPostType(body.type)) {
        return badRequest("INVALID_TYPE");
    }

    const text = body.text?.trim() ?? "";
    if (!text) {
        return badRequest("TEXT_REQUIRED");
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
    const current = getCmsCommunityContent();
    const nextId =
        current.items[locale].reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

    const createdItem = {
        id: nextId,
        type,
        author: body.author?.trim() || "BlueWolf Guest",
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

    const saved = saveCmsCommunityContent({
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
