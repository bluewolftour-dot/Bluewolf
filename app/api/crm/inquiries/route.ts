import { NextResponse } from "next/server";
import { createCrmInquiry, getCrmInquiries, updateCrmInquiryStatus } from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    return NextResponse.json({
        inquiries: getCrmInquiries(),
    });
}

export async function POST(request: Request) {
    const body = (await request.json()) as {
        name?: string;
        email?: string;
        phone?: string;
        subject?: string;
        message?: string;
        locale?: string;
    };

    if (!body.name || !body.email || !body.subject || !body.message) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const id = createCrmInquiry({
        name: body.name.trim(),
        email: body.email.trim(),
        phone: (body.phone ?? "").trim(),
        subject: body.subject.trim(),
        message: body.message.trim(),
        locale: (body.locale ?? "ko").trim(),
    });

    return NextResponse.json({ id });
}

export async function PATCH(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as Partial<{
        id: number;
        status: string;
    }>;

    const id = Number(body.id);
    const status = body.status?.trim() ?? "";

    if (!Number.isInteger(id) || id < 1 || !status) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const inquiry = updateCrmInquiryStatus(id, status);
    if (!inquiry) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
}
