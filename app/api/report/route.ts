import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { createReport } from "@/lib/reports";
import { verifyRecaptchaToken } from "@/lib/recaptcha-server";

const SESSION_COOKIE = "bluewolf_session";

export async function POST(request: Request) {
    const body = await request.json();
    const { targetType, targetId, reportType, content, recaptchaToken } = body;

    // reCAPTCHA 검증 (스팸 방지)
    const recaptcha = await verifyRecaptchaToken({
        token: recaptchaToken,
        expectedAction: "report_submit",
    });
    if (!recaptcha.ok) {
        return NextResponse.json({ error: recaptcha.code }, { status: 400 });
    }

    if (!targetType || !reportType || !content) {
        return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    const report = await createReport({
        userId: user?.id,
        targetType,
        targetId,
        reportType,
        content,
    });

    return NextResponse.json({ ok: true, reportId: report.id });
}
