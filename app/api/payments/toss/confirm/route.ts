import { NextRequest, NextResponse } from "next/server";
import {
    completeCrmPaymentOrder,
    createCrmBooking,
    getCrmPaymentOrder,
    getCrmBookings,
} from "@/lib/cms-crm-db";
import { sendBookingConfirmationEmail } from "@/lib/booking-email";
import { validateBookingAvailability, validateDepartDate } from "@/lib/booking-rules";
import {
    getTossAuthorizationHeader,
    TOSS_CONFIRM_URL,
} from "@/lib/toss-payments";

type ConfirmPaymentBody = {
    paymentKey?: string;
    orderId?: string;
    amount?: number;
};

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

export async function POST(request: NextRequest) {
    const body = (await request.json()) as ConfirmPaymentBody;
    const paymentKey = body.paymentKey?.trim() ?? "";
    const orderId = body.orderId?.trim() ?? "";
    const amount = Number(body.amount);

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
        return NextResponse.json(
            { error: "Missing payment confirmation data." },
            { status: 400 }
        );
    }

    const paymentOrder = getCrmPaymentOrder(orderId);

    if (!paymentOrder) {
        return NextResponse.json(
            { error: "Payment order not found." },
            { status: 404 }
        );
    }

    if (paymentOrder.amount !== amount) {
        return NextResponse.json(
            { error: "The payment amount does not match the prepared order." },
            { status: 400 }
        );
    }

    if (paymentOrder.status === "paid" && paymentOrder.bookingNo) {
        return NextResponse.json({
            bookingNo: paymentOrder.bookingNo,
            payment: {
                orderId: paymentOrder.orderId,
                paymentKey: paymentOrder.paymentKey,
                amount: paymentOrder.amount,
            },
        });
    }

    const isCustomPlan = paymentOrder.customTitle.trim().length > 0 || paymentOrder.tourId === 0;
    const availability = isCustomPlan
        ? validateDepartDate(paymentOrder.departDate)
        : validateBookingAvailability({
              tourId: paymentOrder.tourId,
              departDate: paymentOrder.departDate,
              guests: paymentOrder.guests,
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

    const tossResponse = await fetch(TOSS_CONFIRM_URL, {
        method: "POST",
        headers: {
            Authorization: getTossAuthorizationHeader(),
            "Content-Type": "application/json",
            "Idempotency-Key": orderId,
        },
        body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
        }),
        cache: "no-store",
    });

    const tossPayload = (await tossResponse.json().catch(() => null)) as
        | Record<string, unknown>
        | null;

    if (!tossResponse.ok) {
        return NextResponse.json(
            {
                error:
                    typeof tossPayload?.message === "string"
                        ? tossPayload.message
                        : "Failed to confirm the payment with Toss Payments.",
                code:
                    typeof tossPayload?.code === "string"
                        ? tossPayload.code
                        : undefined,
            },
            { status: tossResponse.status }
        );
    }

    const booking = createCrmBooking({
        tourId: paymentOrder.tourId,
        customTitle: paymentOrder.customTitle,
        customSummary: paymentOrder.customSummary,
        totalAmount: paymentOrder.totalAmount,
        depositAmount: paymentOrder.amount,
        customerName: paymentOrder.customerName,
        email: paymentOrder.email,
        phone: paymentOrder.phone,
        departDate: paymentOrder.departDate,
        guests: paymentOrder.guests,
        locale: paymentOrder.locale,
        status: "pending",
    });

    if (!booking) {
        return NextResponse.json(
            { error: "The payment was approved, but the booking could not be created." },
            { status: 500 }
        );
    }

    completeCrmPaymentOrder({
        orderId,
        paymentKey,
        bookingNo: booking.bookingNo,
    });

    let emailSent = false;

    try {
        const result = await sendBookingConfirmationEmail({
            email: paymentOrder.email,
            bookingNo: booking.bookingNo,
            customerName: booking.customerName,
            tourTitle:
                paymentOrder.customTitle ||
                resolveTourTitle(paymentOrder.locale, paymentOrder.tour?.title),
            departDate: booking.departDate,
            guests: booking.guests,
            locale: booking.locale,
            status: "pending",
        });
        emailSent = result.sent;
    } catch (error) {
        console.error("Failed to send booking confirmation email:", error);
    }

    return NextResponse.json({
        bookingNo: booking.bookingNo,
        emailSent,
        payment: tossPayload,
    });
}
