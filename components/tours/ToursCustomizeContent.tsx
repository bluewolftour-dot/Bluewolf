"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { CalendarPicker } from "@/components/ui/CalendarPicker";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";
import { usePage } from "@/components/layout/PageShell";
import {
    type OptionKey,
    isRegion,
    pageCopy,
    regionMeta,
} from "@/components/tours/tours-customize-data";
import { withLocaleQuery } from "@/lib/locale-routing";
import { useCmsTourOptions } from "@/lib/use-cms-tour-options";
import { useCmsTourCustomize } from "@/lib/use-cms-tour-customize";
import { formatPrice } from "@/lib/bluewolf-utils";
import { type LocalizedTourOption } from "@/lib/cms-tour-options";

type TossPaymentRequest = {
    method: "CARD";
    amount: { currency: "KRW"; value: number };
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerName: string;
    customerMobilePhone: string;
};

type TossPaymentsFactory = (clientKey: string) => {
    payment: (input: { customerKey: string }) => {
        requestPayment: (request: TossPaymentRequest) => Promise<unknown>;
    };
};

type PrepareCustomPlanPaymentResponse = {
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

const CUSTOM_PLAN_DEPOSIT_PER_PERSON = 50000;

function addDaysValue(value: string, days: number) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function useAnimatedNumber(value: number, duration = 420) {
    const [displayValue, setDisplayValue] = useState(value);
    const previousValueRef = useRef(value);

    useEffect(() => {
        let frameId = 0;
        const startValue = previousValueRef.current;
        const startedAt = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(startValue + (value - startValue) * eased));
            if (progress < 1) frameId = window.requestAnimationFrame(tick);
        };

        previousValueRef.current = value;
        frameId = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(frameId);
    }, [duration, value]);

    return displayValue;
}

function OptionDetailModal({
    option,
    isDark,
    closeLabel,
    optionUnitLabel,
    showImages,
    onClose,
}: {
    option: LocalizedTourOption;
    isDark: boolean;
    closeLabel: string;
    optionUnitLabel: string;
    showImages: boolean;
    onClose: () => void;
}) {
    useBodyScrollLock(true);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    const panelClass = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900";

    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="animate-fade-in-overlay fixed bottom-0 left-0 right-0 top-0 z-[70] flex h-dvh w-screen items-end justify-center bg-slate-950/55 backdrop-blur-md sm:items-center">
            <button type="button" aria-label={closeLabel} onClick={onClose} className="absolute inset-0" />
            <div className={`animate-slide-up-modal relative z-10 w-full max-w-xl rounded-t-[28px] border p-6 shadow-2xl sm:m-4 sm:rounded-[28px] ${panelClass}`}>
                <div>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className="inline-flex rounded-full bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white">
                                +{formatPrice(option.price)} / {optionUnitLabel}
                            </span>
                            <h3 className="mt-3 text-2xl font-black tracking-tight">{option.title}</h3>
                            <p className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{option.desc}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl leading-none transition ${
                                isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                            x
                        </button>
                    </div>

                    <div className="mt-5 grid gap-3">
                        {option.details.map((detail) => (
                            <div
                                key={detail}
                                className={`rounded-[20px] border px-4 py-3 text-sm font-semibold ${
                                    isDark ? "border-white/10 bg-slate-950 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"
                                }`}
                            >
                                {detail}
                            </div>
                        ))}
                    </div>

                    {showImages && option.photos.length > 0 && (
                        <div className={`mt-5 border-t pt-5 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                            <div className={`mb-3 text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Gallery</div>
                            <div className={`grid gap-1.5 ${option.photos.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
                                {option.photos.slice(0, 3).map((src, index) => (
                                    <div key={`${option.key}-${index}`} className="relative aspect-square overflow-hidden rounded-[12px]">
                                        <Image src={src} alt={`${option.title} ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 30vw, 180px" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export function ToursCustomizeContent() {
    const searchParams = useSearchParams();
    const { lang, isDark, t } = usePage();
    const { user, ready: authReady } = useAuth();
    const copy = pageCopy[lang];
    const periodCopy = {
        ko: {
            sectionLabel: "여행 기간",
            startLabel: "출발일",
            endLabel: "도착일",
            durationLabel: "예상 일정",
            durationPlaceholder: "출발일과 도착일을 선택해 주세요",
            formatDuration: (nights: number, days: number) => `${nights}박 ${days}일`,
        },
        ja: {
            sectionLabel: "旅行期間",
            startLabel: "出発日",
            endLabel: "到着日",
            durationLabel: "日程の長さ",
            durationPlaceholder: "出発日と到着日を選択してください",
            formatDuration: (nights: number, days: number) => `${nights}泊 ${days}日`,
        },
        en: {
            sectionLabel: "Trip period",
            startLabel: "Start date",
            endLabel: "End date",
            durationLabel: "Trip length",
            durationPlaceholder: "Select both start and end dates",
            formatDuration: (nights: number, days: number) => `${nights} nights ${days} days`,
        },
    }[lang];
    const guestCopy = {
        ko: {
            sectionLabel: "인원 수",
            desc: "함께 여행할 인원 수를 선택해 주세요.",
            summaryLabel: "여행 인원",
            unit: "명",
        },
        ja: {
            sectionLabel: "人数",
            desc: "一緒に旅行する人数を選んでください。",
            summaryLabel: "旅行人数",
            unit: "名",
        },
        en: {
            sectionLabel: "Guests",
            desc: "Choose how many people are traveling together.",
            summaryLabel: "Guests",
            unit: " pax",
        },
    }[lang];
    const optionUnitLabel = {
        ko: "1인당",
        ja: "1名あたり",
        en: "per person",
    }[lang];
    const destinationCopy = {
        ko: {
            sectionLabel: "여행지",
            desc: "선택한 지역에서 대표 여행지를 골라보세요. 여행지는 중복선택이 가능해요.",
            summaryLabel: "세부 여행지",
        },
        ja: {
            sectionLabel: "旅行地",
            desc: "選んだ地域の代表的な旅行地から選んでください。",
            summaryLabel: "詳細エリア",
        },
        en: {
            sectionLabel: "Destinations",
            desc: "Choose from the signature destinations in this region.",
            summaryLabel: "Destination",
        },
    }[lang];
    const activityCopy = {
        ko: {
            sectionLabel: "액티비티",
            desc: "선택한 지역에서 함께 즐길 활동을 골라보세요.",
            summaryLabel: "액티비티",
            emptyLabel: "선택한 액티비티 없음",
        },
        ja: {
            sectionLabel: "アクティビティ",
            desc: "選択した地域で楽しむアクティビティを選べます。",
            summaryLabel: "アクティビティ",
            emptyLabel: "選択したアクティビティなし",
        },
        en: {
            sectionLabel: "Activities",
            desc: "Choose activities to add to your custom plan.",
            summaryLabel: "Activities",
            emptyLabel: "No activities selected",
        },
    }[lang];
    const checkoutCopy = {
        ko: {
            title: "선택한 플랜 확인",
            desc: "예약 전 선택한 여행 조건을 확인하고 문의 사항을 남겨주세요.",
            travelerTitle: "예약자 정보",
            nameLabel: "예약자 이름",
            phoneLabel: "연락처",
            emailLabel: "이메일",
            inquiryLabel: "문의 사항",
            inquiryPlaceholder: "추가 요청 사항이나 상담이 필요한 내용을 입력해주세요.",
            depositLabel: "지금 결제할 예약금",
            depositDesc: "예약금은 1인당 50,000원으로 계산됩니다.",
            payLabel: "이 플랜으로 결제하기",
            cancelLabel: "닫기",
            datesRequired: "출발일과 도착일을 먼저 선택해주세요.",
            travelerRequired: "예약자 이름과 연락처를 입력해주세요.",
            sdkError: "결제창을 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
            failedError: "결제 준비 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
            processingLabel: "결제 준비 중...",
            customTitleSuffix: "커스텀 플랜",
            noInquiry: "문의 사항 없음",
        },
        ja: {
            title: "選択したプラン確認",
            desc: "予約前に選択内容を確認し、追加のリクエストを入力してください。",
            travelerTitle: "予約者情報",
            nameLabel: "予約者名",
            phoneLabel: "連絡先",
            emailLabel: "メール",
            inquiryLabel: "お問い合わせ内容",
            inquiryPlaceholder: "追加リクエストや相談したい内容を入力してください。",
            depositLabel: "今支払う予約金",
            depositDesc: "予約金は1名あたり50,000ウォンで計算されます。",
            payLabel: "このプランで決済する",
            cancelLabel: "閉じる",
            datesRequired: "出発日と到着日を先に選択してください。",
            travelerRequired: "予約者名と連絡先を入力してください。",
            sdkError: "決済画面をまだ読み込めていません。しばらくしてから再度お試しください。",
            failedError: "決済準備中に問題が発生しました。しばらくしてから再度お試しください。",
            processingLabel: "決済準備中...",
            customTitleSuffix: "カスタムプラン",
            noInquiry: "お問い合わせ内容なし",
        },
        en: {
            title: "Review your selected plan",
            desc: "Confirm your custom trip plan and leave any extra requests before payment.",
            travelerTitle: "Traveler details",
            nameLabel: "Lead traveler name",
            phoneLabel: "Phone number",
            emailLabel: "Email",
            inquiryLabel: "Inquiry",
            inquiryPlaceholder: "Add special requests or anything you would like us to check.",
            depositLabel: "Deposit due now",
            depositDesc: "The deposit is calculated at ₩50,000 per person.",
            payLabel: "Pay for this plan",
            cancelLabel: "Close",
            datesRequired: "Please select both start and end dates first.",
            travelerRequired: "Please enter the lead traveler name and phone number.",
            sdkError: "The payment window is still loading. Please try again in a moment.",
            failedError: "Something went wrong while preparing the payment.",
            processingLabel: "Preparing payment...",
            customTitleSuffix: "custom plan",
            noInquiry: "No inquiry",
        },
    }[lang];
    const regionParam = searchParams.get("region");
    const region = isRegion(regionParam) ? regionParam : "south";
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [guests, setGuests] = useState(2);
    const [selectedOptions, setSelectedOptions] = useState<OptionKey[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [detailOption, setDetailOption] = useState<LocalizedTourOption | null>(null);
    const [planCheckoutOpen, setPlanCheckoutOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [inquiry, setInquiry] = useState("");
    const [inlineError, setInlineError] = useState("");
    const [checkoutError, setCheckoutError] = useState("");
    const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
    const [tossReady, setTossReady] = useState(false);
    const [tossLoadFailed, setTossLoadFailed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [footerOverlap, setFooterOverlap] = useState(0);
    useBodyScrollLock(planCheckoutOpen);

    const periodSectionRef = useRef<HTMLDivElement>(null);
    const checkoutPanelRef = useRef<HTMLDivElement>(null);
    const travelerSectionRef = useRef<HTMLDivElement>(null);
    const { localizedOptions: optionChoices, loaded: optionsLoaded } = useCmsTourOptions(lang);
    const { localizedRegions: customizeRegions, loaded: customizeLoaded } = useCmsTourCustomize(lang);

    const regionInfo = regionMeta[lang][region];
    const regionCustomize = customizeRegions[region];
    const destinationOptions = regionCustomize.destinations;
    const activityOptions = regionCustomize.activities;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const footer = document.querySelector<HTMLElement>("[data-site-footer]");
        if (!footer) return;

        let frame = 0;
        const updateFooterOverlap = () => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
                const rect = footer.getBoundingClientRect();
                setFooterOverlap(Math.max(0, window.innerHeight - rect.top));
            });
        };

        updateFooterOverlap();
        window.addEventListener("scroll", updateFooterOverlap, { passive: true });
        window.addEventListener("resize", updateFooterOverlap);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", updateFooterOverlap);
            window.removeEventListener("resize", updateFooterOverlap);
        };
    }, [mounted]);

    const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
        destinationOptions[0] ? [destinationOptions[0].id] : []
    );
    const [lastSelectedDestinationId, setLastSelectedDestinationId] = useState<string>(
        destinationOptions[0]?.id ?? ""
    );
    const minPrice = regionCustomize.basePrice;
    const selectedOptionItems = useMemo(
        () =>
            selectedOptions
                .map((key) => optionChoices.find((option) => option.key === key))
                .filter((option): option is LocalizedTourOption => Boolean(option)),
        [optionChoices, selectedOptions]
    );
    const selectedActivityItems = useMemo(
        () => activityOptions.filter((activity) => selectedActivities.includes(activity.id)),
        [activityOptions, selectedActivities]
    );
    const optionTotal = selectedOptionItems.reduce((sum, option) => sum + option.price, 0) * guests;
    const activityTotal = selectedActivityItems.reduce((sum, activity) => sum + activity.price, 0) * guests;
    const estimatedPrice = minPrice * guests + optionTotal + activityTotal;
    const animatedPrice = useAnimatedNumber(estimatedPrice);
    const animatedOptionTotal = useAnimatedNumber(optionTotal + activityTotal);
    const activeSelectedDestinations = useMemo(() => {
        const availableIds = new Set(destinationOptions.map((destination) => destination.id));
        const filtered = selectedDestinations.filter((id) => availableIds.has(id));
        if (filtered.length > 0) return filtered;
        if (lastSelectedDestinationId && availableIds.has(lastSelectedDestinationId)) {
            return [lastSelectedDestinationId];
        }
        return destinationOptions[0] ? [destinationOptions[0].id] : [];
    }, [destinationOptions, lastSelectedDestinationId, selectedDestinations]);
    const selectedDestinationItems = useMemo(
        () => destinationOptions.filter((destination) => activeSelectedDestinations.includes(destination.id)),
        [activeSelectedDestinations, destinationOptions]
    );

    const tripDuration = useMemo(() => {
        if (!startDate || !endDate) {
            return null;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const msPerDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round((end.getTime() - start.getTime()) / msPerDay);

        if (Number.isNaN(diffDays) || diffDays < 0) {
            return null;
        }

        return {
            nights: diffDays,
            days: diffDays + 1,
        };
    }, [endDate, startDate]);

    const toggleOption = (key: OptionKey) => {
        setSelectedOptions((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
    };

    const toggleActivity = (activityId: string) => {
        setSelectedActivities((prev) =>
            prev.includes(activityId)
                ? prev.filter((item) => item !== activityId)
                : [...prev, activityId]
        );
    };

    const handleStartDateChange = (nextValue: string) => {
        setStartDate(nextValue);
        const nextMinEndDate = nextValue ? addDaysValue(nextValue, 1) : "";
        if (endDate && nextMinEndDate && endDate < nextMinEndDate) {
            setEndDate("");
        }
    };

    const handleEndDateChange = (nextValue: string) => {
        if (endDateMinValue && nextValue && nextValue < endDateMinValue) {
            return;
        }

        setEndDate(nextValue);
    };

    const tripDurationLabel = tripDuration
        ? periodCopy.formatDuration(tripDuration.nights, tripDuration.days)
        : periodCopy.durationPlaceholder;
    const travelDateLabel = startDate && endDate ? `${startDate} - ${endDate}` : periodCopy.durationPlaceholder;
    const endDateMinValue = startDate ? addDaysValue(startDate, 1) : "";
    const customPlanTitle = `${regionInfo.title} ${checkoutCopy.customTitleSuffix}`;
    const customPlanDeposit = CUSTOM_PLAN_DEPOSIT_PER_PERSON * guests;
    const paymentButtonLabel = !tossReady
        ? lang === "ja"
            ? "決済画面を読み込み中..."
            : lang === "en"
              ? "Loading payment window..."
              : "결제창 불러오는 중..."
        : checkoutSubmitting
          ? checkoutCopy.processingLabel
          : checkoutCopy.payLabel;
    const tossLoadFailedMessage =
        lang === "ja"
            ? "決済画面を読み込めませんでした。ネットワーク状態を確認してから再度お試しください。"
            : lang === "en"
              ? "We could not load the payment window. Please check your network and try again."
              : "결제창을 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.";
    const summaryRows = [
        [copy.summaryRegion, regionInfo.title],
        [destinationCopy.summaryLabel, selectedDestinationItems.map((item) => item.title).join(", ") || "-"],
        [guestCopy.summaryLabel, `${guests}${guestCopy.unit}`],
        [copy.summaryDate, travelDateLabel],
        [periodCopy.durationLabel, tripDurationLabel],
        [activityCopy.summaryLabel, selectedActivityItems.map((item) => item.title).join(", ") || activityCopy.emptyLabel],
        [copy.summaryOptions, selectedOptionItems.map((item) => item.title).join(", ") || copy.emptyOptions],
        [copy.estimateLabel, formatPrice(estimatedPrice)],
    ];

    useEffect(() => {
        if (!authReady || !user) return;
        setCustomerName((current) => current || user.name || "");
        setPhone((current) => current || user.phone || "");
        setEmail((current) => current || user.email || "");
    }, [authReady, user]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const tossPaymentsFactory = (window as unknown as { TossPayments?: TossPaymentsFactory }).TossPayments;
        if (tossPaymentsFactory) {
            setTossReady(true);
            setTossLoadFailed(false);
        }
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            setInlineError("");
        }
    }, [endDate, startDate]);

    const buildCustomPlanSummary = () =>
        [
            ...summaryRows.map(([label, value]) => `${label}: ${value}`),
            `${checkoutCopy.inquiryLabel}: ${inquiry.trim() || checkoutCopy.noInquiry}`,
        ].join("\n");

    const scrollToTarget = (target: HTMLElement | null) => {
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const scrollCheckoutToTarget = (target: HTMLElement | null) => {
        const panel = checkoutPanelRef.current;
        if (!panel || !target) return;

        const panelRect = panel.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const nextTop = panel.scrollTop + targetRect.top - panelRect.top - 24;

        panel.scrollTo({
            top: Math.max(nextTop, 0),
            behavior: "smooth",
        });
    };

    const handleOpenPlanCheckout = () => {
        if (!startDate || !endDate) {
            setInlineError(checkoutCopy.datesRequired);
            setPlanCheckoutOpen(false);
            window.requestAnimationFrame(() => scrollToTarget(periodSectionRef.current));
            return;
        }

        setInlineError("");
        setCheckoutError("");
        setPlanCheckoutOpen(true);
    };

    const handleCustomPlanPayment = async () => {
        if (!startDate || !endDate) {
            setCheckoutError(checkoutCopy.datesRequired);
            setPlanCheckoutOpen(false);
            setInlineError(checkoutCopy.datesRequired);
            window.requestAnimationFrame(() => scrollToTarget(periodSectionRef.current));
            return;
        }

        if (!customerName.trim() || !phone.trim()) {
            setCheckoutError(checkoutCopy.travelerRequired);
            window.requestAnimationFrame(() => scrollCheckoutToTarget(travelerSectionRef.current));
            return;
        }

        const tossPaymentsFactory = (window as unknown as { TossPayments?: TossPaymentsFactory }).TossPayments;

        if (!tossReady || !tossPaymentsFactory) {
            setCheckoutError(tossLoadFailed ? tossLoadFailedMessage : checkoutCopy.sdkError);
            return;
        }

        setCheckoutSubmitting(true);
        setCheckoutError("");

        try {
            const response = await fetch("/api/payments/toss/prepare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customPlan: {
                        title: customPlanTitle,
                        summary: buildCustomPlanSummary(),
                        totalAmount: estimatedPrice,
                    },
                    customerName,
                    email,
                    phone,
                    departDate: startDate,
                    guests,
                    locale: lang,
                    paymentMethod: "card",
                    optionKeys: selectedOptions,
                    memo: inquiry,
                }),
            });

            const payload = (await response.json().catch(() => null)) as
                | PrepareCustomPlanPaymentResponse
                | { error?: string }
                | null;

            if (!response.ok || !payload || !("clientKey" in payload)) {
                const responseError =
                    payload && "error" in payload && typeof payload.error === "string"
                        ? payload.error
                        : checkoutCopy.failedError;
                throw new Error(responseError);
            }

            const tossPayments = tossPaymentsFactory(payload.clientKey);
            const payment = tossPayments.payment({ customerKey: payload.customerKey });

            await payment.requestPayment({
                method: "CARD",
                amount: { currency: "KRW", value: payload.amount },
                orderId: payload.orderId,
                orderName: payload.orderName,
                successUrl: payload.successUrl,
                failUrl: payload.failUrl,
                customerName: payload.customerName,
                customerMobilePhone: payload.customerMobilePhone,
            });
        } catch (caught) {
            setCheckoutError(caught instanceof Error ? caught.message : checkoutCopy.failedError);
        } finally {
            setCheckoutSubmitting(false);
        }
    };

    return (
        <>
            <Script
                src="https://js.tosspayments.com/v2/standard"
                strategy="afterInteractive"
                onLoad={() => {
                    setTossReady(true);
                    setTossLoadFailed(false);
                }}
                onError={() => {
                    setTossReady(false);
                    setTossLoadFailed(true);
                }}
            />
            <section className="pb-56 sm:pb-60">
                <div className={`overflow-hidden rounded-[28px] border shadow-sm transition-colors duration-300 ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}`}>
                    <div className="relative h-64 sm:h-80">
                        <Image src={regionInfo.image} alt={regionInfo.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                            <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold backdrop-blur-sm">{regionInfo.label}</span>
                            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.title}</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100 sm:text-base">{copy.desc}</p>
                        </div>
                    </div>

                    <div className="grid gap-8 p-6 sm:p-8">
                        <div ref={periodSectionRef} className="scroll-mt-28">
                            <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{periodCopy.sectionLabel}</h2>
                            <p className={`mt-2 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{copy.nightsDesc}</p>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className={`mb-2 text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{periodCopy.startLabel}</div>
                                    <CalendarPicker value={startDate} onChange={handleStartDateChange} placeholder={copy.datePlaceholder} weekdays={copy.weekdays} deleteLabel={copy.deleteLabel} todayLabel={copy.todayLabel} locale={lang} isDark={isDark} />
                                </div>
                                <div>
                                    <div className={`mb-2 text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{periodCopy.endLabel}</div>
                                    <CalendarPicker
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                        placeholder={copy.datePlaceholder}
                                        weekdays={copy.weekdays}
                                        deleteLabel={copy.deleteLabel}
                                        todayLabel={copy.todayLabel}
                                        locale={lang}
                                        isDark={isDark}
                                        minDate={endDateMinValue}
                                        defaultViewDate={endDateMinValue}
                                    />
                                </div>
                            </div>

                            <div className={`mt-4 rounded-[22px] border p-4 transition-colors duration-300 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{periodCopy.durationLabel}</div>
                                <div className={`mt-1 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {tripDuration ? periodCopy.formatDuration(tripDuration.nights, tripDuration.days) : periodCopy.durationPlaceholder}
                                </div>
                            </div>
                            {inlineError ? (
                                <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm font-bold ${isDark ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-red-100 bg-red-50 text-red-600"}`}>
                                    {inlineError}
                                </div>
                            ) : null}
                        </div>

                        <div>
                            <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{guestCopy.sectionLabel}</h2>
                            <p className={`mt-2 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{guestCopy.desc}</p>
                            <div className={`mt-4 rounded-[24px] border p-5 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                <div className={`mb-3 text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.guestsLabel}</div>
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
                                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg font-black transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.94] ${
                                            isDark ? "border-white/10 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                                        }`}
                                        aria-label="Decrease guests"
                                    >
                                        -
                                    </button>
                                    <div className={`text-center text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {guests}
                                        <span className={`ml-1 text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>{guestCopy.unit}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setGuests((prev) => Math.min(20, prev + 1))}
                                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg font-black transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.94] ${
                                            isDark ? "border-white/10 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                                        }`}
                                        aria-label="Increase guests"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{destinationCopy.sectionLabel}</h2>
                            <p className={`mt-2 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{destinationCopy.desc}</p>
                            <div className="mt-4 grid gap-3">
                                {destinationOptions.map((destination: (typeof destinationOptions)[number]) => {
                                    const active = activeSelectedDestinations.includes(destination.id);
                                    return (
                                        <button
                                            key={destination.id}
                                            type="button"
                                            onClick={() => {
                                                setLastSelectedDestinationId(destination.id);
                                                setSelectedDestinations((prev) =>
                                                    prev.includes(destination.id)
                                                        ? prev.filter((item) => item !== destination.id)
                                                        : [...prev, destination.id]
                                                );
                                            }}
                                            className={`overflow-hidden rounded-[24px] border text-left transition-[background-color,border-color,box-shadow] duration-300 ${
                                                active
                                                    ? isDark
                                                        ? "border-blue-400 bg-blue-500/15 text-slate-100 shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                                                        : "border-blue-500 bg-blue-50 text-slate-900 shadow-[0_10px_24px_rgba(37,99,235,0.12)]"
                                                    : isDark
                                                      ? "border-white/10 bg-slate-950 text-slate-100 hover:border-blue-400/50 hover:bg-blue-500/10"
                                                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50/70"
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="relative aspect-[16/9] w-full overflow-hidden sm:w-52 sm:shrink-0">
                                                    {customizeLoaded ? (
                                                        <Image
                                                            src={destination.image}
                                                            alt={destination.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 640px) 100vw, 208px"
                                                        />
                                                    ) : (
                                                        <div className={`absolute inset-0 ${isDark ? "bg-slate-900" : "bg-slate-100"}`} />
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col justify-center px-4 py-4">
                                                    <div className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                                        {destination.title}
                                                    </div>
                                                    <p className={`mt-2 text-sm leading-6 ${active ? (isDark ? "text-blue-100" : "text-slate-700") : isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                        {destination.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{activityCopy.sectionLabel}</h2>
                            <p className={`mt-2 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{activityCopy.desc}</p>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {activityOptions.map((activity) => {
                                    const active = selectedActivities.includes(activity.id);
                                    return (
                                        <button
                                            key={activity.id}
                                            type="button"
                                            onClick={() => toggleActivity(activity.id)}
                                            className={`overflow-hidden rounded-[24px] border text-left transition-[background-color,border-color,box-shadow] duration-300 ${
                                                active
                                                    ? "border-blue-500 bg-blue-50 text-slate-900 shadow-[0_10px_24px_rgba(37,99,235,0.12)]"
                                                    : isDark
                                                      ? "border-white/10 bg-slate-950 text-slate-100 hover:bg-slate-800"
                                                      : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-white"
                                            }`}
                                        >
                                            <div className="relative aspect-[16/9] overflow-hidden">
                                                {customizeLoaded ? (
                                                    <Image
                                                        src={activity.image}
                                                        alt={activity.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                    />
                                                ) : (
                                                    <div className={`absolute inset-0 ${isDark ? "bg-slate-900" : "bg-slate-100"}`} />
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <div className={`text-base font-black ${active ? "text-slate-900" : isDark ? "text-white" : "text-slate-900"}`}>
                                                        {activity.title}
                                                    </div>
                                                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                                                        +{formatPrice(activity.price)} / {optionUnitLabel}
                                                    </span>
                                                </div>
                                                <p className={`mt-2 text-sm leading-6 ${active ? "text-slate-700" : isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                    {activity.desc}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{copy.optionsTitle}</h2>
                            <p className={`mt-2 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{copy.optionsDesc}</p>
                            <div className="mt-4 grid gap-3">
                                {optionChoices.map((option) => {
                                    const active = selectedOptions.includes(option.key);
                                    return (
                                        <div
                                            key={option.key}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => toggleOption(option.key)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    toggleOption(option.key);
                                                }
                                            }}
                                            className={`rounded-[24px] border p-5 text-left transition-[background-color,border-color,box-shadow] duration-300 ${active ? "border-blue-500 bg-blue-50 shadow-[0_12px_28px_rgba(37,99,235,0.10)]" : isDark ? "border-white/10 bg-slate-950 hover:bg-slate-800" : "border-slate-200 bg-slate-50 hover:bg-white"}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                    <div className={`text-base font-black ${active ? "text-slate-900" : isDark ? "text-white" : "text-slate-900"}`}>{option.title}</div>
                                                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">+{formatPrice(option.price)} / {optionUnitLabel}</span>
                                                    </div>
                                                    <p className={`mt-2 text-sm leading-6 ${active ? "text-slate-700" : isDark ? "text-slate-400" : "text-slate-500"}`}>{option.desc}</p>
                                                </div>
                                                <span className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-4 text-sm font-black transition ${active ? "bg-blue-600 text-white" : isDark ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"}`}>
                                                    {active ? copy.selectedLabel : "+"}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setDetailOption(option);
                                                    }}
                                                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-white text-slate-700 hover:bg-slate-100"}`}
                                                >
                                                    {copy.detailsLabel}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{copy.summaryTitle}</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
                                <div className={`rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{copy.summaryRegion}</div>
                                    <div className={`mt-1 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>{regionInfo.title}</div>
                                </div>
                                <div className={`rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{destinationCopy.summaryLabel}</div>
                                    <div className={`mt-1 flex flex-wrap gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {selectedDestinationItems.length > 0 ? (
                                            selectedDestinationItems.map((destination) => (
                                                <span key={destination.id} className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white">
                                                    {destination.title}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-base font-black">{destinationOptions[0]?.title ?? "-"}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={`rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{guestCopy.summaryLabel}</div>
                                    <div className={`mt-1 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {guests}
                                        <span className={`ml-1 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{guestCopy.unit}</span>
                                    </div>
                                </div>
                                <div className={`rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{copy.summaryDate}</div>
                                    <div className={`mt-1 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {startDate && endDate ? `${startDate} - ${endDate}` : periodCopy.durationPlaceholder}
                                    </div>
                                </div>
                                <div className={`rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{periodCopy.durationLabel}</div>
                                    <div className={`mt-1 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {tripDuration ? periodCopy.formatDuration(tripDuration.nights, tripDuration.days) : periodCopy.durationPlaceholder}
                                    </div>
                                </div>
                                <div className={`rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{activityCopy.summaryLabel}</div>
                                    {selectedActivityItems.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selectedActivityItems.map((activity) => (
                                                <span key={activity.id} className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white">
                                                    {activity.title}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={`mt-2 text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{activityCopy.emptyLabel}</div>
                                    )}
                                </div>
                                <div className={`rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{copy.summaryOptions}</div>
                                    <div className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${selectedOptions.length > 0 ? "mt-2 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-70"}`}>
                                        <div className="overflow-hidden">
                                            <div className="flex flex-wrap gap-2">
                                                {selectedOptions.map((option) => {
                                                    const match = optionChoices.find((item) => item.key === option);
                                                    return <span key={option} className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white">{match?.title ?? option}</span>;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedOptions.length === 0 && <div className={`mt-2 text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{copy.emptyOptions}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {mounted ? createPortal(
                <div
                    className="pointer-events-none fixed inset-x-0 z-40 px-3 pb-3 transition-[bottom] duration-200 sm:px-5 sm:pb-5"
                    style={{ bottom: footerOverlap }}
                >
                <div className={`pointer-events-auto mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border shadow-[0_-12px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-colors duration-300 ${isDark ? "border-white/10 bg-slate-900/95" : "border-slate-200 bg-white/95"}`}>
                    <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.35fr_0.55fr] lg:items-stretch">
                        <div className="flex h-full items-center rounded-[24px] bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 p-5 text-white lg:h-[104px]">
                            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                                <div className="flex w-full items-start justify-between gap-4 lg:w-auto lg:flex-none lg:justify-start">
                                    <div className="self-start text-left">
                                        <div className="text-sm font-bold text-blue-100">{copy.estimateLabel}</div>
                                        <div className="mt-2 text-3xl font-black tracking-tight">{formatPrice(animatedPrice)}</div>
                                    </div>
                                    <div className="ml-auto min-w-[140px] shrink-0 text-right text-sm leading-6 text-blue-100 lg:hidden">
                                        <div>{regionInfo.title}</div>
                                        <div className="text-base font-black text-white">{tripDuration ? periodCopy.formatDuration(tripDuration.nights, tripDuration.days) : periodCopy.durationPlaceholder}</div>
                                    </div>
                                </div>
                                <div className="ml-auto hidden items-center gap-3 lg:flex">
                                    {selectedOptions.length > 0 && (
                                        <div className="w-auto lg:w-[320px] lg:max-w-[320px] flex-none transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-100 translate-y-0">
                                        <div className="grid gap-2 rounded-[18px] bg-white/10 p-3 text-sm lg:rounded-none lg:bg-transparent lg:p-0">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-blue-100">{copy.basePriceLabel}</span>
                                                    <span className="font-black text-white">{formatPrice(minPrice * guests)}</span>
                                                </div>
                                                <div className="border-t border-white/20 pt-2 lg:border-white/25">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-blue-100">{copy.optionPriceLabel}</span>
                                                        <span className="font-black text-white">+ {formatPrice(animatedOptionTotal)}</span>
                                                    </div>
                                                </div>
                                        </div>
                                        </div>
                                    )}
                                    <div className="min-w-[180px] shrink-0 text-right text-sm leading-6 text-blue-100">
                                        <div>{regionInfo.title}</div>
                                        <div className="text-base font-black text-white">{tripDuration ? periodCopy.formatDuration(tripDuration.nights, tripDuration.days) : periodCopy.durationPlaceholder}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid h-full gap-3 lg:h-[104px]">
                            <button type="button" onClick={handleOpenPlanCheckout} className="flex min-h-0 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-500 sm:text-base">
                                {copy.continueLabel}
                            </button>
                            <Link href={withLocaleQuery("/tours", lang)} className={`flex min-h-0 items-center justify-center rounded-2xl px-4 py-3 text-center text-sm font-bold transition sm:text-base ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}>
                                {copy.backLabel}
                            </Link>
                        </div>
                    </div>
                </div>
                </div>,
                document.body
            ) : null}

            {planCheckoutOpen && typeof document !== "undefined" ? createPortal(
                <div className="animate-fade-in-overlay fixed bottom-0 left-0 right-0 top-0 z-[80] flex h-dvh w-screen items-end justify-center bg-slate-950/55 backdrop-blur-md sm:items-center">
                    <button
                        type="button"
                        aria-label={checkoutCopy.cancelLabel}
                        onClick={() => setPlanCheckoutOpen(false)}
                        className="absolute inset-0"
                    />
                    <div
                        ref={checkoutPanelRef}
                        className={`animate-slide-up-modal relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-[30px] border p-5 shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:m-4 sm:rounded-[30px] sm:p-7 ${isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{checkoutCopy.title}</h2>
                                <p className={`mt-2 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{checkoutCopy.desc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPlanCheckoutOpen(false)}
                                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl leading-none transition ${isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                            >
                                x
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {summaryRows.map(([label, value]) => (
                                <div key={label} className={`rounded-[20px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
                                    <div className={`mt-1 text-sm font-black leading-6 ${isDark ? "text-white" : "text-slate-900"}`}>{value}</div>
                                </div>
                            ))}
                        </div>

                        <div ref={travelerSectionRef} className={`mt-5 scroll-mt-10 rounded-[24px] border p-4 sm:p-5 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                            <h3 className="text-base font-black">{checkoutCopy.travelerTitle}</h3>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className="block">
                                    <span className={`mb-2 block text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{checkoutCopy.nameLabel}</span>
                                    <input
                                        value={customerName}
                                        onChange={(event) => setCustomerName(event.target.value)}
                                        className={`h-12 w-full rounded-2xl border px-4 text-[16px] font-semibold outline-none transition ${isDark ? "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-blue-400" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-300"}`}
                                    />
                                </label>
                                <label className="block">
                                    <span className={`mb-2 block text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{checkoutCopy.phoneLabel}</span>
                                    <input
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        className={`h-12 w-full rounded-2xl border px-4 text-[16px] font-semibold outline-none transition ${isDark ? "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-blue-400" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-300"}`}
                                    />
                                </label>
                                <label className="block sm:col-span-2">
                                    <span className={`mb-2 block text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{checkoutCopy.emailLabel}</span>
                                    <input
                                        value={email}
                                        type="email"
                                        onChange={(event) => setEmail(event.target.value)}
                                        className={`h-12 w-full rounded-2xl border px-4 text-[16px] font-semibold outline-none transition ${isDark ? "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-blue-400" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-300"}`}
                                    />
                                </label>
                            </div>
                        </div>

                        <label className="mt-5 block">
                            <span className={`mb-2 block text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{checkoutCopy.inquiryLabel}</span>
                            <textarea
                                value={inquiry}
                                onChange={(event) => setInquiry(event.target.value)}
                                placeholder={checkoutCopy.inquiryPlaceholder}
                                className={`min-h-[130px] w-full resize-none rounded-[22px] border px-4 py-3 text-[16px] font-medium leading-7 outline-none transition ${isDark ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-blue-400" : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-300"}`}
                            />
                        </label>

                        <div className={`mt-5 rounded-[24px] border p-4 ${isDark ? "border-blue-400/30 bg-blue-500/10" : "border-blue-100 bg-blue-50"}`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className={`text-sm font-bold ${isDark ? "text-blue-200" : "text-blue-700"}`}>{checkoutCopy.depositLabel}</div>
                                    <div className={`mt-1 text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}>{checkoutCopy.depositDesc}</div>
                                </div>
                                <div className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(customPlanDeposit)}</div>
                            </div>
                        </div>

                        {checkoutError || tossLoadFailed ? (
                            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-bold ${isDark ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-red-100 bg-red-50 text-red-600"}`}>
                                {checkoutError || tossLoadFailedMessage}
                            </div>
                        ) : null}

                        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
                            <button
                                type="button"
                                onClick={() => setPlanCheckoutOpen(false)}
                                className={`rounded-2xl px-5 py-4 text-sm font-bold transition ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
                            >
                                {checkoutCopy.cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={handleCustomPlanPayment}
                                disabled={checkoutSubmitting || !tossReady}
                                className="rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
                            >
                                {paymentButtonLabel}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            ) : null}

            {detailOption && (
                <OptionDetailModal
                    option={detailOption}
                    isDark={isDark}
                    closeLabel={copy.closeLabel}
                    optionUnitLabel={optionUnitLabel}
                    showImages={optionsLoaded}
                    onClose={() => setDetailOption(null)}
                />
            )}
        </>
    );
}
