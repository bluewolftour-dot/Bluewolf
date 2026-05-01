import { NextResponse } from "next/server";
import { verifyEmailVerificationCode } from "@/lib/auth-email-verification";
import { checkRateLimit, getClientIp, limitedJson } from "@/lib/auth-security";

type VerifyBody = {
    email?: string;
    code?: string;
};

export async function POST(request: Request) {
    const body = (await request.json()) as VerifyBody;
    const email = body.email?.trim() ?? "";
    const code = body.code?.trim() ?? "";
    const ip = getClientIp(request);

    if (!email || !code) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const ipLimit = await checkRateLimit({
        scope: "email-verification-verify-ip",
        key: ip,
        limit: 30,
        windowMs: 1000 * 60 * 15,
        blockMs: 1000 * 60 * 15,
    });
    if (!ipLimit.allowed) {
        const limited = limitedJson(ipLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const emailLimit = await checkRateLimit({
        scope: "email-verification-verify-email",
        key: email,
        limit: 8,
        windowMs: 1000 * 60 * 15,
        blockMs: 1000 * 60 * 15,
    });
    if (!emailLimit.allowed) {
        const limited = limitedJson(emailLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const result = await verifyEmailVerificationCode({ email, code });
    if (!result.ok) {
        return NextResponse.json({ error: result.code }, { status: 400 });
    }

    return NextResponse.json({
        ok: true,
        verificationToken: result.token,
    });
}
