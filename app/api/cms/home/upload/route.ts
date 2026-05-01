import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { homeUploadSlots } from "@/lib/cms-home";
import { requireAdminResponse } from "@/lib/admin-auth";

export const runtime = "nodejs";

const uploadDir = path.join(process.cwd(), "public", "uploads", "cms", "home");
const allowedSlots: Set<string> = new Set([...homeUploadSlots.heroSlides, ...homeUploadSlots.promoBanners]);

function normalizeExtension(filename: string, mimeType: string) {
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith(".png") || mimeType === "image/png") return ".png";
    if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || mimeType === "image/jpeg") return ".jpg";
    if (lowerName.endsWith(".webp") || mimeType === "image/webp") return ".webp";
    return null;
}

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const formData = await request.formData();
    const file = formData.get("file");
    const slot = formData.get("slot");

    if (!(file instanceof File) || typeof slot !== "string") {
        return NextResponse.json({ error: "INVALID_UPLOAD" }, { status: 400 });
    }

    if (!allowedSlots.has(slot)) {
        return NextResponse.json({ error: "INVALID_SLOT" }, { status: 400 });
    }

    const extension = normalizeExtension(file.name, file.type);
    if (!extension) {
        return NextResponse.json({ error: "UNSUPPORTED_FILE_TYPE" }, { status: 400 });
    }

    await mkdir(uploadDir, { recursive: true });

    const baseName = slot;
    const currentFiles = await readdir(uploadDir);

    await Promise.all(
        currentFiles
            .filter(
                (name) =>
                    name === `${baseName}.jpg` ||
                    name === `${baseName}.png` ||
                    name === `${baseName}.webp` ||
                    name.startsWith(`${baseName}-`)
            )
            .map((name) => unlink(path.join(uploadDir, name)).catch(() => undefined))
    );

    const fileName = `${baseName}-${Date.now()}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({
        path: `/uploads/cms/home/${fileName}`,
    });
}
