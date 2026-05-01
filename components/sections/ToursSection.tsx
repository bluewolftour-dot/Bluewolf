"use client";

import { useState } from "react";
import Image from "next/image";
import { Dropdown } from "@/components/ui/Dropdown";
import { SearchIcon } from "@/components/ui/SafeIcons";
import { copy, type Locale, type Tour } from "@/lib/bluewolf-data";
import { getPrimaryTourBadgeTags, getSecondaryTourTags } from "@/lib/tour-tags";
import { formatPrice } from "@/lib/bluewolf-utils";

type CopyValue = (typeof copy)[Locale];

const inputClass =
    "h-12 w-full rounded-2xl border px-4 text-[15px] font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50";


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

    const panelBase = `rounded-[24px] border shadow-sm transition-colors duration-300 sm:rounded-[28px] ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;

    const labelClass = `mb-2 block text-sm font-extrabold ${isDark ? "text-slate-200" : "text-slate-700"}`;

    const hasActiveFilters =
        keyword !== "" || duration !== "all" || region !== "all" || theme !== "all";

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

            {/* 데스크톱: 고정 사이드바 */}
            <aside className={`hidden lg:block lg:w-[260px] xl:w-[280px] shrink-0`}>
                <div className={`sticky top-24 ${panelBase} p-5`}>
                    <h3 className={`mb-5 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className={`text-xl font-black tracking-tight sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {t.featured}
                                </h2>
                                <p className={`mt-0.5 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {filteredTours.length}{lang === "ja" ? "件" : lang === "en" ? " results" : "개 상품"}
                                </p>
                            </div>
                        </div>

                        <div className="w-full sm:w-[200px]">
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
                    </div>

                    {/* 카드 그리드 */}
                    {filteredTours.length === 0 ? (
                        <div className={`mt-5 rounded-[22px] border p-8 text-center ${
                            isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                        }`}>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                                <SearchIcon className="h-5 w-5" />
                            </div>
                            <h3 className={`mt-3 text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
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
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredTours.map((tour) => {
                                const topTags = getPrimaryTourBadgeTags(tour, lang, [
                                    resolveThemeLabel(tour.theme),
                                    tour.duration[lang],
                                ]);
                                const secondaryTags = getSecondaryTourTags(tour, lang).slice(0, 2);

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
                                        <h3 className="text-sm font-black leading-tight tracking-tight sm:text-base">
                                            {tour.title[lang]}
                                        </h3>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/75 sm:text-sm sm:leading-6">
                                            {tour.desc[lang]}
                                        </p>
                                        <div className="mt-2.5 flex items-end justify-between gap-2">
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
                                            <span className="shrink-0 text-lg font-black tracking-tight sm:text-xl">
                                                {formatPrice(tour.price)}
                                            </span>
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
