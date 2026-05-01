import { NextRequest, NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import {
    cancelCrmBookingById,
    getCrmBookingById,
    getCrmPaymentOrderByBookingNo,
    markCrmPaymentOrderCancelledByBookingNo,
} from "@/lib/cms-crm-db";
import { sendBookingCancellationEmail } from "@/lib/booking-email";
import {
    getTossAuthorizationHeader,
    hasTossPaymentsConfig,
    TOSS_PAYMENT_URL,
} from "@/lib/toss-payments";

type AdminCancelBody = {
    id?: number;
    cancelReason?: string;
    cancelMemo?: string;
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

function formatWon(amount: number) {
    return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(amount);
}

export async function POST(request: NextRequest) {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = (await request.json()) as AdminCancelBody;
    const id = Number(body.id);
    const cancelReason = body.cancelReason?.trim() ?? "";
    const cancelMemo = body.cancelMemo?.trim() ?? "";

    if (!Number.isInteger(id) || id < 1 || !cancelReason) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const target = getCrmBookingById(id);
    if (!target) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const paymentOrder = getCrmPaymentOrderByBookingNo(target.bookingNo);
    let refundMessage = "결제 내역을 확인한 뒤 환불 가능 금액을 안내하고 환불을 진행합니다.";
    let refundStatus: "refunded" | "manual_required" | "not_paid" = "not_paid";

    if (paymentOrder?.status === "paid" && paymentOrder.paymentKey) {
        if (!hasTossPaymentsConfig()) {
            return NextResponse.json(
                { error: "Toss Payments keys are not configured." },
                { status: 500 }
            );
        }

        const tossResponse = await fetch(`${TOSS_PAYMENT_URL}/${encodeURIComponent(paymentOrder.paymentKey)}/cancel`, {
            method: "POST",
            headers: {
                Authorization: getTossAuthorizationHeader(),
                "Content-Type": "application/json",
                "Idempotency-Key": `${target.bookingNo}-cancel`,
            },
            body: JSON.stringify({ cancelReason }),
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
                            : "Failed to cancel the Toss payment.",
                    code: typeof tossPayload?.code === "string" ? tossPayload.code : undefined,
                },
                { status: tossResponse.status }
            );
        }

        markCrmPaymentOrderCancelledByBookingNo(target.bookingNo);
        refundStatus = "refunded";
        refundMessage = `결제된 예약금 ${formatWon(paymentOrder.amount)}은 결제 수단으로 환불 처리됩니다. 카드사나 결제사 사정에 따라 실제 반영까지 시간이 걸릴 수 있습니다.`;
    } else if (paymentOrder?.status === "paid") {
        refundStatus = "manual_required";
        refundMessage = "결제 확인은 완료되었지만 자동 환불 정보가 없어 담당자가 수동 환불 절차를 진행합니다.";
    }

    const booking = cancelCrmBookingById({
        id,
        cancelReason,
        cancelMemo,
    });

    if (!booking) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    let emailSent = false;

    try {
        const result = await sendBookingCancellationEmail({
            email: booking.email,
            bookingNo: booking.bookingNo,
            customerName: booking.customerName,
            tourTitle: booking.customTitle || resolveTourTitle(booking.locale, booking.tour?.title),
            departDate: booking.departDate,
            guests: booking.guests,
            locale: booking.locale,
            cancelReason,
            cancelMemo,
            refundMessage,
        });
        emailSent = result.sent;
    } catch (error) {
        console.error("Failed to send admin booking cancellation email:", error);
    }

    return NextResponse.json({
        booking,
        emailSent,
        refundStatus,
        refundMessage,
    });
}
