"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { withLocaleQuery } from "@/lib/locale-routing";
import { useCmsTour } from "@/lib/use-cms-tours";
import { useCmsTourOptions } from "@/lib/use-cms-tour-options";
import { useCmsTourThemes } from "@/lib/use-cms-tour-themes";
import { type LocalizedTourOption } from "@/lib/cms-tour-options";
import { formatPrice } from "@/lib/bluewolf-utils";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { CheckIcon, XIcon } from "@/components/ui/SafeIcons";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";
import { type OptionKey } from "@/components/tours/tours-customize-data";

type Tab = "intro" | "itinerary" | "includes" | "terms";

const includesData = {
    ko: ["전용 차량 및 현지 기사", "전문 한국어 가이드", "게르 또는 호텔 숙박", "현지 식사 (포함 일정 기준)", "입장료 및 체험 활동비", "공항 픽업·샌딩"],
    ja: ["専用車両・現地ドライバー", "日本語専門ガイド", "ゲルまたはホテル宿泊", "現地食事（日程による）", "入場料・アクティビティ費", "空港送迎"],
    en: ["Private vehicle & local driver", "Professional English guide", "Ger or hotel accommodation", "Meals per itinerary", "Entry fees & activity costs", "Airport transfers"],
};

const excludesData = {
    ko: ["국제 항공권", "여행자 보험", "비자 비용", "개인 경비 및 기념품", "음주 비용", "선택 액티비티 추가 비용"],
    ja: ["国際航空券", "旅行保険", "ビザ費用", "個人経費・お土産", "飲酒費用", "オプションアクティビティ追加費用"],
    en: ["International flights", "Travel insurance", "Visa fees", "Personal expenses & souvenirs", "Alcoholic beverages", "Optional activity surcharges"],
};

const cancelPolicy = {
    ko: [
        ["출발 30일 전 이상", "전액 환불"],
        ["출발 20~29일 전", "BlueWolf Mongolia 별도 기준 안내"],
        ["출발 10~19일 전", "여행 요금의 50% 환불"],
        ["출발 7~9일 전", "여행 요금의 30% 환불"],
        ["출발 7일 미만", "환불 불가"],
    ],
    ja: [
        ["出発30日以上前", "全額返金"],
        ["出発20〜29日前", "BlueWolf Mongolia 別途基準案内"],
        ["出発10〜19日前", "旅行料金の50%返金"],
        ["出発7〜9日前", "旅行料金の30%返金"],
        ["出発7日未満", "返金不可"],
    ],
    en: [
        ["30+ days before departure", "Full refund"],
        ["20–29 days before", "See BlueWolf Mongolia policy"],
        ["10–19 days before", "50% refund"],
        ["7–9 days before", "30% refund"],
        ["Under 7 days", "No refund"],
    ],
};

const regionLabel: Record<string, Record<string, string>> = {
    south: { ko: "남부", ja: "南部", en: "South" },
    north: { ko: "북부", ja: "北部", en: "North" },
    central: { ko: "중부", ja: "中部", en: "Central" },
    west: { ko: "서부", ja: "西部", en: "West" },
};

const tabLabels: Record<Tab, Record<string, string>> = {
    intro: { ko: "플랜 소개", ja: "プラン紹介", en: "Plan overview" },
    itinerary: { ko: "플랜 일정", ja: "プラン日程", en: "Plan itinerary" },
    includes: { ko: "포함/불포함", ja: "含む/含まない", en: "Includes" },
    terms: { ko: "이용약관", ja: "利用規約", en: "Terms" },
};

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

function OptionInfoModal({
    option,
    isDark,
    closeLabel,
    optionUnitLabel,
    galleryLabel,
    showImages,
    onClose,
}: {
    option: LocalizedTourOption;
    isDark: boolean;
    closeLabel: string;
    optionUnitLabel: string;
    galleryLabel: string;
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

    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed bottom-0 left-0 right-0 top-0 z-[90] flex h-dvh w-screen items-end justify-center bg-slate-950/55 backdrop-blur-md sm:items-center">
            <button
                type="button"
                aria-label={closeLabel}
                onClick={onClose}
                className="absolute inset-0"
            />
            <div
                className={`relative z-10 w-full max-w-xl rounded-t-[28px] border p-6 shadow-2xl sm:m-4 sm:rounded-[28px] ${
                    isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="inline-flex rounded-full bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white">
                            +{formatPrice(option.price)} / {optionUnitLabel}
                        </span>
                        <h3 className="type-title-lg mt-3">{option.title}</h3>
                        <p className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{option.desc}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl leading-none transition ${
                            isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                        ×
                    </button>
                </div>

                {option.details.length > 0 && (
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
                )}

                {showImages && option.photos.length > 0 && (
                    <div className={`mt-5 border-t pt-5 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                        <div className={`mb-3 text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{galleryLabel}</div>
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
        </div>,
        document.body
    );
}

function OptionSelectionCard({
    option,
    active,
    isDark,
    optionUnitLabel,
    infoLabel,
    onToggle,
    onOpenInfo,
}: {
    option: LocalizedTourOption;
    active: boolean;
    isDark: boolean;
    optionUnitLabel: string;
    infoLabel: string;
    onToggle: () => void;
    onOpenInfo: () => void;
}) {
    return (
        <div
            className={`overflow-hidden rounded-[16px] border transition-[background-color,border-color,box-shadow] duration-200 ${
                active
                    ? "border-blue-500 bg-blue-50 shadow-[0_8px_20px_rgba(37,99,235,0.12)]"
                    : isDark
                      ? "border-white/10 bg-slate-900 text-slate-100"
                      : "border-slate-200 bg-white text-slate-900"
            }`}
        >
            <button
                type="button"
                onClick={onToggle}
                className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-[background-color] duration-200 ${
                    active ? "hover:bg-blue-100/70" : isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                }`}
            >
                <span className={`min-w-0 text-sm font-bold ${active ? "text-slate-900" : isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {option.title}
                </span>
                <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                    +{formatPrice(option.price)} / {optionUnitLabel}
                </span>
            </button>
            <div className="bg-transparent">
                <div className="px-3">
                    <div className={`h-px ${active ? "bg-blue-200/80" : isDark ? "bg-white/10" : "bg-slate-200"}`} />
                </div>
                <button
                    type="button"
                    onClick={onOpenInfo}
                    className={`w-full px-3 py-2 text-xs font-bold transition ${
                        active
                            ? "text-blue-700 hover:bg-blue-100/70"
                            : isDark
                              ? "text-slate-300 hover:bg-slate-900"
                              : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    {infoLabel}
                </button>
            </div>
        </div>
    );
}

function TourDetailContent() {
    const { lang, isDark, t } = usePage();
    const params = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("intro");
    const [guests, setGuests] = useState(2);
    const [selectedOptions, setSelectedOptions] = useState<OptionKey[]>([]);
    const [detailOption, setDetailOption] = useState<LocalizedTourOption | null>(null);
    const [showAllOptions, setShowAllOptions] = useState(false);
    const [showMobileBookingSheet, setShowMobileBookingSheet] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [footerOverlap, setFooterOverlap] = useState(0);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => setMounted(true));

        return () => window.cancelAnimationFrame(frame);
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

    const tourId = Number(params.id);
    const { tour, loaded } = useCmsTour(tourId);


    const { localizedOptions: optionChoices, loaded: optionsLoaded } = useCmsTourOptions(lang);
    const { resolveThemeLabel } = useCmsTourThemes(lang);
    const selectedOptionItems = selectedOptions
        .map((key) => optionChoices.find((option) => option.key === key))
        .filter((option): option is LocalizedTourOption => Boolean(option));
    const optionTotalPerPerson = selectedOptionItems.reduce((sum, option) => sum + option.price, 0);
    const optionTotal = optionTotalPerPerson * guests;
    const totalPrice = (tour?.price ?? 0) * guests + optionTotal;
    const perPersonTotalPrice = (tour?.price ?? 0) + optionTotalPerPerson;
    const animatedTotalPrice = useAnimatedNumber(totalPrice);
    const animatedPerPersonTotalPrice = useAnimatedNumber(perPersonTotalPrice);

    if (!loaded) {
        return null;
    }

    if (!tour) {
        router.replace(withLocaleQuery("/tours", lang));
        return null;
    }

    const region = regionLabel[tour.region][lang];
    const themeLabel = resolveThemeLabel(tour.theme);

    const panelBase = `rounded-[24px] border sm:rounded-[28px] ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;

    const tabs: Tab[] = ["intro", "itinerary", "includes", "terms"];

    const isNoRefund = (s: string) =>
        s.includes("불가") || s.includes("No refund") || s.includes("不可");

    const optionSectionLabel =
        lang === "ko" ? "추가 옵션" : lang === "ja" ? "追加オプション" : "Optional upgrades";
    const moreOptionsLabel =
        lang === "ko" ? "더보기" : lang === "ja" ? "もっと見る" : "Show more";
    const lessOptionsLabel =
        lang === "ko" ? "접기" : lang === "ja" ? "閉じる" : "Show less";
    const estimatedTotalLabel =
        lang === "ko" ? "예상 총액" : lang === "ja" ? "予想総額" : "Estimated total";
    const perPersonPriceLabel =
        lang === "ko" ? "1인 기준 가격" : lang === "ja" ? "1名あたり料金" : "Per-person price";
    const perPersonDepositLabel =
        lang === "ko" ? "1인 기준 플랜료" : lang === "ja" ? "1名基準プランパッケージ利用料" : "Per-person plan package fee";
    const grandTotalLabel =
        lang === "ko" ? "1인당 총 합계" : lang === "ja" ? "1名あたり合計" : "Per-person total";
    const optionUnitLabel =
        lang === "ko" ? "1인당" : lang === "ja" ? "1名あたり" : "per person";
    const mobileBookingOpenLabel =
        lang === "ko" ? "자세히 보기" : lang === "ja" ? "詳しく見る" : "View details";
    const mobileBookingCloseLabel =
        lang === "ko" ? "접기" : lang === "ja" ? "閉じる" : "Collapse";
    const optionInfoLabel =
        lang === "ko" ? "옵션 정보" : lang === "ja" ? "オプション情報" : "Option info";
    const optionGalleryLabel =
        lang === "ko" ? "사진" : lang === "ja" ? "写真" : "Gallery";
    const optionInfoCloseLabel =
        lang === "ko" ? "닫기" : lang === "ja" ? "閉じる" : "Close";
    const perPersonBasePrice = Math.max((tour?.price ?? 0) + optionTotalPerPerson - (tour?.deposit ?? 0), 0);

    const toggleOption = (key: OptionKey) => {
        setSelectedOptions((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
    };
    const baseOptionChoices = optionChoices.slice(0, 2);
    const extraOptionChoices = optionChoices.slice(2);

    return (
        <>
            <button
                type="button"
                aria-label="Close booking sheet"
                onClick={() => setShowMobileBookingSheet(false)}
                className={`fixed inset-0 z-30 transition-opacity duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] sm:hidden ${
                    showMobileBookingSheet ? "pointer-events-auto bg-slate-950/30 opacity-100" : "pointer-events-none bg-slate-950/0 opacity-0"
                }`}
            />
            {/* ── 히어로 ── */}
            {detailOption ? (
                <OptionInfoModal
                    option={detailOption}
                    isDark={isDark}
                    closeLabel={optionInfoCloseLabel}
                    optionUnitLabel={optionUnitLabel}
                    galleryLabel={optionGalleryLabel}
                    showImages={optionsLoaded}
                    onClose={() => setDetailOption(null)}
                />
            ) : null}
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px]" style={{ height: "clamp(280px, 44vw, 480px)" }}>
                {loaded ? (
                    <Image
                        src={tour.heroImage}
                        alt={tour.title[lang]}
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                ) : (
                    <div className={`absolute inset-0 ${isDark ? "bg-slate-950" : "bg-slate-100"}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-10">
                    {/* 브레드크럼 */}
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-white/60 sm:text-sm">
                        <Link href="/tours" className="transition-colors duration-150 hover:text-white">
                            {lang === "ko" ? "투어상품" : lang === "ja" ? "ツアー" : "Tours"}
                        </Link>
                        <span>/</span>
                        <span>{region}</span>
                        <span>/</span>
                        <span className="text-white/90">{tour.title[lang]}</span>
                    </div>

                    {/* 배지 */}
                    <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
                            {themeLabel}
                        </span>
                        <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
                            {region}
                        </span>
                        <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
                            {tour.duration[lang]}
                        </span>
                    </div>

                    <h1 className="type-display text-white">
                        {tour.title[lang]}
                    </h1>
                </div>
            </div>

            {/* ── 2컬럼 레이아웃 ── */}
            <div className="flex flex-col gap-5 pb-28 sm:pb-0 lg:flex-row lg:items-start lg:gap-6">

                {/* ── 왼쪽 메인 콘텐츠 ── */}
                <div className="min-w-0 flex-1">

                    {/* 탭 바 */}
                    <div className={`rounded-[20px] border p-1.5 ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}`}>
                        <div className="flex gap-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 rounded-[14px] px-2 py-2.5 text-xs font-bold transition-[background-color,color,box-shadow] duration-200 sm:text-sm ${
                                        activeTab === tab
                                            ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.22)]"
                                            : isDark
                                              ? "text-slate-400 hover:bg-white/5 hover:text-white"
                                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                >
                                    {tabLabels[tab][lang]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 탭 콘텐츠 */}
                    <div className={`mt-4 ${panelBase} p-5 sm:p-6 lg:p-8`}>

                        {/* ── 상품 소개 ── */}
                        {activeTab === "intro" && (
                            <div className="flex flex-col gap-8">
                                <div>
                                    <h2 className={`type-title-md ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {tabLabels.intro[lang]}
                                    </h2>
                                    <p className={`mt-3 text-base leading-8 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                        {tour.desc[lang]}
                                    </p>
                                </div>

                                {/* 핵심 포인트 */}
                                <div>
                                    <h3 className={`mb-3 text-base font-black sm:mb-4 sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {lang === "ko" ? "핵심 포인트" : lang === "ja" ? "ハイライト" : "Highlights"}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        {tour.highlights[lang].map((hl, i) => (
                                            <div
                                                key={i}
                                                className={`flex min-h-12 items-center gap-2 rounded-[14px] border px-3 py-2.5 sm:min-h-0 sm:gap-3 sm:rounded-[18px] sm:p-4 ${
                                                    isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                                                }`}
                                            >
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white sm:h-8 sm:w-8 sm:text-xs">
                                                    {i + 1}
                                                </span>
                                                <span className={`text-xs font-bold leading-5 sm:text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                                                    {hl}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 갤러리 이미지 */}
                                <div>
                                    <h3 className={`mb-4 text-base font-black sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {lang === "ko" ? "여행지 사진" : lang === "ja" ? "旅行写真" : "Gallery"}
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        {tour.images.map((src, i) => (
                                            <div
                                                key={i}
                                                className={`group rounded-[18px] border p-1 transition-[background-color,border-color,box-shadow] duration-200 ${
                                                    isDark
                                                        ? "border-white/10 bg-slate-900 hover:bg-white/5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.28)]"
                                                        : "border-slate-200 bg-white hover:bg-slate-100 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
                                                }`}
                                            >
                                                <div className="relative overflow-hidden rounded-[14px]" style={{ aspectRatio: "4/3" }}>
                                                    {loaded ? (
                                                        <Image
                                                            src={src}
                                                            alt={`${tour.title[lang]} ${i + 1}`}
                                                            fill
                                                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                                                            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 22vw, 15vw"
                                                        />
                                                    ) : (
                                                        <div className={`absolute inset-0 ${isDark ? "bg-slate-950" : "bg-slate-100"}`} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 상품 상세 이미지 */}
                                {tour.detailImages.length > 0 && (
                                    <div>
                                        <h3 className={`mb-4 text-base font-black sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                                            {lang === "ko" ? "상품 상세" : lang === "ja" ? "商品詳細" : "Tour Details"}
                                        </h3>
                                        <div className="flex flex-col gap-3">
                                            {tour.detailImages.map((src, i) => (
                                                <div
                                                    key={i}
                                                    className={`overflow-hidden rounded-[20px] border p-1 ${
                                                        isDark
                                                            ? "border-white/10 bg-slate-900"
                                                            : "border-slate-200 bg-white"
                                                    }`}
                                                >
                                                    <Image
                                                        src={src}
                                                        alt={`${tour.title[lang]} 상세 ${i + 1}`}
                                                        width={800}
                                                        height={0}
                                                        style={{ width: "100%", height: "auto" }}
                                                        className="block rounded-[16px]"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 65vw, 50vw"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 태그 */}
                                <div>
                                    <h3 className={`mb-3 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {lang === "ko" ? "여행 태그" : lang === "ja" ? "旅行タグ" : "Tags"}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tour.tags[lang].map((tag) => (
                                            <span
                                                key={tag}
                                                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                                                    isDark
                                                        ? "border-white/10 bg-slate-800 text-slate-200"
                                                        : "border-slate-200 bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── 여행 일정 ── */}
                        {activeTab === "itinerary" && (
                            <div>
                                <h2 className={`type-title-md mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {tabLabels.itinerary[lang]}
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {tour.highlights[lang].map((hl, i) => {
                                        const isLast = i === tour.highlights[lang].length - 1;
                                        const dayImg = tour.images[i % tour.images.length];
                                        return (
                                            <div key={i} className="flex gap-3 sm:gap-4">
                                                {/* 타임라인 */}
                                                <div className="flex flex-col items-center pt-1">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)]">
                                                        {i + 1}
                                                    </div>
                                                    {!isLast && (
                                                        <div className={`mt-2 w-0.5 flex-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} style={{ minHeight: "40px" }} />
                                                    )}
                                                </div>

                                                {/* 카드 */}
                                                <div
                                                    className={`group flex-1 overflow-hidden rounded-[20px] border transition-[background-color,border-color,box-shadow] duration-200 ${isLast ? "mb-0" : "mb-1"} ${
                                                        isDark
                                                            ? "border-white/10 bg-slate-950 hover:bg-white/5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.24)]"
                                                            : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                                                    }`}
                                                >
                                                    {/* 이미지 */}
                                                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/7" }}>
                                                        <Image
                                                            src={dayImg}
                                                            alt={hl}
                                                            fill
                                                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 65vw, 50vw"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                                        <span className="absolute left-3 top-3 rounded-full bg-blue-600/90 px-2.5 py-1 text-xs font-black text-white backdrop-blur-sm">
                                                            {lang === "ko" ? `${i + 1}일차` : lang === "ja" ? `${i + 1}日目` : `Day ${i + 1}`}
                                                        </span>
                                                    </div>

                                                    {/* 텍스트 */}
                                                    <div className="p-4 sm:p-5">
                                                        <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                                            {hl}
                                                        </h3>
                                                        <p className={`mt-1.5 text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                            {tour.desc[lang]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── 포함/불포함 ── */}
                        {activeTab === "includes" && (
                            <div className="flex flex-col gap-6">
                                <h2 className={`type-title-md ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {tabLabels.includes[lang]}
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* 포함 */}
                                    <div className={`rounded-[20px] border p-5 ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
                                        <div className="mb-4 flex items-center gap-2.5">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                                                <CheckIcon className="h-4 w-4" />
                                            </span>
                                            <h3 className={`font-black ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                                                {lang === "ko" ? "포함 사항" : lang === "ja" ? "含む" : "Included"}
                                            </h3>
                                        </div>
                                        <ul className="flex flex-col gap-2.5">
                                            {includesData[lang].map((item) => (
                                                <li key={item} className={`flex items-start gap-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                                    <span className="mt-1 shrink-0 text-emerald-500">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* 불포함 */}
                                    <div className={`rounded-[20px] border p-5 ${isDark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"}`}>
                                        <div className="mb-4 flex items-center gap-2.5">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white">
                                                <XIcon className="h-4 w-4" />
                                            </span>
                                            <h3 className={`font-black ${isDark ? "text-red-400" : "text-red-700"}`}>
                                                {lang === "ko" ? "불포함 사항" : lang === "ja" ? "含まない" : "Excluded"}
                                            </h3>
                                        </div>
                                        <ul className="flex flex-col gap-2.5">
                                            {excludesData[lang].map((item) => (
                                                <li key={item} className={`flex items-start gap-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                                    <span className="mt-1 shrink-0 text-red-400">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── 이용약관 ── */}
                        {activeTab === "terms" && (
                            <div>
                                <h2 className={`type-title-md mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {lang === "ko" ? "취소 및 환불 정책" : lang === "ja" ? "キャンセル・返金ポリシー" : "Cancellation Policy"}
                                </h2>

                                <div className={`overflow-hidden rounded-[20px] border ${isDark ? "border-white/10" : "border-slate-200"}`}>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className={isDark ? "bg-slate-800" : "bg-slate-100"}>
                                                <th className={`px-5 py-3.5 text-left text-xs font-black tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                                    {lang === "ko" ? "취소 시점" : lang === "ja" ? "取消時期" : "Cancellation Timing"}
                                                </th>
                                                <th className={`px-5 py-3.5 text-left text-xs font-black tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                                    {lang === "ko" ? "환불 기준" : lang === "ja" ? "返金基準" : "Refund Policy"}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cancelPolicy[lang].map(([when, refund], i) => (
                                                <tr key={i} className={`border-t ${isDark ? "border-white/5 even:bg-slate-900/40" : "border-slate-100 even:bg-slate-50"}`}>
                                                    <td className={`px-5 py-4 font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                                        {when}
                                                    </td>
                                                    <td className={`px-5 py-4 font-black ${isNoRefund(refund) ? "text-red-500" : "text-emerald-500"}`}>
                                                        {refund}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <p className={`mt-4 text-xs leading-6 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    {lang === "ko"
                                        ? "※ 위 기준은 표준 약관 기준이며, 시즌 및 플랜별로 달라질 수 있습니다. 정확한 내용은 BlueWolf Mongolia 확인 완료 단계에서 별도 안내드립니다."
                                        : lang === "ja"
                                          ? "※ 上記の取消規定は標準約款に基づきます。シーズン・商品によって異なる場合があります。"
                                          : "※ Cancellation policy is based on standard terms and may vary by season or product. Full details provided upon booking confirmation."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 오른쪽 사이드바 ── */}
                <aside className="sticky top-4 h-fit shrink-0 self-start sm:top-5 lg:top-24 lg:w-[300px] xl:w-[340px]">
                    <div className="flex flex-col gap-4 self-start">

                        {/* 가격 + 예약 카드 */}
                        <div className={`hidden rounded-[24px] border p-6 shadow-sm sm:block ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}`}>

                            {/* 가격 */}
                            <button
                                type="button"
                                onClick={() => setShowMobileBookingSheet((prev) => !prev)}
                                className="flex w-full items-end justify-between gap-3 text-left sm:hidden"
                            >
                                <div>
                                    <div className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        {estimatedTotalLabel}
                                    </div>
                                    <div className={`mt-0.5 text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {formatPrice(animatedTotalPrice)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                                        isDark ? "border-white/10 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-600"
                                    }`}>
                                        {tour.duration[lang]}
                                    </span>
                                    <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                        {showMobileBookingSheet ? mobileBookingCloseLabel : mobileBookingOpenLabel}
                                    </span>
                                </div>
                            </button>

                            <div className="hidden items-end justify-between gap-2 sm:flex">
                                <div>
                                    <div className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        {estimatedTotalLabel}
                                    </div>
                                    <div className={`mt-0.5 text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {formatPrice(animatedTotalPrice)}
                                    </div>
                                </div>
                                <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                                    isDark ? "border-white/10 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-600"
                                }`}>
                                    {tour.duration[lang]}
                                </span>
                            </div>

                            {/* 인원 선택 */}
                            <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:grid-rows-[1fr] sm:opacity-100 ${showMobileBookingSheet ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0 sm:mt-4"}`}>
                                <div className="overflow-hidden">
                            <div className={`mt-4 rounded-[18px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
                                <div className={`mb-3 text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {t.guestsLabel}
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg font-black transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.92] ${
                                            isDark ? "border-white/10 bg-slate-800 text-white hover:bg-slate-700" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        −
                                    </button>
                                    <span className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {guests}{lang === "ko" ? "명" : lang === "ja" ? "名" : " pax"}
                                    </span>
                                    <button
                                        onClick={() => setGuests(Math.min(20, guests + 1))}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg font-black transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.92] ${
                                            isDark ? "border-white/10 bg-slate-800 text-white hover:bg-slate-700" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* 금액 요약 */}
                            <div className={`mt-3 rounded-[18px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
                                <div className={`mb-3 text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {optionSectionLabel}
                                </div>
                                <div className="grid gap-2">
                                    {baseOptionChoices.map((option) => {
                                        const active = selectedOptions.includes(option.key);
                                        return (
                                            <OptionSelectionCard
                                                key={option.key}
                                                option={option}
                                                active={active}
                                                isDark={isDark}
                                                optionUnitLabel={optionUnitLabel}
                                                infoLabel={optionInfoLabel}
                                                onToggle={() => toggleOption(option.key)}
                                                onOpenInfo={() => setDetailOption(option)}
                                            />
                                        );
                                    })}
                                </div>
                                {extraOptionChoices.length > 0 && (
                                    <div className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showAllOptions ? "mt-2 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}>
                                        <div className="overflow-hidden">
                                            <div className="grid gap-2">
                                                {extraOptionChoices.map((option) => {
                                                    const active = selectedOptions.includes(option.key);
                                                    return (
                                                        <OptionSelectionCard
                                                            key={option.key}
                                                            option={option}
                                                            active={active}
                                                            isDark={isDark}
                                                            optionUnitLabel={optionUnitLabel}
                                                            infoLabel={optionInfoLabel}
                                                            onToggle={() => toggleOption(option.key)}
                                                            onOpenInfo={() => setDetailOption(option)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {extraOptionChoices.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllOptions((prev) => !prev)}
                                        className={`mt-2 w-full rounded-[14px] px-3 py-2 text-sm font-bold transition ${
                                            isDark ? "bg-slate-900 text-slate-200 hover:bg-slate-800" : "bg-white text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        {showAllOptions ? lessOptionsLabel : moreOptionsLabel}
                                    </button>
                                )}
                            </div>

                            <div className={`mt-3 rounded-[18px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{perPersonPriceLabel}</span>
                                    <span className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(perPersonBasePrice)}</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between pt-1">
                                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{perPersonDepositLabel}</span>
                                    <span className="text-xs font-black text-blue-500">{formatPrice(tour.deposit)}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t pt-4 ${isDark ? 'border-white/5' : 'border-slate-200'}">
                                    <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{grandTotalLabel}</span>
                                    <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(animatedPerPersonTotalPrice)}</span>
                                </div>
                            </div>

                            {/* CTA 버튼 */}
                            <div className="mt-4 flex flex-col gap-2.5">
                                <Link
                                    href={withLocaleQuery(`/payment?tour=${tour.id}&guests=${guests}${selectedOptions.length > 0 ? `&options=${selectedOptions.join(",")}` : ""}`, lang)}
                                    className="flex items-center justify-center rounded-[18px] bg-blue-600 px-5 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-[transform,background-color,box-shadow] duration-700 ease-in-out hover:bg-blue-500 hover:shadow-[0_14px_30px_rgba(37,99,235,0.36)] active:scale-[0.97] active:translate-y-0"
                                >
                                    {lang === "ko" ? "플랜 신청하기" : lang === "ja" ? "プラン申請する" : "Apply for this plan"}
                                </Link>
                                <Link
                                    href={withLocaleQuery("/faq#contact-support", lang)}
                                    className={`flex items-center justify-center rounded-[18px] border px-5 py-3.5 text-sm font-bold transition-[transform,background-color] duration-700 ease-in-out active:scale-[0.97] active:translate-y-0 ${
                                        isDark
                                            ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {lang === "ko" ? "상담 문의" : lang === "ja" ? "お問い合わせ" : "Inquire"}
                                </Link>
                            </div>
                                </div>
                            </div>
                        </div>

                        {/* 상품 정보 */}
                        <div className={`hidden rounded-[24px] border p-5 sm:block ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}`}>
                            <h3 className={`mb-4 text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                {lang === "ko" ? "상품 정보" : lang === "ja" ? "商品情報" : "Tour Info"}
                            </h3>
                            <div className="flex flex-col gap-3">
                                {[
                                    {
                                        label: lang === "ko" ? "지역" : lang === "ja" ? "地域" : "Region",
                                        value: region,
                                    },
                                    {
                                        label: lang === "ko" ? "테마" : lang === "ja" ? "テーマ" : "Theme",
                                        value: themeLabel,
                                    },
                                    {
                                        label: lang === "ko" ? "기간" : lang === "ja" ? "期間" : "Duration",
                                        value: tour.duration[lang],
                                    },
                                    {
                                        label: lang === "ko" ? "플랜료" : lang === "ja" ? "プランパッケージ利用料" : "Plan package fee",
                                        value: formatPrice(tour.deposit),
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label} className={`flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 ${isDark ? "border-white/5" : "border-slate-100"}`}>
                                        <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
                                        <span className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 다른 투어 보기 */}
                        <Link
                            href="/tours"
                            className={`hidden items-center justify-center gap-2 rounded-[20px] border px-5 py-4 text-sm font-bold transition-[background-color,transform] duration-700 ease-in-out active:scale-[0.97] sm:flex ${
                                isDark ? "border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            ← {lang === "ko" ? "다른 투어 보기" : lang === "ja" ? "他のツアーを見る" : "Browse other tours"}
                        </Link>
                    </div>
                </aside>
            </div>

            {mounted ? createPortal(
            <div className="sm:hidden">
                <div
                    className={`fixed inset-x-0 z-[60] mx-3 rounded-[24px] border px-4 pb-6 pt-4 shadow-[0_-14px_40px_rgba(15,23,42,0.16)] transition-[bottom,transform,box-shadow] duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] ${showMobileBookingSheet ? "translate-y-0 shadow-[0_-18px_48px_rgba(15,23,42,0.22)]" : "translate-y-0"} ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"}`}
                    style={{ bottom: `${footerOverlap + 30}px` }}
                >
                    <button
                        type="button"
                        onClick={() => setShowMobileBookingSheet((prev) => !prev)}
                        className="relative flex w-full items-end justify-between gap-3 pt-4 text-left"
                    >
                        <span className={`pointer-events-none absolute left-1/2 top-0 inline-flex h-5 w-8 -translate-x-1/2 items-center justify-center opacity-50 transition-[transform,color] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                            isDark ? "text-slate-300" : "text-slate-500"
                        } ${showMobileBookingSheet ? "rotate-0 scale-x-100 scale-y-100" : "rotate-180 scale-x-[1.16] scale-y-[0.88]"}`}>
                            <svg
                                viewBox="0 0 28 18"
                                aria-hidden="true"
                                className="h-4 w-7 overflow-visible"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M3 5.5L14 14.5L25 5.5"
                                    stroke="currentColor"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-[d,stroke-width] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                                />
                            </svg>
                        </span>
                        <div>
                            <div className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                {estimatedTotalLabel}
                            </div>
                            <div className={`mt-0.5 text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                {formatPrice(animatedTotalPrice)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                                isDark ? "border-white/10 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-600"
                            }`}>
                                {tour.duration[lang]}
                            </span>
                        </div>
                    </button>

                    <div className={`grid transition-[grid-template-rows,opacity,margin] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${showMobileBookingSheet ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                            <div className={`mt-4 rounded-[18px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
                                <div className={`mb-3 text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {t.guestsLabel}
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg font-black transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.92] ${
                                            isDark ? "border-white/10 bg-slate-800 text-white hover:bg-slate-700" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        -
                                    </button>
                                    <span className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {guests}{lang === "ko" ? "명" : lang === "ja" ? "名" : " pax"}
                                    </span>
                                    <button
                                        onClick={() => setGuests(Math.min(20, guests + 1))}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg font-black transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.92] ${
                                            isDark ? "border-white/10 bg-slate-800 text-white hover:bg-slate-700" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className={`mt-3 rounded-[18px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
                                <div className={`mb-3 text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {optionSectionLabel}
                                </div>
                                <div className="grid gap-2">
                                    {baseOptionChoices.map((option) => {
                                        const active = selectedOptions.includes(option.key);
                                        return (
                                            <OptionSelectionCard
                                                key={option.key}
                                                option={option}
                                                active={active}
                                                isDark={isDark}
                                                optionUnitLabel={optionUnitLabel}
                                                infoLabel={optionInfoLabel}
                                                onToggle={() => toggleOption(option.key)}
                                                onOpenInfo={() => setDetailOption(option)}
                                            />
                                        );
                                    })}
                                </div>
                                {extraOptionChoices.length > 0 && (
                                    <div className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${showAllOptions ? "mt-2 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}>
                                        <div className="overflow-hidden">
                                            <div className="grid gap-2">
                                                {extraOptionChoices.map((option) => {
                                                    const active = selectedOptions.includes(option.key);
                                                    return (
                                                        <OptionSelectionCard
                                                            key={option.key}
                                                            option={option}
                                                            active={active}
                                                            isDark={isDark}
                                                            optionUnitLabel={optionUnitLabel}
                                                            infoLabel={optionInfoLabel}
                                                            onToggle={() => toggleOption(option.key)}
                                                            onOpenInfo={() => setDetailOption(option)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {extraOptionChoices.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllOptions((prev) => !prev)}
                                        className={`mt-2 w-full rounded-[14px] px-3 py-2 text-sm font-bold transition ${
                                            isDark ? "bg-slate-900 text-slate-200 hover:bg-slate-800" : "bg-white text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        {showAllOptions ? lessOptionsLabel : moreOptionsLabel}
                                    </button>
                                )}
                            </div>

                            <div className={`mt-3 rounded-[18px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{perPersonPriceLabel}</span>
                                    <span className={`text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(perPersonBasePrice)}</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between pt-1">
                                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{perPersonDepositLabel}</span>
                                    <span className="text-xs font-black text-blue-500">{formatPrice(tour.deposit)}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t pt-4 ${isDark ? 'border-white/5' : 'border-slate-200'}">
                                    <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{grandTotalLabel}</span>
                                    <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{formatPrice(animatedPerPersonTotalPrice)}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2.5">
                                <Link
                                    href={withLocaleQuery(`/payment?tour=${tour.id}&guests=${guests}${selectedOptions.length > 0 ? `&options=${selectedOptions.join(",")}` : ""}`, lang)}
                                    className="flex items-center justify-center rounded-[18px] bg-blue-600 px-5 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-[transform,background-color,box-shadow] duration-700 ease-in-out hover:bg-blue-500 hover:shadow-[0_14px_30px_rgba(37,99,235,0.36)] active:scale-[0.97] active:translate-y-0"
                                >
                                    {t.reserve}
                                </Link>
                                <Link
                                    href={withLocaleQuery("/faq#contact-support", lang)}
                                    className={`flex items-center justify-center rounded-[18px] border px-5 py-3.5 text-sm font-bold transition-[transform,background-color] duration-700 ease-in-out active:scale-[0.97] active:translate-y-0 ${
                                        isDark
                                            ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {lang === "ko" ? "상담 문의" : lang === "ja" ? "お問い合わせ" : "Inquire"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
            ) : null}
        </>
    );
}

export default function TourDetailPage() {
    return (
        <PageShell activeKey="tours">
            <TourDetailContent />
        </PageShell>
    );
}
