"use client";

import { type Locale } from "@/lib/bluewolf-data";

export const editableLocales = ["ko", "ja", "en"] as const satisfies readonly Locale[];

export const localeLabels: Record<Locale, string> = {
    ko: "한국어",
    ja: "일본어",
    en: "영어",
};

export function CmsLocaleTabs({
    activeLocale,
    onChange,
    isDark,
}: {
    activeLocale: Locale;
    onChange: (locale: Locale) => void;
    isDark: boolean;
}) {
    return (
        <div
            className={`flex flex-wrap gap-2 rounded-[20px] border p-2 ${
                isDark ? "border-white/10 bg-slate-950/70" : "border-slate-200 bg-white"
            }`}
        >
            {editableLocales.map((locale) => (
                <button
                    key={locale}
                    type="button"
                    onClick={() => onChange(locale)}
                    className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                        activeLocale === locale
                            ? "bg-blue-600 text-white"
                            : isDark
                              ? "bg-slate-900 text-slate-200 hover:bg-slate-800"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                    {localeLabels[locale]}
                </button>
            ))}
        </div>
    );
}
