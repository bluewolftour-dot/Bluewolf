"use client";

import { useMemo } from "react";
import { type Locale } from "@/lib/bluewolf-data";
import { type CmsCommunityContent } from "@/lib/cms-community";

export function useHomeCommunity(communityContent: CmsCommunityContent, lang: Locale) {
    const notices = communityContent.notices[lang].slice(0, 3);
    const reviews = communityContent.items[lang].filter((item) => item.type === "review");
    const loopReviews = useMemo(
        () => {
            if (reviews.length <= 1) return reviews;

            const minimumCards = 12;
            const repeatCount = Math.max(2, Math.ceil(minimumCards / reviews.length));

            return Array.from({ length: repeatCount }, () => reviews).flat();
        },
        [reviews]
    );

    return {
        notices,
        reviews,
        loopReviews,
    };
}
