import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { getUserNotifications, markAsRead, markAllAsRead } from "@/lib/notifications";

const SESSION_COOKIE = "bluewolf_session";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const notifications = await getUserNotifications(user.id);
    return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const { action, notificationId } = (await request.json()) as {
        action: "read" | "read_all";
        notificationId?: string;
    };

    if (action === "read" && notificationId) {
        await markAsRead(notificationId, user.id);
    } else if (action === "read_all") {
        await markAllAsRead(user.id);
    }

    return NextResponse.json({ ok: true });
}
