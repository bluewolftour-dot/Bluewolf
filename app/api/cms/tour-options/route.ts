import { NextResponse } from "next/server";
import {
    getCmsTourOptionsContent,
    saveCmsTourOptionsContent,
    type CmsTourOptionsRecord,
} from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    return NextResponse.json({
        tourOptions: getCmsTourOptionsContent(),
    });
}

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as CmsTourOptionsRecord;
    const saved = saveCmsTourOptionsContent(body);

    return NextResponse.json({
        tourOptions: saved,
    });
}
