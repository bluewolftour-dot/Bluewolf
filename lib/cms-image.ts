import { type Tour } from "@/lib/bluewolf-types";

export const CMS_NULL_IMAGE = "/images/null.png";
export const CMS_UPLOAD_PREFIX = "/uploads/cms/";
export const COMMUNITY_UPLOAD_PREFIX = "/uploads/community/";

function isSupabasePublicUploadImagePath(value: string) {
    return getSupabasePublicUploadObjectPath(value) !== null;
}

function getSupabasePublicUploadObjectPath(value: string) {
    try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") return null;

        const marker = "/storage/v1/object/public/";
        const markerIndex = url.pathname.indexOf(marker);
        if (markerIndex < 0) return null;

        const objectPath = decodeURIComponent(url.pathname.slice(markerIndex + marker.length))
            .split("/")
            .slice(1)
            .join("/");

        return objectPath.startsWith("cms/") || objectPath.startsWith("community/") ? objectPath : null;
    } catch {
        return null;
    }
}

export function isCmsUploadImagePath(value?: string | null) {
    const trimmed = value?.trim() ?? "";
    return (
        trimmed.startsWith(CMS_UPLOAD_PREFIX) ||
        trimmed.startsWith(COMMUNITY_UPLOAD_PREFIX) ||
        isSupabasePublicUploadImagePath(trimmed)
    );
}

export function normalizeCmsImagePath(value?: string | null) {
    const trimmed = value?.trim() ?? "";
    if (!trimmed) return CMS_NULL_IMAGE;
    if (trimmed === CMS_NULL_IMAGE) return CMS_NULL_IMAGE;
    const supabaseObjectPath = getSupabasePublicUploadObjectPath(trimmed);
    if (supabaseObjectPath) return `/uploads/${supabaseObjectPath}`;
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
