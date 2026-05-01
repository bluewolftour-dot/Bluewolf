import { type Locale } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

type CommunityTourRef = {
    id: number;
    title: Record<Locale, string>;
};

export function normalizeCommunityTourTitle(value: string) {
    return value
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[·ㆍ・/&.-]/g, "");
}

export function getCommunityTourHref(
    tourTitle: string | undefined,
    locale: Locale,
    tourItems: CommunityTourRef[]
) {
    if (!tourTitle) {
        return withLocaleQuery("/tours", locale);
    }

    const normalizedTarget = normalizeCommunityTourTitle(tourTitle);
    const matchedTour = tourItems.find((tour) => {
        const localizedTitle = tour.title[locale] ?? tour.title.ko ?? "";
        const normalizedTourTitle = normalizeCommunityTourTitle(localizedTitle);

        return (
            normalizedTourTitle === normalizedTarget
            || normalizedTarget.includes(normalizedTourTitle)
            || normalizedTourTitle.includes(normalizedTarget)
        );
    });

    return matchedTour
        ? withLocaleQuery(`/tours/${matchedTour.id}`, locale)
        : withLocaleQuery("/tours", locale);
}
