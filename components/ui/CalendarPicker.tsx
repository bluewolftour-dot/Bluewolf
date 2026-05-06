"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Locale } from "@/lib/bluewolf-data";

type CalendarPickerProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    weekdays: readonly string[];
    deleteLabel: string;
    todayLabel: string;
    locale: Locale;
    isDark?: boolean;
    minDate?: string;
    defaultViewDate?: string;
    compactOnMobile?: boolean;
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

function parseDateValue(raw: string) {
    const date = raw ? new Date(raw) : null;
    return date && !Number.isNaN(date.getTime())
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate())
        : null;
}

export function CalendarPicker({
    value,
    onChange,
    placeholder,
    weekdays,
    deleteLabel,
    todayLabel,
    locale,
    isDark = false,
    minDate = "",
    defaultViewDate = "",
    compactOnMobile = false,
}: CalendarPickerProps) {
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    const ref = useClickOutside<HTMLDivElement>(close);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const minSelectableDate = useMemo(() => parseDateValue(minDate), [minDate]);
    const viewBaseDate = parseDateValue(value) ?? parseDateValue(defaultViewDate) ?? minSelectableDate ?? todayStart;
    const selectableStart =
        minSelectableDate && minSelectableDate > todayStart ? minSelectableDate : todayStart;
    const baseDate = viewBaseDate;
    const [view, setView] = useState(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));

    useEffect(() => {
        const next = parseDateValue(value) ?? parseDateValue(defaultViewDate) ?? minSelectableDate;
        if (next) {
            const frameId = window.requestAnimationFrame(() => {
                setView(new Date(next.getFullYear(), next.getMonth(), 1));
            });

            return () => {
                window.cancelAnimationFrame(frameId);
            };
        }
    }, [defaultViewDate, minDate, minSelectableDate, value]);

    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const toValue = (date: Date) => {
        const y = date.getFullYear();
        const m = `${date.getMonth() + 1}`.padStart(2, "0");
        const d = `${date.getDate()}`.padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const normalize = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const toLabel = (raw: string) => {
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return placeholder;
        const y = date.getFullYear();
        const m = `${date.getMonth() + 1}`.padStart(2, "0");
        const d = `${date.getDate()}`.padStart(2, "0");
        return locale === "en"
            ? `${y}-${m}-${d}`
            : locale === "ja"
                ? `${y}年 ${m}月 ${d}日`
                : `${y}년 ${m}월 ${d}일`;
    };

    const days: Array<{ date: Date; current: boolean }> = [];
    for (let i = firstDay - 1; i >= 0; i -= 1) {
        days.push({ date: new Date(year, month - 1, prevMonthDays - i), current: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
        days.push({ date: new Date(year, month, day), current: true });
    }
    while (days.length < 42) {
        days.push({
            date: new Date(year, month + 1, days.length - (firstDay + daysInMonth) + 1),
            current: false,
        });
    }

    const triggerSizeClass = compactOnMobile
        ? "h-11 rounded-[14px] px-4 pr-12 text-sm sm:h-14 sm:rounded-2xl sm:px-5 sm:pr-14 sm:text-[16px]"
        : "h-14 rounded-2xl px-5 pr-14 text-[16px]";
    const iconClass = compactOnMobile ? "right-4 sm:right-5" : "right-5";
    const iconSizeClass = compactOnMobile ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5";

    const triggerClass = `${triggerSizeClass} w-full border text-left font-semibold outline-none transition ${isDark
            ? `border-white/10 bg-slate-950 ${open
                ? "border-blue-400 bg-slate-900 ring-4 ring-blue-500/10"
                : "hover:border-white/15"
            } ${value ? "text-slate-100" : "text-slate-500"}`
            : `border-slate-200 bg-slate-50 ${open
                ? "border-blue-300 bg-white ring-4 ring-blue-50"
                : "hover:border-slate-300"
            } ${value ? "text-slate-900" : "text-slate-400"}`
        }`;

    const panelClass = `absolute left-0 top-[calc(100%+10px)] z-30 w-[320px] max-w-[calc(100vw-2rem)] rounded-[24px] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
        }`;

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen((v) => !v)} className={triggerClass}>
                {value ? toLabel(value) : placeholder}
                <span
                    className={`pointer-events-none absolute ${iconClass} top-1/2 -translate-y-1/2 ${isDark ? "text-slate-300" : "text-slate-500"
                        }`}
                >
                    <svg viewBox="0 0 20 20" fill="none" className={`${iconSizeClass} stroke-current stroke-[2]`}>
                        <path d="M6.5 2.5V5" strokeLinecap="round" />
                        <path d="M13.5 2.5V5" strokeLinecap="round" />
                        <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
                        <path d="M3 7.5H17" strokeLinecap="round" />
                    </svg>
                </span>
            </button>

            {open && (
                <div className={panelClass}>
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setView(new Date(year, month - 1, 1))}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"
                                }`}
                        >
                            ←
                        </button>
                        <div className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                            {locale === "en"
                                ? `${year}-${`${month + 1}`.padStart(2, "0")}`
                                : locale === "ja"
                                    ? `${year}年 ${`${month + 1}`.padStart(2, "0")}月`
                                    : `${year}년 ${`${month + 1}`.padStart(2, "0")}월`}
                        </div>
                        <button
                            type="button"
                            onClick={() => setView(new Date(year, month + 1, 1))}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"
                                }`}
                        >
                            →
                        </button>
                    </div>

                    <div className={`mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {weekdays.map((label) => (
                            <div key={label} className="py-2">
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map(({ date, current }) => {
                            const cell = toValue(date);
                            const selected = cell === value;
                            const isToday = cell === toValue(todayStart);
                            const isPast = normalize(date) < selectableStart;

                            return (
                                <button
                                    key={cell}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => {
                                        if (isPast) return;
                                        onChange(cell);
                                        setOpen(false);
                                    }}
                                    className={`flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition ${isPast
                                            ? isDark
                                                ? "cursor-not-allowed text-slate-700"
                                                : "cursor-not-allowed text-slate-200"
                                            : selected
                                                ? "bg-blue-600 text-white"
                                                : isToday
                                                    ? isDark
                                                        ? "bg-blue-500/15 text-blue-300"
                                                        : "bg-blue-50 text-blue-700"
                                                    : current
                                                        ? isDark
                                                            ? "text-slate-200 hover:bg-slate-800"
                                                            : "text-slate-800 hover:bg-slate-100"
                                                        : isDark
                                                            ? "text-slate-600 hover:bg-slate-800"
                                                            : "text-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${isDark
                                    ? "text-slate-300 hover:bg-slate-800"
                                    : "text-slate-500 hover:bg-slate-100"
                                }`}
                        >
                            {deleteLabel}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange(toValue(selectableStart));
                                setView(new Date(selectableStart.getFullYear(), selectableStart.getMonth(), 1));
                                setOpen(false);
                            }}
                            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${isDark
                                    ? "bg-blue-500/15 text-blue-300 hover:bg-blue-500/25"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                        >
                            {todayLabel}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
