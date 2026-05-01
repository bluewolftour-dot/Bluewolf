"use client";

import { useEffect, useState } from "react";
import { useCmsBootstrap } from "@/components/cms/CmsBootstrapProvider";
import {
    defaultCmsTourRegionCardsContent,
    normalizeCmsTourRegionCardsContent,
    type CmsTourRegionCardsContent,
} from "@/lib/cms-tour-region-cards";

export function useCmsTourRegionCards() {
    const cmsBootstrap = useCmsBootstrap();
    const hasInitialRegionCards = Boolean(cmsBootstrap?.tourRegionCardsContent);
    const [regionCardsContent, setRegionCardsContent] = useState<CmsTourRegionCardsContent>(
        normalizeCmsTourRegionCardsContent(
            cmsBootstrap?.tourRegionCardsContent ?? defaultCmsTourRegionCardsContent
        )
    );
    const [loaded, setLoaded] = useState(hasInitialRegionCards);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/tour-region-cards", { cache: "no-store" });
                if (!response.ok) return;

                const data = (await response.json()) as { regionCards: CmsTourRegionCardsContent };
                if (active) {
                    setRegionCardsContent(normalizeCmsTourRegionCardsContent(data.regionCards));
                }
            } catch {
                // Keep default region card images when the CMS API is unavailable.
            } finally {
                if (active) {
                    setLoaded(true);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return {
        regionCardsContent,
        loaded,
    };
}
