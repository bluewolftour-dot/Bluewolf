"use client";

import { useEffect, useState } from "react";
import { slides, type Locale } from "@/lib/bluewolf-data";
import { type CmsHomeContent } from "@/lib/cms-home";

export function useHomeHero(homeContent: CmsHomeContent, lang: Locale) {
    const [slideIndex, setSlideIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [heroDestinationImage, setHeroDestinationImage] = useState<string | null>(null);
    const hero = homeContent.heroSlides[lang].length > 0 ? homeContent.heroSlides[lang] : slides[lang];
    const currentSlide = hero[slideIndex % hero.length];

    useEffect(() => {
        if (paused) return;

        const durationMs = 4200;
        const timerId = window.setTimeout(() => {
            setSlideIndex((prev) => (prev + 1) % hero.length);
        }, durationMs);

        return () => window.clearTimeout(timerId);
    }, [hero.length, paused, slideIndex]);

    return {
        hero,
        currentSlide,
        slideIndex,
        setSlideIndex,
        paused,
        setPaused,
        heroDestinationImage,
        setHeroDestinationImage,
        resetSlide: () => setSlideIndex(0),
    };
}
