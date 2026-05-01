import { NextResponse } from "next/server";
import { sendEmailVerificationCode } from "@/lib/auth-email-verification";
import { checkRateLimit, getClientIp, limitedJson } from "@/lib/auth-security";
import { verifyRecaptchaToken } from "@/lib/recaptcha-server";

type SendBody = {
    email?: string;
    locale?: string;
    recaptchaToken?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    const body = (await request.json()) as SendBody;
    const email = body.email?.trim() ?? "";
    const locale = body.locale?.trim() ?? "ko";
    const ip = getClientIp(request);

    if (!emailPattern.test(email)) {
        return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    }

    const ipLimit = await checkRateLimit({
        scope: "email-verification-send-ip",
        key: ip,
        limit: 10,
        windowMs: 1000 * 60 * 60,
        blockMs: 1000 * 60 * 30,
    });
    if (!ipLimit.allowed) {
        const limited = limitedJson(ipLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const emailLimit = await checkRateLimit({
        scope: "email-verification-send-email",
        key: email,
        limit: 3,
        windowMs: 1000 * 60 * 30,
        blockMs: 1000 * 60 * 30,
    });
    if (!emailLimit.allowed) {
        const limited = limitedJson(emailLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const recaptcha = await verifyRecaptchaToken({
        token: body.recaptchaToken,
        expectedAction: "email_verification_send",
    });
    if (!recaptcha.ok) {
        return NextResponse.json({ error: recaptcha.code }, { status: 400 });
    }

    try {
        await sendEmailVerificationCode({ email, locale });
        return NextResponse.json({ ok: true });
    } catch (error) {
        const code =
            error instanceof Error && error.message === "SMTP_NOT_CONFIGURED"
                ? "SMTP_NOT_CONFIGURED"
                : "SEND_FAILED";

        return NextResponse.json({ error: code }, { status: 500 });
    }
}
