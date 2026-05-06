"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { CloudField } from "@/components/effects/CloudField";
import { StarField } from "@/components/effects/StarField";

export function HomeHeroBackdrop({
    isDark,
    destinationImage,
}: {
    isDark: boolean;
    destinationImage: string | null;
}) {
    const imageLayerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const imageLayer = imageLayerRef.current;
        if (!destinationImage || !imageLayer) return;

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mediaQuery.matches) return;

        let frameId = 0;

        const updatePosition = (event: MouseEvent) => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(() => {
                const x = (event.clientX / window.innerWidth - 0.5) * 2;
                const y = (event.clientY / window.innerHeight - 0.5) * 2;

                imageLayer.style.transform = `scale(1.06) translate3d(${x * 16}px, ${y * 10}px, 0)`;
            });
        };

        const resetPosition = () => {
            window.cancelAnimationFrame(frameId);
            imageLayer.style.transform = "scale(1.06) translate3d(0, 0, 0)";
        };

        window.addEventListener("mousemove", updatePosition);
        window.addEventListener("mouseleave", resetPosition);
        resetPosition();

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("mousemove", updatePosition);
            window.removeEventListener("mouseleave", resetPosition);
            imageLayer.style.transform = "scale(1.06) translate3d(0, 0, 0)";
        };
    }, [destinationImage]);

    return (
        <>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
                style={{
                    background: isDark ? "#06102e" : "transparent",
                    opacity: !destinationImage && isDark ? 1 : 0,
                    transition: "opacity 0.85s ease, background 0.85s ease",
                }}
            >
                <StarField />
            </div>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
                style={{
                    opacity: !destinationImage && !isDark ? 1 : 0,
                    transition: "opacity 0.85s ease",
                }}
            >
                <CloudField />
            </div>
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[760px] overflow-hidden"
                style={{
                    opacity: destinationImage ? 1 : 0,
                    transition: "opacity 0.85s ease",
                }}
            >
                {destinationImage ? (
                    <>
                        <div
                            ref={imageLayerRef}
                            className="absolute inset-[-24px] will-change-transform"
                            style={{
                                transform: "scale(1.06) translate3d(0, 0, 0)",
                                transition: "transform 180ms ease-out",
                            }}
                        >
                            <Image
                                key={destinationImage}
                                src={destinationImage}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
                        </div>
                        <span className="absolute inset-0 bg-black/35" />
                    </>
                ) : null}
            </div>
        </>
    );
}
