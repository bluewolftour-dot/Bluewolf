import { NextResponse } from "next/server";
import { deleteCmsTour, getAllCmsTours, saveCmsTour, type CmsTourRecord } from "@/lib/cms-crm-db";
import { requireAdminResponse } from "@/lib/admin-auth";

export async function GET() {
    return NextResponse.json({
        tours: await getAllCmsTours(),
    });
}

export async function POST(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as CmsTourRecord;
    const saved = await saveCmsTour(body);

    return NextResponse.json({
        tour: saved,
    });
}

export async function DELETE(request: Request) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }

    const deleted = await deleteCmsTour(id);
    if (!deleted) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
        tour: deleted,
    });
}
