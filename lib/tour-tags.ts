import { type Locale, type Tour, type TourTagColorKey } from "@/lib/bluewolf-data";

export const tourTagColorOptions: Array<{
    value: TourTagColorKey;
    label: string;
    className: string;
}> = [
    { value: "rose", label: "파스텔 레드", className: "bg-rose-200 text-rose-800" },
    { value: "slate", label: "차분한 그레이", className: "bg-slate-800 text-white" },
    { value: "blue", label: "블루", className: "bg-blue-600 text-white" },
    { value: "sky", label: "하늘색", className: "bg-sky-100 text-sky-800" },
    { value: "emerald", label: "그린", className: "bg-emerald-100 text-emerald-800" },
    { value: "amber", label: "샌드", className: "bg-amber-100 text-amber-800" },
    { value: "violet", label: "프리미엄 퍼플", className: "bg-violet-100 text-violet-800" },
    { value: "cyan", label: "어드벤처 시안", className: "bg-cyan-100 text-cyan-800" },
];

const colorOptionMap = new Map(tourTagColorOptions.map((option) => [option.value, option]));

export function normalizeTourTags(tags: string[]) {
    const seen = new Set<string>();

    return tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .filter((tag) => {
            const key = tag.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

export function isBestTourTag(tag: string) {
    const normalized = tag.trim().toLowerCase();
    return ["베스트", "best", "人気", "人氣"].some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function isTourTagColorKey(value: string): value is TourTagColorKey {
    return tourTagColorOptions.some((option) => option.value === value);
}

export function getTourTagColorKey(tag: string, explicitColor?: string | null): TourTagColorKey {
    if (isBestTourTag(tag)) return "rose";
    if (explicitColor && isTourTagColorKey(explicitColor)) return explicitColor;

    const normalized = tag.trim().toLowerCase();
    if (/(별|星|star|night)/i.test(normalized)) return "slate";
    if (/(가이드|guide|案内|ガイド)/i.test(normalized)) return "blue";
    if (/(가족|family|ファミリー)/i.test(normalized)) return "emerald";
    if (/(가성비|실속|value|budget)/i.test(normalized)) return "amber";
    if (/(프리미엄|premium|プレミアム)/i.test(normalized)) return "violet";
    if (/(어드벤처|모험|adventure|アドベンチャー)/i.test(normalized)) return "cyan";
    if (/(입문|초보|new|beginner|starter)/i.test(normalized)) return "sky";

    return "blue";
}

export function getTourTagColorClassName(tag: string, explicitColor?: string | null) {
    return colorOptionMap.get(getTourTagColorKey(tag, explicitColor))?.className ?? "bg-blue-600 text-white";
}

export function getPrimaryTourBadgeTags(
    tour: Tour,
    locale: Locale,
    fallbacks: string[] = []
) {
    const tags = normalizeTourTags(tour.tags[locale]);
    if (tags.length > 0) return tags.slice(0, 2);
    return fallbacks.map((tag) => tag.trim()).filter(Boolean).slice(0, 2);
}

export function getSecondaryTourTags(tour: Tour, locale: Locale) {
    return normalizeTourTags(tour.tags[locale]).slice(2);
}
