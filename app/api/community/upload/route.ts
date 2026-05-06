import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { storePublicImageUpload } from "@/lib/upload-storage";

export const runtime = "nodejs";

const SESSION_COOKIE = "bluewolf_session";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "INVALID_UPLOAD" }, { status: 400 });
    }

    const stored = await storePublicImageUpload({
        file,
        directory: "community",
        baseName: `community-${randomUUID().slice(0, 8)}`,
    });

    if (!stored.ok) {
        return NextResponse.json({ error: stored.error }, { status: 400 });
    }

    return NextResponse.json({
        path: stored.upload.path,
    });
}
