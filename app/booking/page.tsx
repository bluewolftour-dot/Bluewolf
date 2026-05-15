"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { withLocaleQuery } from "@/lib/locale-routing";
import { formatPrice } from "@/lib/bluewolf-utils";
import { type Locale } from "@/lib/bluewolf-data";
import { type CrmBookingRecord } from "@/lib/cms-crm-db";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { Dropdown } from "@/components/ui/Dropdown";

const copy = {
    ko: {
        badge: "진행 상태 조회",
        title: "진행 상태 조회",
        desc: "신청 번호와 신청자 이름을 입력하면 플랜 신청 내역과 진행 상태를 확인할 수 있습니다.",
        bookingNo: "신청 번호",
        bookingNoPlaceholder: "예: BW-20260413-6137",
        nameLabel: "신청자 이름",
        namePlaceholder: "홍길동",
        searchBtn: "조회하기",
        notFoundTitle: "조회된 예약이 없습니다",
        notFoundDesc: "신청 번호와 이름을 다시 확인해주세요.",
        bookingInfo: "플랜 신청 정보",
        bookingNoLabel: "신청 번호",
        tourLabel: "플랜",
        departLabel: "출발일",
        guestsLabel: "인원",
        statusLabel: "진행 상태",
        totalLabel: "예상 현지 여행비",
        depositLabel: "플랜료",
        remainLabel: "현지 잔금 안내",
        createdLabel: "플랜 신청일",
        statusConfirmed: "BlueWolf Mongolia 확인 완료",
        statusPending: "BlueWolf Mongolia 검토 중",
        statusPaid: "플랜 패키지 결제 완료",
        statusCompleted: "여행 완료",
        statusCancelled: "취소 완료",
        cancelBtn: "플랜 이용료 환불 문의",
        detailBtn: "플랜 상세보기",
        cancelTitle: "플랜 이용료 환불 문의",
        policyTitle: "플랜 이용료 환불 기준",
        policyHeaders: ["취소 시점", "환불 금액"],
        policyRows: [
            ["출발 30일 전 이상", "전액 환불"],
            ["출발 20~29일 전", "BlueWolf Mongolia 별도 기준 안내"],
            ["출발 10~19일 전", "여행 요금의 50% 환불"],
            ["출발 7~9일 전", "여행 요금의 30% 환불"],
            ["출발 7일 미만", "환불 불가"],
        ] as [string, string][],
        cancelReasonLabel: "취소 사유",
        cancelReasons: ["개인 사정", "일정 변경", "건강 문제", "여행지 변경", "비용 문제", "기타"],
        cancelMemoLabel: "추가 메모 (선택)",
        cancelMemoPlaceholder: "취소와 관련한 추가 내용을 적어주세요.",
        submitBtn: "환불 문의 접수",
        backBtn: "돌아가기",
        doneTitle: "플랜 이용료 환불 문의가 접수되었습니다",
        doneDesc: "영업일 기준 1~2일 이내에 확인 후 안내를 드립니다.\n문의 접수 내역은 이메일 또는 문자로 발송됩니다.",
        doneBack: "처음으로 돌아가기",
        loginRequiredCancel: "환불 문의는 로그인한 회원 본인의 신청 내역에서만 요청할 수 있습니다.",
        guests: (count: number) => `${count}명`,
        fallbackTitle: "맞춤 여행 플랜",
    },
    ja: {
        badge: "進行状況照会",
        title: "進行状況照会",
        desc: "申請番号と申請者名を入力すると、プラン申請内容と進行状況を確認できます。",
        bookingNo: "申請番号",
        bookingNoPlaceholder: "例: BW-20260413-6137",
        nameLabel: "申請者名",
        namePlaceholder: "山田 太郎",
        searchBtn: "照会する",
        notFoundTitle: "予約が見つかりません",
        notFoundDesc: "予約番号とお名前をもう一度確認してください。",
        bookingInfo: "プラン申請情報",
        bookingNoLabel: "申請番号",
        tourLabel: "プラン",
        departLabel: "出発日",
        guestsLabel: "人数",
        statusLabel: "進行状況",
        totalLabel: "予想現地旅行費",
        depositLabel: "プランパッケージ利用料",
        remainLabel: "現地残金案内",
        createdLabel: "プラン申請日",
        statusConfirmed: "BlueWolf Mongolia 確認完了",
        statusPending: "BlueWolf Mongolia 検討中",
        statusPaid: "プランパッケージ決済完了",
        statusCompleted: "旅行完了",
        statusCancelled: "キャンセル完了",
        cancelBtn: "プラン利用料返金問い合わせ",
        detailBtn: "プラン詳細を見る",
        cancelTitle: "プラン利用料返金問い合わせ",
        policyTitle: "プラン利用料返金基準",
        policyHeaders: ["キャンセル時点", "返金額"],
        policyRows: [
            ["出発30日前以上", "全額返金"],
            ["出発20〜29日前", "BlueWolf Mongolia 別途基準案内"],
            ["出発10〜19日前", "旅行代金の50%返金"],
            ["出発7〜9日前", "旅行代金の30%返金"],
            ["出発7日未満", "返金不可"],
        ] as [string, string][],
        cancelReasonLabel: "キャンセル理由",
        cancelReasons: ["個人都合", "日程変更", "健康上の理由", "目的地変更", "費用の問題", "その他"],
        cancelMemoLabel: "追加メモ（任意）",
        cancelMemoPlaceholder: "キャンセルに関する追加内容をご記入ください。",
        submitBtn: "返金問い合わせを送信",
        backBtn: "戻る",
        doneTitle: "返金問い合わせを受け付けました",
        doneDesc: "1〜2営業日以内に確認し、ご案内をお送りします。\n受付内容はメールまたはSMSで送信されます。",
        doneBack: "最初に戻る",
        loginRequiredCancel: "返金問い合わせはログイン済み会員本人の申請からのみ送信できます。",
        guests: (count: number) => `${count}名`,
        fallbackTitle: "カスタム旅行プラン",
    },
    en: {
        badge: "Progress lookup",
        title: "Progress lookup",
        desc: "Enter your application number and applicant name to view your plan application and current progress.",
        bookingNo: "Application number",
        bookingNoPlaceholder: "e.g. BW-20260413-6137",
        nameLabel: "Applicant name",
        namePlaceholder: "John Doe",
        searchBtn: "Look up",
        notFoundTitle: "No booking found",
        notFoundDesc: "Please check your application number and name, then try again.",
        bookingInfo: "Plan application details",
        bookingNoLabel: "Application number",
        tourLabel: "Plan",
        departLabel: "Departure",
        guestsLabel: "Guests",
        statusLabel: "Progress",
        totalLabel: "Estimated local trip cost",
        depositLabel: "Plan package fee",
        remainLabel: "Local balance guidance",
        createdLabel: "Applied on",
        statusConfirmed: "BlueWolf Mongolia review completed",
        statusPending: "BlueWolf Mongolia reviewing",
        statusPaid: "Plan package fee paid",
        statusCompleted: "Completed",
        statusCancelled: "Cancelled",
        cancelBtn: "Plan fee refund inquiry",
        detailBtn: "View plan details",
        cancelTitle: "Plan fee refund inquiry",
        policyTitle: "Plan fee refund policy",
        policyHeaders: ["Cancellation timing", "Refund amount"],
        policyRows: [
            ["30+ days before departure", "Full refund"],
            ["20-29 days before", "See BlueWolf Mongolia policy"],
            ["10-19 days before", "50% refund"],
            ["7-9 days before", "30% refund"],
            ["Under 7 days", "No refund"],
        ] as [string, string][],
        cancelReasonLabel: "Reason for cancellation",
        cancelReasons: ["Personal reasons", "Schedule change", "Health issue", "Change of destination", "Budget concerns", "Other"],
        cancelMemoLabel: "Additional notes (optional)",
        cancelMemoPlaceholder: "Share any additional details about your cancellation.",
        submitBtn: "Submit refund inquiry",
        backBtn: "Go back",
        doneTitle: "Refund inquiry received",
        doneDesc: "We will review it within 1-2 business days and send guidance.\nDetails will be sent by email or SMS.",
        doneBack: "Back to start",
        loginRequiredCancel: "Please log in and cancel from your own member booking list.",
        guests: (count: number) => `${count} guests`,
        fallbackTitle: "Custom travel plan",
    },
} satisfies Record<Locale, Record<string, unknown>>;

type SearchState = "idle" | "found" | "not-found" | "cancel-form" | "cancel-done";

type BookingCopy = typeof copy.ko;

function getStatusLabel(status: string, text: BookingCopy) {
    const labels: Record<string, string> = {
        confirmed: text.statusConfirmed,
        pending: text.statusPending,
        paid: text.statusPaid,
        completed: text.statusCompleted,
        cancelled: text.statusCancelled,
    };
    return labels[status] ?? status;
}

function getStatusClass(status: string) {
    if (status === "cancelled") return "border-red-200 bg-red-100 text-red-600";
    if (status === "paid" || status === "completed") return "border-emerald-200 bg-emerald-100 text-emerald-700";
    if (status === "confirmed") return "border-blue-200 bg-blue-100 text-blue-700";
    return "border-amber-200 bg-amber-100 text-amber-700";
}

function StatusBadge({ status, text }: { status: string; text: BookingCopy }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${getStatusClass(status)}`}>
            {getStatusLabel(status, text)}
        </span>
    );
}

const cardClass = (isDark: boolean) =>
    `rounded-[24px] border p-5 transition-colors duration-300 sm:rounded-[28px] sm:p-7 ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;

const inputClass = (isDark: boolean) =>
    `h-12 w-full rounded-2xl border px-4 text-[15px] font-semibold outline-none transition sm:h-14 sm:px-5 sm:text-[16px] ${
        isDark
            ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-blue-400"
            : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-300"
    }`;

const labelClass = (isDark: boolean) => `text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-800"}`;
const mutedClass = (isDark: boolean) => `text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`;
const primaryButtonClass = "rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500 sm:py-3.5";
const dangerButtonClass = "rounded-2xl border border-red-200 bg-red-50 px-6 py-3 font-bold text-red-600 transition hover:bg-red-100 sm:py-3.5";
const ghostButtonClass = (isDark: boolean) =>
    `rounded-2xl border px-6 py-3 font-bold transition sm:py-3.5 ${
        isDark ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
    }`;

function getBookingTitle(booking: CrmBookingRecord | null, locale: Locale, text: BookingCopy) {
    if (!booking) return text.fallbackTitle;
    return booking.tour?.title[locale] || booking.customTitle || text.fallbackTitle;
}

function BookingLookupContent() {
    const { lang, isDark } = usePage();
    const searchParams = useSearchParams();
    const text = copy[lang];
    const initialBookingNo = searchParams.get("bookingNo")?.trim() ?? "";
    const initialName = searchParams.get("name")?.trim() ?? "";
    const [bookingNo, setBookingNo] = useState(initialBookingNo);
    const [name, setName] = useState(initialName);
    const [state, setState] = useState<SearchState>("idle");
    const [booking, setBooking] = useState<CrmBookingRecord | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelMemo, setCancelMemo] = useState("");

    const title = getBookingTitle(booking, lang, text);
    const totalPrice = booking?.totalAmount ?? 0;
    const depositPrice = booking?.depositAmount ?? 0;
    const remain = Math.max(0, totalPrice - depositPrice);

    async function lookupBooking(targetBookingNo: string, targetName: string) {
        const response = await fetch(
            `/api/crm/bookings/search?bookingNo=${encodeURIComponent(targetBookingNo)}&name=${encodeURIComponent(targetName)}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            setBooking(null);
            setState("not-found");
            return;
        }

        const data = (await response.json()) as { booking: CrmBookingRecord };
        setBooking(data.booking);
        setState("found");
    }

    const autoLookupRef = useRef("");
    useEffect(() => {
        if (!initialBookingNo || !initialName) return;

        const key = `${initialBookingNo}|${initialName}`;
        if (autoLookupRef.current === key) return;
        autoLookupRef.current = key;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        void lookupBooking(initialBookingNo, initialName);
    }, [initialBookingNo, initialName]);

    async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!bookingNo.trim() || !name.trim()) return;
        await lookupBooking(bookingNo.trim(), name.trim());
    }

    function handleReset() {
        setBookingNo("");
        setName("");
        setBooking(null);
        setCancelReason("");
        setCancelMemo("");
        setState("idle");
    }

    async function handleCancelSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!booking) return;

        const response = await fetch("/api/crm/bookings/mine/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bookingNo: booking.bookingNo,
                cancelReason,
                cancelMemo,
            }),
        });

        if (response.status === 401) {
            window.alert(text.loginRequiredCancel);
            return;
        }

        if (response.ok) {
            const data = (await response.json()) as { booking: CrmBookingRecord };
            setBooking(data.booking);
            setState("cancel-done");
            return;
        }

        setState("not-found");
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 sm:gap-6">
            <div>
                <span className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-black text-blue-600">
                    {text.badge}
                </span>
                <h1 className={`type-display mt-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {text.title}
                </h1>
                <p className={`mt-2 text-sm leading-7 sm:text-base ${mutedClass(isDark)}`}>{text.desc}</p>
            </div>

            <section className={cardClass(isDark)}>
                <form onSubmit={handleSearch} className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-2">
                            <span className={labelClass(isDark)}>{text.bookingNo}</span>
                            <input
                                value={bookingNo}
                                onChange={(event) => setBookingNo(event.target.value)}
                                placeholder={text.bookingNoPlaceholder}
                                className={inputClass(isDark)}
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className={labelClass(isDark)}>{text.nameLabel}</span>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder={text.namePlaceholder}
                                className={inputClass(isDark)}
                            />
                        </label>
                    </div>
                    <button type="submit" className={`${primaryButtonClass} w-full`}>
                        {text.searchBtn}
                    </button>
                </form>
            </section>

            {state === "not-found" ? (
                <section className={`${cardClass(isDark)} text-center`}>
                    <p className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>{text.notFoundTitle}</p>
                    <p className={`mt-2 ${mutedClass(isDark)}`}>{text.notFoundDesc}</p>
                </section>
            ) : null}

            {booking && (state === "found" || state === "cancel-form") ? (
                <section className={cardClass(isDark)}>
                    <div className="relative mb-5 overflow-hidden rounded-[20px]" style={{ aspectRatio: "16 / 7" }}>
                        {booking.tour ? (
                            <Image
                                src={booking.tour.heroImage}
                                alt={title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 672px"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        <div className="absolute right-3 top-3">
                            <StatusBadge status={booking.status} text={text} />
                        </div>
                    </div>

                    <h2 className={`type-title-md ${isDark ? "text-white" : "text-slate-900"}`}>
                        {text.bookingInfo}
                    </h2>
                    <div className={`mt-4 divide-y rounded-[20px] border ${isDark ? "divide-white/5 border-white/10 bg-slate-950" : "divide-slate-100 border-slate-200 bg-slate-50"}`}>
                        {[
                            [text.bookingNoLabel, booking.bookingNo],
                            [text.tourLabel, title],
                            [text.departLabel, booking.departDate || "-"],
                            [text.guestsLabel, text.guests(booking.guests)],
                            [text.statusLabel, getStatusLabel(booking.status, text)],
                            [text.createdLabel, booking.createdAt],
                        ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                                <span className={`text-sm font-semibold ${mutedClass(isDark)}`}>{label}</span>
                                <span className={`text-right text-sm font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className={`mt-4 rounded-[20px] border p-4 sm:p-5 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                        <div className={`flex items-center justify-between py-2 text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            <span>{text.totalLabel}</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                        <div className={`flex items-center justify-between py-2 text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            <span>{text.depositLabel}</span>
                            <span>{formatPrice(depositPrice)}</span>
                        </div>
                        <div className={`mt-2 flex items-center justify-between border-t pt-3 text-base font-black ${isDark ? "border-white/10 text-white" : "border-slate-300 text-slate-900"}`}>
                            <span>{text.remainLabel}</span>
                            <span className="text-blue-600">{formatPrice(remain)}</span>
                        </div>
                    </div>

                    {state === "found" && booking.status !== "cancelled" ? (
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setCancelReason(text.cancelReasons[0]);
                                    setState("cancel-form");
                                }}
                                className={dangerButtonClass}
                            >
                                {text.cancelBtn}
                            </button>
                            {booking.tour ? (
                                <Link href={withLocaleQuery(`/tours/${booking.tour.id}`, lang)} className={ghostButtonClass(isDark)}>
                                    {text.detailBtn}
                                </Link>
                            ) : null}
                        </div>
                    ) : null}
                </section>
            ) : null}

            {booking && state === "cancel-form" ? (
                <section className={cardClass(isDark)}>
                    <h2 className={`type-title-md ${isDark ? "text-white" : "text-slate-900"}`}>
                        {text.cancelTitle}
                    </h2>
                    <div className="mt-4">
                        <p className={`mb-3 text-sm font-extrabold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{text.policyTitle}</p>
                        <div className={`overflow-hidden rounded-[18px] border ${isDark ? "border-white/10" : "border-slate-200"}`}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={isDark ? "bg-slate-800" : "bg-slate-100"}>
                                        {text.policyHeaders.map((heading) => (
                                            <th key={heading} className={`px-4 py-2.5 text-left font-black ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                                    {text.policyRows.map(([timing, refund]) => (
                                        <tr key={timing} className={isDark ? "bg-slate-950" : "bg-white"}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{timing}</td>
                                            <td className="px-4 py-3 font-black">{refund}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <form onSubmit={handleCancelSubmit} className="mt-5 grid gap-4">
                        <div className="grid gap-2">
                            <span className={labelClass(isDark)}>{text.cancelReasonLabel}</span>
                            <Dropdown
                                value={cancelReason || text.cancelReasons[0]}
                                options={text.cancelReasons.map((reason) => ({ value: reason, label: reason }))}
                                onChange={setCancelReason}
                                isDark={isDark}
                            />
                        </div>
                        <label className="grid gap-2">
                            <span className={labelClass(isDark)}>{text.cancelMemoLabel}</span>
                            <textarea
                                value={cancelMemo}
                                onChange={(event) => setCancelMemo(event.target.value)}
                                placeholder={text.cancelMemoPlaceholder}
                                rows={3}
                                className={`w-full resize-none rounded-2xl border px-4 py-3 text-[15px] font-semibold outline-none transition ${
                                    isDark
                                        ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-blue-400"
                                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-300"
                                }`}
                            />
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <button type="submit" className="rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-500 sm:py-3.5">
                                {text.submitBtn}
                            </button>
                            <button type="button" onClick={() => setState("found")} className={ghostButtonClass(isDark)}>
                                {text.backBtn}
                            </button>
                        </div>
                    </form>
                </section>
            ) : null}

            {state === "cancel-done" ? (
                <section className={`${cardClass(isDark)} text-center`}>
                    <p className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{text.doneTitle}</p>
                    <p className={`mt-2 whitespace-pre-line text-sm leading-7 ${mutedClass(isDark)}`}>{text.doneDesc}</p>
                    <button type="button" onClick={handleReset} className={`mt-5 ${primaryButtonClass}`}>
                        {text.doneBack}
                    </button>
                </section>
            ) : null}
        </div>
    );
}

export default function BookingPage() {
    return (
        <PageShell activeKey="booking">
            <Suspense>
                <BookingLookupContent />
            </Suspense>
        </PageShell>
    );
}
