import { NextResponse } from "next/server";
import {
    getCmsTourThemesContent,
    saveCmsTourThemesContent,
    type CmsTourThemesRecord,
} from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    return NextResponse.json({
        tourThemes: await getCmsTourThemesContent(),
    });
}

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as CmsTourThemesRecord;
    const saved = await saveCmsTourThemesContent(body);

    return NextResponse.json({
        tourThemes: saved,
    });
}
