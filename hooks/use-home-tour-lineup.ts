"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { type Locale } from "@/lib/bluewolf-data";

export function scrollLineupContainer(
    containerRef: RefObject<HTMLDivElement | null>,
    direction: "previous" | "next"
) {
    const container = containerRef.current;
    if (!container) return;

    container.scrollBy({
        left: direction === "next" ? container.clientWidth * 0.82 : -container.clientWidth * 0.82,
        behavior: "smooth",
    });
}

export function useHomeTourLineup(lang: Locale, tourCount: number) {
    const lineupRef = useRef<HTMLDivElement | null>(null);
    const [scrollbar, setScrollbar] = useState({
        canScroll: false,
        thumbLeft: 0,
        thumbWidth: 100,
    });

    const updateScrollbar = useCallback(() => {
        const container = lineupRef.current;
        if (!container) return;

        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (maxScrollLeft <= 0) {
            setScrollbar({
                canScroll: false,
                thumbLeft: 0,
                thumbWidth: 100,
            });
            return;
        }

        const thumbWidth = Math.max(14, (container.clientWidth / container.scrollWidth) * 100);
        const thumbLeft = (container.scrollLeft / maxScrollLeft) * (100 - thumbWidth);

        setScrollbar({
            canScroll: true,
            thumbLeft,
            thumbWidth,
        });
    }, []);

    const scrollToPointer = useCallback((clientX: number, trackElement: HTMLElement) => {
        const container = lineupRef.current;
        if (!container) return;

        const rect = trackElement.getBoundingClientRect();
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

        container.scrollTo({
            left: ratio * maxScrollLeft,
            behavior: "auto",
        });
    }, []);

    const handleScrollbarPointerDown = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            event.preventDefault();

            const trackElement = event.currentTarget;
            scrollToPointer(event.clientX, trackElement);

            const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
                scrollToPointer(moveEvent.clientX, trackElement);
            };
            const handlePointerUp = () => {
                window.removeEventListener("pointermove", handlePointerMove);
                window.removeEventListener("pointerup", handlePointerUp);
            };

            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp);
        },
        [scrollToPointer]
    );

    useEffect(() => {
        lineupRef.current?.scrollTo({ left: 0 });
        window.requestAnimationFrame(updateScrollbar);
    }, [lang, tourCount, updateScrollbar]);

    useEffect(() => {
        const frameId = window.requestAnimationFrame(updateScrollbar);
        window.addEventListener("resize", updateScrollbar);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateScrollbar);
        };
    }, [updateScrollbar]);

    return {
        lineupRef,
        scrollbar,
        handleLineupScroll: updateScrollbar,
        handleScrollbarPointerDown,
        scrollLineup: (direction: "previous" | "next") => scrollLineupContainer(lineupRef, direction),
    };
}
