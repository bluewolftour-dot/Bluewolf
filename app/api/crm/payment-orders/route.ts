import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { getCrmPaymentOrders } from "@/lib/cms-crm-db";

export async function GET() {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    return NextResponse.json({
        orders: await getCrmPaymentOrders(),
    });
}
