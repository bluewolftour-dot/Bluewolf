"use client";

import { useEffect, useState } from "react";
import { useCmsBootstrap } from "@/components/cms/CmsBootstrapProvider";
import { defaultCmsHomeContent, normalizeCmsHomeContent, type CmsHomeContent } from "@/lib/cms-home";

export function useCmsHomeContent() {
    const cmsBootstrap = useCmsBootstrap();
    const hasInitialHomeContent = Boolean(cmsBootstrap?.homeContent);
    const [homeContent, setHomeContent] = useState<CmsHomeContent>(() =>
        normalizeCmsHomeContent(cmsBootstrap?.homeContent ?? defaultCmsHomeContent)
    );
    const [loaded, setLoaded] = useState(hasInitialHomeContent);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/home", { cache: "no-store" });
                if (!response.ok) return;

                const data = (await response.json()) as { home: CmsHomeContent };
                if (!active) return;
                setHomeContent(normalizeCmsHomeContent(data.home));
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

    return { homeContent, loaded };
}
