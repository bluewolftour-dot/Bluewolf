import { NextResponse } from "next/server";
import { getCrmOverview } from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    return NextResponse.json({
        overview: getCrmOverview(),
    });
}
