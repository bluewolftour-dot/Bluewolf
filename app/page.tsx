"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { copy, slides, type Locale } from "@/lib/bluewolf-data";
import { buildAccountMenuItems } from "@/lib/account-menu";
import { authCopy } from "@/lib/auth-copy";
import { getLocaleFromSearchParam, withLocaleQuery } from "@/lib/locale-routing";
import { useCmsCommunityContent } from "@/lib/use-cms-community";
import { useCmsHomeContent } from "@/lib/use-cms-home";
import { useCmsTours } from "@/lib/use-cms-tours";
import { useCmsTourThemes } from "@/lib/use-cms-tour-themes";
import { getTourTagColorClassName, normalizeTourTags } from "@/lib/tour-tags";
import { formatPrice } from "@/lib/bluewolf-utils";
import { buildHeaderNav } from "@/lib/header-nav";
import { HeroSection } from "@/components/sections/HeroSection";
import { PromoBannerSection } from "@/components/sections/PromoBannerSection";
import { CloudField } from "@/components/effects/CloudField";
import { StarField } from "@/components/effects/StarField";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useTheme } from "./theme";

const homeExtra = {
    ko: {
        featuredTitle: "인기 여행 코스",
        featuredDesc: "블루울프 대표 투어 상품을 만나보세요.",
        viewAll: "투어 전체 보기",
        reserveNow: "예약하기",
        reviewTitle: "여행자들의 이야기",
        ctaTitle: "지금 바로 몽골 여행을 시작해보세요",
        ctaDesc: "입문형부터 프리미엄까지, 당신에게 맞는 일정으로 바로 예약 상담이 가능합니다.",
        ctaButton: "예약 상담 시작",
        ctaSecondary: "투어 살펴보기",
        priceFrom: "부터",
    },
    ja: {
        featuredTitle: "人気ツアー",
        featuredDesc: "BlueWolfの代表的なツアーをご覧ください。",
        viewAll: "ツアー一覧を見る",
        reserveNow: "予約する",
        reviewTitle: "旅行者のレビュー",
        ctaTitle: "今すぐモンゴル旅行を始めよう",
        ctaDesc: "入門コースからプレミアムまで、ご希望の日程で予約相談ができます。",
        ctaButton: "予約相談を開始",
        ctaSecondary: "ツアーを見る",
        priceFrom: "から",
    },
    en: {
        featuredTitle: "Featured Tours",
        featuredDesc: "Explore BlueWolf's most popular itineraries.",
        viewAll: "View all tours",
        reserveNow: "Book now",
        reviewTitle: "Traveler stories",
        ctaTitle: "Start your Mongolia journey today",
        ctaDesc: "From first-timers to premium travelers, get a quote for your perfect itinerary.",
        ctaButton: "Start booking",
        ctaSecondary: "Browse tours",
        priceFrom: " from",
    },
} as const;

const noticeCopy = {
    ko: {
        title: "공지사항",
        viewAll: "전체보기",
        empty: "현재 등록된 공지사항이 없습니다.",
    },
    ja: {
        title: "お知らせ",
        viewAll: "一覧へ",
        empty: "現在登録されたお知らせはありません。",
    },
    en: {
        title: "Notices",
        viewAll: "View all",
        empty: "There are no notices yet.",
    },
} as const;

function HomeContent() {
    const { isDark } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = getLocaleFromSearchParam(searchParams.get("lang")) ?? "ko";
    const [slideIndex, setSlideIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [heroDestinationImage, setHeroDestinationImage] = useState<string | null>(null);
    const lineupRef = useRef<HTMLDivElement | null>(null);

    const t = copy[lang];
    const h = homeExtra[lang];
    const authText = authCopy[lang];
    const { homeContent, loaded: homeLoaded } = useCmsHomeContent();
    const { communityContent } = useCmsCommunityContent();
    const notices = communityContent.notices[lang].slice(0, 3);
    const noticeText = noticeCopy[lang];
    const hero = homeContent.heroSlides[lang].length > 0 ? homeContent.heroSlides[lang] : slides[lang];
    const { tourItems: tours, loaded: toursLoaded } = useCmsTours();
    const { resolveThemeLabel } = useCmsTourThemes(lang);
    const currentSlide = hero[slideIndex % hero.length];

    const navItems = useMemo(
        () => buildHeaderNav({ locale: lang, t }),
        [lang, t]
    );
    const accountMenuItems = useMemo(
        () => buildAccountMenuItems(lang),
        [lang]
    );

    const reviews = communityContent.items[lang].filter((item) => item.type === "review");
    const loopReviews = useMemo(
        () => {
            if (reviews.length <= 1) return reviews;

            const minimumCards = 12;
            const repeatCount = Math.max(2, Math.ceil(minimumCards / reviews.length));

            return Array.from({ length: repeatCount }, () => reviews).flat();
        },
        [reviews]
    );
    useEffect(() => {
        if (paused) return;

        const durationMs = 4200;
        const timerId = window.setTimeout(() => {
            setSlideIndex((prev) => (prev + 1) % hero.length);
        }, durationMs);

        return () => window.clearTimeout(timerId);
    }, [hero.length, paused, slideIndex]);

    useEffect(() => {
        lineupRef.current?.scrollTo({ left: 0 });
    }, [lang, tours.length]);

    const changeLanguage = (nextLang: Locale) => {
        setSlideIndex(0);
        const currentHref = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        router.replace(withLocaleQuery(currentHref, nextLang));
    };

    const scrollLineupContainer = (
        containerRef: RefObject<HTMLDivElement | null>,
        direction: "previous" | "next"
    ) => {
        const container = containerRef.current;
        if (!container) return;

        container.scrollBy({
            left: direction === "next" ? container.clientWidth * 0.82 : -container.clientWidth * 0.82,
            behavior: "smooth",
        });
    };

    return (
        <div
            className={`relative flex min-h-screen flex-col overflow-x-hidden [font-family:var(--font-noto-sans-cjk),sans-serif] transition-colors duration-300 ${
                isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
            }`}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
                style={{
                    background: isDark ? "#06102e" : "transparent",
                    opacity: !heroDestinationImage && isDark ? 1 : 0,
                    transition: "opacity 0.85s ease, background 0.85s ease",
                }}
            >
                <StarField />
            </div>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
                style={{
                    opacity: !heroDestinationImage && !isDark ? 1 : 0,
                    transition: "opacity 0.85s ease",
                }}
            >
                <CloudField />
            </div>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[760px] overflow-hidden"
                style={{
                    opacity: heroDestinationImage ? 1 : 0,
                    transition: "opacity 0.85s ease",
                }}
            >
                {heroDestinationImage ? (
                    <>
                        <Image
                            key={heroDestinationImage}
                            src={heroDestinationImage}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="100vw"
                        />
                        <span className="absolute inset-0 bg-black/35" />
                    </>
                ) : null}
            </div>

            <SiteHeader
                brand={t.brand}
                navItems={navItems}
                activeKey="home"
                loginLabel={t.login}
                loginHref={withLocaleQuery("/login", lang)}
                logoutLabel={authText.logout}
                accountMenuItems={accountMenuItems}
                isDark={isDark}
                rightSlot={
                    <LanguageSwitcher
                        currentLocale={lang}
                        isDark={isDark}
                        mode="button"
                        onChange={changeLanguage}
                    />
                }
            />

            <main
                key={`${pathname}-${lang}`}
                className="animate-site-page-enter mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 py-4 sm:gap-5 sm:py-6 lg:gap-6"
            >
                {/* BlueWolf 배경 단독 섹션 */}
                <section
                    className="relative left-1/2 z-30 min-h-[430px] w-screen -translate-x-1/2 overflow-visible lg:min-h-[560px]"
                    style={{
                        background: "transparent",
                        transition: "background 0.85s ease",
                    }}
                >
                    <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-4 overflow-visible px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-5 lg:px-12">
                        <HeroSection
                            t={t}
                            currentSlide={currentSlide}
                            hero={hero}
                            lang={lang}
                            slideIndex={slideIndex}
                            setSlideIndex={setSlideIndex}
                            paused={paused}
                            setPaused={setPaused}
                            isDark={isDark}
                            showImages={homeLoaded}
                            onDestinationImageChange={setHeroDestinationImage}
                        />
                    </div>
                </section>

                {/* 추천 투어 미리보기 */}
                <section
                    className={`relative left-1/2 w-screen -translate-x-1/2 py-12 sm:py-16 ${
                        isDark ? "bg-slate-950" : "bg-[#f5f5f7]"
                    }`}
                    style={{
                        "--featured-content-width": "min(1280px, 100vw)",
                        "--featured-gutter": "max(1.25rem, calc((100vw - 1280px) / 2 + 3rem))",
                    } as CSSProperties}
                >
                    <div className="mx-auto flex w-[var(--featured-content-width)] items-start justify-between gap-4 px-5 sm:px-8 lg:px-12">
                        <div className="min-w-0">
                            <h2 className={`text-[28px] font-black leading-tight tracking-[-0.03em] sm:text-[40px] ${isDark ? "text-white" : "text-black"}`}>
                                {h.featuredTitle}
                            </h2>
                            <p className={`text-[14px] font-semibold leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                {h.featuredDesc}
                            </p>
                        </div>
                        <Link
                            href={withLocaleQuery("/tours", lang)}
                            className="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-colors duration-300 hover:bg-blue-500 sm:text-[14px]"
                        >
                            {h.viewAll}
                        </Link>
                    </div>

                    <div
                        ref={lineupRef}
                        className="relative mt-9 snap-x snap-mandatory overflow-x-auto pb-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-11"
                        style={{
                            scrollPaddingLeft: "var(--featured-gutter)",
                            scrollPaddingRight: "var(--featured-gutter)",
                        }}
                    >
                        <div
                            className="flex w-max min-w-fit gap-5 sm:gap-7"
                            style={{
                                paddingLeft: "var(--featured-gutter)",
                                paddingRight: "var(--featured-gutter)",
                            }}
                        >
                            {tours.map((tour) => {
                                const cmsTags = normalizeTourTags(tour.tags[lang]);
                                const lineupTags = (
                                    cmsTags.length > 0
                                        ? cmsTags
                                        : [resolveThemeLabel(tour.theme), tour.duration[lang]]
                                ).slice(0, 4);

                                return (
                                    <article
                                        key={`${tour.id}-apple-lineup`}
                                        className="flex w-[78vw] shrink-0 snap-start flex-col sm:w-[360px] lg:w-[390px]"
                                    >
                                        <Link
                                            href={withLocaleQuery(`/tours/${tour.id}`, lang)}
                                            className={`group relative block h-[280px] overflow-hidden rounded-[30px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.015] sm:h-[320px] ${
                                                isDark ? "bg-slate-900" : "bg-white"
                                            }`}
                                        >
                                            {toursLoaded ? (
                                                <Image
                                                    src={tour.heroImage}
                                                    alt={tour.title[lang]}
                                                    fill
                                                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                                                    sizes="(max-width: 640px) 78vw, 390px"
                                                />
                                            ) : (
                                                <div className={`absolute inset-0 ${isDark ? "bg-slate-900" : "bg-slate-200"}`} />
                                            )}
                                        </Link>

                                        <div className="mt-4 flex h-5 items-center gap-1.5">
                                            {lineupTags.map((tag) => (
                                                <span
                                                    key={`${tour.id}-lineup-tag-${tag}`}
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-black leading-none ${getTourTagColorClassName(tag, tour.tagColors?.[lang]?.[tag])}`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className={`mt-12 text-[21px] font-black leading-tight tracking-[-0.02em] ${isDark ? "text-white" : "text-black"}`}>
                                            {tour.title[lang]}
                                        </h3>
                                        <p className={`mt-4 line-clamp-2 text-[14px] font-medium leading-[1.55] ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                                            {tour.desc[lang]}
                                        </p>
                                        <p className={`mt-4 text-[14px] font-black ${isDark ? "text-white" : "text-black"}`}>
                                            {formatPrice(tour.price)}{h.priceFrom}
                                        </p>
                                        <div className="mt-10 flex justify-end">
                                            <Link
                                                href={withLocaleQuery(`/tours/${tour.id}`, lang)}
                                                className="rounded-full bg-blue-600 px-5 py-2.5 text-[14px] font-black text-white transition-colors duration-300 hover:bg-blue-500"
                                            >
                                                {lang === "ko" ? "이 플랜 보기" : lang === "ja" ? "このプランを見る" : "View plan"}
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hidden">
                        <button
                            type="button"
                            onClick={() => scrollLineupContainer(lineupRef, "previous")}
                            aria-label="Previous tour lineup"
                            className={`grid h-9 w-9 place-items-center rounded-full text-xl font-black transition-colors duration-300 ${
                                isDark
                                    ? "bg-white/10 text-white hover:bg-white/15"
                                    : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                            }`}
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollLineupContainer(lineupRef, "next")}
                            aria-label="Next tour lineup"
                            className={`grid h-9 w-9 place-items-center rounded-full text-xl font-black transition-colors duration-300 ${
                                isDark
                                    ? "bg-white/10 text-white hover:bg-white/15"
                                    : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                            }`}
                        >
                            ›
                        </button>
                    </div>
                </section>

                <div className="px-5 sm:px-8 lg:px-12">
                    <PromoBannerSection isDark={isDark} banners={homeContent.promoBanners} lang={lang} showImages={homeLoaded} />
                </div>

                {/* 여행자 후기 */}
                {reviews.length > 0 && (
                    <section
                        className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-4"
                        style={{
                            "--review-content-width": "min(1280px, 100vw)",
                            "--review-gutter": "clamp(1.25rem, 5vw, 2rem)",
                            "--review-loop-width": "min(1184px, calc(100vw - 6rem))",
                        } as CSSProperties}
                    >
                        <div className="mx-auto mb-4 flex w-[var(--review-content-width)] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
                            <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                                {h.reviewTitle}
                            </h2>
                            <Link
                                href={withLocaleQuery("/community/reviews", lang)}
                                className={`shrink-0 text-sm font-black transition-colors ${
                                    isDark ? "text-slate-100 hover:text-blue-300" : "text-slate-950 hover:text-blue-600"
                                }`}
                            >
                                {lang === "ko" ? "더보기" : lang === "ja" ? "もっと見る" : "More"} 〉
                            </Link>
                        </div>

                        <div
                            className="review-marquee-window group/reviews relative overflow-hidden lg:mx-auto lg:w-[var(--review-loop-width)]"
                        >
                            <div className="animate-review-marquee flex w-max gap-3 sm:gap-4 group-hover/reviews:[animation-play-state:paused]">
                                {loopReviews.map((review, loopIndex) => {
                                    const backgroundImage = review.photos?.[0];
                                    const hasPhoto = Boolean(backgroundImage);
                                    const rating = Math.max(1, Math.min(5, review.rating ?? 5));

                                    return (
                                        <Link
                                            key={`${review.id}-${loopIndex}`}
                                            href={withLocaleQuery("/community/reviews", lang)}
                                            className={`group relative h-[270px] w-[200px] shrink-0 overflow-hidden rounded-[18px] sm:h-[300px] sm:w-[220px] ${
                                                hasPhoto
                                                    ? "bg-slate-900 text-white"
                                                    : isDark
                                                      ? "border border-white/10 bg-slate-950 text-slate-100"
                                                      : "border border-slate-200 bg-slate-50 text-slate-900"
                                            }`}
                                        >
                                            {hasPhoto ? (
                                                <>
                                                    <Image
                                                        src={backgroundImage!}
                                                        alt={review.tourTitle ?? review.author}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                                        sizes="220px"
                                                    />
                                                    <span className="absolute inset-0 bg-black/35" />
                                                    <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/72 via-black/30 to-transparent" />
                                                </>
                                            ) : null}

                                            <div className="relative z-10 flex h-full flex-col p-3.5">
                                                <div className="inline-flex w-fit items-center gap-0.5 rounded-sm bg-amber-400 px-1.5 py-1 text-[10px] font-black text-white">
                                                    {Array.from({ length: rating }).map((_, starIndex) => (
                                                        <svg key={starIndex} viewBox="0 0 20 20" className="h-3 w-3 fill-current">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>

                                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center">
                                                    <p className={`line-clamp-5 text-[14px] font-black leading-relaxed ${hasPhoto ? "text-white drop-shadow" : ""}`}>
                                                        {review.text}
                                                    </p>
                                                </div>

                                                <div className={`mt-auto text-center text-xs font-bold ${hasPhoto ? "text-white/85" : isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                    {review.author}
                                                    {review.tourTitle ? ` · ${review.tourTitle}` : ""}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA 배너 */}
                <div className="px-5 sm:px-8 lg:px-12">
                    <section
                        className={`overflow-hidden rounded-[28px] border ${
                            isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                        }`}
                    >
                        <div className="flex items-center gap-3 px-5 py-6 sm:px-8">
                            <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-950"}`}>
                                {noticeText.title}
                            </h2>
                            <Link
                                href={withLocaleQuery("/community/notices", lang)}
                                className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-4 text-sm font-black text-white shadow-[0_8px_18px_rgba(37,99,235,0.24)] transition-colors hover:bg-blue-500"
                            >
                                {noticeText.viewAll}
                            </Link>
                        </div>
                        <div className={`divide-y ${isDark ? "divide-white/10 border-t border-white/10" : "divide-slate-200 border-t border-slate-200"}`}>
                            {notices.length > 0 ? (
                                notices.map((notice) => {
                                    const href = notice.href || "/community/notices";

                                    return (
                                        <Link
                                            key={notice.id}
                                            href={withLocaleQuery(href, lang)}
                                            className={`grid gap-3 px-5 py-5 transition-colors sm:grid-cols-[120px_24px_1fr] sm:items-center sm:px-8 ${
                                                isDark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-slate-50"
                                            }`}
                                        >
                                            <span className={`text-sm font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                {notice.date}
                                            </span>
                                            <span className="hidden text-xl font-black text-blue-600 sm:block">›</span>
                                            <span className="line-clamp-1 text-base font-semibold">{notice.title}</span>
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className={`px-5 py-8 text-sm sm:px-8 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {noticeText.empty}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <SiteFooter brand={t.brand} description={t.footer} isDark={isDark} locale={lang} />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <HomeContent />
        </Suspense>
    );
}
