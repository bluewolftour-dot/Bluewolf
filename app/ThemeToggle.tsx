"use client";

import { useState } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/SafeIcons";
import { useTheme } from "./theme";

export function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    const [animationKey, setAnimationKey] = useState(0);

    function handleToggle() {
        setAnimationKey((current) => current + 1);
        toggleTheme();
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            aria-label={isDark ? "라이트모드로 전환" : "다크모드로 전환"}
            className={`group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border transition-[background-color,border-color,transform] duration-700 ease-in-out ${isDark
                    ? "border-white/10 bg-slate-900 text-yellow-300 hover:bg-slate-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
        >
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_62%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span
                key={`${isDark ? "moon" : "sun"}-${animationKey}`}
                className="relative animate-theme-icon-swap"
                aria-hidden="true"
            >
                {isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </span>
        </button>
    );
}
