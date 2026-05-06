"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BluewolfScrollArea } from "@/components/ui/BluewolfScrollArea";

export type SelectOption = {
    value: string | number;
    label: string;
};

type DropdownProps = {
    value: string | number;
    options: readonly SelectOption[];
    onChange: (value: string) => void;
    className?: string;
    isDark?: boolean;
};

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
    const ref = useRef<T | null>(null);
    const latest = useRef(onOutside);

    useEffect(() => {
        latest.current = onOutside;
    }, [onOutside]);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) latest.current();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return ref;
}

export function Dropdown({
    value,
    options,
    onChange,
    className = "",
    isDark = false,
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    const ref = useClickOutside<HTMLDivElement>(close);
    const selected =
        options.find((option) => String(option.value) === String(value)) ?? options[0];

    const triggerClass = `h-14 w-full rounded-2xl border px-5 pr-14 text-left text-[16px] font-semibold outline-none transition-[border-color,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDark
            ? `border-white/10 bg-slate-950 text-slate-100 ${open
                ? "border-blue-400 bg-slate-900 ring-4 ring-blue-500/10"
                : "hover:border-white/15"
            }`
            : `border-slate-200 bg-slate-50 text-slate-900 ${open
                ? "border-blue-300 bg-white ring-4 ring-blue-50"
                : "hover:border-slate-300"
            }`
        }`;

    const menuClass = `absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-2xl border shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
        }`;

    return (
        <div ref={ref} className={`relative ${open ? "z-[90]" : "z-10"} ${className}`}>
            <button type="button" onClick={() => setOpen((v) => !v)} className={triggerClass}>
                {selected.label}
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
                    <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className={`h-5 w-5 stroke-[2.2] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDark ? "stroke-slate-300" : "stroke-slate-500"
                            } ${open ? "rotate-180" : ""}`}
                    >
                        <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            {open && (
                <div className={`${menuClass} apple-pop-in`}>
                    <BluewolfScrollArea className="max-h-[360px] p-2">
                        {options.map((option) => {
                            const active = String(option.value) === String(value);

                            return (
                                <button
                                    key={String(option.value)}
                                    type="button"
                                    onClick={() => {
                                        onChange(String(option.value));
                                        setOpen(false);
                                    }}
                                    className={`flex w-full rounded-xl px-4 py-3 text-left text-[16px] font-semibold transition-colors duration-150 ${active
                                            ? "bg-blue-600 text-white"
                                            : isDark
                                                ? "text-slate-200 hover:bg-slate-800"
                                                : "text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </BluewolfScrollArea>
                </div>
            )}
        </div>
    );
}
