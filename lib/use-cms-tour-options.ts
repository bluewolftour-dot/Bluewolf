"use client";

import { useEffect, useMemo, useState } from "react";
import { useCmsBootstrap } from "@/components/cms/CmsBootstrapProvider";
import { type Locale } from "@/lib/bluewolf-data";
import {
    defaultCmsTourOptionsContent,
    localizeTourOptions,
    normalizeCmsTourOptionsContent,
    type CmsTourOptionsContent,
} from "@/lib/cms-tour-options";

export function useCmsTourOptions(locale: Locale) {
    const cmsBootstrap = useCmsBootstrap();
    const hasInitialTourOptions = Boolean(cmsBootstrap?.tourOptionsContent);
    const [tourOptionsContent, setTourOptionsContent] = useState<CmsTourOptionsContent>(() =>
        normalizeCmsTourOptionsContent(cmsBootstrap?.tourOptionsContent ?? defaultCmsTourOptionsContent)
    );
    const [loaded, setLoaded] = useState(hasInitialTourOptions);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/tour-options", { cache: "no-store" });
                if (!response.ok) return;

                const data = (await response.json()) as { tourOptions: CmsTourOptionsContent };
                if (!active) return;
                setTourOptionsContent(normalizeCmsTourOptionsContent(data.tourOptions));
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

    const localizedOptions = useMemo(
        () => localizeTourOptions(tourOptionsContent, locale),
        [locale, tourOptionsContent]
    );

    return {
        tourOptionsContent,
        localizedOptions,
        loaded,
    };
}
