"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { withLocaleQuery } from "@/lib/locale-routing";
import { formatPrice } from "@/lib/bluewolf-utils";

type ConfirmResponse = {
    bookingNo: string;
    payment?: {
        amount?: number;
    };
};

function pick<T>(lang: "ko" | "ja" | "en", ko: T, ja: T, en: T) {
    if (lang === "ja") return ja;
    if (lang === "en") return en;
    return ko;
}

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const { lang, isDark } = usePage();
    const paymentKey = searchParams.get("paymentKey") ?? "";
    const orderId = searchParams.get("orderId") ?? "";
    const amount = Number(searchParams.get("amount"));
    const missingPaymentData = !paymentKey || !orderId || !Number.isFinite(amount);
    const initialError = missingPaymentData
        ? pick(
              lang,
              "결제 확인에 필요한 정보가 누락되었습니다.",
              "決済確認に必要な情報が不足しています。",
              "Required payment confirmation data is missing."
          )
        : "";
    const [loading, setLoading] = useState(!missingPaymentData);
    const [error, setError] = useState(initialError);
    const [result, setResult] = useState<ConfirmResponse | null>(null);
    const requestedRef = useRef(false);

    useEffect(() => {
        if (missingPaymentData || requestedRef.current) return;
        requestedRef.current = true;

        void fetch("/api/payments/toss/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                paymentKey,
                orderId,
                amount,
            }),
        })
            .then(async (response) => {
                const payload = (await response.json().catch(() => null)) as
                    | ConfirmResponse
                    | { error?: string }
                    | null;

                if (!response.ok || !payload || !("bookingNo" in payload)) {
                    const responseError =
                        payload && "error" in payload && typeof payload.error === "string"
                            ? payload.error
                            : pick(
                                  lang,
                                  "결제 승인 중 문제가 발생했습니다.",
                                  "決済承認中に問題が発生しました。",
                                  "Something went wrong while confirming the payment."
                              );
                    throw new Error(
                        responseError
                    );
                }

                setResult(payload);
            })
            .catch((caught) => {
                setError(
                    caught instanceof Error
                        ? caught.message
                        : pick(
                              lang,
                              "결제 승인 중 문제가 발생했습니다.",
                              "決済承認中に問題が発生しました。",
                              "Something went wrong while confirming the payment."
                          )
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, [amount, lang, missingPaymentData, orderId, paymentKey]);

    const shellClass = `overflow-hidden rounded-[32px] border p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)] ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;

    if (loading) {
        return (
            <section className={shellClass}>
                <div className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600">
                    {pick(lang, "결제 확인 중", "決済確認中", "Confirming payment")}
                </div>
                <h1 className={`mt-4 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    {pick(lang, "결제를 확인하고 있어요", "決済内容を確認しています", "We're confirming your payment")}
                </h1>
                <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {pick(
                        lang,
                        "토스 결제 승인 후 예약을 확정하는 중입니다. 잠시만 기다려주세요.",
                        "トス決済承認後に予約を確定しています。しばらくお待ちください。",
                        "We are finalizing your booking after Toss approves the payment."
                    )}
                </p>
            </section>
        );
    }

    if (error || !result) {
        return (
            <section className={shellClass}>
                <div className="inline-flex rounded-full bg-red-50 px-4 py-1.5 text-sm font-bold text-red-600">
                    {pick(lang, "결제 실패", "決済失敗", "Payment failed")}
                </div>
                <h1 className={`mt-4 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    {pick(lang, "승인 중 문제가 발생했습니다", "承認中に問題が発生しました", "We couldn't confirm the payment")}
                </h1>
                <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {error}
                </p>
                <Link
                    href={withLocaleQuery("/tours", lang)}
                    className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                    {pick(lang, "투어 목록으로 이동", "ツアー一覧へ", "Go to tours")}
                </Link>
            </section>
        );
    }

    return (
        <section className={shellClass}>
            <div className="inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-600">
                {pick(lang, "플랜 패키지 결제 완료", "プランパッケージ決済完了", "Plan package payment completed")}
            </div>
            <h1 className={`mt-4 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                {pick(lang, "BlueWolf Mongolia 검토 중입니다", "BlueWolf Mongolia 確認中です", "BlueWolf Mongolia is reviewing your request")}
            </h1>
            <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {pick(
                    lang,
                    "플랜료 결제가 완료되었습니다. BlueWolf Mongolia 검토 후 진행 상태가 갱신됩니다.",
                    "プランパッケージ利用料の決済が完了しました。BlueWolf Mongolia の確認後に進行状況が更新されます。",
                    "Your plan package fee payment is complete. BlueWolf Mongolia will review this request and update the progress."
                )}
            </p>
            <div
                className={`mx-auto mt-6 max-w-md rounded-[28px] border px-6 py-7 text-left ${
                    isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                }`}
            >
                <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {pick(lang, "신청 번호", "申請番号", "Application number")}
                    </span>
                    <span className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        {result.bookingNo}
                    </span>
                </div>
                <div className={`mt-4 border-t pt-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {pick(lang, "플랜료", "プランパッケージ利用料", "Plan package fee paid")}
                        </span>
                        <span className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                            {formatPrice(Number(result.payment?.amount ?? 0))}
                        </span>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                    href={withLocaleQuery("/mypage/bookings", lang)}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                    {pick(lang, "진행 상태 조회로 이동", "進行状況照会へ", "Go to progress lookup")}
                </Link>
                <Link
                    href={withLocaleQuery("/tours", lang)}
                    className={`inline-flex items-center justify-center rounded-2xl border px-6 py-3.5 text-sm font-bold transition ${
                        isDark
                            ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                >
                    {pick(lang, "플랜 목록 보기", "プラン一覧を見る", "View plans")}
                </Link>
            </div>
        </section>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={null}>
            <PageShell activeKey="booking">
                <PaymentSuccessContent />
            </PageShell>
        </Suspense>
    );
}

