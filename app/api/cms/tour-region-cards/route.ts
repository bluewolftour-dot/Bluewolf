import { NextResponse } from "next/server";
import {
    getCmsTourRegionCardsContent,
    saveCmsTourRegionCardsContent,
    type CmsTourRegionCardsRecord,
} from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    return NextResponse.json({
        regionCards: getCmsTourRegionCardsContent(),
    });
}

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as CmsTourRegionCardsRecord;
    const saved = saveCmsTourRegionCardsContent(body);

    return NextResponse.json({
        regionCards: saved,
    });
}
