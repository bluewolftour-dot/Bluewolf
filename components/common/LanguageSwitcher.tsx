"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Locale = "ko" | "ja" | "en";

const items: { key: Locale; label: string; href: string }[] = [
    { key: "ko", label: "KO", href: "/about" },
    { key: "ja", label: "JA", href: "/about/ja" },
    { key: "en", label: "EN", href: "/about/en" },
];

function FlagIcon({ locale }: { locale: Locale }) {
    if (locale === "ja") {
        return (
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 rounded-full" aria-hidden="true">
                <circle cx="12" cy="12" r="12" fill="#fff" />
                <circle cx="12" cy="12" r="5" fill="#BC002D" />
            </svg>
        );
    }

    if (locale === "en") {
        return (
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 rounded-full" aria-hidden="true">
                <clipPath id="flag-us-circle">
                    <circle cx="12" cy="12" r="12" />
                </clipPath>
                <g clipPath="url(#flag-us-circle)">
                    <rect width="24" height="24" fill="#fff" />
                    {Array.from({ length: 7 }).map((_, index) => (
                        <rect key={index} y={index * 4} width="24" height="2" fill="#B22234" />
                    ))}
                    <rect width="11" height="10" fill="#3C3B6E" />
                    {Array.from({ length: 9 }).map((_, index) => (
                        <circle key={index} cx={2 + (index % 3) * 3} cy={2 + Math.floor(index / 3) * 3} r="0.45" fill="#fff" />
                    ))}
                </g>
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 rounded-full" aria-hidden="true">
            <circle cx="12" cy="12" r="12" fill="#fff" />
            <circle cx="12" cy="12" r="4.2" fill="#CD2E3A" />
            <path d="M12 7.8a4.2 4.2 0 0 1 0 8.4 2.1 2.1 0 0 0 0-4.2 2.1 2.1 0 0 1 0-4.2Z" fill="#0047A0" />
            <g stroke="#111827" strokeWidth="1" strokeLinecap="round">
                <path d="M5.2 5.6 7 7.4M6.4 4.4 8.2 6.2M4 6.8 5.8 8.6" />
                <path d="M17 16.6 18.8 18.4M15.8 17.8 17.6 19.6M18.2 15.4 20 17.2" />
                <path d="M18.8 5.6 17 7.4M17.6 4.4 15.8 6.2M20 6.8 18.2 8.6" />
                <path d="M7 16.6 5.2 18.4M8.2 17.8 6.4 19.6M5.8 15.4 4 17.2" />
            </g>
        </svg>
    );
}

export function LanguageSwitcher({
    currentLocale,
    isDark,
    mode,
    onChange,
}: {
    currentLocale: Locale;
    isDark: boolean;
    mode: "button" | "link";
    onChange?: (locale: Locale) => void;
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const currentItem = items.find((item) => item.key === currentLocale) ?? items[0];
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) close();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [close]);

    return (
        <div
            ref={wrapperRef}
            className={`relative inline-flex h-11 min-w-[104px] items-center rounded-2xl border transition-colors duration-300 ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
        >
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className={`flex h-full w-full items-center justify-between gap-2 rounded-2xl px-3 text-sm font-black transition ${
                    open
                        ? "bg-blue-600 text-white"
                        : isDark
                          ? "text-slate-100 hover:bg-white/10"
                          : "text-slate-800 hover:bg-slate-50"
                }`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2">
                    <FlagIcon locale={currentItem.key} />
                    <span>{currentItem.label}</span>
                </span>
                <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`h-4 w-4 stroke-[2.4] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open ? (
                <div
                    className={`absolute right-0 top-[calc(100%+8px)] z-[90] w-36 overflow-hidden rounded-2xl border p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] ${
                        isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                    }`}
                    role="listbox"
                >
                    {items.map((item) => {
                        const active = item.key === currentLocale;
                        const itemClass = `flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-black transition ${
                            active
                                ? "bg-blue-600 text-white"
                                : isDark
                                  ? "text-slate-200 hover:bg-slate-800"
                                  : "text-slate-700 hover:bg-slate-100"
                        }`;

                        if (mode === "button") {
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    className={itemClass}
                                    onClick={() => {
                                        onChange?.(item.key);
                                        close();
                                    }}
                                    role="option"
                                    aria-selected={active}
                                >
                                    <FlagIcon locale={item.key} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={itemClass}
                                onClick={close}
                                role="option"
                                aria-selected={active}
                            >
                                <FlagIcon locale={item.key} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
