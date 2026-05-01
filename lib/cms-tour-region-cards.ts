import { type Region } from "@/lib/bluewolf-data";
import { CMS_NULL_IMAGE, normalizeCmsImagePath } from "@/lib/cms-image";

export type CmsTourRegionCardsContent = {
    images: Record<Region, string>;
};

export const defaultCmsTourRegionCardsContent: CmsTourRegionCardsContent = {
    images: {
        south: CMS_NULL_IMAGE,
        north: CMS_NULL_IMAGE,
        central: CMS_NULL_IMAGE,
        west: CMS_NULL_IMAGE,
    },
};

export function normalizeCmsTourRegionCardsContent(
    input?: Partial<CmsTourRegionCardsContent> | null
): CmsTourRegionCardsContent {
    return {
        images: {
            south: normalizeCmsImagePath(input?.images?.south || defaultCmsTourRegionCardsContent.images.south),
            north: normalizeCmsImagePath(input?.images?.north || defaultCmsTourRegionCardsContent.images.north),
            central: normalizeCmsImagePath(input?.images?.central || defaultCmsTourRegionCardsContent.images.central),
            west: normalizeCmsImagePath(input?.images?.west || defaultCmsTourRegionCardsContent.images.west),
        },
    };
}
