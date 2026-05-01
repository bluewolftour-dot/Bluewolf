import { NextResponse } from "next/server";
import { findUserById } from "@/lib/auth-server";
import { sendEmailVerificationCode } from "@/lib/auth-email-verification";
import { checkRateLimit, getClientIp, limitedJson } from "@/lib/auth-security";
import { verifyRecaptchaToken } from "@/lib/recaptcha-server";

type SendCodeBody = {
    id?: string;
    locale?: string;
    recaptchaToken?: string;
};

function maskEmail(email: string) {
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    if (local.length <= 2) return `${local[0] ?? ""}*@${domain}`;
    const visible = local.slice(0, 2);
    const hidden = "*".repeat(Math.max(2, local.length - 2));
    return `${visible}${hidden}@${domain}`;
}

export async function POST(request: Request) {
    const body = (await request.json()) as SendCodeBody;
    const id = body.id?.trim() ?? "";
    const locale = body.locale?.trim() ?? "ko";
    const ip = getClientIp(request);

    if (id.length < 4) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const ipLimit = await checkRateLimit({
        scope: "forgot-password-send-ip",
        key: ip,
        limit: 10,
        windowMs: 1000 * 60 * 60,
        blockMs: 1000 * 60 * 30,
    });
    if (!ipLimit.allowed) {
        const limited = limitedJson(ipLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const idLimit = await checkRateLimit({
        scope: "forgot-password-send-id",
        key: id,
        limit: 3,
        windowMs: 1000 * 60 * 30,
        blockMs: 1000 * 60 * 30,
    });
    if (!idLimit.allowed) {
        const limited = limitedJson(idLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const recaptcha = await verifyRecaptchaToken({
        token: body.recaptchaToken,
        expectedAction: "forgot_password_send",
    });
    if (!recaptcha.ok) {
        return NextResponse.json({ error: recaptcha.code }, { status: 400 });
    }

    const user = await findUserById(id);
    if (!user) {
        return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    if (!user.email) {
        return NextResponse.json({ error: "EMAIL_NOT_REGISTERED" }, { status: 400 });
    }

    try {
        await sendEmailVerificationCode({ email: user.email, locale });
    } catch (error) {
        const code =
            error instanceof Error && error.message === "SMTP_NOT_CONFIGURED"
                ? "SMTP_NOT_CONFIGURED"
                : "SEND_FAILED";

        return NextResponse.json({ error: code }, { status: 500 });
    }

    return NextResponse.json({
        ok: true,
        maskedEmail: maskEmail(user.email),
    });
}
