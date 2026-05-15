"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { withLocaleQuery } from "@/lib/locale-routing";
import { formatPrice } from "@/lib/bluewolf-utils";
import { type Locale } from "@/lib/bluewolf-data";
import { type CrmBookingRecord } from "@/lib/cms-crm-db";
import { Dropdown } from "@/components/ui/Dropdown";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";

type TabKey = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const myBookingsCopy = {
    ko: {
        title: "회원 진행 상태 조회",
        subtitle: "내 플랜 신청 내역",
        desc: "회원가입 시 등록한 이메일로 접수된 플랜 신청 내역을 자동으로 모아드립니다. 신청 번호 입력 없이 바로 확인할 수 있어요.",
        loginRequired: "로그인 후 회원 진행 상태 조회 페이지를 이용할 수 있습니다.",
        login: "로그인하기",
        sidebarTitle: "정렬",
        userBadge: "회원 전용",
        searchPlaceholder: "신청 번호 또는 플랜 이름으로 검색",
        sortLabel: "정렬",
        sortDepart: "출발 임박순",
        countUnit: "건",
        emptyTitle: "조회된 예약이 없습니다",
        emptyDesc: "선택한 카테고리에 해당하는 예약이 없습니다. 다른 카테고리를 확인해보세요.",
        emptyCta: "투어 둘러보기",
        loadingTitle: "플랜 신청 내역을 불러오는 중...",
        loadFail: "플랜 신청 내역을 불러올 수 없습니다.",
        tabs: {
            all: "전체",
            pending: "결제 대기",
            confirmed: "신규 예약",
            completed: "여행 완료",
            cancelled: "취소",
        } satisfies Record<TabKey, string>,
        bookingNoLabel: "신청 번호",
        bookingDateLabel: "신청일",
        departLabel: "출발일",
        guestsLabel: "인원",
        guests: (n: number) => `${n}명`,
        totalLabel: "예상 현지 여행비",
        depositLabel: "플랜료",
        remainLabel: "현지 잔금 안내",
        statusConfirmed: "BlueWolf Mongolia 확인 완료",
        statusPending: "BlueWolf Mongolia 검토 중",
        statusPaid: "플랜 패키지 결제 완료",
        statusCompleted: "여행 완료",
        statusCancelled: "취소 완료",
        cancelBtn: "플랜 이용료 환불 문의",
        detailBtn: "플랜 상세",
        receiptBtn: "플랜 신청 내역서",
        backToMypage: "← 마이페이지",
        fallbackTitle: "맞춤 여행 플랜",
        cancelReasonLabel: "취소 사유",
        summaryTotal: "총 예약",
        summaryUpcoming: "예정된 여행",
        summaryAmount: "결제 합계",
        receiptTitle: "플랜 신청 내역서",
        receiptSection: "플랜 신청 정보",
        receiptPaymentSection: "결제 정보",
        receiptCustomer: "신청자",
        receiptEmail: "이메일",
        receiptPhone: "전화번호",
        receiptCloseBtn: "닫기",
        receiptRequestBtn: "영수증 요청",
        taxInvoiceRequestBtn: "세금계산서 요청",
        taxInvoiceInfoLabel: "세금계산서 발급 정보",
        taxInvoiceInfoPlaceholder: "사업자등록번호, 상호, 담당자 이메일 등 필요한 정보를 입력해주세요.",
        receiptRequestDone: "발급 요청이 접수되었습니다.",
        receiptRequestFail: "발급 요청을 접수하지 못했습니다. 잠시 후 다시 시도해주세요.",
        cancelModalTitle: "플랜 이용료 환불 문의",
        cancelTargetLabel: "문의 대상",
        policyTitle: "플랜 이용료 환불 기준",
        policyHeaders: ["취소 시점", "환불 금액"],
        policyRows: [
            ["출발 30일 전 이상", "전액 환불"],
            ["출발 20~29일 전", "BlueWolf Mongolia 별도 기준 안내"],
            ["출발 10~19일 전", "여행 요금의 50% 환불"],
            ["출발 7~9일 전", "여행 요금의 30% 환불"],
            ["출발 7일 미만", "환불 불가"],
        ] as [string, string][],
        cancelReasons: ["개인 사정", "일정 변경", "건강 문제", "여행지 변경", "비용 문제", "기타"],
        cancelMemoLabel: "추가 메모 (선택)",
        cancelMemoPlaceholder: "취소와 관련한 추가 내용을 적어주세요.",
        submitCancelBtn: "환불 문의 접수",
        submittingCancelBtn: "처리 중...",
        cancelCloseBtn: "닫기",
        cancelDoneTitle: "플랜 이용료 환불 문의가 접수되었습니다",
        cancelDoneDesc: "영업일 기준 1~2일 이내에 확인 후 환불 안내를 드립니다.",
        cancelFailTitle: "취소 신청에 실패했습니다",
        cancelFailDesc: "잠시 후 다시 시도하거나 고객센터로 문의해주세요.",
        cancelDoneClose: "확인",
    },
    ja: {
        title: "会員進行状況照会",
        subtitle: "プラン申請履歴",
        desc: "登録メールアドレスで受け付けたプラン申請を自動的に表示します。申請番号の入力なしで確認できます。",
        loginRequired: "ログイン後にご利用いただけます。",
        login: "ログイン",
        sidebarTitle: "並び替え",
        userBadge: "会員専用",
        searchPlaceholder: "申請番号またはプラン名で検索",
        sortLabel: "並び替え",
        sortDepart: "出発が近い順",
        countUnit: "件",
        emptyTitle: "予約が見つかりません",
        emptyDesc: "選択中のカテゴリに該当する予約はありません。",
        emptyCta: "ツアーを見る",
        loadingTitle: "プラン申請履歴を読み込み中...",
        loadFail: "プラン申請履歴を読み込めません。",
        tabs: {
            all: "すべて",
            pending: "支払い待ち",
            confirmed: "新規予約",
            completed: "旅行完了",
            cancelled: "キャンセル",
        } satisfies Record<TabKey, string>,
        bookingNoLabel: "申請番号",
        bookingDateLabel: "申請日",
        departLabel: "出発日",
        guestsLabel: "人数",
        guests: (n: number) => `${n}名`,
        totalLabel: "合計金額",
        depositLabel: "プランパッケージ利用料",
        remainLabel: "現地残金案内",
        statusConfirmed: "BlueWolf Mongolia 確認完了",
        statusPending: "BlueWolf Mongolia 検討中",
        statusPaid: "プランパッケージ決済完了",
        statusCompleted: "旅行完了",
        statusCancelled: "キャンセル完了",
        cancelBtn: "プラン利用料返金問い合わせ",
        detailBtn: "プラン詳細",
        receiptBtn: "プラン申請明細",
        backToMypage: "← マイページ",
        fallbackTitle: "カスタム旅行プラン",
        cancelReasonLabel: "キャンセル理由",
        summaryTotal: "予約合計",
        summaryUpcoming: "今後の旅行",
        summaryAmount: "支払い合計",
        receiptTitle: "プラン申請明細書",
        receiptSection: "プラン申請情報",
        receiptPaymentSection: "決済情報",
        receiptCustomer: "申請者",
        receiptEmail: "メール",
        receiptPhone: "電話番号",
        receiptCloseBtn: "閉じる",
        receiptRequestBtn: "領収書を依頼",
        taxInvoiceRequestBtn: "税金計算書を依頼",
        taxInvoiceInfoLabel: "発行情報",
        taxInvoiceInfoPlaceholder: "事業者番号、会社名、担当者メールなどをご記入ください。",
        receiptRequestDone: "発行依頼を受け付けました。",
        receiptRequestFail: "発行依頼を受け付けられませんでした。しばらくしてから再度お試しください。",
        cancelModalTitle: "プラン利用料返金問い合わせ",
        cancelTargetLabel: "対象申請",
        policyTitle: "プラン利用料返金基準",
        policyHeaders: ["キャンセル時点", "返金額"],
        policyRows: [
            ["出発30日前以上", "全額返金"],
            ["出発20〜29日前", "BlueWolf Mongolia 別途基準案内"],
            ["出発10〜19日前", "旅行代金の50%返金"],
            ["出発7〜9日前", "旅行代金の30%返金"],
            ["出発7日未満", "返金不可"],
        ] as [string, string][],
        cancelReasons: ["個人都合", "日程変更", "健康上の理由", "目的地変更", "費用の問題", "その他"],
        cancelMemoLabel: "追加メモ（任意）",
        cancelMemoPlaceholder: "キャンセルに関する追加内容をご記入ください。",
        submitCancelBtn: "返金問い合わせを送信",
        submittingCancelBtn: "送信中...",
        cancelCloseBtn: "閉じる",
        cancelDoneTitle: "返金問い合わせを受け付けました",
        cancelDoneDesc: "1〜2営業日以内に確認し、返金案内をお送りします。",
        cancelFailTitle: "キャンセル申請に失敗しました",
        cancelFailDesc: "しばらくしてからもう一度お試しいただくか、サポートにお問い合わせください。",
        cancelDoneClose: "確認",
    },
    en: {
        title: "Member progress lookup",
        subtitle: "My plan applications",
        desc: "Plan applications tied to your registered email show up automatically — no application number lookup needed.",
        loginRequired: "Please log in to view your member progress lookup.",
        login: "Log in",
        sidebarTitle: "Sort",
        userBadge: "Members only",
        searchPlaceholder: "Search by application no. or plan name",
        sortLabel: "Sort",
        sortDepart: "Upcoming departures",
        countUnit: "bookings",
        emptyTitle: "No plan applications yet",
        emptyDesc: "There are no plan applications in this category.",
        emptyCta: "Browse tours",
        loadingTitle: "Loading your plan applications...",
        loadFail: "Could not load your plan applications.",
        tabs: {
            all: "All",
            pending: "Pending",
            confirmed: "Confirmed",
            completed: "Completed",
            cancelled: "Cancelled",
        } satisfies Record<TabKey, string>,
        bookingNoLabel: "Application no.",
        bookingDateLabel: "Applied on",
        departLabel: "Departure",
        guestsLabel: "Guests",
        guests: (n: number) => `${n} guests`,
        totalLabel: "Estimated local trip cost",
        depositLabel: "Plan package fee",
        remainLabel: "Local balance guidance",
        statusConfirmed: "BlueWolf Mongolia review completed",
        statusPending: "BlueWolf Mongolia reviewing",
        statusPaid: "Plan package fee paid",
        statusCompleted: "Completed",
        statusCancelled: "Cancelled",
        cancelBtn: "Plan fee refund inquiry",
        detailBtn: "Plan details",
        receiptBtn: "Plan application receipt",
        backToMypage: "← My Page",
        fallbackTitle: "Custom travel plan",
        cancelReasonLabel: "Cancellation reason",
        summaryTotal: "Total bookings",
        summaryUpcoming: "Upcoming trips",
        summaryAmount: "Total paid",
        receiptTitle: "Plan application receipt",
        receiptSection: "Plan application details",
        receiptPaymentSection: "Payment details",
        receiptCustomer: "Applicant",
        receiptEmail: "Email",
        receiptPhone: "Phone",
        receiptCloseBtn: "Close",
        receiptRequestBtn: "Request receipt",
        taxInvoiceRequestBtn: "Request tax invoice",
        taxInvoiceInfoLabel: "Tax invoice details",
        taxInvoiceInfoPlaceholder: "Enter business number, company name, billing email, or other required details.",
        receiptRequestDone: "Your issuance request has been received.",
        receiptRequestFail: "We could not submit the request. Please try again later.",
        cancelModalTitle: "Plan fee refund inquiry",
        cancelTargetLabel: "Target application",
        policyTitle: "Plan fee refund policy",
        policyHeaders: ["Cancellation timing", "Refund amount"],
        policyRows: [
            ["30+ days before departure", "Full refund"],
            ["20-29 days before", "See BlueWolf Mongolia policy"],
            ["10-19 days before", "50% refund"],
            ["7-9 days before", "30% refund"],
            ["Under 7 days", "No refund"],
        ] as [string, string][],
        cancelReasons: ["Personal reasons", "Schedule change", "Health issue", "Change of destination", "Budget concerns", "Other"],
        cancelMemoLabel: "Additional notes (optional)",
        cancelMemoPlaceholder: "Share any additional details about your cancellation.",
        submitCancelBtn: "Submit refund inquiry",
        submittingCancelBtn: "Submitting...",
        cancelCloseBtn: "Close",
        cancelDoneTitle: "Refund inquiry received",
        cancelDoneDesc: "We will review it within 1-2 business days and send refund guidance.",
        cancelFailTitle: "Cancellation request failed",
        cancelFailDesc: "Please try again later or contact customer support.",
        cancelDoneClose: "OK",
    },
} satisfies Record<Locale, Record<string, unknown>>;

type MyBookingsCopy = typeof myBookingsCopy.ko;

function getStatusLabel(status: string, c: MyBookingsCopy) {
    if (status === "confirmed") return c.statusConfirmed;
    if (status === "pending") return c.statusPending;
    if (status === "paid") return c.statusPaid;
    if (status === "completed") return c.statusCompleted;
    if (status === "cancelled") return c.statusCancelled;
    return status;
}

function getStatusBadgeClass(status: string, isDark: boolean) {
    if (status === "cancelled") {
        return isDark
            ? "border-red-400/30 bg-red-500/15 text-red-300"
            : "border-red-200 bg-red-50 text-red-600";
    }
    if (status === "paid" || status === "completed") {
        return isDark
            ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
            : "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    if (status === "confirmed") {
        return isDark
            ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
            : "border-blue-200 bg-blue-50 text-blue-700";
    }
    return isDark
        ? "border-amber-400/30 bg-amber-500/15 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-700";
}

function tabMatches(tab: TabKey, status: string) {
    if (tab === "all") return true;
    if (tab === "confirmed") return status === "confirmed" || status === "paid";
    if (tab === "completed") return status === "completed";
    if (tab === "pending") return status === "pending";
    if (tab === "cancelled") return status === "cancelled";
    return true;
}

function formatDate(value: string, locale: Locale) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const tag = locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "ko-KR";
    return new Intl.DateTimeFormat(tag, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}

export default function MemberBookingsPage() {
    return (
        <PageShell activeKey="booking">
            <MemberBookingsContent />
        </PageShell>
    );
}

function MemberBookingsContent() {
    const { user, ready } = useAuth();
    const { isDark, lang } = usePage();
    const c = myBookingsCopy[lang];
    const panel = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white";
    const subPanel = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";
    const textMain = isDark ? "text-white" : "text-slate-950";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const textSubtle = isDark ? "text-slate-300" : "text-slate-600";

    if (!ready) {
        return <div className={`rounded-[28px] border p-8 ${panel}`} />;
    }

    if (!user) {
        return (
            <section className={`rounded-[32px] border p-10 text-center ${panel}`}>
                <p className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-black text-blue-600">
                    {c.userBadge}
                </p>
                <h1 className={`type-display mt-3 ${textMain}`}>{c.title}</h1>
                <p className={`mt-3 ${textMuted}`}>{c.loginRequired}</p>
                <Link
                    href={withLocaleQuery("/login", lang)}
                    className="mt-6 inline-flex h-12 items-center rounded-2xl bg-blue-600 px-6 text-sm font-black text-white"
                >
                    {c.login}
                </Link>
            </section>
        );
    }

    return (
        <BookingsBoard
            lang={lang}
            isDark={isDark}
            c={c}
            panel={panel}
            subPanel={subPanel}
            textMain={textMain}
            textMuted={textMuted}
            textSubtle={textSubtle}
            user={{ name: user.name, email: user.email, id: user.id }}
        />
    );
}

function BookingsBoard({
    lang,
    isDark,
    c,
    panel,
    subPanel,
    textMain,
    textMuted,
    textSubtle,
    user,
}: {
    lang: Locale;
    isDark: boolean;
    c: MyBookingsCopy;
    panel: string;
    subPanel: string;
    textMain: string;
    textMuted: string;
    textSubtle: string;
    user: { name: string; email: string; id: string };
}) {
    const [tab, setTab] = useState<TabKey>("all");
    const [keyword, setKeyword] = useState("");
    const [bookings, setBookings] = useState<CrmBookingRecord[] | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [receiptBooking, setReceiptBooking] = useState<CrmBookingRecord | null>(null);
    const [cancelBooking, setCancelBooking] = useState<CrmBookingRecord | null>(null);

    const handleBookingUpdated = useCallback((updated: CrmBookingRecord) => {
        setBookings((prev) =>
            prev ? prev.map((item) => (item.id === updated.id ? updated : item)) : prev
        );
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const response = await fetch("/api/crm/bookings/mine", { cache: "no-store" });
                if (!response.ok) {
                    if (!cancelled) {
                        setBookings([]);
                        setLoadError(true);
                    }
                    return;
                }

                const data = (await response.json()) as { bookings: CrmBookingRecord[] };
                if (!cancelled) {
                    setBookings(data.bookings);
                    setLoadError(false);
                }
            } catch {
                if (!cancelled) {
                    setBookings([]);
                    setLoadError(true);
                }
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    const counts = useMemo(() => {
        const list = bookings ?? [];
        return {
            all: list.length,
            pending: list.filter((b) => b.status === "pending").length,
            confirmed: list.filter((b) => b.status === "confirmed" || b.status === "paid").length,
            completed: list.filter((b) => b.status === "completed").length,
            cancelled: list.filter((b) => b.status === "cancelled").length,
        } satisfies Record<TabKey, number>;
    }, [bookings]);

    const filtered = useMemo(() => {
        const trimmed = keyword.trim().toLowerCase();
        const list = (bookings ?? [])
            .filter((booking) => tabMatches(tab, booking.status))
            .filter((booking) => {
                if (!trimmed) return true;
                const title = booking.tour?.title[lang] || booking.customTitle || "";
                return (
                    booking.bookingNo.toLowerCase().includes(trimmed) ||
                    title.toLowerCase().includes(trimmed) ||
                    booking.customerName.toLowerCase().includes(trimmed)
                );
            });

        return [...list].sort((a, b) => {
            const createdA = new Date(a.createdAt).getTime();
            const createdB = new Date(b.createdAt).getTime();
            if (Number.isNaN(createdA) && Number.isNaN(createdB)) return b.id - a.id;
            if (Number.isNaN(createdA)) return 1;
            if (Number.isNaN(createdB)) return -1;
            if (createdA === createdB) return b.id - a.id;
            return createdB - createdA;
        });
    }, [bookings, tab, keyword, lang]);

    const tabKeys: TabKey[] = ["all", "pending", "confirmed", "completed", "cancelled"];

    return (
        <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-start">
            <aside className={`rounded-[28px] border p-5 lg:sticky lg:top-24 ${panel}`}>
                <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${subPanel}`}>
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-black text-white">
                            {(user.name || user.id).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className={`truncate text-sm font-black ${textMain}`}>{user.name || user.id}</p>
                            <p className={`truncate text-xs ${textMuted}`}>{user.email}</p>
                        </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-black text-blue-600">
                        {counts.all}{c.countUnit}
                    </span>
                </div>

                <div className="mt-5">
                    <p className={`px-2 text-xs font-black uppercase tracking-wider ${textMuted}`}>{c.sidebarTitle}</p>
                    <div className="mt-2">
                        <Dropdown
                            value={tab}
                            options={tabKeys.map((key) => ({
                                value: key,
                                label: c.tabs[key],
                            }))}
                            onChange={(value) => setTab(value as TabKey)}
                            isDark={isDark}
                        />
                    </div>
                </div>

                <Link
                    href={withLocaleQuery("/mypage", lang)}
                    className={`mt-5 inline-flex w-full items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        isDark
                            ? "border-white/10 text-slate-300 hover:bg-slate-800"
                            : "border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    {c.backToMypage}
                </Link>
            </aside>

            <div className="grid gap-5">
                <label className="grid gap-1">
                    <span className="sr-only">{c.searchPlaceholder}</span>
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder={c.searchPlaceholder}
                        className={`h-12 w-full rounded-2xl border px-5 text-[15px] font-semibold outline-none transition ${
                            isDark
                                ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-blue-400"
                                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-300"
                        }`}
                    />
                </label>

                <div className="grid gap-4">
                    {bookings === null ? (
                        <div className={`rounded-[24px] border p-10 text-center text-sm ${subPanel} ${textMuted}`}>
                            {c.loadingTitle}
                        </div>
                    ) : loadError ? (
                        <div className={`rounded-[24px] border p-10 text-center text-sm ${subPanel} ${textMuted}`}>
                            {c.loadFail}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className={`rounded-[24px] border p-12 text-center ${subPanel}`}>
                            <p className={`text-base font-black ${textMain}`}>{c.emptyTitle}</p>
                            <p className={`mt-2 text-sm ${textMuted}`}>{c.emptyDesc}</p>
                            <Link
                                href={withLocaleQuery("/tours", lang)}
                                className="mt-6 inline-flex h-11 items-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white"
                            >
                                {c.emptyCta}
                            </Link>
                        </div>
                    ) : (
                        filtered.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                lang={lang}
                                isDark={isDark}
                                c={c}
                                panel={panel}
                                subPanel={subPanel}
                                textMain={textMain}
                                textMuted={textMuted}
                                textSubtle={textSubtle}
                                onOpenReceipt={setReceiptBooking}
                                onOpenCancel={setCancelBooking}
                            />
                        ))
                    )}
                </div>
            </div>

            {receiptBooking ? (
                <ReceiptModal
                    booking={receiptBooking}
                    lang={lang}
                    isDark={isDark}
                    c={c}
                    onClose={() => setReceiptBooking(null)}
                />
            ) : null}

            {cancelBooking ? (
                <CancelModal
                    booking={cancelBooking}
                    lang={lang}
                    isDark={isDark}
                    c={c}
                    onClose={() => setCancelBooking(null)}
                    onCompleted={(updated) => {
                        handleBookingUpdated(updated);
                    }}
                />
            ) : null}
        </div>
    );
}

function BookingCard({
    booking,
    lang,
    isDark,
    c,
    panel,
    subPanel,
    textMain,
    textMuted,
    textSubtle,
    onOpenReceipt,
    onOpenCancel,
}: {
    booking: CrmBookingRecord;
    lang: Locale;
    isDark: boolean;
    c: MyBookingsCopy;
    panel: string;
    subPanel: string;
    textMain: string;
    textMuted: string;
    textSubtle: string;
    onOpenReceipt: (booking: CrmBookingRecord) => void;
    onOpenCancel: (booking: CrmBookingRecord) => void;
}) {
    const title = booking.tour?.title[lang] || booking.customTitle || c.fallbackTitle;
    const heroImage = booking.tour?.heroImage;
    const remain = Math.max(0, booking.totalAmount - booking.depositAmount);
    const statusBadgeClass = getStatusBadgeClass(booking.status, isDark);
    const canCancel = booking.status !== "cancelled" && booking.status !== "completed";
    const ghostBtn = isDark
        ? "border-white/10 bg-slate-900 text-slate-100 hover:bg-slate-800"
        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50";

    return (
        <article className={`overflow-hidden rounded-[28px] border ${panel}`}>
            <header
                className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-7 ${
                    isDark ? "border-b border-white/5 bg-slate-950/40" : "border-b border-slate-200 bg-slate-50"
                }`}
            >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                    <span className={`font-bold ${textSubtle}`}>
                        {c.bookingNoLabel}:{" "}
                        <span className={`font-black tracking-tight ${textMain}`}>{booking.bookingNo}</span>
                    </span>
                    <span className={`hidden sm:inline ${textMuted}`}>|</span>
                    <span className={`font-bold ${textSubtle}`}>
                        {c.bookingDateLabel}:{" "}
                        <span className={`font-black ${textMain}`}>{formatDate(booking.createdAt, lang)}</span>
                    </span>
                </div>
                <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${statusBadgeClass}`}
                >
                    {getStatusLabel(booking.status, c)}
                </span>
            </header>

            <div className="grid gap-5 p-5 sm:grid-cols-[200px_1fr_auto] sm:items-center sm:gap-7 sm:p-7">
                <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:h-32 sm:w-48">
                    {heroImage ? (
                        <Image
                            src={heroImage}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 200px"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500" />
                    )}
                </div>

                <div className="grid gap-2">
                    <h3 className={`type-title-md ${textMain}`}>{title}</h3>
                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${textSubtle}`}>
                        <span>
                            <span className={textMuted}>{c.departLabel}</span>{" "}
                            <span className="font-bold">{booking.departDate || "-"}</span>
                        </span>
                        <span className={textMuted}>·</span>
                        <span>
                            <span className={textMuted}>{c.guestsLabel}</span>{" "}
                            <span className="font-bold">{c.guests(booking.guests)}</span>
                        </span>
                    </div>
                    <p className={`mt-1 text-xs ${textMuted}`}>{booking.customerName}</p>
                    {booking.status === "cancelled" && booking.cancelReason ? (
                        <p className={`mt-2 inline-flex w-fit rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600"
                        }`}>
                            {c.cancelReasonLabel}: {booking.cancelReason}
                        </p>
                    ) : null}
                </div>

                <div className="text-left sm:text-right">
                    <p className={`text-xs font-bold ${textMuted}`}>{c.totalLabel}</p>
                    <p className={`text-2xl font-black ${textMain}`}>{formatPrice(booking.totalAmount)}</p>
                    <div className={`mt-2 grid gap-1 rounded-xl px-3 py-2 text-[11px] sm:min-w-[180px] ${subPanel}`}>
                        <div className="flex items-center justify-between gap-3">
                            <span className={textMuted}>{c.depositLabel}</span>
                            <span className={`font-black ${textMain}`}>{formatPrice(booking.depositAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className={textMuted}>{c.remainLabel}</span>
                            <span className={`font-black ${booking.status === "cancelled" ? textMuted : "text-blue-500"}`}>
                                {formatPrice(remain)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <footer
                className={`flex flex-wrap items-center justify-end gap-2 px-5 pb-5 sm:px-7 ${
                    isDark ? "border-t border-white/5 pt-4" : "border-t border-slate-200 pt-4"
                }`}
            >
                {booking.tour ? (
                    <Link
                        href={withLocaleQuery(`/tours/${booking.tour.id}`, lang)}
                        className={`inline-flex h-10 items-center rounded-xl border px-4 text-sm font-bold transition ${ghostBtn}`}
                    >
                        {c.detailBtn}
                    </Link>
                ) : null}
                <button
                    type="button"
                    onClick={() => onOpenReceipt(booking)}
                    className={`inline-flex h-10 items-center rounded-xl border px-4 text-sm font-bold transition ${ghostBtn}`}
                >
                    {c.receiptBtn}
                </button>
                {canCancel ? (
                    <button
                        type="button"
                        onClick={() => onOpenCancel(booking)}
                        className="inline-flex h-10 items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                        {c.cancelBtn}
                    </button>
                ) : null}
            </footer>
        </article>
    );
}

function ModalShell({
    isDark,
    onClose,
    labelledBy,
    children,
    size = "md",
}: {
    isDark: boolean;
    onClose: () => void;
    labelledBy: string;
    children: React.ReactNode;
    size?: "md" | "lg";
}) {
    useBodyScrollLock(true);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => {
            window.removeEventListener("keydown", handleKey);
        };
    }, [onClose]);

    if (typeof document === "undefined") return null;

    const widthClass = size === "lg" ? "max-w-2xl" : "max-w-lg";

    return createPortal(
        <div
            className={`fixed inset-0 z-[140] flex h-dvh w-screen items-center justify-center p-4 backdrop-blur-md sm:p-6 ${
                isDark ? "bg-slate-950/70" : "bg-slate-900/35"
            }`}
        >
            <button
                type="button"
                aria-label="close"
                onClick={onClose}
                className="absolute inset-0"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                className={`relative z-10 w-full ${widthClass} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[28px] border shadow-2xl ${
                    isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                }`}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

function ReceiptModal({
    booking,
    lang,
    isDark,
    c,
    onClose,
}: {
    booking: CrmBookingRecord;
    lang: Locale;
    isDark: boolean;
    c: MyBookingsCopy;
    onClose: () => void;
}) {
    const title = booking.tour?.title[lang] || booking.customTitle || c.fallbackTitle;
    const remain = Math.max(0, booking.totalAmount - booking.depositAmount);
    const subPanel = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const textMain = isDark ? "text-white" : "text-slate-950";
    const statusBadgeClass = getStatusBadgeClass(booking.status, isDark);
    const [businessInfo, setBusinessInfo] = useState("");
    const [requestState, setRequestState] = useState<"idle" | "submitting" | "done" | "error">("idle");

    const rows: [string, string][] = [
        [c.bookingNoLabel, booking.bookingNo],
        [c.bookingDateLabel, formatDate(booking.createdAt, lang)],
        [c.departLabel, booking.departDate || "-"],
        [c.guestsLabel, c.guests(booking.guests)],
        [c.receiptCustomer, booking.customerName],
        [c.receiptEmail, booking.email || "-"],
        [c.receiptPhone, booking.phone || "-"],
    ];

    async function submitReceiptRequest(requestType: "receipt" | "tax_invoice") {
        if (requestState === "submitting") return;
        setRequestState("submitting");

        try {
            const response = await fetch("/api/crm/bookings/receipt-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingNo: booking.bookingNo,
                    requestType,
                    businessInfo,
                }),
            });
            setRequestState(response.ok ? "done" : "error");
        } catch {
            setRequestState("error");
        }
    }

    return (
        <ModalShell isDark={isDark} onClose={onClose} labelledBy="receipt-modal-title" size="lg">
            <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-black text-blue-600">
                            {c.receiptTitle}
                        </p>
                        <h2 id="receipt-modal-title" className={`type-title-lg mt-3 ${textMain}`}>
                            {title}
                        </h2>
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${statusBadgeClass}`}>
                        {getStatusLabel(booking.status, c)}
                    </span>
                </div>

                <section className="mt-6">
                    <p className={`text-xs font-black uppercase tracking-wider ${textMuted}`}>{c.receiptSection}</p>
                    <div className={`mt-2 divide-y rounded-2xl border ${subPanel} ${
                        isDark ? "divide-white/5" : "divide-slate-100"
                    }`}>
                        {rows.map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-3 px-4 py-3">
                                <span className={`text-sm font-semibold ${textMuted}`}>{label}</span>
                                <span className={`text-right text-sm font-black ${textMain}`}>{value}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-5">
                    <p className={`text-xs font-black uppercase tracking-wider ${textMuted}`}>{c.receiptPaymentSection}</p>
                    <div className={`mt-2 rounded-2xl border p-4 ${subPanel}`}>
                        <div className={`flex items-center justify-between py-1.5 text-sm font-bold ${
                            isDark ? "text-slate-300" : "text-slate-600"
                        }`}>
                            <span>{c.totalLabel}</span>
                            <span>{formatPrice(booking.totalAmount)}</span>
                        </div>
                        <div className={`flex items-center justify-between py-1.5 text-sm font-bold ${
                            isDark ? "text-slate-300" : "text-slate-600"
                        }`}>
                            <span>{c.depositLabel}</span>
                            <span>{formatPrice(booking.depositAmount)}</span>
                        </div>
                        <div className={`mt-2 flex items-center justify-between border-t pt-3 text-base font-black ${
                            isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-900"
                        }`}>
                            <span>{c.remainLabel}</span>
                            <span className={booking.status === "cancelled" ? textMuted : "text-blue-600"}>
                                {formatPrice(remain)}
                            </span>
                        </div>
                    </div>
                </section>

                {booking.status === "cancelled" && booking.cancelReason ? (
                    <section className={`mt-5 rounded-2xl border p-4 ${
                        isDark ? "border-red-400/20 bg-red-500/10" : "border-red-200 bg-red-50"
                    }`}>
                        <p className={`text-xs font-black uppercase tracking-wider ${
                            isDark ? "text-red-300" : "text-red-600"
                        }`}>
                            {c.cancelReasonLabel}
                        </p>
                        <p className={`mt-2 text-sm font-bold ${isDark ? "text-red-200" : "text-red-700"}`}>
                            {booking.cancelReason}
                        </p>
                        {booking.cancelMemo ? (
                            <p className={`mt-1 text-xs ${isDark ? "text-red-200/80" : "text-red-700/80"}`}>
                                {booking.cancelMemo}
                            </p>
                        ) : null}
                    </section>
                ) : null}

                <section className="mt-5">
                    <label className="grid gap-2">
                        <span className={`text-xs font-black uppercase tracking-wider ${textMuted}`}>
                            {c.taxInvoiceInfoLabel}
                        </span>
                        <textarea
                            value={businessInfo}
                            onChange={(event) => setBusinessInfo(event.target.value)}
                            rows={3}
                            placeholder={c.taxInvoiceInfoPlaceholder}
                            className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                                isDark
                                    ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-blue-400"
                                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-300"
                            }`}
                        />
                    </label>
                    {requestState === "done" || requestState === "error" ? (
                        <p
                            className={`mt-3 rounded-2xl px-4 py-3 text-sm font-bold ${
                                requestState === "done"
                                    ? isDark
                                        ? "bg-emerald-500/10 text-emerald-200"
                                        : "bg-emerald-50 text-emerald-700"
                                    : isDark
                                      ? "bg-red-500/10 text-red-200"
                                      : "bg-red-50 text-red-700"
                            }`}
                        >
                            {requestState === "done" ? c.receiptRequestDone : c.receiptRequestFail}
                        </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => void submitReceiptRequest("receipt")}
                            disabled={requestState === "submitting"}
                            className={`inline-flex h-11 items-center rounded-2xl border px-5 text-sm font-bold transition disabled:opacity-60 ${
                                isDark
                                    ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                            }`}
                        >
                            {c.receiptRequestBtn}
                        </button>
                        <button
                            type="button"
                            onClick={() => void submitReceiptRequest("tax_invoice")}
                            disabled={requestState === "submitting"}
                            className="inline-flex h-11 items-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-500 disabled:opacity-60"
                        >
                            {c.taxInvoiceRequestBtn}
                        </button>
                    </div>
                </section>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-11 items-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-500"
                    >
                        {c.receiptCloseBtn}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

function CancelModal({
    booking,
    lang,
    isDark,
    c,
    onClose,
    onCompleted,
}: {
    booking: CrmBookingRecord;
    lang: Locale;
    isDark: boolean;
    c: MyBookingsCopy;
    onClose: () => void;
    onCompleted: (updated: CrmBookingRecord) => void;
}) {
    const title = booking.tour?.title[lang] || booking.customTitle || c.fallbackTitle;
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const textMain = isDark ? "text-white" : "text-slate-950";
    const labelClass = `text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-800"}`;

    const [reason, setReason] = useState(c.cancelReasons[0]);
    const [memo, setMemo] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState<"success" | "error" | null>(null);
    const [refundMessage, setRefundMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        try {
            const response = await fetch("/api/crm/bookings/mine/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingNo: booking.bookingNo,
                    cancelReason: reason,
                    cancelMemo: memo,
                }),
            });

            if (!response.ok) {
                setDone("error");
                return;
            }

            const data = (await response.json()) as {
                booking: CrmBookingRecord;
                refundMessage?: string;
            };
            onCompleted(data.booking);
            setRefundMessage(data.refundMessage ?? "");
            setDone("success");
        } catch {
            setDone("error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ModalShell isDark={isDark} onClose={onClose} labelledBy="cancel-modal-title" size="lg">
            <div className="p-6 sm:p-8">
                {done === "success" ? (
                    <div className="text-center">
                        <p className={`text-2xl font-black ${textMain}`} id="cancel-modal-title">
                            {c.cancelDoneTitle}
                        </p>
                        <p className={`mt-3 whitespace-pre-line text-sm leading-7 ${textMuted}`}>
                            {c.cancelDoneDesc}
                        </p>
                        {refundMessage ? (
                            <p className={`mx-auto mt-4 max-w-md rounded-2xl px-4 py-3 text-left text-sm leading-6 ${
                                isDark ? "bg-blue-500/10 text-blue-200" : "bg-blue-50 text-blue-700"
                            }`}>
                                {refundMessage}
                            </p>
                        ) : null}
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 inline-flex h-11 items-center rounded-2xl bg-blue-600 px-6 text-sm font-black text-white"
                        >
                            {c.cancelDoneClose}
                        </button>
                    </div>
                ) : done === "error" ? (
                    <div className="text-center">
                        <p className={`text-2xl font-black ${textMain}`} id="cancel-modal-title">
                            {c.cancelFailTitle}
                        </p>
                        <p className={`mt-3 text-sm leading-7 ${textMuted}`}>{c.cancelFailDesc}</p>
                        <div className="mt-6 flex justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setDone(null)}
                                className={`inline-flex h-11 items-center rounded-2xl border px-5 text-sm font-bold transition ${
                                    isDark
                                        ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                                }`}
                            >
                                {c.submitCancelBtn}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-11 items-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white"
                            >
                                {c.cancelCloseBtn}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-xs font-black text-red-600">
                                    {c.cancelModalTitle}
                                </p>
                                <h2 id="cancel-modal-title" className={`type-title-lg mt-3 ${textMain}`}>
                                    {title}
                                </h2>
                                <p className={`mt-1 text-xs ${textMuted}`}>
                                    {c.cancelTargetLabel} · {booking.bookingNo}
                                </p>
                            </div>
                        </div>

                        <section className="mt-5">
                            <p className={labelClass}>{c.policyTitle}</p>
                            <div className={`mt-2 overflow-hidden rounded-2xl border ${
                                isDark ? "border-white/10" : "border-slate-200"
                            }`}>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={isDark ? "bg-slate-800" : "bg-slate-100"}>
                                            {c.policyHeaders.map((heading) => (
                                                <th
                                                    key={heading}
                                                    className={`px-4 py-2.5 text-left font-black ${
                                                        isDark ? "text-slate-200" : "text-slate-700"
                                                    }`}
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
                                        {c.policyRows.map(([timing, refund]) => (
                                            <tr key={timing} className={isDark ? "bg-slate-950" : "bg-white"}>
                                                <td className={`px-4 py-2.5 font-semibold ${
                                                    isDark ? "text-slate-300" : "text-slate-600"
                                                }`}>
                                                    {timing}
                                                </td>
                                                <td className={`px-4 py-2.5 font-black ${textMain}`}>{refund}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
                            <div className="grid gap-2">
                                <span className={labelClass}>{c.cancelReasonLabel}</span>
                                <Dropdown
                                    value={reason}
                                    options={c.cancelReasons.map((value) => ({ value, label: value }))}
                                    onChange={setReason}
                                    isDark={isDark}
                                />
                            </div>
                            <label className="grid gap-2">
                                <span className={labelClass}>{c.cancelMemoLabel}</span>
                                <textarea
                                    value={memo}
                                    onChange={(event) => setMemo(event.target.value)}
                                    placeholder={c.cancelMemoPlaceholder}
                                    rows={3}
                                    className={`w-full resize-none rounded-2xl border px-4 py-3 text-[15px] font-semibold outline-none transition ${
                                        isDark
                                            ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-blue-400"
                                            : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-300"
                                    }`}
                                />
                            </label>
                            <div className="flex flex-wrap justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={submitting}
                                    className={`inline-flex h-11 items-center rounded-2xl border px-5 text-sm font-bold transition disabled:opacity-50 ${
                                        isDark
                                            ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                                    }`}
                                >
                                    {c.cancelCloseBtn}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex h-11 items-center rounded-2xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-500 disabled:opacity-60"
                                >
                                    {submitting ? c.submittingCancelBtn : c.submitCancelBtn}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </ModalShell>
    );
}
