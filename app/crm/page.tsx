"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AdminGate } from "@/components/auth/AdminGate";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { Dropdown } from "@/components/ui/Dropdown";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";
import type { CrmBookingRecord, CrmInquiryRecord, CrmPaymentOrderRecord } from "@/lib/cms-crm-db";

type Overview = {
    inquiryCount: number;
    bookingCount: number;
    cancelledCount: number;
    latestInquiryAt: string | null;
    latestBookingAt: string | null;
};

type CrmTab = "dashboard" | "customers" | "bookings" | "inquiries" | "payments";

type SelectOption = {
    value: string;
    label: string;
};

type CustomerRecord = {
    key: string;
    name: string;
    email: string;
    phone: string;
    bookingCount: number;
    inquiryCount: number;
    cancelledCount: number;
    totalAmount: number;
    depositAmount: number;
    latestAt: string;
    latestTour: string;
    status: "active" | "pending" | "cancelled" | "inquiry";
};

type FollowUpItem = {
    key: string;
    label: string;
    title: string;
    desc: string;
    tone: "blue" | "red" | "amber" | "slate";
};

const bookingStatusOptions = [
    { value: "confirmed", label: "예약 확정" },
    { value: "cancelled", label: "예약 취소" },
    { value: "paid", label: "결제 완료" },
] as const;

const inquiryStatusOptions = [
    { value: "new", label: "신규 문의" },
    { value: "checking", label: "확인 중" },
    { value: "answered", label: "답변 완료" },
    { value: "closed", label: "종료" },
] as const;

const cancellationReasonOptions = [
    { value: "고객 요청", label: "고객 요청" },
    { value: "일정 변경", label: "일정 변경" },
    { value: "건강 문제", label: "건강 문제" },
    { value: "결제 문제", label: "결제 문제" },
    { value: "운영상 취소", label: "운영상 취소" },
    { value: "기타", label: "기타" },
] as const;

const paymentStatusLabels: Record<string, string> = {
    ready: "결제 대기",
    paid: "결제 완료",
    failed: "결제 실패",
    cancelled: "결제 취소",
};

const bookingStatusLabels: Record<string, string> = {
    pending: "확인 대기",
    confirmed: "예약 확정",
    cancelled: "예약 취소",
    paid: "결제 완료",
    completed: "여행 완료",
};

const revenueStatuses = new Set(["confirmed", "paid", "completed"]);

const formatCurrency = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
});

function formatDate(value: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getMonthKey(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
    const [year, month] = monthKey.split("-");
    return `${year}년 ${Number(month)}월`;
}

function getTourTitle(record: CrmBookingRecord | CrmPaymentOrderRecord) {
    return record.customTitle || record.tour?.title.ko || "-";
}

function getBookingStatusBadgeClass(status: string, isDark: boolean) {
    if (status === "cancelled") return "bg-red-500 text-white";
    if (status === "confirmed") return "bg-blue-600 text-white";
    if (status === "paid") return "bg-emerald-500 text-white";
    return isDark ? "bg-slate-700 text-slate-100" : "bg-slate-200 text-slate-700";
}

function getBookingStatusButtonClass(status: string, active: boolean, isDark: boolean) {
    if (status === "cancelled") {
        return active
            ? "bg-red-500 text-white shadow-[0_8px_18px_rgba(239,68,68,0.22)]"
            : isDark
              ? "border border-red-400/30 bg-red-500/10 text-red-200 hover:border-red-400 hover:bg-red-500/20"
              : "border border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100";
    }

    if (status === "paid") {
        return active
            ? "bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.22)]"
            : isDark
              ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-500/20"
              : "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100";
    }

    if (status === "confirmed") {
        return active
            ? "bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)]"
            : isDark
              ? "border border-blue-400/30 bg-blue-500/10 text-blue-200 hover:border-blue-400 hover:bg-blue-500/20"
              : "border border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100";
    }

    return active
        ? "bg-slate-700 text-white"
        : isDark
          ? "border border-white/10 bg-slate-900 text-slate-300 hover:border-blue-400/50 hover:text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600";
}

function normalizeContactValue(value: string | null | undefined) {
    return String(value || "").trim();
}

function getCustomerKey(name: string, email: string, phone: string) {
    const normalizedEmail = normalizeContactValue(email).toLowerCase();
    const normalizedPhone = normalizeContactValue(phone).replace(/[^\d]/g, "");
    const normalizedName = normalizeContactValue(name).toLowerCase();

    return normalizedEmail || normalizedPhone || normalizedName || "unknown";
}

function getCustomerStatus(customer: CustomerRecord): CustomerRecord["status"] {
    if (customer.bookingCount === 0 && customer.inquiryCount > 0) return "inquiry";
    if (customer.cancelledCount > 0 && customer.cancelledCount === customer.bookingCount) return "cancelled";
    if (customer.bookingCount > 0 && customer.totalAmount === 0) return "pending";
    return "active";
}

function getCustomerStatusLabel(status: CustomerRecord["status"]) {
    if (status === "active") return "활성 고객";
    if (status === "pending") return "확인 필요";
    if (status === "cancelled") return "취소 이력";
    return "문의 고객";
}

function getCustomerStatusClass(status: CustomerRecord["status"], isDark: boolean) {
    if (status === "active") return "bg-emerald-500 text-white";
    if (status === "pending") return "bg-blue-600 text-white";
    if (status === "cancelled") return "bg-red-500 text-white";
    return isDark ? "bg-slate-700 text-slate-100" : "bg-slate-200 text-slate-700";
}

function getFollowUpToneClass(tone: FollowUpItem["tone"], isDark: boolean) {
    if (tone === "blue") return "bg-blue-600 text-white";
    if (tone === "red") return "bg-red-500 text-white";
    if (tone === "amber") return "bg-amber-400 text-slate-950";
    return isDark ? "bg-slate-700 text-slate-100" : "bg-slate-200 text-slate-700";
}

function isLaterThan(current: string, next: string) {
    return new Date(next).getTime() > new Date(current).getTime();
}

function buildCustomerRecords(bookings: CrmBookingRecord[], inquiries: CrmInquiryRecord[]) {
    const customers = new Map<string, CustomerRecord>();

    for (const booking of bookings) {
        const key = getCustomerKey(booking.customerName, booking.email, booking.phone);
        const current =
            customers.get(key) ??
            ({
                key,
                name: normalizeContactValue(booking.customerName) || "이름 없음",
                email: normalizeContactValue(booking.email),
                phone: normalizeContactValue(booking.phone),
                bookingCount: 0,
                inquiryCount: 0,
                cancelledCount: 0,
                totalAmount: 0,
                depositAmount: 0,
                latestAt: booking.createdAt,
                latestTour: getTourTitle(booking),
                status: "pending",
            } satisfies CustomerRecord);

        current.name = current.name === "이름 없음" ? normalizeContactValue(booking.customerName) || current.name : current.name;
        current.email = current.email || normalizeContactValue(booking.email);
        current.phone = current.phone || normalizeContactValue(booking.phone);
        current.bookingCount += 1;
        current.cancelledCount += booking.status === "cancelled" ? 1 : 0;
        current.totalAmount += revenueStatuses.has(booking.status) ? Math.max(0, Number(booking.totalAmount || 0)) : 0;
        current.depositAmount += revenueStatuses.has(booking.status) ? Math.max(0, Number(booking.depositAmount || 0)) : 0;
        if (isLaterThan(current.latestAt, booking.createdAt)) {
            current.latestAt = booking.createdAt;
            current.latestTour = getTourTitle(booking);
        }
        customers.set(key, current);
    }

    for (const inquiry of inquiries) {
        const key = getCustomerKey(inquiry.name, inquiry.email, inquiry.phone);
        const current =
            customers.get(key) ??
            ({
                key,
                name: normalizeContactValue(inquiry.name) || "이름 없음",
                email: normalizeContactValue(inquiry.email),
                phone: normalizeContactValue(inquiry.phone),
                bookingCount: 0,
                inquiryCount: 0,
                cancelledCount: 0,
                totalAmount: 0,
                depositAmount: 0,
                latestAt: inquiry.createdAt,
                latestTour: inquiry.subject,
                status: "inquiry",
            } satisfies CustomerRecord);

        current.name = current.name === "이름 없음" ? normalizeContactValue(inquiry.name) || current.name : current.name;
        current.email = current.email || normalizeContactValue(inquiry.email);
        current.phone = current.phone || normalizeContactValue(inquiry.phone);
        current.inquiryCount += 1;
        if (isLaterThan(current.latestAt, inquiry.createdAt)) {
            current.latestAt = inquiry.createdAt;
            current.latestTour = inquiry.subject;
        }
        customers.set(key, current);
    }

    return Array.from(customers.values())
        .map((customer) => ({ ...customer, status: getCustomerStatus(customer) }))
        .sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());
}

function sumBookingRevenue(bookings: CrmBookingRecord[]) {
    return bookings
        .filter((booking) => revenueStatuses.has(booking.status))
        .reduce((sum, booking) => sum + Math.max(0, Number(booking.totalAmount || 0)), 0);
}

function sumBookingDepositRevenue(bookings: CrmBookingRecord[]) {
    return bookings
        .filter((booking) => revenueStatuses.has(booking.status))
        .reduce((sum, booking) => sum + Math.max(0, Number(booking.depositAmount || 0)), 0);
}

function getRevenueBalance(total: number, deposit: number) {
    return Math.max(0, total - deposit);
}

function getPercentage(value: number, total: number) {
    if (total <= 0) return 0;
    return Math.round((value / total) * 100);
}

function CrmContent() {
    const { isDark } = usePage();
    const [activeTab, setActiveTab] = useState<CrmTab>("dashboard");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<CrmBookingRecord | null>(null);
    const [cancelTarget, setCancelTarget] = useState<CrmBookingRecord | null>(null);
    const [cancelReason, setCancelReason] = useState<string>(cancellationReasonOptions[0].value);
    const [cancelMemo, setCancelMemo] = useState("");
    const [cancelSaving, setCancelSaving] = useState(false);
    const [overview, setOverview] = useState<Overview | null>(null);
    const [inquiries, setInquiries] = useState<CrmInquiryRecord[]>([]);
    const [bookings, setBookings] = useState<CrmBookingRecord[]>([]);
    const [orders, setOrders] = useState<CrmPaymentOrderRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState("");
    const [error, setError] = useState("");

    const panelTone = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900";
    const surfaceTone = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const strongMutedTone = isDark ? "text-slate-300" : "text-slate-700";

    const loadCrmData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [overviewResponse, inquiriesResponse, bookingsResponse, ordersResponse] = await Promise.all([
                fetch("/api/crm/overview", { cache: "no-store" }),
                fetch("/api/crm/inquiries", { cache: "no-store" }),
                fetch("/api/crm/bookings", { cache: "no-store" }),
                fetch("/api/crm/payment-orders", { cache: "no-store" }),
            ]);

            if (!overviewResponse.ok || !inquiriesResponse.ok || !bookingsResponse.ok || !ordersResponse.ok) {
                throw new Error("CRM 데이터를 불러오지 못했습니다.");
            }

            const overviewData = (await overviewResponse.json()) as { overview: Overview };
            const inquiriesData = (await inquiriesResponse.json()) as { inquiries: CrmInquiryRecord[] };
            const bookingsData = (await bookingsResponse.json()) as { bookings: CrmBookingRecord[] };
            const ordersData = (await ordersResponse.json()) as { orders: CrmPaymentOrderRecord[] };

            setOverview(overviewData.overview);
            setInquiries(inquiriesData.inquiries);
            setBookings(bookingsData.bookings);
            setOrders(ordersData.orders);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "CRM 데이터를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCrmData();
    }, [loadCrmData]);

    const monthOptions = useMemo<SelectOption[]>(() => {
        const monthKeys = Array.from(new Set(bookings.map((booking) => getMonthKey(booking.createdAt)).filter(Boolean))).sort((a, b) =>
            b.localeCompare(a)
        );

        return [
            { value: "all", label: "전체 월" },
            ...monthKeys.map((monthKey) => ({
                value: monthKey,
                label: getMonthLabel(monthKey),
            })),
        ];
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        if (selectedMonth === "all") return bookings;
        return bookings.filter((booking) => getMonthKey(booking.createdAt) === selectedMonth);
    }, [bookings, selectedMonth]);

    const customers = useMemo(() => buildCustomerRecords(bookings, inquiries), [bookings, inquiries]);

    const filteredCustomers = useMemo(() => {
        const query = customerSearch.trim().toLowerCase();
        if (!query) return customers;

        return customers.filter((customer) =>
            [customer.name, customer.email, customer.phone, customer.latestTour].some((value) =>
                value.toLowerCase().includes(query)
            )
        );
    }, [customerSearch, customers]);

    const followUpItems = useMemo<FollowUpItem[]>(() => {
        const pendingBookings = bookings
            .filter((booking) => booking.status === "pending")
            .slice(0, 4)
            .map((booking) => ({
                key: `booking-${booking.id}`,
                label: "예약 확인",
                title: getTourTitle(booking),
                desc: `${booking.customerName} · ${booking.departDate || "출발일 미정"} · ${booking.guests}명`,
                tone: "blue" as const,
            }));
        const newInquiries = inquiries
            .filter((inquiry) => inquiry.status === "new" || inquiry.status === "checking")
            .slice(0, 4)
            .map((inquiry) => ({
                key: `inquiry-${inquiry.id}`,
                label: inquiry.status === "new" ? "신규 문의" : "확인 중",
                title: inquiry.subject,
                desc: `${inquiry.name} · ${formatDate(inquiry.createdAt)}`,
                tone: "amber" as const,
            }));
        const failedPayments = orders
            .filter((order) => order.status === "failed" || order.status === "ready")
            .slice(0, 4)
            .map((order) => ({
                key: `payment-${order.id}`,
                label: order.status === "failed" ? "결제 실패" : "결제 대기",
                title: getTourTitle(order),
                desc: `${order.customerName} · ${formatCurrency.format(order.amount)}`,
                tone: order.status === "failed" ? ("red" as const) : ("slate" as const),
            }));

        return [...pendingBookings, ...newInquiries, ...failedPayments].slice(0, 8);
    }, [bookings, inquiries, orders]);

    const revenueSummary = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
        const targetMonth = selectedMonth === "all" ? currentMonth : selectedMonth;
        const yearlyBookings = bookings.filter((booking) => {
            const monthKey = getMonthKey(booking.createdAt);
            return monthKey.startsWith(`${currentYear}-`);
        });
        const monthlyBookings = bookings.filter((booking) => getMonthKey(booking.createdAt) === targetMonth);

        return {
            total: sumBookingRevenue(bookings),
            totalDeposit: sumBookingDepositRevenue(bookings),
            annual: sumBookingRevenue(yearlyBookings),
            annualDeposit: sumBookingDepositRevenue(yearlyBookings),
            monthly: sumBookingRevenue(monthlyBookings),
            monthlyDeposit: sumBookingDepositRevenue(monthlyBookings),
            monthlyLabel: selectedMonth === "all" ? "이번 달 매출" : `${getMonthLabel(targetMonth)} 매출`,
            filtered: sumBookingRevenue(filteredBookings),
            filteredDeposit: sumBookingDepositRevenue(filteredBookings),
            filteredLabel: selectedMonth === "all" ? "전체 기간" : getMonthLabel(selectedMonth),
        };
    }, [bookings, filteredBookings, selectedMonth]);

    const stats = useMemo(
        () => [
            { label: "전체 고객", value: `${customers.length}명`, note: "예약과 문의 기준 자동 집계" },
            { label: "전체 예약", value: `${overview?.bookingCount ?? bookings.length}건`, note: `취소 ${overview?.cancelledCount ?? 0}건 포함` },
            { label: "연간 매출", value: formatCurrency.format(revenueSummary.annual), note: `${new Date().getFullYear()}년 예약 기준` },
            { label: "처리 대기", value: `${followUpItems.length}건`, note: "예약 확인, 신규 문의, 결제 이슈" },
        ],
        [bookings.length, customers.length, followUpItems.length, overview, revenueSummary]
    );

    const selectedRevenue = useMemo(() => {
        const total = revenueSummary.filtered;
        const deposit = revenueSummary.filteredDeposit;
        const balance = getRevenueBalance(total, deposit);

        return {
            total,
            deposit,
            balance,
            depositPercent: getPercentage(deposit, total),
            balancePercent: getPercentage(balance, total),
        };
    }, [revenueSummary.filtered, revenueSummary.filteredDeposit]);

    async function updateBookingStatus(id: number, status: string) {
        setSavingKey(`booking-${id}`);
        setError("");

        try {
            const response = await fetch("/api/crm/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            if (!response.ok) throw new Error("예약 상태를 저장하지 못했습니다.");

            const data = (await response.json()) as {
                booking: CrmBookingRecord;
                emailSent?: boolean;
                emailReason?: string;
            };
            setBookings((current) => {
                const nextBookings = current.map((booking) => (booking.id === id ? data.booking : booking));
                setOverview((currentOverview) =>
                    currentOverview
                        ? {
                              ...currentOverview,
                              cancelledCount: nextBookings.filter((booking) => booking.status === "cancelled").length,
                          }
                        : currentOverview
                );
                return nextBookings;
            });

            if (status === "confirmed" && !data.emailSent) {
                const message =
                    data.emailReason === "missing_email"
                        ? "예약은 확정됐지만 고객 이메일이 없어 확정 메일을 보내지 못했습니다."
                        : data.emailReason === "smtp_not_configured"
                          ? "예약은 확정됐지만 SMTP 메일 설정이 없어 확정 메일을 보내지 못했습니다."
                          : "예약은 확정됐지만 확정 메일 발송 중 문제가 발생했습니다.";
                setError(message);
            }
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "예약 상태를 저장하지 못했습니다.");
        } finally {
            setSavingKey("");
        }
    }

    async function submitAdminCancellation() {
        if (!cancelTarget || !cancelReason.trim()) return;

        setCancelSaving(true);
        setError("");

        try {
            const response = await fetch("/api/crm/bookings/admin-cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: cancelTarget.id,
                    cancelReason,
                    cancelMemo,
                }),
            });

            const data = (await response.json().catch(() => null)) as
                | { booking?: CrmBookingRecord; error?: string; refundMessage?: string }
                | null;

            if (!response.ok || !data?.booking) {
                throw new Error(data?.error || "예약 취소 처리에 실패했습니다.");
            }

            setBookings((current) => {
                const nextBookings = current.map((booking) => (booking.id === data.booking?.id ? data.booking : booking));
                setOverview((currentOverview) =>
                    currentOverview
                        ? {
                              ...currentOverview,
                              cancelledCount: nextBookings.filter((booking) => booking.status === "cancelled").length,
                          }
                        : currentOverview
                );
                return nextBookings;
            });
            setCancelTarget(null);
            setCancelMemo("");
            setCancelReason(cancellationReasonOptions[0].value);
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "예약 취소 처리에 실패했습니다.");
        } finally {
            setCancelSaving(false);
        }
    }

    async function updateInquiryStatus(id: number, status: string) {
        setSavingKey(`inquiry-${id}`);
        setError("");

        try {
            const response = await fetch("/api/crm/inquiries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });

            if (!response.ok) throw new Error("문의 상태를 저장하지 못했습니다.");

            const data = (await response.json()) as { inquiry: CrmInquiryRecord };
            setInquiries((current) => current.map((inquiry) => (inquiry.id === id ? data.inquiry : inquiry)));
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "문의 상태를 저장하지 못했습니다.");
        } finally {
            setSavingKey("");
        }
    }

    const tabs = [
        { key: "dashboard", label: "운영 대시보드", count: followUpItems.length },
        { key: "customers", label: "고객명단", count: customers.length },
        { key: "bookings", label: "예약 관리", count: filteredBookings.length },
        { key: "inquiries", label: "문의 관리", count: inquiries.length },
        { key: "payments", label: "결제 관리", count: orders.length },
    ] satisfies Array<{ key: CrmTab; label: string; count: number }>;

    return (
        <AdminGate isDark={isDark}>
            <div className="grid gap-5">
                <section className={`rounded-[28px] border p-6 shadow-sm ${panelTone}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-black text-blue-500">CRM</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight">고객 운영 CRM</h1>
                            <p className={`mt-2 text-sm ${mutedTone}`}>
                                고객명단, 예약, 문의, 결제, 후속 조치를 한 곳에서 확인하고 관리합니다.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                            <div className="w-full sm:w-56">
                                <p className={`mb-2 text-xs font-black ${mutedTone}`}>기간 선택</p>
                                <Dropdown
                                    value={selectedMonth}
                                    options={monthOptions}
                                    onChange={(value) => {
                                        setSelectedMonth(value);
                                        setActiveTab("bookings");
                                    }}
                                    isDark={isDark}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => void loadCrmData()}
                                className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-500"
                            >
                                새로고침
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
                        <RevenueDonutCard
                            total={selectedRevenue.total}
                            deposit={selectedRevenue.deposit}
                            balance={selectedRevenue.balance}
                            depositPercent={selectedRevenue.depositPercent}
                            balancePercent={selectedRevenue.balancePercent}
                            label={revenueSummary.filteredLabel}
                            isDark={isDark}
                        />
                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                            <RevenueMetric
                                label="총매출"
                                value={formatCurrency.format(selectedRevenue.total)}
                                note={`${revenueSummary.filteredLabel} 취소 제외`}
                                isDark={isDark}
                            />
                            <RevenueMetric
                                label="예약금 매출"
                                value={formatCurrency.format(selectedRevenue.deposit)}
                                note={`${selectedRevenue.depositPercent}% 구성`}
                                isDark={isDark}
                            />
                            <RevenueMetric
                                label="예약금 외 매출"
                                value={formatCurrency.format(selectedRevenue.balance)}
                                note={`${selectedRevenue.balancePercent}% 구성`}
                                isDark={isDark}
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((item) => (
                            <div key={item.label} className={`rounded-2xl border p-4 ${surfaceTone}`}>
                                <p className={`text-sm font-bold ${mutedTone}`}>{item.label}</p>
                                <p className="mt-2 text-2xl font-black tracking-tight lg:text-3xl">{item.value}</p>
                                <p className={`mt-2 text-xs font-semibold ${mutedTone}`}>{item.note}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`rounded-[28px] border p-4 shadow-sm sm:p-6 ${panelTone}`}>
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => {
                            const active = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`h-11 rounded-2xl px-4 text-sm font-black transition ${
                                        active
                                            ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]"
                                            : isDark
                                              ? "bg-slate-950 text-slate-300 hover:bg-slate-800"
                                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {tab.label} {tab.count}
                                </button>
                            );
                        })}
                    </div>

                    {loading ? (
                        <div className={`mt-5 rounded-3xl border p-8 text-center text-sm font-bold ${surfaceTone} ${mutedTone}`}>
                            CRM 데이터를 불러오는 중입니다.
                        </div>
                    ) : (
                        <div className="mt-5">
                            {activeTab === "dashboard" && (
                                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                                    <section className={`rounded-3xl border p-5 ${surfaceTone}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className={`text-xs font-black ${mutedTone}`}>오늘 처리해야 할 일</p>
                                                <h2 className="mt-2 text-xl font-black">처리 대기 큐</h2>
                                            </div>
                                            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                                                {followUpItems.length}건
                                            </span>
                                        </div>
                                        <div className="mt-4 grid gap-3">
                                            {followUpItems.map((item) => (
                                                <article key={item.key} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"}`}>
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <span className={`rounded-full px-3 py-1 text-xs font-black ${getFollowUpToneClass(item.tone, isDark)}`}>
                                                                {item.label}
                                                            </span>
                                                            <h3 className="mt-3 text-sm font-black">{item.title}</h3>
                                                            <p className={`mt-1 text-xs font-semibold ${mutedTone}`}>{item.desc}</p>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
                                            {followUpItems.length === 0 && <EmptyState label="현재 처리 대기 항목이 없습니다." isDark={isDark} />}
                                        </div>
                                    </section>

                                    <section className={`rounded-3xl border p-5 ${surfaceTone}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className={`text-xs font-black ${mutedTone}`}>고객 운영 요약</p>
                                                <h2 className="mt-2 text-xl font-black">최근 고객</h2>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("customers")}
                                                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white transition hover:bg-blue-500"
                                            >
                                                고객명단 보기
                                            </button>
                                        </div>
                                        <div className="mt-4 grid gap-3">
                                            {customers.slice(0, 5).map((customer) => (
                                                <article key={customer.key} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"}`}>
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-sm font-black">{customer.name}</h3>
                                                            <p className={`mt-1 text-xs font-semibold ${mutedTone}`}>
                                                                {customer.email || "이메일 없음"} · {customer.phone || "연락처 없음"}
                                                            </p>
                                                        </div>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-black ${getCustomerStatusClass(customer.status, isDark)}`}>
                                                            {getCustomerStatusLabel(customer.status)}
                                                        </span>
                                                    </div>
                                                    <p className={`mt-3 text-xs font-bold ${mutedTone}`}>
                                                        예약 {customer.bookingCount}건 · 문의 {customer.inquiryCount}건 · 최근 {formatDate(customer.latestAt)}
                                                    </p>
                                                </article>
                                            ))}
                                            {customers.length === 0 && <EmptyState label="아직 고객 데이터가 없습니다." isDark={isDark} />}
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === "customers" && (
                                <div className="grid gap-4">
                                    <div className={`rounded-3xl border p-4 ${surfaceTone}`}>
                                        <div className="grid gap-3 lg:grid-cols-[1fr_220px] lg:items-center">
                                            <label className="block">
                                                <span className={`mb-2 block text-xs font-black ${mutedTone}`}>고객 검색</span>
                                                <input
                                                    value={customerSearch}
                                                    onChange={(event) => setCustomerSearch(event.target.value)}
                                                    placeholder="고객명, 이메일, 연락처, 최근 여행명으로 검색"
                                                    className={`h-12 w-full rounded-2xl border px-4 text-sm font-bold outline-none transition focus:border-blue-400 ${
                                                        isDark
                                                            ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                                                            : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400"
                                                    }`}
                                                />
                                            </label>
                                            <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"}`}>
                                                <p className={`text-xs font-black ${mutedTone}`}>검색 결과</p>
                                                <p className="mt-1 text-2xl font-black">{filteredCustomers.length}명</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 lg:grid-cols-2">
                                        {filteredCustomers.map((customer) => (
                                            <article key={customer.key} className={`rounded-3xl border p-4 ${surfaceTone}`}>
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-lg font-black">{customer.name}</h3>
                                                        <p className={`mt-2 text-sm leading-6 ${strongMutedTone}`}>
                                                            {customer.email || "이메일 없음"} · {customer.phone || "연락처 없음"}
                                                        </p>
                                                    </div>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-black ${getCustomerStatusClass(customer.status, isDark)}`}>
                                                        {getCustomerStatusLabel(customer.status)}
                                                    </span>
                                                </div>
                                                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>예약</dt>
                                                        <dd className="mt-1 font-black">{customer.bookingCount}건</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>문의</dt>
                                                        <dd className="mt-1 font-black">{customer.inquiryCount}건</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>누적 예약 총액</dt>
                                                        <dd className="mt-1 font-black">{formatCurrency.format(customer.totalAmount)}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>누적 예약금</dt>
                                                        <dd className="mt-1 font-black text-blue-500">{formatCurrency.format(customer.depositAmount)}</dd>
                                                    </div>
                                                </dl>
                                                <div className={`mt-4 rounded-2xl border p-4 text-sm ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"}`}>
                                                    <p className={`text-xs font-black ${mutedTone}`}>최근 접점</p>
                                                    <p className="mt-2 font-black">{customer.latestTour}</p>
                                                    <p className={`mt-1 text-xs font-semibold ${mutedTone}`}>{formatDate(customer.latestAt)}</p>
                                                </div>
                                            </article>
                                        ))}
                                        {filteredCustomers.length === 0 && <EmptyState label="검색 조건에 맞는 고객이 없습니다." isDark={isDark} />}
                                    </div>
                                </div>
                            )}

                            {activeTab === "bookings" && (
                                <div className="grid gap-3">
                                    {filteredBookings.map((booking) => (
                                        <article key={booking.id} className={`rounded-3xl border p-4 ${surfaceTone}`}>
                                            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_260px] lg:items-center">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                                                            {booking.bookingNo}
                                                        </span>
                                                        <span className={`text-xs font-bold ${mutedTone}`}>
                                                            예약일 {formatDate(booking.createdAt)}
                                                        </span>
                                                    </div>
                                                    <h3 className="mt-3 flex flex-wrap items-center gap-2 text-lg font-black">
                                                        {bookingStatusLabels[booking.status] ? (
                                                            <span className={`rounded-full px-3 py-1 text-xs font-black ${getBookingStatusBadgeClass(booking.status, isDark)}`}>
                                                                {bookingStatusLabels[booking.status]}
                                                            </span>
                                                        ) : null}
                                                        <span>{getTourTitle(booking)}</span>
                                                    </h3>
                                                    <p className={`mt-2 text-sm leading-6 ${strongMutedTone}`}>
                                                        {booking.customerName} · {booking.phone} · {booking.email || "이메일 없음"}
                                                    </p>
                                                </div>

                                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>출발일</dt>
                                                        <dd className="mt-1 font-black">{booking.departDate || "-"}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>인원</dt>
                                                        <dd className="mt-1 font-black">{booking.guests}명</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>예약 총액</dt>
                                                        <dd className="mt-1 font-black">{formatCurrency.format(booking.totalAmount)}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>예약금</dt>
                                                        <dd className="mt-1 font-black text-blue-500">{formatCurrency.format(booking.depositAmount)}</dd>
                                                    </div>
                                                </dl>

                                                <div>
                                                    <p className={`mb-2 text-xs font-black ${mutedTone}`}>처리 상태</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {bookingStatusOptions.map((option) => {
                                                            const active = booking.status === option.value;
                                                            const disabled = savingKey === `booking-${booking.id}`;

                                                            return (
                                                                <button
                                                                    key={option.value}
                                                                    type="button"
                                                                    disabled={disabled || active}
                                                                    onClick={() => {
                                                                        if (option.value === "cancelled") {
                                                                            setCancelTarget(booking);
                                                                            setCancelReason(booking.cancelReason || cancellationReasonOptions[0].value);
                                                                            setCancelMemo(booking.cancelMemo || "");
                                                                            return;
                                                                        }

                                                                        void updateBookingStatus(booking.id, option.value);
                                                                    }}
                                                                    className={`h-10 rounded-xl px-3 text-xs font-black transition ${getBookingStatusButtonClass(
                                                                        option.value,
                                                                        active,
                                                                        isDark
                                                                    )} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            );
                                                        })}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className={`h-10 rounded-xl px-3 text-xs font-black transition ${
                                                                isDark
                                                                    ? "border border-white/10 bg-slate-900 text-slate-100 hover:border-blue-400/50 hover:text-white"
                                                                    : "border border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:text-blue-600"
                                                            }`}
                                                        >
                                                            상세보기
                                                        </button>
                                                    </div>
                                                    {savingKey === `booking-${booking.id}` && (
                                                        <p className={`mt-2 text-xs font-bold ${mutedTone}`}>저장 중...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                    {filteredBookings.length === 0 && <EmptyState label="선택한 월의 예약 내역이 없습니다." isDark={isDark} />}
                                </div>
                            )}

                            {activeTab === "inquiries" && (
                                <div className="grid gap-3 lg:grid-cols-2">
                                    {inquiries.map((inquiry) => (
                                        <article key={inquiry.id} className={`rounded-3xl border p-4 ${surfaceTone}`}>
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className={`text-xs font-bold ${mutedTone}`}>{formatDate(inquiry.createdAt)}</p>
                                                    <h3 className="mt-2 text-lg font-black">{inquiry.subject}</h3>
                                                </div>
                                                <div className="w-full sm:w-48">
                                                    <Dropdown
                                                        value={inquiry.status}
                                                        options={inquiryStatusOptions}
                                                        onChange={(value) => void updateInquiryStatus(inquiry.id, value)}
                                                        isDark={isDark}
                                                    />
                                                </div>
                                            </div>
                                            <p className={`mt-3 text-sm ${strongMutedTone}`}>
                                                {inquiry.name} · {inquiry.email} · {inquiry.phone || "연락처 없음"}
                                            </p>
                                            <p className="mt-4 text-sm leading-7">{inquiry.message}</p>
                                            {savingKey === `inquiry-${inquiry.id}` && (
                                                <p className={`mt-3 text-xs font-bold ${mutedTone}`}>저장 중...</p>
                                            )}
                                        </article>
                                    ))}
                                    {inquiries.length === 0 && <EmptyState label="아직 문의 내역이 없습니다." isDark={isDark} />}
                                </div>
                            )}

                            {activeTab === "payments" && (
                                <div className="grid gap-3">
                                    {orders.map((order) => (
                                        <article key={order.id} className={`rounded-3xl border p-4 ${surfaceTone}`}>
                                            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-center">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                                                            {paymentStatusLabels[order.status] ?? order.status}
                                                        </span>
                                                        <span className={`text-xs font-bold ${mutedTone}`}>{formatDate(order.createdAt)}</span>
                                                    </div>
                                                    <h3 className="mt-3 text-lg font-black">{getTourTitle(order)}</h3>
                                                    <p className={`mt-2 break-all text-xs font-semibold ${mutedTone}`}>주문번호 {order.orderId}</p>
                                                </div>
                                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>고객</dt>
                                                        <dd className="mt-1 font-black">{order.customerName}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>결제수단</dt>
                                                        <dd className="mt-1 font-black">{order.paymentMethod}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>출발일</dt>
                                                        <dd className="mt-1 font-black">{order.departDate || "-"}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className={`font-bold ${mutedTone}`}>예약번호</dt>
                                                        <dd className="mt-1 font-black">{order.bookingNo || "-"}</dd>
                                                    </div>
                                                </dl>
                                                <div className="lg:text-right">
                                                    <p className={`text-xs font-bold ${mutedTone}`}>결제 요청 금액</p>
                                                    <p className="mt-1 text-2xl font-black text-blue-500">{formatCurrency.format(order.amount)}</p>
                                                    <p className={`mt-2 text-xs font-bold ${mutedTone}`}>승인 {formatDate(order.approvedAt)}</p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                    {orders.length === 0 && <EmptyState label="아직 결제 주문이 없습니다." isDark={isDark} />}
                                </div>
                            )}
                        </div>
                    )}
                </section>
                {selectedBooking ? (
                    <BookingDetailModal
                        booking={selectedBooking}
                        isDark={isDark}
                        onClose={() => setSelectedBooking(null)}
                    />
                ) : null}
                {cancelTarget ? (
                    <BookingCancelModal
                        booking={cancelTarget}
                        cancelReason={cancelReason}
                        cancelMemo={cancelMemo}
                        isDark={isDark}
                        saving={cancelSaving}
                        onReasonChange={setCancelReason}
                        onMemoChange={setCancelMemo}
                        onClose={() => {
                            if (cancelSaving) return;
                            setCancelTarget(null);
                        }}
                        onSubmit={() => void submitAdminCancellation()}
                    />
                ) : null}
            </div>
        </AdminGate>
    );
}

function RevenueMetric({
    label,
    value,
    note,
    isDark,
}: {
    label: string;
    value: string;
    note: string;
    isDark: boolean;
}) {
    return (
        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
            <p className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
            <p className={`mt-2 text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{note}</p>
        </div>
    );
}

function RevenueDonutCard({
    total,
    deposit,
    balance,
    depositPercent,
    balancePercent,
    label,
    isDark,
}: {
    total: number;
    deposit: number;
    balance: number;
    depositPercent: number;
    balancePercent: number;
    label: string;
    isDark: boolean;
}) {
    const surfaceTone = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";
    const innerTone = isDark ? "bg-slate-900" : "bg-white";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const chartBackground =
        total > 0
            ? `conic-gradient(#2563eb 0 ${depositPercent}%, #0ea5e9 ${depositPercent}% 100%)`
            : isDark
              ? "conic-gradient(#334155 0 100%)"
              : "conic-gradient(#e2e8f0 0 100%)";

    return (
        <section className={`rounded-3xl border p-5 ${surfaceTone}`}>
            <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
                <div className="mx-auto flex size-52 items-center justify-center rounded-full p-4" style={{ background: chartBackground }}>
                    <div className={`flex size-36 flex-col items-center justify-center rounded-full text-center shadow-sm ${innerTone}`}>
                        <p className={`text-xs font-black ${mutedTone}`}>{label}</p>
                        <p className="mt-1 text-2xl font-black tracking-tight">{formatCurrency.format(total)}</p>
                        <p className={`mt-1 text-[11px] font-bold ${mutedTone}`}>총매출</p>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-black text-blue-500">매출 구성</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">예약금과 잔여 매출을 분리해서 봅니다.</h2>
                    <div className="mt-5 grid gap-3">
                        <RevenueLegend
                            colorClass="bg-blue-600"
                            label="예약금 매출"
                            value={formatCurrency.format(deposit)}
                            percent={depositPercent}
                            isDark={isDark}
                        />
                        <RevenueLegend
                            colorClass="bg-sky-500"
                            label="예약금 외 매출"
                            value={formatCurrency.format(balance)}
                            percent={balancePercent}
                            isDark={isDark}
                        />
                        <div className={`mt-2 rounded-2xl border p-4 ${isDark ? "border-blue-400/20 bg-blue-500/10" : "border-blue-100 bg-blue-50"}`}>
                            <div className="flex items-center justify-between gap-3">
                                <span className={`text-sm font-black ${mutedTone}`}>총매출</span>
                                <span className="text-lg font-black">{formatCurrency.format(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function RevenueLegend({
    colorClass,
    label,
    value,
    percent,
    isDark,
}: {
    colorClass: string;
    label: string;
    value: string;
    percent: number;
    isDark: boolean;
}) {
    return (
        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-black">
                    <span className={`size-3 rounded-full ${colorClass}`} />
                    {label}
                </span>
                <span className="text-sm font-black">{value}</span>
            </div>
            <div className={`mt-3 h-2 overflow-hidden rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }} />
            </div>
            <p className={`mt-2 text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{percent}%</p>
        </div>
    );
}

function BookingCancelModal({
    booking,
    cancelReason,
    cancelMemo,
    isDark,
    saving,
    onReasonChange,
    onMemoChange,
    onClose,
    onSubmit,
}: {
    booking: CrmBookingRecord;
    cancelReason: string;
    cancelMemo: string;
    isDark: boolean;
    saving: boolean;
    onReasonChange: (value: string) => void;
    onMemoChange: (value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}) {
    const panelTone = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-950";
    const fieldTone = isDark ? "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";

    useBodyScrollLock(true);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed bottom-0 left-0 right-0 top-0 z-[130] flex h-dvh w-screen items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
            <section className={`w-full max-w-xl rounded-[28px] border p-5 shadow-2xl sm:p-6 ${panelTone}`}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-black text-red-500">예약 취소</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight">{getTourTitle(booking)}</h2>
                        <p className={`mt-2 text-sm ${mutedTone}`}>
                            취소 사유와 고객에게 보낼 메시지를 입력하면 취소 이메일을 발송하고 가능한 경우 Toss 환불을 진행합니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-black transition ${
                            isDark ? "bg-slate-900 text-slate-200 hover:bg-slate-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                        닫기
                    </button>
                </div>

                <div className="mt-5 grid gap-4">
                    <div>
                        <p className={`mb-2 text-xs font-black ${mutedTone}`}>취소 사유</p>
                        <Dropdown
                            value={cancelReason}
                            options={cancellationReasonOptions}
                            onChange={onReasonChange}
                            isDark={isDark}
                        />
                    </div>
                    <div>
                        <p className={`mb-2 text-xs font-black ${mutedTone}`}>고객 안내 메시지</p>
                        <textarea
                            value={cancelMemo}
                            onChange={(event) => onMemoChange(event.target.value)}
                            placeholder="예: 예약 취소가 확정되었으며, 결제된 예약금은 결제 수단으로 환불 처리됩니다."
                            className={`min-h-32 w-full resize-none rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-400 ${fieldTone}`}
                        />
                    </div>
                    <div className={`rounded-2xl border p-4 text-sm ${isDark ? "border-red-400/20 bg-red-500/10 text-red-100" : "border-red-200 bg-red-50 text-red-700"}`}>
                        예약번호 {booking.bookingNo}의 상태가 예약 취소로 변경됩니다. PG 결제 정보가 있으면 전액 환불 요청을 함께 보냅니다.
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className={`h-12 rounded-2xl px-5 text-sm font-black transition ${
                            isDark ? "bg-slate-900 text-slate-200 hover:bg-slate-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={saving || !cancelReason.trim()}
                        className={`h-12 rounded-2xl bg-red-500 px-5 text-sm font-black text-white transition hover:bg-red-400 ${
                            saving || !cancelReason.trim() ? "cursor-not-allowed opacity-60" : ""
                        }`}
                    >
                        {saving ? "처리 중..." : "취소 이메일 발송 및 환불 진행"}
                    </button>
                </div>
            </section>
        </div>,
        document.body
    );
}

function BookingDetailModal({
    booking,
    isDark,
    onClose,
}: {
    booking: CrmBookingRecord;
    isDark: boolean;
    onClose: () => void;
}) {
    const panelTone = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-950";
    const surfaceTone = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-slate-50";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const rows = [
        ["예약 번호", booking.bookingNo],
        ["예약 상태", bookingStatusLabels[booking.status] ?? booking.status],
        ["여행명", getTourTitle(booking)],
        ["고객명", booking.customerName],
        ["전화번호", booking.phone],
        ["이메일", booking.email || "이메일 없음"],
        ["출발일", booking.departDate || "-"],
        ["인원", `${booking.guests}명`],
        ["예약 총액", formatCurrency.format(booking.totalAmount)],
        ["예약금", formatCurrency.format(booking.depositAmount)],
        ["예약일", formatDate(booking.createdAt)],
    ];

    useBodyScrollLock(true);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed bottom-0 left-0 right-0 top-0 z-[120] flex h-dvh w-screen items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
            <section className={`max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border p-5 shadow-2xl sm:p-6 ${panelTone}`}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-black text-blue-500">예약 상세보기</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight">{getTourTitle(booking)}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-black transition ${
                            isDark ? "bg-slate-900 text-slate-200 hover:bg-slate-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                        닫기
                    </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {rows.map(([label, value]) => (
                        <div key={label} className={`rounded-2xl border p-4 ${surfaceTone}`}>
                            <p className={`text-xs font-black ${mutedTone}`}>{label}</p>
                            <p className="mt-2 break-words text-sm font-black">{value}</p>
                        </div>
                    ))}
                </div>

                {booking.customSummary || booking.cancelReason || booking.cancelMemo ? (
                    <div className={`mt-4 rounded-2xl border p-4 ${surfaceTone}`}>
                        {booking.customSummary ? (
                            <>
                                <p className={`text-xs font-black ${mutedTone}`}>고객 플랜 요약</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{booking.customSummary}</p>
                            </>
                        ) : null}
                        {booking.cancelReason ? (
                            <>
                                <p className={`mt-4 text-xs font-black ${mutedTone}`}>취소 사유</p>
                                <p className="mt-2 text-sm font-bold text-red-500">{booking.cancelReason}</p>
                            </>
                        ) : null}
                        {booking.cancelMemo ? (
                            <>
                                <p className={`mt-4 text-xs font-black ${mutedTone}`}>취소 메모</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{booking.cancelMemo}</p>
                            </>
                        ) : null}
                    </div>
                ) : null}
            </section>
        </div>,
        document.body
    );
}

function EmptyState({ label, isDark }: { label: string; isDark: boolean }) {
    return (
        <div
            className={`rounded-3xl border p-8 text-center text-sm font-bold ${
                isDark ? "border-white/10 bg-slate-950 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
        >
            {label}
        </div>
    );
}

export default function CrmPage() {
    return (
        <PageShell activeKey="home">
            <CrmContent />
        </PageShell>
    );
}
