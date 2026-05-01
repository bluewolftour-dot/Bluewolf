import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeEmailVerification } from "@/lib/auth-email-verification";
import { getSessionUser, updateUserProfile } from "@/lib/auth-server";

const SESSION_COOKIE = "bluewolf_session";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ProfileBody = {
    name?: string;
    phone?: string;
    email?: string;
    verificationToken?: string;
};

export async function PATCH(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const currentUser = await getSessionUser(token);

    if (!currentUser) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await request.json()) as ProfileBody;
    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const email = body.email?.trim().toLowerCase();
    const verificationToken = body.verificationToken?.trim() ?? "";
    const nextEmail = email && email !== currentUser.email.toLowerCase() ? email : undefined;

    if (name !== undefined && name.length < 1) {
        return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });
    }

    if (phone !== undefined && phone.length < 1) {
        return NextResponse.json({ error: "INVALID_PHONE" }, { status: 400 });
    }

    if (nextEmail) {
        if (!emailPattern.test(nextEmail)) {
            return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
        }

        if (!verificationToken) {
            return NextResponse.json({ error: "EMAIL_NOT_VERIFIED" }, { status: 400 });
        }

        const verified = await consumeEmailVerification({
            email: nextEmail,
            token: verificationToken,
        });

        if (!verified) {
            return NextResponse.json({ error: "EMAIL_NOT_VERIFIED" }, { status: 400 });
        }
    }

    const result = await updateUserProfile({
        id: currentUser.id,
        name,
        phone,
        email: nextEmail,
    });

    if (!result.ok) {
        const status = result.code === "EMAIL_EXISTS" ? 409 : 404;
        return NextResponse.json({ error: result.code }, { status });
    }

    return NextResponse.json({ user: result.user });
}
