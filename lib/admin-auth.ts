import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";

const SESSION_COOKIE = "bluewolf_session";

function getAdminIds() {
    return (process.env.BLUEWOLF_ADMIN_IDS || "admin,bluewolf")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

export async function getAdminUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) return null;
    return getAdminIds().includes(user.id.toLowerCase()) ? user : null;
}

export async function requireAdminResponse() {
    const user = await getAdminUser();

    if (!user) {
        return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
    }

    return null;
}
