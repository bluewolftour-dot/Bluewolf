"use client";

import { useState } from "react";
import Image from "next/image";
import { Dropdown } from "@/components/ui/Dropdown";
import { SearchIcon } from "@/components/ui/SafeIcons";
import { copy, type Locale, type Tour } from "@/lib/bluewolf-data";
import { getPrimaryTourBadgeTags, getSecondaryTourTags } from "@/lib/tour-tags";
import { formatPrice } from "@/lib/bluewolf-utils";

type CopyValue = (typeof copy)[Locale];
type TourViewMode = "default" | "twoColumn" | "list";

const inputClass =
    "h-12 w-full rounded-2xl border px-4 text-[15px] font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

function DefaultViewIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="3" width="14" height="14" rx="3" />
            <path d="M6 7h8M6 10h8M6 13h5" strokeLinecap="round" />
        </svg>
    );
}

function TwoColumnViewIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="3" width="6" height="6" rx="1.5" />
            <rect x="11" y="3" width="6" height="6" rx="1.5" />
            <rect x="3" y="11" width="6" height="6" rx="1.5" />
            <rect x="11" y="11" width="6" height="6" rx="1.5" />
        </svg>
    );
}

function ListViewIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="4" width="4" height="4" rx="1" />
            <rect x="3" y="12" width="4" height="4" rx="1" />
            <path d="M10 5h7M10 8h5M10 13h7M10 16h5" strokeLinecap="round" />
        </svg>
    );
}


export function ToursSection({
    t,
    lang,
    keyword,
    setKeyword,
    duration,
    setDuration,
    region,
    setRegion,
    theme,
    setTheme,
    sort,
    setSort,
    filteredTours,
    resetFilters,
    setSelectedTourId,
    isDark,
    showImages,
    themeOptions,
    resolveThemeLabel,
}: {
    t: CopyValue;
    lang: Locale;
    keyword: string;
    setKeyword: (value: string) => void;
    duration: string;
    setDuration: (value: string) => void;
    region: string;
    setRegion: (value: string) => void;
    theme: string;
    setTheme: (value: string) => void;
    sort: string;
    setSort: (value: string) => void;
    filteredTours: Tour[];
    resetFilters: () => void;
    setSelectedTourId: (id: number) => void;
    isDark: boolean;
    showImages: boolean;
    themeOptions: Array<{ value: string; label: string }>;
    resolveThemeLabel: (themeKey: string) => string;
}) {
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<TourViewMode>("default");

    const panelBase = `rounded-[24px] border shadow-sm transition-colors duration-300 sm:rounded-[28px] ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;

    const labelClass = `mb-2 block text-sm font-extrabold ${isDark ? "text-slate-200" : "text-slate-700"}`;

    const hasActiveFilters =
        keyword !== "" || duration !== "all" || region !== "all" || theme !== "all";

    const viewModeOptions: Array<{ value: TourViewMode; label: string; Icon: typeof DefaultViewIcon }> = [
        { value: "default", label: lang === "en" ? "Default" : lang === "ja" ? "基本" : "기본형", Icon: DefaultViewIcon },
        { value: "twoColumn", label: lang === "en" ? "2 columns" : lang === "ja" ? "2列" : "2열 정렬형", Icon: TwoColumnViewIcon },
        { value: "list", label: lang === "en" ? "List" : lang === "ja" ? "リスト" : "목록형", Icon: ListViewIcon },
    ];

    const regionLabelByKey: Record<Tour["region"], string> = {
        south: t.south,
        central: t.central,
        north: t.north,
        west: t.west,
    };

    const priceFromLabel = lang === "en" ? "from" : lang === "ja" ? "から" : "부터";

    const filterPanel = (
        <div className="flex flex-col gap-5">
            {/* 검색 */}
            <div>
                <label className={labelClass}>{t.searchPlaceholder.replace(/\s*또는.*/, "").replace(/\s*or.*/, "").replace(/\s*または.*/, "") || "검색"}</label>
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={`${inputClass} ${
                        isDark
                            ? "border-white/10 bg-slate-950 text-slate-100 focus:bg-slate-900"
                            : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                    }`}
                />
            </div>

            {/* 일정 */}
            <div>
                <label className={labelClass}>{t.allDuration}</label>
                <Dropdown
                    value={duration}
                    onChange={setDuration}
                    options={[
                        { value: "all", label: t.allDuration },
                        { value: "short", label: t.shortDuration },
                        { value: "long", label: t.longDuration },
                    ]}
                    isDark={isDark}
                />
            </div>

            {/* 지역 */}
            <div>
                <label className={labelClass}>{t.allRegion}</label>
                <Dropdown
                    value={region}
                    onChange={setRegion}
                    options={[
                        { value: "all", label: t.allRegion },
                        { value: "south", label: t.south },
                        { value: "central", label: t.central },
                        { value: "north", label: t.north },
                        { value: "west", label: t.west },
                    ]}
                    isDark={isDark}
                />
            </div>

            {/* 테마 */}
            <div>
                <label className={labelClass}>{t.allTheme}</label>
                <Dropdown
                    value={theme}
                    onChange={setTheme}
                    options={[
                        { value: "all", label: t.allTheme },
                        ...themeOptions,
                    ]}
                    isDark={isDark}
                />
            </div>

            {/* 초기화 */}
            {hasActiveFilters && (
                <button
                    onClick={resetFilters}
                    className={`w-full rounded-2xl py-3 text-sm font-bold transition ${
                        isDark
                            ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                >
                    {t.reset}
                </button>
            )}
        </div>
    );

    return (
        <section id="tours" className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
            {/* ── 왼쪽 필터 사이드바 ── */}
            {/* 모바일: 토글 버튼 + 접힘 패널 */}
            <div className="lg:hidden">
                <button
                    onClick={() => setMobileFilterOpen((v) => !v)}
                    className={`flex w-full items-center justify-between rounded-[22px] border px-5 py-4 font-bold transition-colors duration-200 ${
                        isDark
                            ? "border-white/10 bg-slate-900 text-slate-100"
                            : "border-slate-200 bg-white text-slate-900"
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 12h10M11 18h2" />
                        </svg>
                        {t.searchPlaceholder.split(" ")[0]}
                        {hasActiveFilters && (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                                ON
                            </span>
                        )}
                    </span>
                    <span className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileFilterOpen ? "rotate-180" : ""}`}>▾</span>
                </button>
                {mobileFilterOpen && (
                    <div className={`mt-2 rounded-[22px] border p-5 ${
                        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                    }`}>
                        {filterPanel}
                    </div>
                )}
            </div>

            <div className="flex justify-end lg:hidden">
                <div className={`inline-flex rounded-2xl p-1 ${
                    isDark ? "bg-slate-950/80" : "bg-slate-100"
                }`}>
                    {viewModeOptions.map((option) => {
                        const active = viewMode === option.value;
                        const Icon = option.Icon;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setViewMode(option.value)}
                                aria-label={option.label}
                                title={option.label}
                                className={`grid h-9 w-9 place-items-center rounded-xl transition ${
                                    active
                                        ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]"
                                        : isDark
                                          ? "text-slate-300 hover:bg-white/5"
                                          : "text-slate-600 hover:bg-white"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 데스크톱: 고정 사이드바 */}
            <aside className={`hidden lg:block lg:w-[260px] xl:w-[280px] shrink-0`}>
                <div className={`sticky top-24 ${panelBase} p-5`}>
                    <h3 className={`type-label mb-5 ${isDark ? "text-white" : "text-slate-900"}`}>
                        <span className="inline-flex items-center gap-2">
                            <SearchIcon className="h-4 w-4" />
                            필터
                        </span>
                    </h3>
                    {filterPanel}
                </div>
            </aside>

            {/* ── 오른쪽 투어 목록 ── */}
            <div className="min-w-0 flex-1">
                <div className={`${panelBase} p-4 sm:p-6`}>
                    {/* 헤더 */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                                <h2 className={`type-title-md ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {t.featured}
                                </h2>
                                <p className={`mt-0.5 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {filteredTours.length}{lang === "ja" ? "件" : lang === "en" ? " results" : "개 상품"}
                                </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <div className="w-[132px] sm:w-[200px]">
                                <Dropdown
                                    value={sort}
                                    onChange={setSort}
                                    options={[
                                        { value: "popular", label: t.popularSort },
                                        { value: "priceLow", label: t.lowSort },
                                        { value: "priceHigh", label: t.highSort },
                                    ]}
                                    isDark={isDark}
                                />
                            </div>
                            <div className={`hidden rounded-2xl p-1 sm:inline-flex ${
                                isDark ? "bg-slate-950/80" : "bg-slate-100"
                            }`}>
                                {viewModeOptions.map((option) => {
                                    const active = viewMode === option.value;
                                    const Icon = option.Icon;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setViewMode(option.value)}
                                            aria-label={option.label}
                                            title={option.label}
                                            className={`grid h-9 w-9 place-items-center rounded-xl transition ${
                                                active
                                                    ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]"
                                                    : isDark
                                                      ? "text-slate-300 hover:bg-white/5"
                                                      : "text-slate-600 hover:bg-white"
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {filteredTours.length === 0 ? (
                        <div className={`mt-5 rounded-[22px] border p-8 text-center ${
                            isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                        }`}>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                                <SearchIcon className="h-5 w-5" />
                            </div>
                            <h3 className={`type-title-md mt-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                                {t.noResults}
                            </h3>
                            <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                {t.noResultsDesc}
                            </p>
                            <button
                                onClick={resetFilters}
                                className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                            >
                                {t.reset}
                            </button>
                        </div>
                    ) : (
                        <div className={
                            viewMode === "list"
                                ? "mt-5 flex flex-col gap-3"
                                : viewMode === "twoColumn"
                                  ? "mt-5 grid grid-cols-2 gap-4"
                                  : "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                        }>
                            {filteredTours.map((tour) => {
                                const topTags = getPrimaryTourBadgeTags(tour, lang, [
                                    resolveThemeLabel(tour.theme),
                                    tour.duration[lang],
                                ]);
                                const secondaryTags = getSecondaryTourTags(tour, lang).slice(0, 2);

                                if (viewMode === "list") {
                                    return (
                                        <article
                                            key={tour.id}
                                            className={`group flex cursor-pointer overflow-hidden rounded-[18px] border text-left shadow-sm transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-xl active:scale-[0.99] ${
                                                isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"
                                            }`}
                                            onClick={() => setSelectedTourId(tour.id)}
                                        >
                                            <div className={`relative min-h-24 w-28 shrink-0 self-stretch overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-100"} sm:min-h-28 sm:w-36`}>
                                                {showImages ? (
                                                    <Image
                                                        src={tour.heroImage}
                                                        alt={tour.title[lang]}
                                                        fill
                                                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                                                        sizes="176px"
                                                    />
                                                ) : null}
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3">
                                                <div className="min-w-0">
                                                    <div className="mb-1.5 flex flex-wrap gap-1">
                                                        {topTags.map((tag, index) => (
                                                            <span
                                                                key={`${tour.id}-list-top-tag-${tag}`}
                                                                className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold text-white ${
                                                                    index === 0 ? "bg-blue-600" : "bg-slate-700"
                                                                }`}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <h3 className={`line-clamp-1 !text-[13px] font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                                        {tour.title[lang]}
                                                    </h3>
                                                    <p className={`mt-1 line-clamp-2 !text-[10px] font-semibold leading-snug ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                        {tour.desc[lang]}
                                                    </p>
                                                </div>

                                                <div className="flex items-end justify-between gap-2">
                                                    <div className="flex min-w-0 flex-wrap gap-1">
                                                        {secondaryTags.map((tag) => (
                                                            <span
                                                                key={`${tour.id}-list-secondary-${tag}`}
                                                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                                    isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-700"
                                                                }`}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <span className={`block text-[9px] font-extrabold leading-none ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                            {t.priceLabel}
                                                        </span>
                                                        <span className={`mt-0.5 block text-sm font-black leading-tight ${isDark ? "text-white" : "text-slate-950"}`}>
                                                            {formatPrice(tour.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }

                                if (viewMode === "twoColumn") {
                                    return (
                                        <article
                                            key={tour.id}
                                            className="group relative aspect-[0.9] min-h-[174px] cursor-pointer overflow-hidden rounded-[20px] bg-slate-200 text-white shadow-sm transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-xl active:scale-[0.98] sm:aspect-[4/3] sm:min-h-[220px] sm:rounded-[22px]"
                                            onClick={() => setSelectedTourId(tour.id)}
                                        >
                                            {showImages ? (
                                                <Image
                                                    src={tour.heroImage}
                                                    alt={tour.title[lang]}
                                                    fill
                                                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                                                    sizes="(max-width: 640px) 50vw, 50vw"
                                                />
                                            ) : (
                                                <div className={`absolute inset-0 ${isDark ? "bg-slate-950" : "bg-slate-100"}`} />
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/78" />

                                            <span className="absolute left-3 top-3 rounded-full bg-white/25 px-3 py-1 text-[10px] font-black text-white shadow-[0_8px_18px_rgba(15,23,42,0.18)] backdrop-blur-md sm:left-4 sm:top-4 sm:text-xs">
                                                {regionLabelByKey[tour.region]}
                                            </span>

                                            <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                                                <h3 className="!text-[1.2rem] font-black leading-tight tracking-tight text-white sm:!text-[1.35rem]">
                                                    {tour.title[lang]}
                                                </h3>
                                                <div className="mt-2">
                                                    <span className="block text-[10px] font-black leading-none text-white/85 sm:text-xs">
                                                        {t.priceLabel}
                                                    </span>
                                                    <span className="mt-1 block text-[0.95rem] font-black leading-tight text-white sm:text-lg">
                                                        {formatPrice(tour.price)}{" "}
                                                        <span className="text-[0.9em]">{priceFromLabel}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }

                                return (
                                    <article
                                        key={tour.id}
                                        className="group relative h-[200px] cursor-pointer overflow-hidden rounded-[22px] shadow-sm transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-xl active:scale-[0.98] sm:h-[240px]"
                                        onClick={() => setSelectedTourId(tour.id)}
                                    >
                                    {/* 배경 이미지 */}
                                    {showImages ? (
                                        <Image
                                            src={tour.heroImage}
                                            alt={tour.title[lang]}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className={`absolute inset-0 ${isDark ? "bg-slate-950" : "bg-slate-100"}`} />
                                    )}

                                    {/* 상단 배지 */}
                                    <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 sm:left-4 sm:top-4">
                                        {topTags.map((tag, index) => (
                                            <span
                                                key={`${tour.id}-top-tag-${tag}`}
                                                className={`rounded-full px-2.5 py-1 text-xs font-extrabold text-white backdrop-blur-sm ${
                                                    index === 0
                                                        ? "bg-blue-600/85"
                                                        : "border border-white/25 bg-black/30"
                                                }`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* 하단 그라데이션 + 텍스트 */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-16 text-white sm:px-5 sm:pb-5 sm:pt-20">
                                        <h3 className="!text-[1.2rem] font-black leading-tight tracking-tight">
                                            {tour.title[lang]}
                                        </h3>
                                        <div className="mt-3 flex items-end justify-between gap-2">
                                            <div className="flex flex-wrap gap-1">
                                                {secondaryTags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm sm:text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className="block text-[10px] font-extrabold leading-none text-white/70 sm:text-[11px]">
                                                    {t.priceLabel}
                                                </span>
                                                <span className="mt-1 block text-lg font-black leading-tight sm:text-xl">
                                                    {formatPrice(tour.price)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
