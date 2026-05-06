import { NextResponse } from "next/server";
import { readOptionalEnv, readRequiredEnv } from "@/lib/env";
import { isSupabaseUploadStorageEnabled } from "@/lib/upload-storage";

export const runtime = "nodejs";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const IMAGE_MIME_TYPES: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

function isAllowedUploadObjectPath(pathParts: string[]) {
    if (pathParts.length < 2) return false;
    if (pathParts.some((part) => !part || part === "." || part === ".." || part.includes("\\"))) return false;

    const [scope] = pathParts;
    if (scope !== "cms" && scope !== "community") return false;

    const extension = pathParts[pathParts.length - 1]?.split(".").pop()?.toLowerCase();
    return Boolean(extension && IMAGE_EXTENSIONS.has(extension));
}

function getContentType(objectPath: string, fallback?: string | null) {
    if (fallback?.startsWith("image/")) return fallback;
    const extension = objectPath.split(".").pop()?.toLowerCase() ?? "";
    return IMAGE_MIME_TYPES[extension] ?? "application/octet-stream";
}

function getCacheRevalidateSeconds() {
    const seconds = Number(readOptionalEnv("BLUEWOLF_UPLOAD_CACHE_SECONDS") || 3600);
    return Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 3600;
}

export async function GET(_request: Request, context: { params: Promise<{ path?: string[] }> }) {
    const params = await context.params;
    const pathParts = params.path ?? [];

    if (!isAllowedUploadObjectPath(pathParts)) {
        return NextResponse.json({ error: "INVALID_UPLOAD_PATH" }, { status: 400 });
    }

    if (!isSupabaseUploadStorageEnabled()) {
        return NextResponse.json({ error: "UPLOAD_NOT_FOUND" }, { status: 404 });
    }

    const supabaseUrl = readRequiredEnv("SUPABASE_URL").replace(/\/+$/, "");
    const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const bucket = readRequiredEnv("SUPABASE_STORAGE_BUCKET");
    const objectPath = pathParts.map((part) => encodeURIComponent(part)).join("/");
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`, {
        headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
        },
        cache: "force-cache",
        next: { revalidate: getCacheRevalidateSeconds() },
    });

    if (!response.ok || !response.body) {
        return NextResponse.json({ error: "UPLOAD_NOT_FOUND" }, { status: response.status === 404 ? 404 : 502 });
    }

    const decodedObjectPath = pathParts.join("/");
    return new Response(response.body, {
        status: 200,
        headers: {
            "Content-Type": getContentType(decodedObjectPath, response.headers.get("content-type")),
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
    });
}
