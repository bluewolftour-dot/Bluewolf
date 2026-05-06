import { NextRequest, NextResponse } from "next/server";
import {
    finalizeCrmPaymentOrderWithBooking,
    getCrmPaymentOrder,
    getCrmBookings,
} from "@/lib/cms-crm-db";
import { sendBookingConfirmationEmail } from "@/lib/booking-email";
import { validateBookingAvailability, validateDepartDate } from "@/lib/booking-rules";
import {
    getTossAuthorizationHeader,
    TOSS_CONFIRM_URL,
} from "@/lib/toss-payments";
import { createNotification } from "@/lib/notifications";
import { findUserByEmail } from "@/lib/auth-server";

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

function parseConfirmBody(body: ConfirmPaymentBody) {
    const paymentKey = body.paymentKey?.trim() ?? "";
    const orderId = body.orderId?.trim() ?? "";
    const amount = Number(body.amount);

    if (!paymentKey || !orderId || !Number.isInteger(amount) || amount < 1) {
        return null;
    }

    return { paymentKey, orderId, amount };
}

export async function POST(request: NextRequest) {
    const parsed = parseConfirmBody((await request.json()) as ConfirmPaymentBody);

    if (!parsed) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const { paymentKey, orderId, amount } = parsed;
    const paymentOrder = await getCrmPaymentOrder(orderId);

    if (!paymentOrder) {
        return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    if (paymentOrder.amount !== amount) {
        return NextResponse.json({ error: "AMOUNT_MISMATCH" }, { status: 400 });
    }

    if (paymentOrder.status === "paid" && paymentOrder.bookingNo) {
        return NextResponse.json({
            bookingNo: paymentOrder.bookingNo,
            emailSent: false,
            alreadyProcessed: true,
            payment: {
                paymentKey: paymentOrder.paymentKey,
                orderId: paymentOrder.orderId,
                status: paymentOrder.status,
            },
        });
    }

    if (paymentOrder.status !== "ready") {
        return NextResponse.json({ error: "ORDER_NOT_PAYABLE" }, { status: 409 });
    }

    const availability =
        paymentOrder.customTitle.trim().length > 0
            ? validateDepartDate(paymentOrder.departDate)
            : validateBookingAvailability({
                  tourId: paymentOrder.tourId,
                  departDate: paymentOrder.departDate,
                  guests: paymentOrder.guests,
                  bookings: await getCrmBookings(),
              });

    if (!availability.ok) {
        return NextResponse.json({ error: availability.code }, { status: 409 });
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
                        : "Failed to confirm the Toss payment.",
                code: typeof tossPayload?.code === "string" ? tossPayload.code : undefined,
            },
            { status: tossResponse.status }
        );
    }

    const finalized = await finalizeCrmPaymentOrderWithBooking({
        orderId,
        paymentKey,
        booking: {
            tourId: paymentOrder.tourId,
            departDate: paymentOrder.departDate,
            customerName: paymentOrder.customerName,
            email: paymentOrder.email,
            phone: paymentOrder.phone,
            guests: paymentOrder.guests,
            totalAmount: paymentOrder.totalAmount,
            depositAmount: paymentOrder.amount,
            locale: paymentOrder.locale,
            status: "pending",
            customTitle: paymentOrder.customTitle,
            customSummary: paymentOrder.customSummary,
        },
    });

    if (!finalized.ok) {
        const status = finalized.code === "ORDER_NOT_PAYABLE" ? 409 : 500;
        return NextResponse.json(
            { error: finalized.code },
            { status }
        );
    }

    const { booking } = finalized;

    if (!finalized.alreadyProcessed) {
        try {
            const user = await findUserByEmail(paymentOrder.email);
            if (user) {
                await createNotification({
                    userId: user.id,
                    type: "booking_confirmed",
                    title: {
                        ko: "BlueWolf Mongolia 확인 완료 안내",
                        ja: "BlueWolf Mongolia 確認完了のお知らせ",
                        en: "BlueWolf Mongolia review completed",
                    },
                    content: {
                        ko: `[${booking.bookingNo}] BlueWolf Mongolia 확인이 완료되었습니다. 마이페이지에서 진행 상태를 확인하실 수 있습니다.`,
                        ja: `[${booking.bookingNo}] BlueWolf Mongolia の確認が完了しました。マイページで進行状況を確認できます。`,
                        en: `[${booking.bookingNo}] BlueWolf Mongolia review is completed. You can check progress in My Page.`,
                    },
                    link: "/mypage/bookings",
                });
            }
        } catch (error) {
            console.error("Failed to create booking notification:", error);
        }
    }

    let emailSent = false;

    if (!finalized.alreadyProcessed) {
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
    }

    return NextResponse.json({
        bookingNo: booking.bookingNo,
        emailSent,
        alreadyProcessed: finalized.alreadyProcessed,
        payment: tossPayload,
    });
}
