"use client";

import { useEffect, useMemo, useState } from "react";
import { useCmsBootstrap } from "@/components/cms/CmsBootstrapProvider";
import { type Locale } from "@/lib/bluewolf-data";
import {
    defaultCmsTourCustomizeContent,
    localizeCmsTourCustomizeContent,
    normalizeCmsTourCustomizeContent,
    type CmsTourCustomizeContent,
} from "@/lib/cms-tour-customize";

export function useCmsTourCustomize(locale: Locale) {
    const cmsBootstrap = useCmsBootstrap();
    const hasInitialTourCustomize = Boolean(cmsBootstrap?.tourCustomizeContent);
    const [tourCustomizeContent, setTourCustomizeContent] = useState<CmsTourCustomizeContent>(
        normalizeCmsTourCustomizeContent(
            cmsBootstrap?.tourCustomizeContent ?? defaultCmsTourCustomizeContent
        )
    );
    const [loaded, setLoaded] = useState(hasInitialTourCustomize);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/tour-customize", {
                    cache: "no-store",
                });
                if (!response.ok) return;

                const data = (await response.json()) as {
                    tourCustomize: CmsTourCustomizeContent;
                };
                if (!active) return;
                setTourCustomizeContent(normalizeCmsTourCustomizeContent(data.tourCustomize));
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

    const localizedRegions = useMemo(
        () => localizeCmsTourCustomizeContent(tourCustomizeContent, locale),
        [locale, tourCustomizeContent]
    );

    return {
        tourCustomizeContent,
        localizedRegions,
        loaded,
    };
}
