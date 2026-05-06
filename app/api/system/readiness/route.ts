import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { getSupabaseReadiness } from "@/lib/supabase-readiness";

export const runtime = "nodejs";

export async function GET() {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const readiness = await getSupabaseReadiness();
    const ok =
        readiness.readyForAsyncStores &&
        readiness.readyForCmsCrmDatabase &&
        readiness.readyForStorage;

    return NextResponse.json(
        {
            ok,
            ...readiness,
            hasServiceRoleKey: readiness.hasServiceRoleKey,
        },
        { status: ok ? 200 : 503 }
    );
}
