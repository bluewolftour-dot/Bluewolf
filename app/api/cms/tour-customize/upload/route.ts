import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { storePublicImageUpload } from "@/lib/upload-storage";

export const runtime = "nodejs";

const allowedSlotPattern =
    /^tour-customize-(south|north|central|west)-[a-z0-9-]+$/;

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const formData = await request.formData();
    const file = formData.get("file");
    const slot = formData.get("slot");

    if (!(file instanceof File) || typeof slot !== "string") {
        return NextResponse.json({ error: "INVALID_UPLOAD" }, { status: 400 });
    }

    if (!allowedSlotPattern.test(slot)) {
        return NextResponse.json({ error: "INVALID_SLOT" }, { status: 400 });
    }

    const stored = await storePublicImageUpload({
        file,
        directory: "cms/tour-customize",
        baseName: slot,
        replaceExistingForBaseName: true,
    });

    if (!stored.ok) {
        return NextResponse.json({ error: stored.error }, { status: 400 });
    }

    return NextResponse.json({
        path: stored.upload.path,
    });
}
