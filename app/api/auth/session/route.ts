import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { getAdminUser } from "@/lib/admin-auth";

const SESSION_COOKIE = "bluewolf_session";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);
    
    // 관리자 여부 확인
    const adminUser = await getAdminUser();
    const isAdmin = Boolean(adminUser && user && adminUser.id === user.id);

    return NextResponse.json({
        user: user ? { ...user, isAdmin } : null,
    });
}
