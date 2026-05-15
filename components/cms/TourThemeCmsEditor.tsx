"use client";

import { type ReactNode, useMemo, useState } from "react";
import { type Locale, type Tour } from "@/lib/bluewolf-data";
import { CmsLocaleTabs, localeLabels } from "@/components/cms/CmsLocaleTabs";
import { type CmsTourThemesContent } from "@/lib/cms-tour-themes";

function Field({
    label,
    value,
    onChange,
    tone,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    tone: string;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-bold">{label}</span>
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`h-12 rounded-2xl border px-4 ${tone}`}
            />
        </label>
    );
}

function SectionCard({
    title,
    desc,
    mutedTone,
    isDark,
    actions,
    children,
}: {
    title: string;
    desc: string;
    mutedTone: string;
    isDark: boolean;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section
            className={`rounded-[28px] border p-5 sm:p-6 ${
                isDark ? "border-white/10 bg-slate-950/60" : "border-slate-200 bg-white"
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="type-title-md">{title}</h3>
                    <p className={`mt-1 text-sm leading-6 ${mutedTone}`}>{desc}</p>
                </div>
                {actions}
            </div>
            <div className="mt-5 flex flex-col gap-4">{children}</div>
        </section>
    );
}

export function TourThemeCmsEditor({
    content,
    tours,
    usageCounts,
    isDark,
    saving,
    saved,
    error,
    onSave,
    onUpdateThemeLabel,
    onAddTheme,
    onDeleteTheme,
}: {
    content: CmsTourThemesContent;
    tours: Tour[];
    usageCounts: Record<string, number>;
    isDark: boolean;
    saving: boolean;
    saved: boolean;
    error: string | null;
    onSave: () => void;
    onUpdateThemeLabel: (themeKey: string, locale: Locale, value: string) => void;
    onAddTheme: (themeLabel: string) => void;
    onDeleteTheme: (themeKey: string) => void;
}) {
    const tone = isDark
        ? "border-white/10 bg-slate-950 text-slate-100"
        : "border-slate-200 bg-slate-50 text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const [activeLocale, setActiveLocale] = useState<Locale>("ko");
    const [themeDrafts, setThemeDrafts] = useState<Record<Locale, string>>({
        ko: "",
        ja: "",
        en: "",
    });
    const [openThemeKeys, setOpenThemeKeys] = useState<Record<string, boolean>>({});

    const currentThemeDraft = themeDrafts[activeLocale];
    const themeUsageTours = useMemo(
        () =>
            tours.reduce<Record<string, Tour[]>>((acc, tour) => {
                const key = tour.theme;
                acc[key] = [...(acc[key] ?? []), tour];
                return acc;
            }, {}),
        [tours]
    );

    const setThemeDraft = (value: string) => {
        setThemeDrafts((current) => ({ ...current, [activeLocale]: value }));
    };

    const handleAddTheme = () => {
        const nextLabel = currentThemeDraft.trim();
        if (!nextLabel) return;
        onAddTheme(nextLabel);
        setThemeDraft("");
    };

    const toggleThemeProducts = (themeKey: string) => {
        setOpenThemeKeys((current) => ({
            ...current,
            [themeKey]: !current[themeKey],
        }));
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="type-title-lg">테마 관리</h2>
                    <p className={`mt-1 text-sm ${mutedTone}`}>
                        상품 카드와 상세 페이지에 쓰이는 공통 테마를 언어별로 관리합니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? "저장 중..." : saved ? "저장 완료" : "변경사항 저장"}
                </button>
            </div>

            <CmsLocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} isDark={isDark} />

            {error ? (
                <p
                    className={`rounded-2xl px-3 py-2 text-xs font-bold ${
                        isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"
                    }`}
                >
                    {error}
                </p>
            ) : null}

            <SectionCard
                title="새 테마 추가"
                desc={`${localeLabels[activeLocale]} 기준 이름으로 새 테마를 만듭니다. 키는 내부에서 자동 생성됩니다.`}
                mutedTone={mutedTone}
                isDark={isDark}
                actions={
                    <button
                        type="button"
                        onClick={handleAddTheme}
                        className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                    >
                        테마 추가
                    </button>
                }
            >
                <div className="max-w-2xl">
                    <Field
                        label={`${localeLabels[activeLocale]} 테마명`}
                        value={currentThemeDraft}
                        onChange={setThemeDraft}
                        tone={tone}
                    />
                </div>
            </SectionCard>

            <SectionCard
                title="등록된 테마"
                desc="테마별로 사용 중인 상품을 펼쳐서 볼 수 있고, 미사용 테마만 삭제할 수 있습니다."
                mutedTone={mutedTone}
                isDark={isDark}
            >
                <div className="flex flex-col gap-4">
                    {content.themes.map((theme) => {
                        const usageCount = usageCounts[theme.key] ?? 0;
                        const canDeleteTheme = content.themes.length > 1 && usageCount === 0;
                        const isOpen = openThemeKeys[theme.key] ?? false;
                        const usedTours = themeUsageTours[theme.key] ?? [];

                        return (
                            <div
                                key={theme.key}
                                className={`rounded-[24px] border p-4 ${
                                    isDark
                                        ? "border-white/10 bg-slate-950/70"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-black">{theme.key}</p>
                                        <p className={`mt-1 text-xs ${mutedTone}`}>
                                            사용 중 {usageCount}개 상품
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {usageCount > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleThemeProducts(theme.key)}
                                                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                                                    isDark
                                                        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                }`}
                                            >
                                                <span>사용 중인 상품 보기</span>
                                                <svg
                                                    viewBox="0 0 20 20"
                                                    className={`h-4 w-4 transition-transform duration-300 ${
                                                        isOpen ? "rotate-180" : ""
                                                    }`}
                                                    fill="none"
                                                    aria-hidden
                                                >
                                                    <path
                                                        d="M5 7.5L10 12.5L15 7.5"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => onDeleteTheme(theme.key)}
                                            disabled={!canDeleteTheme}
                                            className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                                                canDeleteTheme
                                                    ? isDark
                                                        ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                                        : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                    : isDark
                                                      ? "bg-slate-800 text-slate-500"
                                                      : "bg-slate-200 text-slate-400"
                                            }`}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 max-w-2xl">
                                    <Field
                                        label={`${localeLabels[activeLocale]} 테마명`}
                                        value={theme.label[activeLocale]}
                                        onChange={(value) =>
                                            onUpdateThemeLabel(theme.key, activeLocale, value)
                                        }
                                        tone={tone}
                                    />
                                </div>

                                {usageCount > 0 ? (
                                    <div
                                        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                        }`}
                                    >
                                        <div className="overflow-hidden">
                                            <div
                                                className={`mt-4 rounded-[20px] border p-4 ${
                                                    isDark
                                                        ? "border-white/10 bg-slate-900/80"
                                                        : "border-slate-200 bg-slate-50"
                                                }`}
                                            >
                                                <p className="text-sm font-black">사용 중인 상품</p>
                                                <div className="mt-3 flex flex-col gap-3">
                                                    {usedTours.map((tour) => (
                                                        <div
                                                            key={tour.id}
                                                            className={`rounded-2xl border px-4 py-3 ${
                                                                isDark
                                                                    ? "border-white/10 bg-slate-950"
                                                                    : "border-slate-200 bg-white"
                                                            }`}
                                                        >
                                                            <p className="text-sm font-black">
                                                                #{tour.id} {tour.title[activeLocale]}
                                                            </p>
                                                            <p className={`mt-1 text-xs ${mutedTone}`}>
                                                                {tour.duration[activeLocale]}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {!canDeleteTheme ? (
                                    <p className={`mt-3 text-xs ${mutedTone}`}>
                                        {content.themes.length <= 1
                                            ? "마지막 남은 테마는 삭제할 수 없습니다."
                                            : "이 테마를 사용하는 상품이 있어 삭제할 수 없습니다."}
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </SectionCard>
        </div>
    );
}
