import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { getCrmBookings, getCrmInquiries } from "@/lib/cms-crm-db";
import { findUserByEmail } from "@/lib/auth-server";

export async function GET() {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const [bookings, inquiries] = await Promise.all([getCrmBookings(), getCrmInquiries()]);
    const emails = Array.from(
        new Set(
            [...bookings.map((booking) => booking.email), ...inquiries.map((inquiry) => inquiry.email)]
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean)
        )
    );

    const users = (
        await Promise.all(
            emails.map(async (email) => {
                const user = await findUserByEmail(email);
                return user ? { email, userId: user.id } : null;
            })
        )
    ).filter((user): user is { email: string; userId: string } => user !== null);

    return NextResponse.json({ users });
}
