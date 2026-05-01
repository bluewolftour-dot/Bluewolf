"use client";

import { useState } from "react";

type CloudDef = {
    id: string;
    w: number;
    h: number;
    top: string;
    blur: number;
    opacity: number;
    duration: number;
    delay: number;
    seed: number;
    scale: number;
};

function createSeededRandom(seed: number) {
    let state = seed >>> 0;

    return () => {
        state += 0x6d2b79f5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function CloudField() {
    const [clouds] = useState<CloudDef[]>(() => {
        const count = 9;
        const referenceDuration = 72;
        const random = createSeededRandom(20260330);

        return Array.from({ length: count }, (_, index) => {
            const w = 160 + random() * 200;
            const h = w * (0.44 + random() * 0.14);
            const blur = 30 + random() * 32;
            const opacity = 0.82 + random() * 0.18;
            const duration = 55 + random() * 40;
            const shadowYPercent = 5 + random() * 80;
            const top = `calc(${shadowYPercent.toFixed(2)}% - 400px)`;
            const slot = index / count;
            const jitter = (random() - 0.5) * (1 / count) * 0.4;
            const delay = -((slot + jitter) * referenceDuration);
            const seed = Math.floor(random() * 30) + 1;
            const scale = 145 + random() * 45;

            return { id: `cwf-${index}`, w, h, top, blur, opacity, duration, delay, seed, scale };
        });
    });

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: "inherit" }}>
            <div className="absolute inset-0 bg-[linear-gradient(165deg,#1a5faa_0%,#2e82cc_28%,#50a4e2_55%,#78c0ef_78%,#a6d8f7_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_42%,rgba(14,50,105,0.26)_100%)]" />
            <svg width="0" height="0" className="absolute">
                <defs>
                    {clouds.map((cloud) => (
                        <filter key={cloud.id} id={cloud.id}>
                            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="10" seed={String(cloud.seed)} />
                            <feDisplacementMap in="SourceGraphic" scale={String(Math.round(cloud.scale))} />
                        </filter>
                    ))}
                </defs>
            </svg>
            <style>{`@keyframes cwDrift { from { left: 110%; } to { left: -80%; } }`}</style>
            {clouds.map((cloud) => (
                <div
                    key={cloud.id}
                    style={{
                        width: `${Math.round(cloud.w)}px`,
                        height: `${Math.round(cloud.h)}px`,
                        borderRadius: "50%",
                        filter: `url(#${cloud.id})`,
                        boxShadow: `400px 400px ${Math.round(cloud.blur)}px 0px rgba(255,255,255,${cloud.opacity.toFixed(2)})`,
                        position: "absolute",
                        top: cloud.top,
                        animation: `cwDrift ${cloud.duration.toFixed(1)}s linear ${cloud.delay.toFixed(1)}s infinite backwards`,
                    }}
                />
            ))}
        </div>
    );
}
