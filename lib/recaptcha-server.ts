import { isProductionRuntime } from "@/lib/env";

type RecaptchaVerifyResponse = {
    success?: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    "error-codes"?: string[];
};

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const DEFAULT_MIN_SCORE = 0.5;

export async function verifyRecaptchaToken(input: {
    token?: string;
    expectedAction: string;
    minScore?: number;
}) {
    const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
    if (!secret) {
        if (isProductionRuntime()) {
            return { ok: false as const, code: "RECAPTCHA_NOT_CONFIGURED" };
        }

        return { ok: true as const, skipped: true as const };
    }

    const token = input.token?.trim();
    if (!token) {
        return { ok: false as const, code: "RECAPTCHA_REQUIRED" };
    }

    try {
        const response = await fetch(VERIFY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                secret,
                response: token,
            }),
        });
        const data = (await response.json()) as RecaptchaVerifyResponse;
        const score = typeof data.score === "number" ? data.score : 0;
        const minScore = input.minScore ?? DEFAULT_MIN_SCORE;

        if (!data.success || data.action !== input.expectedAction || score < minScore) {
            return {
                ok: false as const,
                code: "RECAPTCHA_FAILED",
                score,
            };
        }

        return { ok: true as const, skipped: false as const, score };
    } catch {
        return { ok: false as const, code: "RECAPTCHA_FAILED" };
    }
}
