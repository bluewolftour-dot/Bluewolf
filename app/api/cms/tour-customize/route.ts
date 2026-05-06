import { NextResponse } from "next/server";
import {
    getCmsTourCustomizeContent,
    saveCmsTourCustomizeContent,
    type CmsTourCustomizeRecord,
} from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    return NextResponse.json({
        tourCustomize: await getCmsTourCustomizeContent(),
    });
}

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as CmsTourCustomizeRecord;
    const saved = await saveCmsTourCustomizeContent(body);

    return NextResponse.json({
        tourCustomize: saved,
    });
}
