import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const uploadDir = path.join(process.cwd(), "public", "uploads", "community");

function normalizeExtension(filename: string, mimeType: string) {
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith(".png") || mimeType === "image/png") return ".png";
    if (
        lowerName.endsWith(".jpg") ||
        lowerName.endsWith(".jpeg") ||
        mimeType === "image/jpeg"
    ) {
        return ".jpg";
    }
    if (lowerName.endsWith(".webp") || mimeType === "image/webp") return ".webp";
    return null;
}

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "INVALID_UPLOAD" }, { status: 400 });
    }

    const extension = normalizeExtension(file.name, file.type);
    if (!extension) {
        return NextResponse.json({ error: "UNSUPPORTED_FILE_TYPE" }, { status: 400 });
    }

    await mkdir(uploadDir, { recursive: true });

    const fileName = `community-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({
        path: `/uploads/community/${fileName}`,
    });
}
