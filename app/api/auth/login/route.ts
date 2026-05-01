import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateUser, createSession } from "@/lib/auth-server";
import {
    checkAccountLock,
    checkRateLimit,
    clearLoginFailures,
    getClientIp,
    limitedJson,
    recordLoginFailure,
} from "@/lib/auth-security";
import { verifyRecaptchaToken } from "@/lib/recaptcha-server";

const SESSION_COOKIE = "bluewolf_session";

export async function POST(request: Request) {
    const body = (await request.json()) as { id?: string; password?: string; recaptchaToken?: string };
    const id = body.id?.trim() ?? "";
    const password = body.password?.trim() ?? "";
    const ip = getClientIp(request);

    if (id.length < 4 || password.length < 6) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const ipLimit = await checkRateLimit({
        scope: "login-ip",
        key: ip,
        limit: 30,
        windowMs: 1000 * 60 * 15,
        blockMs: 1000 * 60 * 15,
    });
    if (!ipLimit.allowed) {
        const limited = limitedJson(ipLimit);
        return NextResponse.json(limited.body, limited.init);
    }

    const recaptcha = await verifyRecaptchaToken({
        token: body.recaptchaToken,
        expectedAction: "login",
    });
    if (!recaptcha.ok) {
        return NextResponse.json({ error: recaptcha.code }, { status: 400 });
    }

    const accountLock = await checkAccountLock({ id });
    if (!accountLock.allowed) {
        const limited = limitedJson(accountLock);
        return NextResponse.json(limited.body, limited.init);
    }

    const result = await authenticateUser({ id, password });
    if (!result.ok) {
        const failure = await recordLoginFailure({
            id,
            maxFailures: 5,
            windowMs: 1000 * 60 * 15,
            lockMs: 1000 * 60 * 15,
        });
        if (failure.locked) {
            const limited = limitedJson({
                allowed: false,
                code: "ACCOUNT_LOCKED",
                retryAfterSeconds: failure.retryAfterSeconds,
            });
            return NextResponse.json(limited.body, limited.init);
        }

        return NextResponse.json({ error: result.code }, { status: 401 });
    }

    await clearLoginFailures(id);
    const token = await createSession(result.user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
        user: result.user,
    });
}
