import { randomUUID } from "node:crypto";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { readOptionalEnv, readRequiredEnv } from "@/lib/env";

const PUBLIC_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const DEFAULT_MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const IMAGE_EXTENSIONS = [".jpg", ".png", ".webp"] as const;

export type PublicUploadDirectory =
    | "community"
    | "cms/home"
    | "cms/tours"
    | "cms/tour-options"
    | "cms/tour-customize";

export type StoredUpload = {
    path: string;
    fileName: string;
    size: number;
};

type UploadStorageProvider = "local" | "supabase";

type SupabaseStorageListEntry = {
    name: string;
    id?: string | null;
    metadata?: unknown;
};

function normalizeImageExtension(filename: string, mimeType: string) {
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith(".png") || mimeType === "image/png") return ".png";
    if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || mimeType === "image/jpeg") return ".jpg";
    if (lowerName.endsWith(".webp") || mimeType === "image/webp") return ".webp";
    return null;
}

function assertSafeUploadDirectory(directory: PublicUploadDirectory) {
    const absoluteDirectory = path.join(PUBLIC_UPLOAD_ROOT, directory);
    const relative = path.relative(PUBLIC_UPLOAD_ROOT, absoluteDirectory);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error("Unsafe upload directory.");
    }

    return absoluteDirectory;
}

function hasValidImageSignature(buffer: Buffer, extension: string) {
    if (extension === ".png") return buffer.subarray(0, 4).toString("hex") === "89504e47";
    if (extension === ".jpg") return buffer.subarray(0, 3).toString("hex") === "ffd8ff";
    if (extension === ".webp") {
        return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
    }
    return false;
}

function sanitizeBaseName(baseName: string) {
    return baseName.trim().replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function removeExistingSlotFiles(uploadDir: string, slot: string) {
    const files = await readdir(uploadDir).catch(() => []);

    await Promise.all(
        files
            .filter((name) => IMAGE_EXTENSIONS.some((ext) => name === `${slot}${ext}` || name.startsWith(`${slot}-`)))
            .map((name) => unlink(path.join(uploadDir, name)).catch(() => undefined))
    );
}

function getUploadStorageProvider(): UploadStorageProvider {
    return readOptionalEnv("BLUEWOLF_UPLOAD_STORAGE_PROVIDER") === "supabase" ? "supabase" : "local";
}

export function isSupabaseUploadStorageEnabled() {
    return getUploadStorageProvider() === "supabase";
}

function getSupabaseStorageConfig() {
    const url = readRequiredEnv("SUPABASE_URL").replace(/\/+$/, "");
    const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const bucket = readRequiredEnv("SUPABASE_STORAGE_BUCKET");
    return { url, serviceRoleKey, bucket };
}

function buildObjectPath(directory: PublicUploadDirectory, fileName: string) {
    return `${directory}/${fileName}`.replace(/\/+/g, "/");
}

function isImageObjectPath(value: string) {
    const lower = value.toLowerCase();
    return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
}

function buildAppUploadPath(objectPath: string) {
    return `/uploads/${objectPath
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/")}`;
}

function parseSupabasePublicObjectPath(publicUrl: string) {
    const { url, bucket } = getSupabaseStorageConfig();
    const prefix = `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/`;
    if (!publicUrl.startsWith(prefix)) return null;

    return publicUrl
        .slice(prefix.length)
        .split("/")
        .map((part) => decodeURIComponent(part))
        .join("/");
}

function parseAppUploadObjectPath(publicPath: string) {
    if (!publicPath.startsWith("/uploads/")) return null;
    return publicPath
        .slice("/uploads/".length)
        .split("/")
        .map((part) => decodeURIComponent(part))
        .join("/");
}

function parseStoredUploadObjectPath(publicPath: string) {
    return parseAppUploadObjectPath(publicPath) ?? parseSupabasePublicObjectPath(publicPath);
}

async function listSupabaseStoragePrefix(prefix: string): Promise<SupabaseStorageListEntry[]> {
    const { url, serviceRoleKey, bucket } = getSupabaseStorageConfig();
    const response = await fetch(`${url}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prefix,
            limit: 1000,
            offset: 0,
            sortBy: { column: "name", order: "asc" },
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("SUPABASE_STORAGE_LIST_FAILED");
    }

    const data = (await response.json()) as SupabaseStorageListEntry[];
    return Array.isArray(data) ? data : [];
}

export async function listPublicCmsImageUploads() {
    const results: string[] = [];
    const visited = new Set<string>();

    async function visit(prefix: string) {
        if (visited.has(prefix)) return;
        visited.add(prefix);

        const entries = await listSupabaseStoragePrefix(prefix);
        await Promise.all(
            entries.map(async (entry) => {
                const objectPath = `${prefix}/${entry.name}`.replace(/\/+/g, "/");
                if (entry.id && isImageObjectPath(objectPath)) {
                    results.push(buildAppUploadPath(objectPath));
                    return;
                }

                if (!entry.id) {
                    await visit(objectPath);
                }
            })
        );
    }

    await visit("cms");
    return results.sort((a, b) => a.localeCompare(b));
}

export async function deletePublicCmsImageUpload(publicPath: string) {
    if (getUploadStorageProvider() === "supabase") {
        const { url, serviceRoleKey, bucket } = getSupabaseStorageConfig();
        const objectPath = parseStoredUploadObjectPath(publicPath);
        if (!objectPath || !objectPath.startsWith("cms/") || !isImageObjectPath(objectPath)) {
            return { ok: false as const, error: "INVALID_IMAGE_PATH" };
        }

        const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${serviceRoleKey}`,
                apikey: serviceRoleKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prefixes: [objectPath] }),
            cache: "no-store",
        });

        if (!response.ok) return { ok: false as const, error: "DELETE_FAILED" };
        return { ok: true as const };
    }

    if (!publicPath.startsWith("/uploads/cms/") || !isImageObjectPath(publicPath)) {
        return { ok: false as const, error: "INVALID_IMAGE_PATH" };
    }

    const baseDir = path.join(process.cwd(), "public");
    const absolutePath = path.resolve(baseDir, `.${publicPath}`);
    const relative = path.relative(path.join(baseDir, "uploads", "cms"), absolutePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        return { ok: false as const, error: "INVALID_IMAGE_PATH" };
    }

    await unlink(absolutePath);
    return { ok: true as const };
}

async function storeSupabaseImageUpload(input: {
    directory: PublicUploadDirectory;
    fileName: string;
    buffer: Buffer;
    contentType: string;
    size: number;
}): Promise<{ ok: true; upload: StoredUpload } | { ok: false; error: string }> {
    const { url, serviceRoleKey, bucket } = getSupabaseStorageConfig();
    const objectPath = buildObjectPath(input.directory, input.fileName);
    const uploadUrl = `${url}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/")}`;

    const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": input.contentType,
            "x-upsert": "true",
        },
        body: new Uint8Array(input.buffer),
        cache: "no-store",
    });

    if (!response.ok) {
        return { ok: false, error: "SUPABASE_UPLOAD_FAILED" };
    }

    return {
        ok: true,
        upload: {
            path: buildAppUploadPath(objectPath),
            fileName: input.fileName,
            size: input.size,
        },
    };
}

export async function storePublicImageUpload(input: {
    file: File;
    directory: PublicUploadDirectory;
    baseName: string;
    replaceExistingForBaseName?: boolean;
    maxSize?: number;
}) {
    const maxSize = input.maxSize ?? DEFAULT_MAX_IMAGE_SIZE;
    const extension = normalizeImageExtension(input.file.name, input.file.type);
    const baseName = sanitizeBaseName(input.baseName);

    if (!baseName) {
        return { ok: false as const, error: "INVALID_UPLOAD_NAME" };
    }

    if (input.file.size > maxSize) {
        return { ok: false as const, error: "FILE_TOO_LARGE" };
    }

    if (!extension) {
        return { ok: false as const, error: "UNSUPPORTED_FILE_TYPE" };
    }

    const buffer = Buffer.from(await input.file.arrayBuffer());
    if (!hasValidImageSignature(buffer, extension)) {
        return { ok: false as const, error: "INVALID_IMAGE_CONTENT" };
    }

    const fileName = `${baseName}-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;

    if (getUploadStorageProvider() === "supabase") {
        return storeSupabaseImageUpload({
            directory: input.directory,
            fileName,
            buffer,
            contentType: input.file.type,
            size: input.file.size,
        });
    }

    const uploadDir = assertSafeUploadDirectory(input.directory);
    await mkdir(uploadDir, { recursive: true });

    if (input.replaceExistingForBaseName) {
        await removeExistingSlotFiles(uploadDir, baseName);
    }

    await writeFile(path.join(uploadDir, fileName), buffer);

    return {
        ok: true as const,
        upload: {
            path: `/uploads/${input.directory}/${fileName}`,
            fileName,
            size: input.file.size,
        } satisfies StoredUpload,
    };
}
