"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { CalendarPicker } from "@/components/ui/CalendarPicker";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { withLocaleQuery } from "@/lib/locale-routing";
import { formatPrice } from "@/lib/bluewolf-utils";
import { useCmsTourOptions } from "@/lib/use-cms-tour-options";
import { useCmsTours } from "@/lib/use-cms-tours";

type PaymentMethod = "card" | "bank" | "simple";
type SimpleProvider = "toss" | "naver" | "kakao";
type TossEasyPayCode = "TOSSPAY" | "NAVERPAY" | "KAKAOPAY";

type BookingCreateResponse = {
    booking: {
        bookingNo: string;
        status: string;
    };
};

type PreparePaymentResponse = {
    clientKey: string;
    customerKey: string;
    orderId: string;
    orderName: string;
    amount: number;
    customerName: string;
    customerMobilePhone: string;
    successUrl: string;
    failUrl: string;
};

type PaymentDraft = {
    customerName: string;
    phone: string;
    email: string;
    departDate: string;
    memo: string;
    paymentMethod: PaymentMethod;
    simpleProvider: SimpleProvider;
};

type CustomPlanPaymentDraft = {
    title: string;
    summary: string;
    totalAmount: number;
    baseAmount: number;
    optionAmount: number;
    depositAmount: number;
    image: string;
    durationLabel: string;
    departDate: string;
    guests: number;
    optionKeys: string[];
    customerName: string;
    phone: string;
    email: string;
    memo: string;
};

const CUSTOM_PLAN_PAYMENT_STORAGE_KEY = "custom-plan-payment";

type TossPaymentRequest = {
    method: "CARD";
    amount: { currency: "KRW"; value: number };
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerName: string;
    customerMobilePhone: string;
    card?: {
        flowMode: "DEFAULT" | "DIRECT";
        easyPay?: TossEasyPayCode;
    };
};

type TossPaymentsFactory = (clientKey: string) => {
    payment: (input: { customerKey: string }) => {
        requestPayment: (request: TossPaymentRequest) => Promise<unknown>;
    };
};

declare global {
    interface Window {
        TossPayments?: TossPaymentsFactory;
    }
}

function pick<T>(lang: "ko" | "ja" | "en", ko: T, ja: T, en: T) {
    if (lang === "ja") return ja;
    if (lang === "en") return en;
    return ko;
}

function getEasyPayCode(provider: SimpleProvider): TossEasyPayCode {
    if (provider === "naver") return "NAVERPAY";
    if (provider === "kakao") return "KAKAOPAY";
    return "TOSSPAY";
}

function isPaymentMethod(value: string): value is PaymentMethod {
    return value === "card" || value === "bank" || value === "simple";
}

function isSimpleProvider(value: string): value is SimpleProvider {
    return value === "toss" || value === "naver" || value === "kakao";
}

function StepTitle({
    step,
    title,
    desc,
    isDark,
}: {
    step: number;
    title: string;
    desc?: string;
    isDark: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                {step}
            </span>
            <div>
                <h2 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h2>
                {desc ? (
                    <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
                ) : null}
            </div>
        </div>
    );
}

function PaymentContent() {
    const searchParams = useSearchParams();
    const { lang, isDark } = usePage();
    const { user, ready: authReady } = useAuth();
    const { tourItems, loaded: toursLoaded } = useCmsTours();
    const { localizedOptions, loaded: optionsLoaded } = useCmsTourOptions(lang);

    const isCustomPlanFlow = searchParams.get("custom") === "1";
    const tourId = Number(searchParams.get("tour"));
    const queryGuests = Math.max(1, Number(searchParams.get("guests")) || 1);
    const queryOptionKeys = useMemo(
        () =>
            (searchParams.get("options") ?? "")
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
        [searchParams]
    );

    const tour = useMemo(
        () => tourItems.find((item) => item.id === tourId) ?? null,
        [tourId, tourItems]
    );
    const [customPlan, setCustomPlan] = useState<CustomPlanPaymentDraft | null>(null);
    const [customPlanReady, setCustomPlanReady] = useState(!isCustomPlanFlow);
    const guests = isCustomPlanFlow ? customPlan?.guests ?? queryGuests : queryGuests;
    const optionKeys = useMemo(
        () => (isCustomPlanFlow ? customPlan?.optionKeys ?? [] : queryOptionKeys),
        [customPlan?.optionKeys, isCustomPlanFlow, queryOptionKeys]
    );
    const selectedOptions = useMemo(
        () => localizedOptions.filter((option) => optionKeys.includes(option.key)),
        [localizedOptions, optionKeys]
    );
    const draftStorageKey = useMemo(
        () =>
            isCustomPlanFlow
                ? `payment-draft:custom:${lang}`
                : `payment-draft:${tourId}:${guests}:${optionKeys.join(",")}:${lang}`,
        [guests, isCustomPlanFlow, lang, optionKeys, tourId]
    );

    const baseFare = isCustomPlanFlow ? customPlan?.baseAmount ?? 0 : tour ? tour.price * guests : 0;
    const optionTotal = isCustomPlanFlow
        ? customPlan?.optionAmount ?? 0
        : selectedOptions.reduce((sum, option) => sum + option.price * guests, 0);
    const estimatedTotal = isCustomPlanFlow ? customPlan?.totalAmount ?? 0 : baseFare + optionTotal;
    const depositDue = isCustomPlanFlow ? customPlan?.depositAmount ?? 0 : tour ? tour.deposit * guests : 0;

    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [departDate, setDepartDate] = useState("");
    const [memo, setMemo] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
    const [simpleProvider, setSimpleProvider] = useState<SimpleProvider>("toss");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sdkReady, setSdkReady] = useState(false);
    const [sdkLoadFailed, setSdkLoadFailed] = useState(false);
    const [draftReady, setDraftReady] = useState(false);
    const [createdBooking, setCreatedBooking] = useState<{
        bookingNo: string;
        status: "pending" | "confirmed";
    } | null>(null);

    useEffect(() => {
        if (!isCustomPlanFlow || typeof window === "undefined") return;

        try {
            const raw = window.sessionStorage.getItem(CUSTOM_PLAN_PAYMENT_STORAGE_KEY);
            if (!raw) {
                setCustomPlan(null);
                return;
            }

            const parsed = JSON.parse(raw) as Partial<CustomPlanPaymentDraft>;
            const valid =
                typeof parsed.title === "string" &&
                typeof parsed.summary === "string" &&
                typeof parsed.image === "string" &&
                typeof parsed.durationLabel === "string" &&
                typeof parsed.departDate === "string" &&
                typeof parsed.customerName === "string" &&
                typeof parsed.phone === "string" &&
                typeof parsed.email === "string" &&
                typeof parsed.memo === "string" &&
                Number.isFinite(parsed.totalAmount) &&
                Number.isFinite(parsed.baseAmount) &&
                Number.isFinite(parsed.optionAmount) &&
                Number.isFinite(parsed.depositAmount) &&
                Number.isFinite(parsed.guests) &&
                Array.isArray(parsed.optionKeys);

            setCustomPlan(valid ? parsed as CustomPlanPaymentDraft : null);
        } catch {
            window.sessionStorage.removeItem(CUSTOM_PLAN_PAYMENT_STORAGE_KEY);
            setCustomPlan(null);
        } finally {
            setCustomPlanReady(true);
        }
    }, [isCustomPlanFlow]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.TossPayments) {
            setSdkReady(true);
            setSdkLoadFailed(false);
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        setDraftReady(false);

        try {
            const raw = window.sessionStorage.getItem(draftStorageKey);
            if (!raw) {
                setCustomerName(isCustomPlanFlow ? customPlan?.customerName ?? "" : "");
                setPhone(isCustomPlanFlow ? customPlan?.phone ?? "" : "");
                setEmail(isCustomPlanFlow ? customPlan?.email ?? "" : "");
                setDepartDate(isCustomPlanFlow ? customPlan?.departDate ?? "" : "");
                setMemo(isCustomPlanFlow ? customPlan?.memo ?? "" : "");
                setPaymentMethod("bank");
                setSimpleProvider("toss");
                setDraftReady(true);
                return;
            }

            const parsed = JSON.parse(raw) as Partial<PaymentDraft>;
            setCustomerName(typeof parsed.customerName === "string" ? parsed.customerName : "");
            setPhone(typeof parsed.phone === "string" ? parsed.phone : "");
            setEmail(typeof parsed.email === "string" ? parsed.email : "");
            setDepartDate(typeof parsed.departDate === "string" ? parsed.departDate : "");
            setMemo(typeof parsed.memo === "string" ? parsed.memo : "");
            setPaymentMethod(
                typeof parsed.paymentMethod === "string" &&
                    isPaymentMethod(parsed.paymentMethod) &&
                    parsed.paymentMethod === "bank"
                    ? parsed.paymentMethod
                    : "bank"
            );
            setSimpleProvider(
                typeof parsed.simpleProvider === "string" && isSimpleProvider(parsed.simpleProvider)
                    ? parsed.simpleProvider
                    : "toss"
            );
        } catch {
            window.sessionStorage.removeItem(draftStorageKey);
        } finally {
            setDraftReady(true);
        }
    }, [customPlan, draftStorageKey, isCustomPlanFlow]);

    useEffect(() => {
        if (!draftReady || typeof window === "undefined" || createdBooking) return;

        const draft: PaymentDraft = {
            customerName,
            phone,
            email,
            departDate,
            memo,
            paymentMethod,
            simpleProvider,
        };

        window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    }, [
        createdBooking,
        customerName,
        departDate,
        draftReady,
        draftStorageKey,
        email,
        memo,
        paymentMethod,
        phone,
        simpleProvider,
    ]);

    useEffect(() => {
        if (!createdBooking || typeof window === "undefined") return;
        window.sessionStorage.removeItem(draftStorageKey);
    }, [createdBooking, draftStorageKey]);

    useEffect(() => {
        if (!authReady || !user || !draftReady || createdBooking) return;

        setCustomerName((current) => current || user.name || "");
        setPhone((current) => current || user.phone || "");
        setEmail((current) => current || user.email || "");
    }, [authReady, createdBooking, draftReady, user]);

    const text = {
        badge: pick(lang, "결제", "決済", "Payment"),
        invalidTitle: pick(lang, "선택한 플랜을 찾을 수 없어요", "選択したプランが見つかりません", "We couldn't find that plan"),
        invalidDesc: pick(lang, "이전 페이지에서 다시 신청을 시작해주세요.", "前のページから申請をやり直してください。", "Please restart the application from the previous page."),
        backToTours: pick(lang, "투어로 돌아가기", "ツアーへ戻る", "Back to tours"),
        title: pick(lang, "플랜 패키지 결제", "プランパッケージ決済", "Plan package payment"),
        desc: pick(lang, "상품 정보와 신청자 정보를 확인하고 플랜료를 결제하거나 플랜 신청을 접수하세요.", "商品情報と申請者情報を確認し、プランパッケージ利用料を決済するかプラン申請を送信してください。", "Review the trip details, then pay the plan package fee or submit your application."),
        travelerDesc: pick(lang, "신청자 정보를 입력해주세요", "申請者情報を入力してください", "Enter the applicant details"),
        extraDesc: pick(lang, "선택한 옵션과 요청 사항을 마지막으로 확인합니다.", "選択したオプションとご要望を最後に確認します。", "Review selected options and special requests."),
        methodDesc: pick(lang, "현재는 무통장 입금만 이용할 수 있습니다. 입금 확인 후 신청 상태가 갱신됩니다.", "現在は銀行振込のみご利用いただけます。入金確認後に申請状況が更新されます。", "Only bank transfer is currently available. The application status updates after payment confirmation."),
        unavailableMethod: pick(lang, "준비 중", "準備中", "Coming soon"),
        bankOnlyError: pick(lang, "현재는 무통장 입금만 이용할 수 있습니다.", "現在は銀行振込のみご利用いただけます。", "Only bank transfer is currently available."),
        requiredError: pick(lang, "이름, 연락처, 출발일을 모두 입력해주세요.", "名前、連絡先、出発日をすべて入力してください。", "Please enter your name, phone number, and departure date."),
        sdkError: pick(lang, "결제창을 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.", "決済画面をまだ読み込めていません。しばらくしてからもう一度お試しください。", "The payment window is still loading. Please try again in a moment."),
        sdkLoading: pick(lang, "결제창을 불러오는 중입니다.", "決済画面を読み込み中です。", "Loading the payment window."),
        sdkLoadFail: pick(lang, "결제창 스크립트를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.", "決済画面のスクリプトを読み込めませんでした。再読み込み後にお試しください。", "Could not load the payment script. Please refresh and try again."),
        failedError: pick(lang, "결제 준비 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.", "決済準備中に問題が発生しました。しばらくしてからもう一度お試しください。", "Something went wrong while preparing the payment."),
        pendingTitle: pick(lang, "플랜 신청이 접수되었습니다", "プラン申請を受け付けました", "Your plan application has been received"),
        pendingDesc: pick(lang, "BlueWolf Mongolia 검토 후 진행 상태가 갱신됩니다. 아래 신청 번호로 진행 상황을 확인할 수 있어요.", "BlueWolf Mongolia の確認後に進行状況が更新されます。以下の申請番号で確認できます。", "BlueWolf Mongolia will review this request and update the progress. You can track it with the application number below."),
        confirmedTitle: pick(lang, "BlueWolf Mongolia 확인 완료", "BlueWolf Mongolia 確認完了", "BlueWolf Mongolia review completed"),
        confirmedDesc: pick(lang, "아래 신청 번호로 진행 상태 조회 페이지에서 상태를 확인할 수 있습니다.", "以下の申請番号で進行状況照会ページから状態を確認できます。", "You can check the progress with the application number below."),
        bookingNoLabel: pick(lang, "신청 번호", "申請番号", "Application number"),
        goLookup: pick(lang, "진행 상태 조회로 이동", "進行状況照会へ", "Go to progress lookup"),
        goTour: pick(lang, "플랜 상세로 돌아가기", "プラン詳細へ戻る", "Back to plan details"),
    };

    const weekdays = pick(
        lang,
        ["일", "월", "화", "수", "목", "금", "토"],
        ["日", "月", "火", "水", "木", "金", "土"],
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    );

    const shellClass = `overflow-hidden rounded-[32px] border shadow-[0_30px_80px_rgba(15,23,42,0.08)] ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;
    const sectionClass = `rounded-[28px] border p-5 sm:p-6 ${
        isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"
    }`;
    const labelClass = `mb-2 block text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`;
    const inputClass = `h-14 w-full rounded-2xl border px-5 text-[16px] font-semibold outline-none transition ${
        isDark
            ? "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-blue-400"
            : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-300"
    }`;
    const textareaClass = `min-h-[132px] w-full rounded-2xl border px-5 py-4 text-[16px] font-medium outline-none transition ${
        isDark
            ? "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-blue-400"
            : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-300"
    }`;

    const detailHref = isCustomPlanFlow
        ? withLocaleQuery("/tours/customize", lang)
        : tour
          ? withLocaleQuery(`/tours/${tour.id}`, lang)
          : withLocaleQuery("/tours", lang);

    const handleSubmit = async () => {
        if ((!tour && !customPlan) || !customerName.trim() || !phone.trim() || !departDate) {
            setError(text.requiredError);
            return;
        }

        if (paymentMethod !== "bank") {
            setPaymentMethod("bank");
            setError(text.bankOnlyError);
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            if (paymentMethod === "bank") {
                const response = await fetch("/api/crm/bookings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tourId: tour?.id,
                        customPlan: customPlan
                            ? {
                                  title: customPlan.title,
                                  summary: customPlan.summary,
                                  totalAmount: customPlan.totalAmount,
                              }
                            : undefined,
                        customerName,
                        email,
                        phone,
                        departDate,
                        guests,
                        locale: lang,
                        status: "pending",
                    }),
                });

                if (!response.ok) {
                    throw new Error(text.failedError);
                }

                const payload = (await response.json()) as BookingCreateResponse;
                setCreatedBooking({
                    bookingNo: payload.booking.bookingNo,
                    status: "pending",
                });
                return;
            }

            if (!sdkReady || !window.TossPayments) {
                throw new Error(sdkLoadFailed ? text.sdkLoadFail : text.sdkError);
            }

            if (!tour) {
                throw new Error(text.failedError);
            }

            const response = await fetch("/api/payments/toss/prepare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tourId: tour.id,
                        customerName,
                        email,
                        phone,
                        departDate,
                    guests,
                    locale: lang,
                    paymentMethod: paymentMethod === "simple" ? `simple:${simpleProvider}` : "card",
                    optionKeys,
                    memo,
                }),
            });

            const payload = (await response.json().catch(() => null)) as
                | PreparePaymentResponse
                | { error?: string }
                | null;

            if (!response.ok || !payload || !("clientKey" in payload)) {
                const responseError =
                    payload && "error" in payload && typeof payload.error === "string"
                        ? payload.error
                        : text.failedError;
                throw new Error(responseError);
            }

            const tossPayments = window.TossPayments(payload.clientKey);
            const payment = tossPayments.payment({ customerKey: payload.customerKey });
            const requestPayload: TossPaymentRequest = {
                method: "CARD",
                amount: { currency: "KRW", value: payload.amount },
                orderId: payload.orderId,
                orderName: payload.orderName,
                successUrl: payload.successUrl,
                failUrl: payload.failUrl,
                customerName: payload.customerName,
                customerMobilePhone: payload.customerMobilePhone,
            };

            if (paymentMethod === "simple") {
                requestPayload.card = {
                    flowMode: "DIRECT",
                    easyPay: getEasyPayCode(simpleProvider),
                };
            }

            await payment.requestPayment(requestPayload);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : text.failedError);
        } finally {
            setSubmitting(false);
        }
    };

    if ((!toursLoaded || !optionsLoaded || !customPlanReady) && !tour && !customPlan) {
        return (
            <section className={shellClass}>
                <div className={`border-b px-6 py-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`} />
                <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6">
                    <div className={`h-[540px] rounded-[28px] ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                    <div className={`h-[360px] rounded-[28px] ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                </div>
            </section>
        );
    }

    if (!tour && !customPlan) {
        return (
            <section className={`${shellClass} p-8 text-center`}>
                <div className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600">{text.badge}</div>
                <h1 className={`mt-4 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{text.invalidTitle}</h1>
                <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>{text.invalidDesc}</p>
                <Link href={withLocaleQuery("/tours", lang)} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500">
                    {text.backToTours}
                </Link>
            </section>
        );
    }

    if (createdBooking) {
        return (
            <section className={`${shellClass} p-8 text-center`}>
                <div className="inline-flex rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-600">{text.badge}</div>
                <h1 className={`mt-4 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{text.pendingTitle}</h1>
                <p className={`mx-auto mt-3 max-w-xl text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>{text.pendingDesc}</p>
                <div className={`mx-auto mt-6 max-w-md rounded-[28px] border px-6 py-7 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                    <div className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{text.bookingNoLabel}</div>
                    <div className={`mt-2 text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{createdBooking.bookingNo}</div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link href={withLocaleQuery("/mypage/bookings", lang)} className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500">{text.goLookup}</Link>
                    <Link href={detailHref} className={`inline-flex items-center justify-center rounded-2xl border px-6 py-3.5 text-sm font-bold transition ${isDark ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}`}>{text.goTour}</Link>
                </div>
            </section>
        );
    }

    return (
        <>
            <Script
                src="https://js.tosspayments.com/v2/standard"
                strategy="afterInteractive"
                onReady={() => {
                    if (window.TossPayments) {
                        setSdkReady(true);
                        setSdkLoadFailed(false);
                    }
                }}
                onLoad={() => {
                    setSdkReady(true);
                    setSdkLoadFailed(false);
                }}
                onError={() => {
                    setSdkReady(false);
                    setSdkLoadFailed(true);
                }}
            />

            <section className={shellClass}>
                <div className={`border-b px-6 py-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
                    <div className="mt-4">
                        <div className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600">{text.badge}</div>
                        <h1 className={`mt-3 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{text.title}</h1>
                        <p className={`mt-2 text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>{text.desc}</p>
                    </div>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6">
                    <div className="grid gap-4">
                        <section className={sectionClass}>
                            <StepTitle step={1} title={pick(lang, "상품 정보", "商品情報", "Product info")} isDark={isDark} />
                            <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                                <div className={`relative h-28 overflow-hidden rounded-[24px] sm:h-24 sm:w-28 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                                    <Image
                                        src={customPlan?.image ?? tour?.heroImage ?? "/images/null.png"}
                                        alt={customPlan?.title ?? tour?.title[lang] ?? ""}
                                        fill
                                        className="object-cover"
                                        sizes="112px"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{customPlan?.title ?? tour?.title[lang]}</h3>
                                    <p className={`mt-2 whitespace-pre-line text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        {customPlan?.summary ?? tour?.desc[lang]}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>{pick(lang, "여행 기간", "旅行期間", "Duration")} · {customPlan?.durationLabel ?? tour?.duration[lang]}</span>
                                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>{pick(lang, "여행 인원", "旅行人数", "Guests")} · {guests}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={sectionClass}>
                            <StepTitle step={2} title={pick(lang, "여행자 정보", "旅行者情報", "Traveler info")} desc={text.travelerDesc} isDark={isDark} />
                            <div className="mt-5 grid gap-4">
                                <div>
                                    <label className={labelClass}>{pick(lang, "신청자 이름", "申請者名", "Applicant name")}</label>
                                    <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className={inputClass} placeholder={pick(lang, "예: 김지수", "例: 山田花子", "e.g. John Doe")} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>{pick(lang, "연락처", "連絡先", "Phone number")}</label>
                                        <input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} placeholder={pick(lang, "예: 010-1234-5678", "例: 090-1234-5678", "e.g. 010-1234-5678")} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>{pick(lang, "이메일", "メール", "Email")}</label>
                                        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className={inputClass} placeholder={pick(lang, "예: bluewolf@example.com", "例: bluewolf@example.com", "e.g. bluewolf@example.com")} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>{pick(lang, "출발일", "出発日", "Departure date")}</label>
                                    <CalendarPicker value={departDate} onChange={setDepartDate} placeholder={pick(lang, "출발일을 선택해주세요", "出発日を選択してください", "Choose a departure date")} weekdays={weekdays} deleteLabel={pick(lang, "날짜 지우기", "日付を削除", "Clear date")} todayLabel={pick(lang, "오늘", "今日", "Today")} locale={lang} isDark={isDark} />
                                </div>
                            </div>
                        </section>

                        <section className={sectionClass}>
                            <StepTitle step={3} title={pick(lang, "추가 정보", "追加情報", "Extra info")} desc={text.extraDesc} isDark={isDark} />
                            <div className="mt-5 grid gap-4">
                                <div>
                                    <div className={labelClass}>{pick(lang, "선택 옵션", "選択オプション", "Selected options")}</div>
                                    {selectedOptions.length > 0 ? (
                                        <div className="grid gap-3">
                                            {selectedOptions.map((option) => (
                                                <div key={option.key} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
                                                    <div>
                                                        <div className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{option.title}</div>
                                                        <div className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{formatPrice(option.price)} × {guests}</div>
                                                    </div>
                                                    <div className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(option.price * guests)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`rounded-2xl border px-4 py-4 text-sm ${isDark ? "border-white/10 bg-slate-900 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>{pick(lang, "선택한 추가 옵션이 없습니다.", "選択した追加オプションはありません。", "No extra options selected.")}</div>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>{pick(lang, "요청 사항", "ご要望", "Special request")}</label>
                                    <textarea value={memo} onChange={(event) => setMemo(event.target.value)} className={textareaClass} placeholder={pick(lang, "픽업, 차량, 숙소 관련 요청이 있다면 적어주세요.", "ピックアップ、車両、宿泊に関するご要望があれば入力してください。", "Leave any pickup, vehicle, or stay requests here.")} />
                                </div>
                            </div>
                        </section>

                        <section className={sectionClass}>
                            <StepTitle step={4} title={pick(lang, "결제 방법", "決済方法", "Payment method")} desc={text.methodDesc} isDark={isDark} />
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                {([
                                    ["card", pick(lang, "카드 결제", "カード決済", "Card")],
                                    ["bank", pick(lang, "무통장 입금", "銀行振込", "Bank transfer")],
                                    ["simple", pick(lang, "간편 결제", "簡単決済", "Simple pay")],
                                ] as const).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            if (value === "bank") setPaymentMethod(value);
                                        }}
                                        disabled={value !== "bank"}
                                        className={`relative rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                                            paymentMethod === value
                                                ? "border-blue-600 bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)]"
                                                : value !== "bank"
                                                  ? isDark
                                                      ? "cursor-not-allowed border-white/10 bg-slate-900/60 text-slate-500"
                                                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                                  : isDark
                                                    ? "border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800"
                                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        <span>{label}</span>
                                        {value !== "bank" ? (
                                            <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-black ${isDark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-400"}`}>
                                                {text.unavailableMethod}
                                            </span>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                            {paymentMethod === "simple" ? (
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    {([
                                        ["toss", "Toss Pay"],
                                        ["naver", "N Pay"],
                                        ["kakao", "Kakao Pay"],
                                    ] as const).map(([value, label]) => (
                                        <button key={value} type="button" onClick={() => setSimpleProvider(value)} className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${simpleProvider === value ? "border-blue-600 bg-blue-50 text-blue-700" : isDark ? "border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{label}</button>
                                    ))}
                                </div>
                            ) : null}
                            {paymentMethod === "bank" ? (
                                <div className={`mt-4 rounded-[24px] border p-4 ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{pick(lang, "계좌 이체 안내", "振込案内", "Bank transfer guide")}</div>
                                    <div className="mt-4 grid gap-3">
                                        <div className={`rounded-2xl border px-4 py-3 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"}`}>
                                            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{pick(lang, "예금주", "口座名義", "Account holder")}</div>
                                            <div className={`mt-1 text-sm font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>블루울프 코리아(BlueWolf KR)</div>
                                        </div>
                                        <div className={`rounded-2xl border px-4 py-3 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"}`}>
                                            <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{pick(lang, "계좌번호", "口座番号", "Account number")}</div>
                                            <div className={`mt-1 text-sm font-black tracking-wide ${isDark ? "text-slate-100" : "text-slate-900"}`}>토스뱅크 1002-5461-3978</div>
                                        </div>
                                    </div>
                                    <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-bold ${isDark ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{pick(lang, "BlueWolf Mongolia 확인 후 진행 상태가 갱신됩니다.", "BlueWolf Mongolia の確認後に進行状況が更新されます。", "BlueWolf Mongolia will review this transfer and update the progress.")}</div>
                                </div>
                            ) : null}
                        </section>
                    </div>

                    <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
                        <section className={sectionClass}>
                            <StepTitle step={5} title={pick(lang, "결제 요약", "決済サマリー", "Payment summary")} isDark={isDark} />
                            <div className="mt-5 space-y-3">
                                <div className="flex items-center justify-between"><span className={isDark ? "text-slate-400" : "text-slate-500"}>{pick(lang, "기본 여행 금액", "基本旅行金額", "Base trip amount")}</span><span className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{formatPrice(baseFare)}</span></div>
                                <div className="flex items-center justify-between"><span className={isDark ? "text-slate-400" : "text-slate-500"}>{pick(lang, "추가 옵션 금액", "追加オプション金額", "Option amount")}</span><span className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{formatPrice(optionTotal)}</span></div>
                                <div className={`border-t pt-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                                    <div className="flex items-center justify-between"><span className={`text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{pick(lang, "예상 총액", "想定総額", "Estimated total")}</span><span className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(estimatedTotal)}</span></div>
                                </div>
                                <div className="flex items-center justify-between"><span className="text-sm font-bold text-blue-500">{pick(lang, "플랜료", "今支払うプランパッケージ利用料", "Plan package fee due now")}</span><span className="text-lg font-black text-blue-500">{formatPrice(depositDue)}</span></div>
                            </div>
                        </section>

                        {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}
                        {(paymentMethod === "card" || paymentMethod === "simple") && !sdkReady ? (
                            <p className={`rounded-2xl border px-4 py-3 text-xs font-bold ${
                                sdkLoadFailed
                                    ? isDark
                                        ? "border-red-500/30 bg-red-500/10 text-red-200"
                                        : "border-red-200 bg-red-50 text-red-600"
                                    : isDark
                                      ? "border-white/10 bg-slate-900 text-slate-300"
                                      : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}>
                                {sdkLoadFailed ? text.sdkLoadFail : text.sdkLoading}
                            </p>
                        ) : null}
                        <button type="button" onClick={handleSubmit} disabled={submitting || ((paymentMethod === "card" || paymentMethod === "simple") && !sdkReady)} className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-base font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400">
                            {submitting
                                ? pick(lang, "처리 중...", "処理中...", "Processing...")
                                : (paymentMethod === "card" || paymentMethod === "simple") && !sdkReady
                                  ? pick(lang, "결제창 로딩 중", "決済画面読み込み中", "Loading payment")
                                  : paymentMethod === "bank"
                                    ? pick(lang, "플랜 신청하기", "プラン申請を送信する", "Submit plan application")
                                    : pick(lang, "플랜료 결제하기", "プランパッケージ決済へ", "Pay plan package fee")}
                        </button>
                        <Link href={detailHref} className={`inline-flex w-full items-center justify-center rounded-2xl border px-6 py-3.5 text-sm font-bold transition ${isDark ? "border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>{text.goTour}</Link>
                    </aside>
                </div>
            </section>
        </>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={null}>
            <PageShell activeKey="booking">
                <PaymentContent />
            </PageShell>
        </Suspense>
    );
}

