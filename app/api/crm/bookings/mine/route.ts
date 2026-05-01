import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { getCrmBookingsByEmail } from "@/lib/cms-crm-db";

const SESSION_COOKIE = "bluewolf_session";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const bookings = user.email ? getCrmBookingsByEmail(user.email) : [];
    return NextResponse.json({ bookings });
}
