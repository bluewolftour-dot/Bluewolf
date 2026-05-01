import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteUserAccount, getSessionUser } from "@/lib/auth-server";

const SESSION_COOKIE = "bluewolf_session";

type DeleteAccountBody = {
    password?: string;
};

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await request.json()) as DeleteAccountBody;
    const password = body.password?.trim() ?? "";

    if (!password) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const result = await deleteUserAccount({ id: user.id, password });

    if (!result.ok) {
        const status = result.code === "INVALID_CREDENTIALS" ? 401 : 404;
        return NextResponse.json({ error: result.code }, { status });
    }

    cookieStore.delete(SESSION_COOKIE);
    return NextResponse.json({ ok: true });
}
