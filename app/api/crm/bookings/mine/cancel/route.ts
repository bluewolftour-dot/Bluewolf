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

const SESSION_COOKIE = "bluewolf_session";

type SelfCancelBody = {
    bookingNo?: string;
    cancelReason?: string;
    cancelMemo?: string;
};

type RefundLocale = "ko" | "ja" | "en";

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

function buildRefundMessage(
    status: "refunded" | "manual_required" | "not_paid",
    amount: number,
    locale: RefundLocale
) {
    if (status === "refunded") {
        if (locale === "ja") {
            return `お支払い済みの予約金 ${formatAmount(amount, locale)} は決済手段へ返金処理されます。カード会社や決済会社の都合により、実際の反映までお時間をいただく場合があります。`;
        }
        if (locale === "en") {
            return `Your paid deposit of ${formatAmount(amount, locale)} will be refunded to the original payment method. Posting times depend on your card issuer and payment provider.`;
        }
        return `결제된 예약금 ${formatAmount(amount, locale)}은 결제 수단으로 환불 처리됩니다. 카드사나 결제사 사정에 따라 실제 반영까지 시간이 걸릴 수 있습니다.`;
    }

    if (status === "manual_required") {
        if (locale === "ja") {
            return "決済の確認は完了していますが、自動返金情報がないため担当者が手動で返金を進めます。";
        }
        if (locale === "en") {
            return "We've confirmed your payment, but automatic refund details are missing — our team will process the refund manually.";
        }
        return "결제 확인은 완료되었지만 자동 환불 정보가 없어 담당자가 수동 환불 절차를 진행합니다.";
    }

    if (locale === "ja") {
        return "決済履歴を確認のうえ、返金可能額をご案内し返金処理を行います。";
    }
    if (locale === "en") {
        return "We will check your payment history and notify you of the refundable amount before processing.";
    }
    return "결제 내역을 확인한 뒤 환불 가능 금액을 안내하고 환불을 진행합니다.";
}

void buildRefundMessage;

function buildSafeRefundMessage(
    status: "refunded" | "manual_required" | "not_paid",
    amount: number,
    locale: RefundLocale
) {
    if (status === "refunded") {
        if (locale === "ja") {
            return `決済済みの予約金 ${formatAmount(amount, locale)} は元の決済手段へ返金処理されます。カード会社や決済会社の処理状況により反映まで時間がかかる場合があります。`;
        }
        if (locale === "en") {
            return `Your paid deposit of ${formatAmount(amount, locale)} will be refunded to the original payment method. Posting times depend on your card issuer and payment provider.`;
        }
        return `결제된 예약금 ${formatAmount(amount, locale)}은 결제 수단으로 환불 처리됩니다. 카드사나 결제사 사정에 따라 실제 반영까지 시간이 걸릴 수 있습니다.`;
    }

    if (status === "manual_required") {
        if (locale === "ja") {
            return "決済は確認済みですが自動返金情報が不足しているため、担当者が手動で返金手続きを進めます。";
        }
        if (locale === "en") {
            return "We've confirmed your payment, but automatic refund details are missing. Our team will process the refund manually.";
        }
        return "결제 확인은 완료되었지만 자동 환불 정보가 없어 담당자가 수동 환불 절차를 진행합니다.";
    }

    if (locale === "ja") {
        return "決済履歴を確認したうえで、返金可能金額をご案内してから返金を進めます。";
    }
    if (locale === "en") {
        return "We will check your payment history and notify you of the refundable amount before processing.";
    }
    return "결제 내역을 확인한 후 환불 가능 금액을 안내하고 환불을 진행합니다.";
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

    const target = findCrmBookingByNoForEmail(bookingNo, user.email);
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
    const paymentOrder = getCrmPaymentOrderByBookingNo(target.bookingNo);
    let refundStatus: "refunded" | "manual_required" | "not_paid" = "not_paid";
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

        markCrmPaymentOrderCancelledByBookingNo(target.bookingNo);
        refundStatus = "refunded";
        refundedAmount = paymentOrder.amount;
    } else if (paymentOrder?.status === "paid") {
        refundStatus = "manual_required";
        refundedAmount = paymentOrder.amount;
    }

    const refundMessage = buildSafeRefundMessage(refundStatus, refundedAmount, locale);

    const booking = cancelCrmBookingById({
        id: target.id,
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
        console.error("Failed to send self-cancellation email:", error);
    }

    return NextResponse.json({
        booking,
        emailSent,
        refundStatus,
        refundMessage,
    });
}
