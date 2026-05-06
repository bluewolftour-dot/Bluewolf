import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DATA_ROOT = path.join(process.cwd(), "data");

function resolveDataPath(relativePath: string) {
    const absolutePath = path.join(DATA_ROOT, relativePath);
    const relative = path.relative(DATA_ROOT, absolutePath);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error("Unsafe data path.");
    }

    return absolutePath;
}

async function ensureJsonFile(filePath: string, fallback: unknown) {
    await mkdir(path.dirname(filePath), { recursive: true });

    try {
        await readFile(filePath, "utf8");
    } catch {
        await writeJsonFile(filePath, fallback);
    }
}

async function writeJsonFile(filePath: string, data: unknown) {
    await mkdir(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
    await rename(tempPath, filePath);
}

export async function readJsonStore<T>(relativePath: string, fallback: T): Promise<T> {
    const filePath = resolveDataPath(relativePath);
    await ensureJsonFile(filePath, fallback);
    const raw = await readFile(filePath, "utf8");

    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export async function writeJsonStore<T>(relativePath: string, data: T) {
    await writeJsonFile(resolveDataPath(relativePath), data);
}

export async function readJsonListStore<T>(relativePath: string): Promise<T[]> {
    const data = await readJsonStore<unknown>(relativePath, []);
    return Array.isArray(data) ? (data as T[]) : [];
}

export async function writeJsonListStore<T>(relativePath: string, data: T[]) {
    await writeJsonStore(relativePath, data);
}
