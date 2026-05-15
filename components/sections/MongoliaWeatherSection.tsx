"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { type Locale } from "@/lib/bluewolf-data";

type WeatherDay = {
    date: string;
    weatherCode: number | null;
    temperatureMax: number | null;
    temperatureMin: number | null;
};

type WeatherResponse = {
    ok: boolean;
    source?: string;
    days?: WeatherDay[];
};

type WeatherVisualKind = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "thunder" | "variable";

const weatherImageByKind: Record<WeatherVisualKind, string> = {
    clear: "/images/weather/github/sun.png",
    partly: "/images/weather/github/haze.png",
    cloudy: "/images/weather/github/cloud.png",
    fog: "/images/weather/github/mist.png",
    drizzle: "/images/weather/github/rain.png",
    rain: "/images/weather/github/rain.png",
    snow: "/images/weather/github/snow.png",
    thunder: "/images/weather/github/thunderstorm.png",
    variable: "/images/weather/github/wind.png",
};

const copy = {
    ko: {
        eyebrow: "몽골 현지 날씨",
        title: "울란바토르 7일 예보",
        desc: "여행 준비에 참고할 수 있도록 몽골 현지 기온과 강수, 바람 정보를 보여드립니다.",
        loading: "날씨 정보를 불러오는 중입니다.",
        error: "날씨 정보를 불러오지 못했습니다.",
        high: "최고",
        low: "최저",
        source: "자료",
    },
    ja: {
        eyebrow: "モンゴル現地天気",
        title: "ウランバートル 7日予報",
        desc: "旅行準備の参考になる気温、降水量、風の情報を表示します。",
        loading: "天気情報を読み込み中です。",
        error: "天気情報を取得できませんでした。",
        high: "最高",
        low: "最低",
        source: "出典",
    },
    en: {
        eyebrow: "Mongolia weather",
        title: "Ulaanbaatar 7-day forecast",
        desc: "Check local temperature and weather conditions while planning your trip.",
        loading: "Loading weather forecast.",
        error: "Weather forecast is currently unavailable.",
        high: "High",
        low: "Low",
        source: "Source",
    },
} as const;

const localeByLang: Record<Locale, string> = {
    ko: "ko-KR",
    ja: "ja-JP",
    en: "en-US",
};

const weatherUiCopy: Record<Locale, { today: string; forecast: string; location: string }> = {
    ko: {
        today: "오늘",
        forecast: "7일 예보",
        location: "울란바토르",
    },
    ja: {
        today: "今日",
        forecast: "7日予報",
        location: "ウランバートル",
    },
    en: {
        today: "Today",
        forecast: "7-day forecast",
        location: "Ulaanbaatar",
    },
};

function getWeatherLabel(code: number | null, lang: Locale) {
    if (code === null) return lang === "ko" ? "정보 없음" : lang === "ja" ? "情報なし" : "Unknown";
    if (code === 0) return lang === "ko" ? "맑음" : lang === "ja" ? "晴れ" : "Clear";
    if ([1, 2].includes(code)) return lang === "ko" ? "대체로 맑음" : lang === "ja" ? "やや晴れ" : "Mostly clear";
    if (code === 3) return lang === "ko" ? "흐림" : lang === "ja" ? "くもり" : "Cloudy";
    if ([45, 48].includes(code)) return lang === "ko" ? "안개" : lang === "ja" ? "霧" : "Fog";
    if (code >= 51 && code <= 57) return lang === "ko" ? "이슬비" : lang === "ja" ? "霧雨" : "Drizzle";
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return lang === "ko" ? "비" : lang === "ja" ? "雨" : "Rain";
    if (code >= 71 && code <= 77) return lang === "ko" ? "눈" : lang === "ja" ? "雪" : "Snow";
    if (code >= 95) return lang === "ko" ? "뇌우" : lang === "ja" ? "雷雨" : "Thunderstorm";
    return lang === "ko" ? "변화 있음" : lang === "ja" ? "変化あり" : "Variable";
}

function getWeatherVisualKind(code: number | null): WeatherVisualKind {
    if (code === null) return "variable";
    if (code === 0) return "clear";
    if ([1, 2].includes(code)) return "partly";
    if (code === 3) return "cloudy";
    if ([45, 48].includes(code)) return "fog";
    if (code >= 51 && code <= 57) return "drizzle";
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
    if (code >= 71 && code <= 77) return "snow";
    if (code >= 95) return "thunder";
    return "variable";
}

function formatDate(date: string, lang: Locale) {
    return new Intl.DateTimeFormat(localeByLang[lang], {
        month: "short",
        day: "numeric",
        weekday: "short",
    }).format(new Date(`${date}T00:00:00`));
}

function formatTemperature(value: number | null) {
    return value === null ? "-" : `${Math.round(value)}°`;
}

export function MongoliaWeatherSection({ isDark, lang }: { isDark: boolean; lang: Locale }) {
    const [weather, setWeather] = useState<WeatherResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showAllMobileDays, setShowAllMobileDays] = useState(false);
    const text = copy[lang];
    const weatherText = weatherUiCopy[lang];

    useEffect(() => {
        let mounted = true;

        async function loadWeather() {
            try {
                setIsLoading(true);
                setHasError(false);
                const response = await fetch("/api/weather/mongolia");
                const data = (await response.json()) as WeatherResponse;

                if (!response.ok || !data.ok) throw new Error("Weather request failed");
                if (mounted) setWeather(data);
            } catch {
                if (mounted) setHasError(true);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        void loadWeather();

        return () => {
            mounted = false;
        };
    }, []);

    const days = useMemo(() => weather?.days?.slice(0, 7) ?? [], [weather?.days]);
    const today = days[0];
    const forecastDays = days.slice(1);
    const todayKind = getWeatherVisualKind(today?.weatherCode ?? null);
    const hasMobileHiddenDays = days.length > 3;
    const moreButtonLabel = showAllMobileDays
        ? lang === "en"
            ? "Show less"
            : lang === "ja"
              ? "閉じる"
              : "접기"
        : lang === "en"
          ? "Show more"
          : lang === "ja"
            ? "もっと見る"
            : "더보기";

    return (
        <div className="px-5 sm:px-8 lg:px-12">
            <section className="overflow-visible py-2 transition-colors sm:py-3 lg:py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className={`text-xs font-black uppercase tracking-[0.18em] ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                            {text.eyebrow}
                        </p>
                        <h2 className={`type-title-md mt-2 ${isDark ? "text-white" : "text-slate-950"}`}>
                            {text.title}
                        </h2>
                        <p className={`mt-2 max-w-2xl text-sm font-semibold leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {text.desc}
                        </p>
                    </div>

                    {weather?.source ? (
                        <p className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {text.source}: {weather.source}
                        </p>
                    ) : null}
                </div>

                {isLoading ? (
                    <div className={`mt-5 rounded-[18px] px-4 py-5 text-sm font-bold ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"}`}>
                        {text.loading}
                    </div>
                ) : hasError || days.length === 0 ? (
                    <div className={`mt-5 rounded-[18px] px-4 py-5 text-sm font-bold ${isDark ? "bg-red-500/10 text-red-200" : "bg-red-50 text-red-700"}`}>
                        {text.error}
                    </div>
                ) : today ? (
                    <>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-7">
                        <article className="group/weather-card relative h-[96px] overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#2563eb_0%,#38bdf8_54%,#0f5f92_100%)] text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)] sm:h-[260px] sm:rounded-[24px]">
                            <Image
                                src={weatherImageByKind[todayKind]}
                                alt=""
                                fill
                                className="object-contain object-center p-5 pr-[66%] transition-transform duration-500 ease-out group-hover/weather-card:scale-105 sm:p-6 sm:pr-6"
                                sizes="150px"
                            />
                            <span className="absolute inset-x-0 bottom-0 hidden h-2/3 bg-[linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.5)_100%)] sm:block" />
                            <div className="absolute inset-0 z-10 flex items-center justify-end p-[10px] sm:relative sm:inset-auto sm:block sm:h-full sm:p-0">
                                <div className="grid h-[64px] w-[58%] grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] content-start gap-x-2 gap-y-1 rounded-[18px] border border-white/35 bg-white/18 p-[10px] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:flex sm:h-full sm:w-auto sm:flex-col sm:items-stretch sm:justify-between sm:rounded-none sm:border-0 sm:bg-transparent sm:p-4 sm:shadow-none sm:backdrop-blur-none">
                                    <div className="flex min-w-0 flex-col items-start">
                                        <span className="inline-flex w-max max-w-none whitespace-nowrap rounded-full bg-white/18 px-2.5 py-0.5 text-[10px] font-black leading-none text-white backdrop-blur">
                                            {weatherText.today}
                                        </span>
                                        <p className="mt-0.5 whitespace-nowrap !text-[1.3rem] font-black leading-none tracking-tight sm:mt-2 sm:!text-[2.5rem]">{formatTemperature(today.temperatureMax)}</p>
                                    </div>

                                    <div className="min-w-0 overflow-visible text-right sm:text-left">
                                        <p className="line-clamp-1 text-sm font-black">{getWeatherLabel(today.weatherCode, lang)}</p>
                                        <p className="mt-1 -ml-8 whitespace-nowrap text-xs font-bold leading-none text-white/82 sm:ml-0 sm:whitespace-normal sm:leading-relaxed">
                                            <span>{text.high} {formatTemperature(today.temperatureMax)}</span> <span>{text.low} {formatTemperature(today.temperatureMin)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {forecastDays.map((day, index) => {
                            const kind = getWeatherVisualKind(day.weatherCode);

                            return (
                                <article
                                    key={day.date}
                                    className={`group/weather-card relative h-[96px] overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#2563eb_0%,#38bdf8_54%,#0f5f92_100%)] text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)] sm:h-[260px] sm:rounded-[24px] ${
                                        !showAllMobileDays && index >= 2 ? "hidden sm:block" : index >= 2 ? "animate-slide-down" : ""
                                    }`}
                                >
                                    <Image
                                        src={weatherImageByKind[kind]}
                                        alt=""
                                        fill
                                        className="object-contain object-center p-5 pr-[66%] transition-transform duration-500 ease-out group-hover/weather-card:scale-105 sm:p-6 sm:pr-6"
                                        sizes="150px"
                                    />
                                    <span className="absolute inset-x-0 bottom-0 hidden h-2/3 bg-[linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.46)_100%)] sm:block" />
                                    <div className="absolute inset-0 z-10 flex items-center justify-end p-[10px] sm:relative sm:inset-auto sm:block sm:h-full sm:p-0">
                                        <div className="grid h-[64px] w-[58%] grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] content-start gap-x-2 gap-y-1 rounded-[18px] border border-white/35 bg-white/18 p-[10px] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:flex sm:h-full sm:w-auto sm:flex-col sm:items-stretch sm:justify-between sm:rounded-none sm:border-0 sm:bg-transparent sm:p-4 sm:shadow-none sm:backdrop-blur-none">
                                            <div className="flex min-w-0 flex-col items-start">
                                                <span className="inline-flex w-max max-w-none whitespace-nowrap rounded-full bg-white/18 px-2.5 py-0.5 text-[10px] font-black leading-none text-white backdrop-blur">
                                                    {formatDate(day.date, lang)}
                                                </span>
                                                <p className="mt-0.5 whitespace-nowrap !text-[1.3rem] font-black leading-none tracking-tight sm:mt-2 sm:!text-[2.5rem]">{formatTemperature(day.temperatureMax)}</p>
                                            </div>

                                            <div className="min-w-0 overflow-visible text-right sm:text-left">
                                                <p className="line-clamp-1 text-sm font-black">{getWeatherLabel(day.weatherCode, lang)}</p>
                                                <p className="mt-1 -ml-8 whitespace-nowrap text-xs font-bold leading-none text-white/84 sm:ml-0 sm:whitespace-normal sm:leading-relaxed">
                                                    <span>{text.high} {formatTemperature(day.temperatureMax)}</span> <span>{text.low} {formatTemperature(day.temperatureMin)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    {hasMobileHiddenDays ? (
                        <button
                            type="button"
                            aria-expanded={showAllMobileDays}
                            onClick={() => setShowAllMobileDays((current) => !current)}
                            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition hover:bg-blue-500 active:scale-[0.99] sm:hidden"
                        >
                            {moreButtonLabel}
                        </button>
                    ) : null}
                    </>
                ) : null}
            </section>
        </div>
    );
}
