import { NextResponse } from "next/server";
import { findUserById, resetUserPassword } from "@/lib/auth-server";
import { consumeEmailVerification } from "@/lib/auth-email-verification";

type ResetBody = {
    id?: string;
    password?: string;
    verificationToken?: string;
};

export async function POST(request: Request) {
    const body = (await request.json()) as ResetBody;
    const id = body.id?.trim() ?? "";
    const password = body.password?.trim() ?? "";
    const verificationToken = body.verificationToken?.trim() ?? "";

    if (id.length < 4 || password.length < 6 || !verificationToken) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const user = await findUserById(id);
    if (!user || !user.email) {
        return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const verified = await consumeEmailVerification({
        email: user.email,
        token: verificationToken,
    });

    if (!verified) {
        return NextResponse.json({ error: "EMAIL_NOT_VERIFIED" }, { status: 400 });
    }

    const result = await resetUserPassword({ id, password });
    if (!result.ok) {
        return NextResponse.json({ error: result.code }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
