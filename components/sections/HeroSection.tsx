"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { copy, type HeroSlide, type Locale, type Region } from "@/lib/bluewolf-data";
import { CMS_NULL_IMAGE } from "@/lib/cms-image";
import { withLocaleQuery } from "@/lib/locale-routing";
import { useCmsTourCustomize } from "@/lib/use-cms-tour-customize";
import { regionMeta } from "@/components/tours/tours-customize-data";
import { BluewolfScrollArea } from "@/components/ui/BluewolfScrollArea";
import { CalendarPicker } from "@/components/ui/CalendarPicker";

type CopyValue = (typeof copy)[Locale];

const heroSearchCopy = {
    ko: {
        title: "여행자님\n나만의 여행을 계획해보세요!",
        destinationPlaceholder: "어디로 떠나세요?",
        datePlaceholder: "여행 시작일 선택",
        search: "몽골 여행 검색",
    },
    ja: {
        title: "お客様、\nどんな旅をお探しですか？",
        destinationPlaceholder: "どこへ出発しますか？",
        datePlaceholder: "旅行開始日を選択",
        search: "モンゴル旅行を検索",
    },
    en: {
        title: "What kind of trip\nare you dreaming of?",
        destinationPlaceholder: "Where do you want to go?",
        datePlaceholder: "Select travel start date",
        search: "Search Mongolia trips",
    },
} as const;

const regionOrder: Region[] = ["south", "north", "central", "west"];

type HeroDestinationOption = {
    id: string;
    label: string;
    image: string;
    region: Region;
};

function HeroDestinationDropdown({
    value,
    placeholder,
    groups,
    isDark,
    onChange,
}: {
    value: string;
    placeholder: string;
    groups: Array<{
        region: Region;
        label: string;
        options: HeroDestinationOption[];
    }>;
    isDark: boolean;
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const selected = groups.flatMap((group) => group.options).find((option) => option.id === value);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    return (
        <div ref={ref} className={`relative ${open ? "z-[120]" : "z-20"}`}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="relative h-[52px] w-full rounded-2xl border-0 bg-white px-5 pr-14 text-left text-[15px] font-black text-slate-950 outline-none transition focus:ring-4 focus:ring-blue-500/20"
                aria-expanded={open}
            >
                {selected?.label ?? placeholder}
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
                    <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className={`h-5 w-5 stroke-[2.2] transition-transform duration-300 ${open ? "rotate-180" : ""} ${
                            isDark ? "stroke-slate-500" : "stroke-slate-500"
                        }`}
                    >
                        <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            {open ? (
                <div className="apple-pop-in absolute left-0 right-0 top-[calc(100%+10px)] z-[130] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_24px_54px_rgba(15,23,42,0.22)]">
                    <BluewolfScrollArea className="max-h-[360px] p-3 pr-7">
                        {groups.map((group) => (
                            <div key={group.region} className="py-1">
                                <div className="px-3 pb-1 pt-2 text-xs font-black text-blue-600">
                                    {group.label}
                                </div>
                                <div className="grid gap-1">
                                    {group.options.map((option) => {
                                        const active = option.id === value;

                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => {
                                                    onChange(option.id);
                                                    setOpen(false);
                                                }}
                                                className={`rounded-xl px-3 py-3 text-left text-[15px] font-black transition-colors ${
                                                    active
                                                        ? "bg-blue-600 text-white"
                                                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </BluewolfScrollArea>
                </div>
            ) : null}
        </div>
    );
}

export function HeroSection({
    t,
    currentSlide,
    hero,
    lang,
    slideIndex,
    setSlideIndex,
    paused,
    setPaused,
    isDark,
    showImages,
    onDestinationImageChange,
}: {
    t: CopyValue;
    currentSlide: HeroSlide;
    hero: HeroSlide[];
    lang: Locale;
    slideIndex: number;
    setSlideIndex: (value: number) => void;
    paused: boolean;
    setPaused: (value: boolean) => void;
    isDark: boolean;
    showImages: boolean;
    onDestinationImageChange?: (image: string | null) => void;
}) {
    const router = useRouter();
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const { localizedRegions } = useCmsTourCustomize(lang);
    const searchCopy = heroSearchCopy[lang];
    const activeSlideNumber = (slideIndex % hero.length) + 1;
    const destinationGroups = useMemo(
        () =>
            regionOrder.map((region) => ({
                region,
                label: regionMeta[lang][region].label,
                options: localizedRegions[region].destinations.map((destinationItem) => ({
                    id: `${region}:${destinationItem.id}`,
                    label: destinationItem.title,
                    image: destinationItem.image,
                    region,
                })),
            })),
        [lang, localizedRegions]
    );
    const selectedDestination = destinationGroups
        .flatMap((group) => group.options)
        .find((option) => option.id === destination);
    const selectedDestinationImage =
        selectedDestination?.image && selectedDestination.image !== CMS_NULL_IMAGE
            ? selectedDestination.image
            : null;
    const currentSlideTitle = currentSlide.title.replace(/\s*\n\s*/g, " ");

    useEffect(() => {
        onDestinationImageChange?.(selectedDestinationImage);
    }, [onDestinationImageChange, selectedDestinationImage]);

    const handlePreviousSlide = () => {
        setSlideIndex((slideIndex - 1 + hero.length) % hero.length);
    };

    const handleNextSlide = () => {
        setSlideIndex((slideIndex + 1) % hero.length);
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const params = new URLSearchParams();
        params.set("lang", lang);
        if (selectedDestination) params.set("q", selectedDestination.label);
        if (startDate) params.set("startDate", startDate);

        router.push(`/tours?${params.toString()}`);
    };

    return (
        <>
                <div className="relative z-30 flex min-h-0 flex-col justify-start overflow-visible rounded-[24px] border border-white/10 bg-slate-950/28 p-5 backdrop-blur-[2px] sm:rounded-[28px] sm:px-7 md:min-h-[360px] md:justify-center md:py-6 lg:min-h-[460px] lg:px-8">
                    <h1
                        className="relative whitespace-pre-line !text-[1.8rem] font-black leading-tight tracking-tight text-white"
                    >
                        {searchCopy.title}
                    </h1>

                    <form onSubmit={handleSearch} className="relative mt-6 grid max-w-md gap-3">
                        <HeroDestinationDropdown
                            value={destination}
                            placeholder={searchCopy.destinationPlaceholder}
                            groups={destinationGroups}
                            onChange={setDestination}
                            isDark={isDark}
                        />

                        <CalendarPicker
                            value={startDate}
                            onChange={setStartDate}
                            placeholder={searchCopy.datePlaceholder}
                            weekdays={t.weekdays}
                            deleteLabel={t.delete}
                            todayLabel={t.today}
                            locale={lang}
                            isDark={false}
                        />

                        <button
                            type="submit"
                            className="mt-2 h-[52px] rounded-2xl bg-blue-600 px-6 text-[15px] font-black text-white transition duration-300 hover:bg-blue-500 active:scale-[0.99]"
                        >
                            {searchCopy.search}
                        </button>
                    </form>
                </div>

                <div
                    className="relative z-10 min-h-[170px] overflow-hidden rounded-[20px] bg-slate-950/28 backdrop-blur-[2px] sm:rounded-[28px] md:min-h-[360px] lg:min-h-[460px]"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    {showImages ? (
                        hero.map((slide, index) => (
                            <a
                                key={`${slide.eyebrow}-${index}`}
                                href={withLocaleQuery(slide.href || "/tours", lang)}
                                className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    index === slideIndex ? "opacity-100" : "pointer-events-none opacity-0"
                                }`}
                                aria-label={slide.title}
                            >
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    priority={index === 0}
                                    className="object-cover"
                                    sizes="(min-width: 1024px) 65vw, 100vw"
                                />
                                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/38 to-transparent" />
                            </a>
                        ))
                    ) : (
                        <div className={`absolute inset-0 ${isDark ? "bg-slate-900" : "bg-slate-100"}`} />
                    )}

                    <div className="pointer-events-none relative z-10 flex h-[170px] flex-col justify-end p-5 md:h-auto md:min-h-[360px] md:p-8 lg:min-h-[460px]">
                        <div className="absolute bottom-5 left-5 max-w-[62%] md:bottom-8 md:left-8 md:max-w-xl">
                            <span className="hidden rounded-full bg-white/90 px-4 py-2 text-[11px] font-black text-blue-700 shadow-[0_6px_18px_rgba(15,23,42,0.08)] backdrop-blur md:inline-flex">
                                {currentSlide.eyebrow}
                            </span>
                            <h2 className="text-[13px] font-black leading-tight tracking-tight text-white md:mt-5 md:text-[36px] lg:text-[46px]">
                                {currentSlideTitle}
                            </h2>
                            <p className="mt-3 hidden max-w-md font-bold text-slate-200 md:mt-4 md:line-clamp-2 md:block md:text-[15px] md:leading-6">
                                {currentSlide.desc}
                            </p>
                        </div>

                        <div className="pointer-events-auto absolute bottom-5 right-5 flex items-end justify-end gap-2 md:bottom-8 md:right-8 md:items-center">
                            <div className="flex items-center gap-2 rounded-full bg-slate-950/72 px-3 py-2 text-xs font-black text-white backdrop-blur-md md:gap-3 md:px-4 md:py-3 md:text-sm">
                                <span>
                                    {activeSlideNumber}/{hero.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={handlePreviousSlide}
                                    aria-label="Previous slide"
                                    className="rounded-full px-1 text-base transition hover:bg-white/10 md:px-1.5 md:text-lg"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextSlide}
                                    aria-label="Next slide"
                                    className="rounded-full px-1 text-base transition hover:bg-white/10 md:px-1.5 md:text-lg"
                                >
                                    ›
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPaused(!paused)}
                                aria-label={paused ? t.featuredLabel : t.pausedLabel}
                                className="hidden h-12 w-12 place-items-center rounded-full bg-slate-950/72 text-sm font-black text-white backdrop-blur-md transition hover:bg-slate-950/88 md:grid"
                            >
                                {paused ? "▶" : "Ⅱ"}
                            </button>
                        </div>
                    </div>

                </div>
        </>
    );
}
