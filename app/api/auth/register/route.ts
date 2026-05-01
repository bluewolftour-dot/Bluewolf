import { NextResponse } from "next/server";
import { consumeEmailVerification } from "@/lib/auth-email-verification";
import { createUser } from "@/lib/auth-server";

type RegisterBody = {
    id?: string;
    password?: string;
    name?: string;
    phone?: string;
    email?: string;
    verificationToken?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    const body = (await request.json()) as RegisterBody;
    const id = body.id?.trim() ?? "";
    const password = body.password?.trim() ?? "";
    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const verificationToken = body.verificationToken?.trim() ?? "";

    if (
        id.length < 4 ||
        password.length < 6 ||
        !name ||
        !phone ||
        !emailPattern.test(email) ||
        !verificationToken
    ) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const verified = await consumeEmailVerification({ email, token: verificationToken });
    if (!verified) {
        return NextResponse.json({ error: "EMAIL_NOT_VERIFIED" }, { status: 400 });
    }

    const result = await createUser({
        id,
        password,
        name,
        phone,
        email,
    });

    if (!result.ok) {
        return NextResponse.json({ error: result.code }, { status: 409 });
    }

    return NextResponse.json({
        user: result.user,
    });
}
