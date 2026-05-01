"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useCmsBootstrap } from "@/components/cms/CmsBootstrapProvider";
import {
    defaultCmsCommunityContent,
    normalizeCmsCommunityContent,
    type CmsCommunityContent,
} from "@/lib/cms-community";

export function useCmsCommunityContent() {
    const cmsBootstrap = useCmsBootstrap();
    const hasInitialCommunity = Boolean(cmsBootstrap?.communityContent);
    const [communityContent, setCommunityContent] = useState<CmsCommunityContent>(() =>
        normalizeCmsCommunityContent(cmsBootstrap?.communityContent ?? defaultCmsCommunityContent)
    );
    const [loaded, setLoaded] = useState(hasInitialCommunity);

    const refreshCommunityContent = useCallback(async () => {
        const response = await fetch("/api/cms/community", { cache: "no-store" });
        if (!response.ok) {
            setLoaded(true);
            return null;
        }

        const data = (await response.json()) as { community: CmsCommunityContent };
        const normalized = normalizeCmsCommunityContent(data.community);
        setCommunityContent(normalized);
        setLoaded(true);
        return normalized;
    }, []);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/community", { cache: "no-store" });
                if (!response.ok) return;

                const data = (await response.json()) as { community: CmsCommunityContent };
                if (!active) return;
                setCommunityContent(normalizeCmsCommunityContent(data.community));
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

    const applyCommunityContent: Dispatch<SetStateAction<CmsCommunityContent>> = useCallback(
        (nextState) => {
            setCommunityContent((previous) =>
                normalizeCmsCommunityContent(
                    typeof nextState === "function" ? nextState(previous) : nextState
                )
            );
            setLoaded(true);
        },
        []
    );

    return {
        communityContent,
        loaded,
        setCommunityContent: applyCommunityContent,
        refreshCommunityContent,
    };
}
