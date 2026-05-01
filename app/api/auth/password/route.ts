import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { changeUserPassword, getSessionUser } from "@/lib/auth-server";

const SESSION_COOKIE = "bluewolf_session";

type ChangePasswordBody = {
    currentPassword?: string;
    newPassword?: string;
};

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await request.json()) as ChangePasswordBody;
    const currentPassword = body.currentPassword?.trim() ?? "";
    const newPassword = body.newPassword?.trim() ?? "";

    if (!currentPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    if (currentPassword === newPassword) {
        return NextResponse.json({ error: "SAME_PASSWORD" }, { status: 400 });
    }

    const result = await changeUserPassword({
        id: user.id,
        currentPassword,
        newPassword,
        preserveSessionToken: token,
    });

    if (!result.ok) {
        const status = result.code === "INVALID_CREDENTIALS" ? 401 : 404;
        return NextResponse.json({ error: result.code }, { status });
    }

    return NextResponse.json({ ok: true });
}
