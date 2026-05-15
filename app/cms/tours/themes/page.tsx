"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CmsSidebar } from "@/components/cms/CmsSidebar";
import { TourThemeCmsEditor } from "@/components/cms/TourThemeCmsEditor";
import { CmsUnsavedChangesGuard } from "@/components/cms/CmsUnsavedChangesGuard";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { cmsTourRegions } from "@/lib/cms-tour-admin";
import {
    createCmsTourTheme,
    defaultCmsTourThemesContent,
    normalizeCmsTourThemesContent,
    type CmsTourThemesContent,
} from "@/lib/cms-tour-themes";
import { community, tours as defaultTours, type Tour } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

function serializeJson<T>(value: T) {
    return JSON.stringify(value);
}

function TourThemesCmsContent() {
    const { isDark, lang } = usePage();
    const [tours, setTours] = useState<Tour[]>(defaultTours);
    const [tourThemesContent, setTourThemesContent] = useState<CmsTourThemesContent>(
        defaultCmsTourThemesContent
    );
    const [savedTourThemesContent, setSavedTourThemesContent] =
        useState<CmsTourThemesContent>(defaultCmsTourThemesContent);
    const [themesError, setThemesError] = useState<string | null>(null);
    const [savingThemes, setSavingThemes] = useState(false);
    const [themesSaved, setThemesSaved] = useState(false);

    useEffect(() => {
        void (async () => {
            try {
                const response = await fetch("/api/cms/tours", { cache: "no-store" });
                if (!response.ok) return;

                const data = (await response.json()) as { tours: Tour[] };
                if (data.tours.length > 0) {
                    setTours(data.tours);
                }
            } catch {
                // Keep default tours count when the API is unavailable.
            }
        })();
    }, []);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/tour-themes", {
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error("CMS_TOUR_THEMES_FETCH_FAILED");
                }

                const data = (await response.json()) as {
                    tourThemes: CmsTourThemesContent;
                };
                if (!active) return;

                const normalized = normalizeCmsTourThemesContent(data.tourThemes);
                setTourThemesContent(normalized);
                setSavedTourThemesContent(normalized);
                setThemesError(null);
            } catch {
                if (!active) return;
                setTourThemesContent(defaultCmsTourThemesContent);
                setSavedTourThemesContent(defaultCmsTourThemesContent);
                setThemesError(
                    "테마 데이터를 불러오지 못해 기본 테마 목록을 표시하고 있습니다."
                );
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const themesDirty = useMemo(
        () => serializeJson(tourThemesContent) !== serializeJson(savedTourThemesContent),
        [savedTourThemesContent, tourThemesContent]
    );

    const counts = {
        review: community.ko.filter((item) => item.type === "review").length,
        mate: community.ko.filter((item) => item.type === "mate").length,
        qna: community.ko.filter((item) => item.type === "qna").length,
    };
    const panelTone = isDark
        ? "border-white/10 bg-slate-900 text-slate-100"
        : "border-slate-200 bg-white text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const themeUsageCounts = useMemo(
        () =>
            tours.reduce<Record<string, number>>((acc, tour) => {
                acc[tour.theme] = (acc[tour.theme] ?? 0) + 1;
                return acc;
            }, {}),
        [tours]
    );

    const handleSaveThemes = async () => {
        setSavingThemes(true);
        setThemesSaved(false);

        try {
            const response = await fetch("/api/cms/tour-themes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tourThemesContent),
            });

            if (!response.ok) {
                throw new Error("CMS_TOUR_THEMES_SAVE_FAILED");
            }

            const data = (await response.json()) as { tourThemes: CmsTourThemesContent };
            const normalized = normalizeCmsTourThemesContent(data.tourThemes);
            setTourThemesContent(normalized);
            setSavedTourThemesContent(normalized);
            setThemesSaved(true);
            setThemesError(null);
        } catch {
            setThemesError("테마 데이터를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setSavingThemes(false);
        }
    };

    const handleUpdateThemeLabel = (
        themeKey: string,
        locale: "ko" | "ja" | "en",
        value: string
    ) => {
        setTourThemesContent((current) => ({
            themes: current.themes.map((theme) =>
                theme.key === themeKey
                    ? {
                          ...theme,
                          label: {
                              ...theme.label,
                              [locale]: value,
                          },
                      }
                    : theme
            ),
        }));
        setThemesSaved(false);
        setThemesError(null);
    };

    const handleAddTheme = (themeLabel: string) => {
        setTourThemesContent((current) => ({
            themes: [...current.themes, createCmsTourTheme(current, themeLabel)],
        }));
        setThemesSaved(false);
        setThemesError(null);
    };

    const handleDeleteTheme = (themeKey: string) => {
        const usageCount = themeUsageCounts[themeKey] ?? 0;
        if (tourThemesContent.themes.length <= 1) {
            setThemesError("마지막 남은 테마는 삭제할 수 없습니다.");
            return;
        }

        if (usageCount > 0) {
            setThemesError("이 테마를 사용하는 상품이 있어 삭제할 수 없습니다.");
            return;
        }

        setTourThemesContent((current) => ({
            themes: current.themes.filter((theme) => theme.key !== themeKey),
        }));
        setThemesSaved(false);
        setThemesError(null);
    };

    return (
        <>
            <CmsUnsavedChangesGuard when={themesDirty} isDark={isDark} />

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5">
                <CmsSidebar
                    activeCategory="tours"
                    toursCount={tours.length}
                    counts={counts}
                    isDark={isDark}
                    hrefBuilder={(category) => withLocaleQuery(`/cms?category=${category}`, lang)}
                />

                <div className="min-w-0 space-y-6">
                    <div className={`rounded-[28px] border p-5 shadow-sm sm:p-6 ${panelTone}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <Link
                                    href={withLocaleQuery("/cms?category=tours", lang)}
                                    className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                                        isDark
                                            ? "text-slate-300 hover:text-white"
                                            : "text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    <span aria-hidden>←</span>
                                    <span>투어상품 CMS로 돌아가기</span>
                                </Link>
                                <h1 className="type-display mt-3">
                                    테마 관리
                                </h1>
                                <p className={`mt-2 text-sm ${mutedTone}`}>
                                    상품 카드와 상세 페이지에 쓰이는 공통 테마를 추가, 삭제하고
                                    언어별 이름을 관리합니다.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            {cmsTourRegions.map((region) => (
                                <Link
                                    key={region.key}
                                    href={withLocaleQuery(`/cms/tours/${region.key}`, lang)}
                                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                                        isDark
                                            ? "bg-slate-950 text-slate-100 hover:bg-slate-800"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {region.label}
                                </Link>
                            ))}
                            <Link
                                href={withLocaleQuery("/cms/tours/region-images", lang)}
                                className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                                    isDark
                                        ? "bg-slate-950 text-slate-100 hover:bg-slate-800"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                여행지 선택 이미지
                            </Link>
                            <Link
                                href={withLocaleQuery("/cms/tours/customize", lang)}
                                className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                                    isDark
                                        ? "bg-slate-950 text-slate-100 hover:bg-slate-800"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                커스텀 여행지 / 시작 금액
                            </Link>
                            <Link
                                href={withLocaleQuery("/cms/tours/options", lang)}
                                className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                                    isDark
                                        ? "bg-slate-950 text-slate-100 hover:bg-slate-800"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                추가옵션 설정
                            </Link>
                            <Link
                                href={withLocaleQuery("/cms/tours/themes", lang)}
                                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors"
                            >
                                테마 관리
                            </Link>
                        </div>
                    </div>

                    <TourThemeCmsEditor
                        content={tourThemesContent}
                        tours={tours}
                        usageCounts={themeUsageCounts}
                        isDark={isDark}
                        saving={savingThemes}
                        saved={themesSaved}
                        error={themesError}
                        onSave={() => void handleSaveThemes()}
                        onUpdateThemeLabel={handleUpdateThemeLabel}
                        onAddTheme={handleAddTheme}
                        onDeleteTheme={handleDeleteTheme}
                    />
                </div>
            </div>
        </>
    );
}

export default function TourThemesCmsPage() {
    return (
        <PageShell activeKey="home">
            <TourThemesCmsContent />
        </PageShell>
    );
}
