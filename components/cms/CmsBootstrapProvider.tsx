"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Tour } from "@/lib/bluewolf-data";
import type { CmsCommunityContent } from "@/lib/cms-community";
import type { CmsHomeContent } from "@/lib/cms-home";
import type { CmsTourOptionsContent } from "@/lib/cms-tour-options";
import type { CmsTourRegionCardsContent } from "@/lib/cms-tour-region-cards";
import type { CmsTourCustomizeContent } from "@/lib/cms-tour-customize";
import type { CmsTourThemesContent } from "@/lib/cms-tour-themes";

export type CmsBootstrapPayload = {
    homeContent: CmsHomeContent | null;
    communityContent: CmsCommunityContent | null;
    tours: Tour[] | null;
    tourRegionCardsContent: CmsTourRegionCardsContent | null;
    tourOptionsContent: CmsTourOptionsContent | null;
    tourCustomizeContent: CmsTourCustomizeContent | null;
    tourThemesContent: CmsTourThemesContent | null;
};

const CmsBootstrapContext = createContext<CmsBootstrapPayload | null>(null);

export function CmsBootstrapProvider({
    initialData,
    children,
}: {
    initialData: CmsBootstrapPayload;
    children: ReactNode;
}) {
    return <CmsBootstrapContext.Provider value={initialData}>{children}</CmsBootstrapContext.Provider>;
}

export function useCmsBootstrap() {
    return useContext(CmsBootstrapContext);
}
