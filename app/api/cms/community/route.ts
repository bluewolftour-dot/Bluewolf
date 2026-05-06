import { NextResponse } from "next/server";
import {
    getCmsCommunityContent,
    saveCmsCommunityContent,
    type CmsCommunityRecord,
} from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    return NextResponse.json({
        community: await getCmsCommunityContent(),
    });
}

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as CmsCommunityRecord;
    const saved = await saveCmsCommunityContent(body);

    return NextResponse.json({
        community: saved,
    });
}
