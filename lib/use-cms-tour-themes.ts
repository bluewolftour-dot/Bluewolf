"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCmsBootstrap } from "@/components/cms/CmsBootstrapProvider";
import { type Locale } from "@/lib/bluewolf-data";
import {
    defaultCmsTourThemesContent,
    getCmsTourThemeLabel,
    getCmsTourThemeOptions,
    normalizeCmsTourThemesContent,
    type CmsTourThemesContent,
} from "@/lib/cms-tour-themes";

export function useCmsTourThemes(locale: Locale) {
    const cmsBootstrap = useCmsBootstrap();
    const hasInitialThemes = Boolean(cmsBootstrap?.tourThemesContent);
    const [tourThemesContent, setTourThemesContent] = useState<CmsTourThemesContent>(() =>
        normalizeCmsTourThemesContent(
            cmsBootstrap?.tourThemesContent ?? defaultCmsTourThemesContent
        )
    );
    const [loaded, setLoaded] = useState(hasInitialThemes);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/tour-themes", { cache: "no-store" });
                if (!response.ok) return;

                const data = (await response.json()) as { tourThemes: CmsTourThemesContent };
                if (!active) return;
                setTourThemesContent(normalizeCmsTourThemesContent(data.tourThemes));
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

    const themeOptions = useMemo(
        () => getCmsTourThemeOptions(tourThemesContent, locale),
        [locale, tourThemesContent]
    );

    const resolveThemeLabel = useCallback(
        (themeKey: string) => getCmsTourThemeLabel(tourThemesContent, themeKey, locale),
        [locale, tourThemesContent]
    );

    return {
        tourThemesContent,
        themeOptions,
        resolveThemeLabel,
        loaded,
    };
}

