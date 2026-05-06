import {
    community as defaultCommunityItems,
    communityNotices as defaultCommunityNotices,
    type CommunityComment,
    type CommunityItem,
    type CommunityNotice,
    type Locale,
} from "@/lib/bluewolf-data";
import { normalizeCmsImageList } from "@/lib/cms-image";

export type CmsCommunityContent = {
    items: Record<Locale, CommunityItem[]>;
    notices: Record<Locale, CommunityNotice[]>;
};

function today() {
    return new Date().toISOString().slice(0, 10);
}

function normalizeComment(input: Partial<CommunityComment> | undefined): CommunityComment {
    return {
        author: input?.author?.trim() || "BlueWolf",
        text: input?.text?.trim() || "",
        date: input?.date?.trim() || today(),
    };
}

function normalizeNotice(
    input: Partial<CommunityNotice> | undefined,
    fallbackId: number
): CommunityNotice {
    return {
        id: Number.isFinite(Number(input?.id)) ? Number(input?.id) : fallbackId,
        title: input?.title?.trim() || "",
        summary: input?.summary?.trim() || "",
        date: input?.date?.trim() || today(),
        href: input?.href?.trim() || undefined,
        important: Boolean(input?.important),
    };
}

function normalizeItem(input: Partial<CommunityItem> | undefined, fallbackId: number): CommunityItem {
    const type =
        input?.type === "review" || input?.type === "mate" || input?.type === "qna"
            ? input.type
            : "review";

    return {
        id: Number.isFinite(Number(input?.id)) ? Number(input?.id) : fallbackId,
        type,
        author: input?.author?.trim() || "",
        authorId: input?.authorId?.trim().toLowerCase() || undefined,
        date: input?.date?.trim() || today(),
        text: input?.text?.trim() || "",
        likes: Number.isFinite(Number(input?.likes)) ? Number(input?.likes) : 0,
        rating:
            type === "review"
                ? Math.min(
                      5,
                      Math.max(
                          1,
                          Number.isFinite(Number(input?.rating)) ? Number(input?.rating) : 5
                      )
                  )
                : undefined,
        tourTitle: input?.tourTitle?.trim() || undefined,
        travelDate: type === "mate" ? input?.travelDate?.trim() || undefined : undefined,
        maxPeople:
            type === "mate" && Number.isFinite(Number(input?.maxPeople))
                ? Math.max(1, Number(input?.maxPeople))
                : undefined,
        currentPeople:
            type === "mate" && Number.isFinite(Number(input?.currentPeople))
                ? Math.max(0, Number(input?.currentPeople))
                : undefined,
        travelRegion: type === "mate" ? input?.travelRegion?.trim() || undefined : undefined,
        answered: type === "qna" ? Boolean(input?.answered) : undefined,
        photos:
            type === "review" && input?.photos?.length
                ? normalizeCmsImageList(input.photos, input.photos.length)
                : undefined,
        comments: (input?.comments ?? []).map((comment) => normalizeComment(comment)),
    };
}

function cloneLocaleItems(locale: Locale) {
    return defaultCommunityItems[locale].map((item) => normalizeItem(item, item.id));
}

function cloneLocaleNotices(locale: Locale) {
    return defaultCommunityNotices[locale].map((notice) => normalizeNotice(notice, notice.id));
}

export const defaultCmsCommunityContent: CmsCommunityContent = {
    items: {
        ko: cloneLocaleItems("ko"),
        ja: cloneLocaleItems("ja"),
        en: cloneLocaleItems("en"),
    },
    notices: {
        ko: cloneLocaleNotices("ko"),
        ja: cloneLocaleNotices("ja"),
        en: cloneLocaleNotices("en"),
    },
};

export function normalizeCmsCommunityContent(
    input?: Partial<CmsCommunityContent> | null
): CmsCommunityContent {
    const normalizedItems = (["ko", "ja", "en"] as const).reduce<Record<Locale, CommunityItem[]>>(
        (acc, locale) => {
            const source = input?.items?.[locale];
            acc[locale] =
                Array.isArray(source) && source.length > 0
                    ? source.map((item, index) => normalizeItem(item, index + 1))
                    : defaultCmsCommunityContent.items[locale].map((item) => ({ ...item }));
            return acc;
        },
        {} as Record<Locale, CommunityItem[]>
    );

    const normalizedNotices = (
        ["ko", "ja", "en"] as const
    ).reduce<Record<Locale, CommunityNotice[]>>((acc, locale) => {
        const source = input?.notices?.[locale];
        acc[locale] =
            Array.isArray(source) && source.length > 0
                ? source.map((notice, index) => normalizeNotice(notice, index + 1))
                : defaultCmsCommunityContent.notices[locale].map((notice) => ({ ...notice }));
        return acc;
    }, {} as Record<Locale, CommunityNotice[]>);

    return {
        items: normalizedItems,
        notices: normalizedNotices,
    };
}
