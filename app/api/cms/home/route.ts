import { NextResponse } from "next/server";
import { getCmsHomeContent, saveCmsHomeContent, type CmsHomeRecord } from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    return NextResponse.json({
        home: await getCmsHomeContent(),
    });
}

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as CmsHomeRecord;
    const saved = await saveCmsHomeContent(body);

    return NextResponse.json({
        home: saved,
    });
}
