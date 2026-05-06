import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import {
    cancelCrmBookingById,
    findCrmBookingByNoForEmail,
    getCrmPaymentOrderByBookingNo,
    markCrmPaymentOrderCancelledByBookingNo,
} from "@/lib/cms-crm-db";
import { sendBookingCancellationEmail } from "@/lib/booking-email";
import {
    getTossAuthorizationHeader,
    hasTossPaymentsConfig,
    TOSS_PAYMENT_URL,
} from "@/lib/toss-payments";
import { createNotification } from "@/lib/notifications";

const SESSION_COOKIE = "bluewolf_session";

type SelfCancelBody = {
    bookingNo?: string;
    cancelReason?: string;
    cancelMemo?: string;
};

type RefundLocale = "ko" | "ja" | "en";
type RefundStatus = "refunded" | "manual_required" | "not_paid";

function resolveLocale(locale: string): RefundLocale {
    if (locale === "ja") return "ja";
    if (locale === "en") return "en";
    return "ko";
}

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

function formatAmount(amount: number, locale: RefundLocale) {
    const tag = locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "ko-KR";
    return new Intl.NumberFormat(tag, {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(amount);
}

function buildRefundMessage(status: RefundStatus, amount: number, locale: RefundLocale) {
    if (status === "refunded") {
        if (locale === "ja") {
            return `お支払い済みの予約金 ${formatAmount(amount, locale)} は元のお支払い方法へ返金されます。反映まで時間がかかる場合があります。`;
        }
        if (locale === "en") {
            return `Your paid deposit of ${formatAmount(amount, locale)} will be refunded to the original payment method. Posting times depend on your card issuer and payment provider.`;
        }
        return `결제된 플랜 패키지 이용료 ${formatAmount(amount, locale)}는 결제 수단으로 환불 처리됩니다. 카드사나 결제사 사정에 따라 실제 반영까지 시간이 걸릴 수 있습니다.`;
    }

    if (status === "manual_required") {
        if (locale === "ja") {
            return "お支払いは確認済みですが自動返金情報が不足しているため、担当者が手動で返金手続きを進めます。";
        }
        if (locale === "en") {
            return "We've confirmed your payment, but automatic refund details are missing. Our team will process the refund manually.";
        }
        return "결제 확인은 완료되었지만 자동 환불 정보가 없어 담당자가 수동 환불 절차를 진행합니다.";
    }

    if (locale === "ja") {
        return "お支払い履歴を確認した後、返金可能額をご案内して返金を進めます。";
    }
    if (locale === "en") {
        return "We will check your payment history and notify you of the refundable amount before processing.";
    }
    return "결제 내역을 확인한 뒤 환불 가능 금액을 안내하고 환불을 진행합니다.";
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user || !user.email) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await request.json()) as SelfCancelBody;
    const bookingNo = body.bookingNo?.trim() ?? "";
    const cancelReason = body.cancelReason?.trim() ?? "";
    const cancelMemo = body.cancelMemo?.trim() ?? "";

    if (!bookingNo || !cancelReason) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const target = await findCrmBookingByNoForEmail(bookingNo, user.email);
    if (!target) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    if (target.status === "cancelled") {
        return NextResponse.json({ error: "ALREADY_CANCELLED" }, { status: 409 });
    }

    if (target.status === "completed") {
        return NextResponse.json({ error: "NOT_CANCELLABLE" }, { status: 409 });
    }

    const locale = resolveLocale(target.locale);
    const paymentOrder = await getCrmPaymentOrderByBookingNo(target.bookingNo);
    let refundStatus: RefundStatus = "not_paid";
    let refundedAmount = 0;

    if (paymentOrder?.status === "paid" && paymentOrder.paymentKey) {
        if (!hasTossPaymentsConfig()) {
            return NextResponse.json(
                { error: "PAYMENT_PROVIDER_UNAVAILABLE" },
                { status: 500 }
            );
        }

        const tossResponse = await fetch(
            `${TOSS_PAYMENT_URL}/${encodeURIComponent(paymentOrder.paymentKey)}/cancel`,
            {
                method: "POST",
                headers: {
                    Authorization: getTossAuthorizationHeader(),
                    "Content-Type": "application/json",
                    "Idempotency-Key": `${target.bookingNo}-self-cancel`,
                },
                body: JSON.stringify({ cancelReason }),
                cache: "no-store",
            }
        );

        const tossPayload = (await tossResponse.json().catch(() => null)) as
            | Record<string, unknown>
            | null;

        if (!tossResponse.ok) {
            return NextResponse.json(
                {
                    error:
                        typeof tossPayload?.message === "string"
                            ? tossPayload.message
                            : "REFUND_FAILED",
                    code: typeof tossPayload?.code === "string" ? tossPayload.code : undefined,
                },
                { status: tossResponse.status }
            );
        }

        await markCrmPaymentOrderCancelledByBookingNo(target.bookingNo);
        refundStatus = "refunded";
        refundedAmount = paymentOrder.amount;
    } else if (paymentOrder?.status === "paid") {
        refundStatus = "manual_required";
        refundedAmount = paymentOrder.amount;
    }

    const refundMessage = buildRefundMessage(refundStatus, refundedAmount, locale);

    const booking = await cancelCrmBookingById({
        id: target.id,
        cancelReason,
        cancelMemo,
    });

    if (!booking) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    try {
        await createNotification({
            userId: user.id,
            type: "booking_cancelled",
            title: {
                ko: "예약 취소 완료",
                ja: "予約キャンセル完了",
                en: "Booking Cancelled",
            },
            content: {
                ko: `[${booking.bookingNo}] 예약 취소가 완료되었습니다. 환불 관련 내용은 마이페이지에서 확인하실 수 있습니다.`,
                ja: `[${booking.bookingNo}] 予約キャンセルが完了しました。返金の詳細はマイページで確認できます。`,
                en: `[${booking.bookingNo}] Your booking cancellation is complete. You can check refund details in My Page.`,
            },
            link: "/mypage/bookings",
        });
    } catch (error) {
        console.error("Failed to create cancellation notification:", error);
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
        console.error("Failed to send self-cancellation email:", error);
    }

    return NextResponse.json({
        booking,
        emailSent,
        refundStatus,
        refundMessage,
    });
}
