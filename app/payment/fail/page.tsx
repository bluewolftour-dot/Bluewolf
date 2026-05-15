"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { withLocaleQuery } from "@/lib/locale-routing";

function pick<T>(lang: "ko" | "ja" | "en", ko: T, ja: T, en: T) {
    if (lang === "ja") return ja;
    if (lang === "en") return en;
    return ko;
}

function PaymentFailContent() {
    const searchParams = useSearchParams();
    const { lang, isDark } = usePage();
    const code = searchParams.get("code") ?? "";
    const message = searchParams.get("message") ?? "";
    const tourId = Number(searchParams.get("tour"));
    const tourHref = Number.isInteger(tourId)
        ? withLocaleQuery(`/tours/${tourId}`, lang)
        : withLocaleQuery("/tours", lang);

    return (
        <section
            className={`overflow-hidden rounded-[32px] border p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)] ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
        >
            <div className="inline-flex rounded-full bg-red-50 px-4 py-1.5 text-sm font-bold text-red-600">
                {pick(lang, "결제 실패", "決済失敗", "Payment failed")}
            </div>
            <h1 className={`type-display mt-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                {pick(lang, "결제가 완료되지 않았습니다", "決済が完了しませんでした", "The payment was not completed")}
            </h1>
            <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {message ||
                    pick(
                        lang,
                        "결제창에서 결제가 취소되었거나 승인 중 오류가 발생했습니다.",
                        "決済画面でキャンセルされたか、承認中にエラーが発生しました。",
                        "The payment was canceled or failed during approval."
                    )}
            </p>
            {code ? (
                <div
                    className={`mx-auto mt-5 max-w-md rounded-2xl border px-4 py-3 text-left text-sm ${
                        isDark ? "border-white/10 bg-slate-950 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                >
                    <span className="font-bold">{pick(lang, "오류 코드", "エラーコード", "Error code")}:</span> {code}
                </div>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                    href={tourHref}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                    {pick(lang, "상품으로 돌아가기", "商品へ戻る", "Back to tour")}
                </Link>
                <Link
                    href={withLocaleQuery("/tours", lang)}
                    className={`inline-flex items-center justify-center rounded-2xl border px-6 py-3.5 text-sm font-bold transition ${
                        isDark
                            ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                >
                    {pick(lang, "투어 목록 보기", "ツアー一覧を見る", "View tours")}
                </Link>
            </div>
        </section>
    );
}

export default function PaymentFailPage() {
    return (
        <Suspense fallback={null}>
            <PageShell activeKey="booking">
                <PaymentFailContent />
            </PageShell>
        </Suspense>
    );
}
