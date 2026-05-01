import { NextResponse } from "next/server";
import { findUserById } from "@/lib/auth-server";
import { verifyEmailVerificationCode } from "@/lib/auth-email-verification";
import { checkRateLimit, getClientIp, limitedJson } from "@/lib/auth-security";

type VerifyCodeBody = {
    id?: string;
    code?: string;
};

export async function POST(request: Request) {
    const body = (await request.json()) as VerifyCodeBody;
    const id = body.id?.trim() ?? "";
    const code = body.code?.trim() ?? "";
    const ip = getClientIp(request);

    if (id.length < 4 || !code) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const ipLimit = await checkRateLimit({
        scope: "forgot-password-verify-ip",
        key: ip,
        limit: 30,
        windowMs: 1000 * 60 * 15,
        blockMs: 1000 * 60 * 15,
    });
    if (!ipLimit.allowed) {
        const limited = limitedJson(ipLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const idLimit = await checkRateLimit({
        scope: "forgot-password-verify-id",
        key: id,
        limit: 8,
        windowMs: 1000 * 60 * 15,
        blockMs: 1000 * 60 * 15,
    });
    if (!idLimit.allowed) {
        const limited = limitedJson(idLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const user = await findUserById(id);
    if (!user || !user.email) {
        return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const result = await verifyEmailVerificationCode({ email: user.email, code });
    if (!result.ok) {
        return NextResponse.json({ error: result.code }, { status: 400 });
    }

    return NextResponse.json({
        ok: true,
        verificationToken: result.token,
    });
}
