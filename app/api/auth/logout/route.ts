import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth-server";

const SESSION_COOKIE = "bluewolf_session";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    await deleteSession(token);
    cookieStore.delete(SESSION_COOKIE);

    return NextResponse.json({ ok: true });
}
