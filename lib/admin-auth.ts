import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { isProductionRuntime, readCommaSeparatedEnv } from "@/lib/env";

const SESSION_COOKIE = "bluewolf_session";

function getAdminIds() {
    const ids = readCommaSeparatedEnv("BLUEWOLF_ADMIN_IDS")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

    if (isProductionRuntime() && ids.length === 0) {
        throw new Error("BLUEWOLF_ADMIN_IDS must be configured in production.");
    }

    return ids;
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
