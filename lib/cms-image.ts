import { type Tour } from "@/lib/bluewolf-data";

export const CMS_NULL_IMAGE = "/images/null.png";
export const CMS_UPLOAD_PREFIX = "/uploads/cms/";
export const COMMUNITY_UPLOAD_PREFIX = "/uploads/community/";

export function isCmsUploadImagePath(value?: string | null) {
    const trimmed = value?.trim() ?? "";
    return (
        trimmed.startsWith(CMS_UPLOAD_PREFIX) ||
        trimmed.startsWith(COMMUNITY_UPLOAD_PREFIX)
    );
}

export function normalizeCmsImagePath(value?: string | null) {
    const trimmed = value?.trim() ?? "";
    if (!trimmed) return CMS_NULL_IMAGE;
    if (trimmed === CMS_NULL_IMAGE) return CMS_NULL_IMAGE;
    if (isCmsUploadImagePath(trimmed)) return trimmed;
    return CMS_NULL_IMAGE;
}

export function createCmsImagePlaceholders(count: number) {
    return Array.from({ length: Math.max(count, 1) }, () => CMS_NULL_IMAGE);
}

export function normalizeCmsImageList(values: string[] | null | undefined, minCount = 1) {
    const source =
        Array.isArray(values) && values.length > 0
            ? values
            : createCmsImagePlaceholders(minCount);

    return source.map((value) => normalizeCmsImagePath(value));
}

export function normalizeCmsTourImages(tour: Tour): Tour {
    return {
        ...tour,
        heroImage: normalizeCmsImagePath(tour.heroImage),
        images: normalizeCmsImageList(tour.images, 3),
        detailImages: normalizeCmsImageList(tour.detailImages, 1),
    };
}
