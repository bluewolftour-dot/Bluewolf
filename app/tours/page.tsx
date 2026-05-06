"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type Region, type Tour } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";
import { filterTours, formatPrice } from "@/lib/bluewolf-utils";
import { useCmsTours } from "@/lib/use-cms-tours";
import { useCmsTourRegionCards } from "@/lib/use-cms-tour-region-cards";
import { useCmsTourThemes } from "@/lib/use-cms-tour-themes";
import { tourRegionCardMeta, tourRegionOrder } from "@/lib/tour-region-cards";
import { ToursSection } from "@/components/sections/ToursSection";
import { PageShell, usePage } from "@/components/layout/PageShell";

function RegionSelector({
    onSelect,
    selectedRegion,
    tourItems,
    regionImages,
    showImages,
}: {
    onSelect: (region: Region) => void;
    selectedRegion: Region | null;
    tourItems: Tour[];
    regionImages: Record<Region, string>;
    showImages: boolean;
}) {
    const { lang, isDark } = usePage();

    const regionTitle = {
        ko: "나만의 여행을 계획해보세요",
        ja: "どこへ旅行に出かけたいですか？",
        en: "Where would you like to travel?",
    }[lang];

    const fromLabel = {
        ko: "부터",
        ja: "から",
        en: "from",
    }[lang];

    const perPersonLabel = {
        ko: "1인 기준",
        ja: "1名基準",
        en: "Per person",
    }[lang];

    const selectedLabel = {
        ko: "선택",
        ja: "選択",
        en: "Selected",
    }[lang];

    return (
        <section
            className={`rounded-[24px] border p-6 shadow-sm sm:rounded-[28px] sm:p-8 lg:!p-[40px] ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
        >
            <h1
                className={`flex items-center gap-2 !text-[23px] font-black tracking-tight sm:!text-xl lg:!text-2xl ${
                    isDark ? "text-white" : "text-slate-900"
                }`}
            >
                <span className="relative block h-[45px] w-16 shrink-0 overflow-visible sm:h-14 sm:w-20" aria-hidden="true">
                    <Image
                        src="/images/plane-icon.png"
                        alt=""
                        fill
                        className={`animate-float-plane object-contain transition-opacity duration-500 ${
                            isDark ? "opacity-0" : "opacity-100"
                        }`}
                        sizes="(max-width: 640px) 64px, 80px"
                    />
                    <Image
                        src="/images/plane-icon-dark.png"
                        alt=""
                        fill
                        className={`animate-float-plane object-contain transition-opacity duration-500 ${
                            isDark ? "opacity-100" : "opacity-0"
                        }`}
                        sizes="(max-width: 640px) 64px, 80px"
                    />
                </span>
                {regionTitle}
            </h1>

            <div className="mx-auto mt-6 grid w-full grid-cols-2 gap-3 sm:gap-4">
                {tourRegionOrder.map((region) => {
                    const meta = tourRegionCardMeta[region];
                    const label = meta.label[lang];
                    const subtitle = meta.subtitle[lang];
                    const image = regionImages[region] || meta.defaultImage;
                    const regionTours = tourItems.filter((tour) => tour.region === region);
                    const minPrice =
                        regionTours.length > 0
                            ? Math.min(...regionTours.map((tour) => tour.price))
                            : 0;
                    const isSelected = selectedRegion === region;

                    return (
                        <button
                            key={region}
                            type="button"
                            onClick={() => onSelect(region)}
                            className={`group relative overflow-hidden text-left transition-[transform,box-shadow] duration-700 ease-in-out hover:shadow-xl active:scale-[0.98] ${
                                isSelected
                                    ? "rounded-[22px] ring-4 ring-blue-500 ring-offset-2"
                                    : "rounded-[22px]"
                            }`}
                        >
                            <div className="relative h-44 overflow-hidden rounded-[inherit] sm:h-60 lg:h-[200px]">
                                {showImages ? (
                                    <Image
                                        src={image}
                                        alt={subtitle}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                                        sizes="(max-width: 640px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className={`absolute inset-0 ${isDark ? "bg-slate-950" : "bg-slate-100"}`} />
                                )}
                                <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-black/35 via-black/25 to-black/60" />
                                <div className="absolute inset-0 flex flex-col justify-between rounded-[inherit] p-4 text-white sm:p-5 lg:!p-[30px]">
                                    <div className="flex items-start justify-between">
                                        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs">
                                            {label}
                                        </span>
                                        {isSelected ? (
                                            <span className="rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-extrabold sm:px-3 sm:py-1.5 sm:text-xs">
                                                {selectedLabel}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div>
                                        <div className="text-lg font-black tracking-tight sm:text-3xl">
                                            {subtitle}
                                        </div>
                                        <div className="mt-2 sm:mt-3">
                                            <span className="block text-[10px] font-extrabold leading-none text-white/80 sm:text-xs">
                                                {perPersonLabel}
                                            </span>
                                            <span className="mt-1 block text-sm font-black leading-tight sm:text-base">
                                                {lang === "en"
                                                    ? `${fromLabel} ${formatPrice(minPrice)}`
                                                    : `${formatPrice(minPrice)} ${fromLabel}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function ToursContent() {
    const { lang, isDark, t } = usePage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { tourItems, loaded: toursLoaded } = useCmsTours();
    const { regionCardsContent, loaded: regionCardsLoaded } = useCmsTourRegionCards();
    const { themeOptions, resolveThemeLabel } = useCmsTourThemes(lang);

    const initialRegion = (() => {
        const value = searchParams.get("region");
        return value === "south" || value === "north" || value === "central" || value === "west"
            ? value
            : null;
    })();
    const initialDuration =
        searchParams.get("duration") === "short"
            ? "short"
            : searchParams.get("duration") === "long"
              ? "long"
              : "all";

    const [selectedRegion] = useState<Region | null>(initialRegion);
    const [keyword, setKeyword] = useState("");
    const [duration, setDuration] = useState(initialDuration);
    const [theme, setTheme] = useState("all");
    const [sort, setSort] = useState("popular");

    const filteredTours = useMemo(
        () =>
            filterTours(
                tourItems,
                lang,
                keyword,
                duration,
                selectedRegion ?? "all",
                theme,
                sort
            ),
        [duration, keyword, lang, selectedRegion, sort, theme, tourItems]
    );

    const resetFilters = () => {
        setKeyword("");
        setDuration("all");
        setTheme("all");
        setSort("popular");
    };

    const handleRegionSelect = (region: Region) => {
        router.push(withLocaleQuery(`/tours/customize?region=${region}`, lang));
    };

    return (
        <>
            <RegionSelector
                onSelect={handleRegionSelect}
                selectedRegion={selectedRegion}
                tourItems={tourItems}
                regionImages={regionCardsContent.images}
                showImages={regionCardsLoaded}
            />
            <div id="tours-list">
                <ToursSection
                    t={t}
                    lang={lang}
                    keyword={keyword}
                    setKeyword={setKeyword}
                    duration={duration}
                    setDuration={setDuration}
                    region={selectedRegion ?? "all"}
                    setRegion={() => {}}
                    theme={theme}
                    setTheme={setTheme}
                    sort={sort}
                    setSort={setSort}
                    filteredTours={filteredTours}
                    resetFilters={resetFilters}
                    setSelectedTourId={(id) =>
                        router.push(withLocaleQuery(`/tours/${id}`, lang))
                    }
                    isDark={isDark}
                    showImages={toursLoaded}
                    themeOptions={themeOptions}
                    resolveThemeLabel={resolveThemeLabel}
                />
            </div>
        </>
    );
}

export default function ToursPage() {
    return (
        <Suspense fallback={null}>
            <PageShell activeKey="tours">
                <ToursContent />
            </PageShell>
        </Suspense>
    );
}
