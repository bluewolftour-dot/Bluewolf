import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCrmBooking, getCmsTourById, getCrmBookings, updateCrmBookingStatus } from "@/lib/cms-crm-db";
import { getSessionUser } from "@/lib/auth-server";
import { sendBookingConfirmationEmail } from "@/lib/booking-email";
import { requireAdminResponse } from "@/lib/admin-auth";
import { validateBookingAvailability } from "@/lib/booking-rules";

const SESSION_COOKIE = "bluewolf_session";

function resolveTourTitle(
    locale: string,
    tourTitle:
        | {
              ko: string;
              ja: string;
              en: string;
          }
        | undefined
) {
    if (!tourTitle) return "";
    if (locale === "ja") return tourTitle.ja;
    if (locale === "en") return tourTitle.en;
    return tourTitle.ko;
}

export async function GET() {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    return NextResponse.json({
        bookings: getCrmBookings(),
    });
}

export async function POST(request: NextRequest) {
    const body = (await request.json()) as Partial<{
        tourId: number;
        customerName: string;
        email: string;
        phone: string;
        departDate: string;
        guests: number;
        locale: string;
        status: string;
    }>;

    const tourId = Number(body.tourId);
    const customerName = body.customerName?.trim() ?? "";
    const requestedEmail = body.email?.trim().toLowerCase() ?? "";
    const phone = body.phone?.trim() ?? "";
    const departDate = body.departDate?.trim() ?? "";
    const guests = Number(body.guests);
    const locale = body.locale?.trim() ?? "ko";
    const status = body.status?.trim() === "pending" ? "pending" : "confirmed";
    const tour = Number.isInteger(tourId) ? getCmsTourById(tourId) : null;
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);
    const email = user?.email?.trim().toLowerCase() || requestedEmail;

    if (!tour) {
        return NextResponse.json(
            { error: "A valid tour is required." },
            { status: 400 }
        );
    }

    if (!customerName || !email || !phone || !departDate || !Number.isFinite(guests) || guests < 1) {
        return NextResponse.json(
            { error: "Missing required booking information." },
            { status: 400 }
        );
    }

    const availability = validateBookingAvailability({
        tourId,
        departDate,
        guests,
        bookings: getCrmBookings(),
    });

    if (!availability.ok) {
        return NextResponse.json(
            {
                error: availability.message,
                code: availability.code,
                capacity: availability.capacity,
                remainingSeats: availability.remainingSeats,
            },
            { status: 409 }
        );
    }

    const booking = createCrmBooking({
        tourId,
        totalAmount: tour.price * guests,
        depositAmount: tour.deposit * guests,
        customerName,
        email,
        phone,
        departDate,
        guests,
        locale,
        status,
    });

    if (!booking) {
        return NextResponse.json(
            { error: "Failed to create booking." },
            { status: 500 }
        );
    }

    try {
        await sendBookingConfirmationEmail({
            email,
            bookingNo: booking.bookingNo,
            customerName: booking.customerName,
            tourTitle: locale === "ja" ? tour.title.ja : locale === "en" ? tour.title.en : tour.title.ko,
            departDate: booking.departDate,
            guests: booking.guests,
            locale,
            status,
        });
    } catch (error) {
        console.error("Failed to send booking email:", error);
    }

    return NextResponse.json({ booking }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as Partial<{
        id: number;
        status: string;
    }>;

    const id = Number(body.id);
    const status = body.status?.trim() ?? "";

    if (!Number.isInteger(id) || id < 1 || !status) {
        return NextResponse.json(
            { error: "Invalid booking status update." },
            { status: 400 }
        );
    }

    const booking = updateCrmBookingStatus(id, status);
    if (!booking) {
        return NextResponse.json(
            { error: "Booking not found." },
            { status: 404 }
        );
    }

    let emailSent = false;
    let emailReason = "";

    if (booking.status === "confirmed") {
        try {
            const result = await sendBookingConfirmationEmail({
                email: booking.email,
                bookingNo: booking.bookingNo,
                customerName: booking.customerName,
                tourTitle: booking.customTitle || resolveTourTitle(booking.locale, booking.tour?.title),
                departDate: booking.departDate,
                guests: booking.guests,
                locale: booking.locale,
                status: "confirmed",
            });
            emailSent = result.sent;
            emailReason = result.sent ? "" : result.reason;
        } catch (error) {
            console.error("Failed to send CRM booking confirmation email:", error);
            emailReason = "send_failed";
        }
    }

    return NextResponse.json({ booking, emailSent, emailReason });
}
