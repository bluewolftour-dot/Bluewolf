import { NextResponse } from "next/server";
import { findCrmBooking } from "@/lib/cms-crm-db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const bookingNo = searchParams.get("bookingNo") ?? "";
    const name = searchParams.get("name") ?? "";

    if (!bookingNo.trim() || !name.trim()) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const booking = findCrmBooking(bookingNo, name);
    if (!booking) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ booking });
}
