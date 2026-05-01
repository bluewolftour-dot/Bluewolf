"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { type Locale } from "@/lib/bluewolf-data";
import { type CmsPromoBanner } from "@/lib/cms-home";
import { withLocaleQuery } from "@/lib/locale-routing";

const badgeByLocale: Record<Locale, string> = {
    ko: "기간한정",
    ja: "期間限定",
    en: "Limited",
};

export function PromoBannerSection({
    isDark,
    banners,
    lang,
    showImages,
}: {
    isDark: boolean;
    banners: CmsPromoBanner[];
    lang: Locale;
    showImages: boolean;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentBanner = banners[currentIndex];

    useEffect(() => {
        if (banners.length <= 1) return;

        const timer = window.setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 3500);

        return () => window.clearInterval(timer);
    }, [banners.length]);

    if (banners.length === 0) return null;

    return (
        <section
            className={`overflow-hidden rounded-[24px] border shadow-sm transition-colors duration-300 sm:rounded-[28px] ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
        >
            <div className="relative min-h-[180px] sm:min-h-[240px] lg:min-h-[280px]">
                {showImages ? (
                    banners.map((banner, index) => (
                        <div
                            key={`${banner.image}-${index}`}
                            className={`absolute inset-0 transition-opacity duration-700 ${
                                index === currentIndex ? "opacity-100" : "pointer-events-none opacity-0"
                            }`}
                        >
                            <Image
                                src={banner.image}
                                alt={banner.alt[lang]}
                                fill
                                priority={index === 0}
                                className="object-cover"
                                sizes="100vw"
                            />
                        </div>
                    ))
                ) : (
                    <div className={`absolute inset-0 ${isDark ? "bg-slate-950" : "bg-slate-100"}`} />
                )}

                <a
                    href={withLocaleQuery(currentBanner?.href || "/tours", lang)}
                    className="absolute inset-0 z-10"
                    aria-label="Open promo banner destination"
                />

                <div
                    className={`absolute inset-0 ${
                        isDark
                            ? "bg-[linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.08)_45%,rgba(2,6,23,0.18)_100%)]"
                            : "bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.04)_45%,rgba(15,23,42,0.12)_100%)]"
                    }`}
                />

                <div className="pointer-events-none relative z-20 flex min-h-[180px] flex-col justify-between p-4 sm:min-h-[240px] sm:p-6 lg:min-h-[280px] lg:p-8">
                    <div className="flex justify-start">
                        <span className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] sm:text-sm">
                            {badgeByLocale[lang]}
                        </span>
                    </div>

                    <div className="pointer-events-auto flex items-center justify-center gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`banner-${index + 1}`}
                                className={`h-2.5 rounded-full transition-all ${
                                    index === currentIndex
                                        ? "w-8 bg-blue-600"
                                        : isDark
                                          ? "w-2.5 bg-white/35 hover:bg-white/60"
                                          : "w-2.5 bg-white/70 hover:bg-white"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
