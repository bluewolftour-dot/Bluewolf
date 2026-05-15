"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CmsSidebar } from "@/components/cms/CmsSidebar";
import { CmsUnsavedChangesGuard } from "@/components/cms/CmsUnsavedChangesGuard";
import { TourCmsEditor } from "@/components/cms/TourCmsEditor";
import { TourOptionsCmsEditor } from "@/components/cms/TourOptionsCmsEditor";
import { PageShell, usePage } from "@/components/layout/PageShell";
import {
    cmsTourRegions,
    createDefaultCmsTour,
    getCmsTourRegionMeta,
    getNextCmsTourId,
    isCmsTourRegion,
} from "@/lib/cms-tour-admin";
import {
    defaultCmsTourOptionsContent,
    normalizeCmsTourOptionsContent,
    type CmsTourOption,
    type CmsTourOptionsContent,
} from "@/lib/cms-tour-options";
import {
    defaultCmsTourThemesContent,
    normalizeCmsTourThemesContent,
    type CmsTourThemesContent,
} from "@/lib/cms-tour-themes";
import {
    community,
    tours as defaultTours,
    type Region,
    type Tour,
} from "@/lib/bluewolf-data";
import { createCmsImagePlaceholders, normalizeCmsTourImages } from "@/lib/cms-image";
import { withLocaleQuery } from "@/lib/locale-routing";

type TourSection = Region | "options";

function serializeJson<T>(value: T) {
    return JSON.stringify(value);
}

function isTourSection(value: string): value is TourSection {
    return value === "options" || isCmsTourRegion(value);
}

function buildNewOption(existing: CmsTourOption[]): CmsTourOption {
    let nextNumber = existing.length + 1;
    let key = `customOption${nextNumber}`;

    while (existing.some((option) => option.key === key)) {
        nextNumber += 1;
        key = `customOption${nextNumber}`;
    }

    return {
        key,
        price: 50000,
        title: {
            ko: `새 옵션 ${nextNumber}`,
            ja: `新しいオプション ${nextNumber}`,
            en: `New option ${nextNumber}`,
        },
        desc: {
            ko: "",
            ja: "",
            en: "",
        },
        details: {
            ko: [],
            ja: [],
            en: [],
        },
        photos: createCmsImagePlaceholders(1),
    };
}

function TourCmsSectionContent() {
    const params = useParams<{ section: string }>();
    const { isDark, lang } = usePage();
    const sectionParam = Array.isArray(params.section) ? params.section[0] : params.section;
    const section = isTourSection(sectionParam) ? sectionParam : "central";
    const isOptionsSection = section === "options";
    const activeRegion: Region | null = !isOptionsSection ? section : null;

    const normalizedDefaultTours = useMemo(() => defaultTours.map(normalizeCmsTourImages), []);

    const [tours, setTours] = useState<Tour[]>(normalizedDefaultTours);
    const [savedTours, setSavedTours] = useState<Tour[]>(normalizedDefaultTours);
    const [persistedIds, setPersistedIds] = useState<number[]>(
        normalizedDefaultTours.map((tour) => tour.id)
    );
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loadingTours, setLoadingTours] = useState(true);
    const [tourError, setTourError] = useState<string | null>(null);
    const [savingTour, setSavingTour] = useState(false);
    const [tourSaved, setTourSaved] = useState(false);

    const [tourOptionsContent, setTourOptionsContent] = useState<CmsTourOptionsContent>(
        defaultCmsTourOptionsContent
    );
    const [savedTourOptionsContent, setSavedTourOptionsContent] =
        useState<CmsTourOptionsContent>(defaultCmsTourOptionsContent);
    const [loadingOptions, setLoadingOptions] = useState(isOptionsSection);
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [savingOptions, setSavingOptions] = useState(false);
    const [optionsSaved, setOptionsSaved] = useState(false);

    const [tourThemesContent, setTourThemesContent] = useState<CmsTourThemesContent>(
        defaultCmsTourThemesContent
    );
    const [loadingThemes, setLoadingThemes] = useState(false);
    const [themeError, setThemeError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/tours", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error("CMS_TOURS_FETCH_FAILED");
                }

                const data = (await response.json()) as { tours: Tour[] };
                if (!active) return;

                const nextTours =
                    data.tours.length > 0
                        ? data.tours.map(normalizeCmsTourImages)
                        : normalizedDefaultTours;

                setTours(nextTours);
                setSavedTours(nextTours);
                setPersistedIds(nextTours.map((tour) => tour.id));
                setTourError(
                    data.tours.length > 0
                        ? null
                        : "등록된 상품이 없어 기본 투어 데이터를 표시하고 있습니다."
                );
            } catch {
                if (!active) return;
                setTours(normalizedDefaultTours);
                setSavedTours(normalizedDefaultTours);
                setPersistedIds(normalizedDefaultTours.map((tour) => tour.id));
                setTourError(
                    "투어 CMS API 연결에 실패해 기본 투어 데이터를 표시하고 있습니다."
                );
            } finally {
                if (active) {
                    setLoadingTours(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [normalizedDefaultTours]);

    useEffect(() => {
        if (!isOptionsSection) {
            setLoadingOptions(false);
            return;
        }

        let active = true;
        setLoadingOptions(true);

        void (async () => {
            try {
                const response = await fetch("/api/cms/tour-options", {
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error("CMS_TOUR_OPTIONS_FETCH_FAILED");
                }

                const data = (await response.json()) as {
                    tourOptions: CmsTourOptionsContent;
                };
                if (!active) return;

                const normalized = normalizeCmsTourOptionsContent(data.tourOptions);
                setTourOptionsContent(normalized);
                setSavedTourOptionsContent(normalized);
                setOptionsError(null);
            } catch {
                if (!active) return;
                setTourOptionsContent(defaultCmsTourOptionsContent);
                setSavedTourOptionsContent(defaultCmsTourOptionsContent);
                setOptionsError(
                    "추가옵션 CMS API 연결에 실패해 기본 옵션 데이터를 표시하고 있습니다."
                );
            } finally {
                if (active) {
                    setLoadingOptions(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [isOptionsSection]);

    useEffect(() => {
        let active = true;
        setLoadingThemes(true);

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

                setTourThemesContent(normalizeCmsTourThemesContent(data.tourThemes));
                setThemeError(null);
            } catch {
                if (!active) return;
                setTourThemesContent(defaultCmsTourThemesContent);
                setThemeError("테마 CMS API 연결에 실패해 기본 테마 목록을 표시하고 있습니다.");
            } finally {
                if (active) {
                    setLoadingThemes(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const regionTours = useMemo(
        () => (activeRegion ? tours.filter((tour) => tour.region === activeRegion) : []),
        [activeRegion, tours]
    );

    const selectedTour = useMemo(
        () => regionTours.find((tour) => tour.id === selectedId) ?? null,
        [regionTours, selectedId]
    );

    const tourDirty = useMemo(
        () => serializeJson(tours) !== serializeJson(savedTours),
        [savedTours, tours]
    );
    const optionsDirty = useMemo(
        () => serializeJson(tourOptionsContent) !== serializeJson(savedTourOptionsContent),
        [savedTourOptionsContent, tourOptionsContent]
    );

    useEffect(() => {
        if (!activeRegion) return;

        if (regionTours.length === 0) {
            setSelectedId(null);
            return;
        }

        if (!regionTours.some((tour) => tour.id === selectedId)) {
            setSelectedId(regionTours[0]?.id ?? null);
        }
    }, [activeRegion, regionTours, selectedId]);

    const counts = {
        review: community.ko.filter((item) => item.type === "review").length,
        mate: community.ko.filter((item) => item.type === "mate").length,
        qna: community.ko.filter((item) => item.type === "qna").length,
    };

    const panelTone = isDark
        ? "border-white/10 bg-slate-900 text-slate-100"
        : "border-slate-200 bg-white text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";

    const handleAddTour = () => {
        if (!activeRegion) return;

        const nextTour = createDefaultCmsTour(activeRegion, getNextCmsTourId(tours));
        const defaultThemeKey = tourThemesContent.themes[0]?.key;
        const nextTourWithTheme = defaultThemeKey
            ? { ...nextTour, theme: defaultThemeKey }
            : nextTour;

        setTours((current) => [...current, nextTourWithTheme]);
        setSelectedId(nextTourWithTheme.id);
        setTourSaved(false);
        setTourError(null);
    };

    const handleSaveTour = async () => {
        if (!selectedTour) return;

        setSavingTour(true);
        setTourSaved(false);

        try {
            const response = await fetch("/api/cms/tours", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedTour),
            });

            if (!response.ok) {
                throw new Error("CMS_TOUR_SAVE_FAILED");
            }

            const data = (await response.json()) as { tour: Tour | null };
            const savedTour = normalizeCmsTourImages(data.tour ?? selectedTour);

            setTours((current) =>
                current.map((tour) => (tour.id === savedTour.id ? savedTour : tour))
            );
            setSavedTours((current) => {
                if (current.some((tour) => tour.id === savedTour.id)) {
                    return current.map((tour) =>
                        tour.id === savedTour.id ? savedTour : tour
                    );
                }

                return [...current, savedTour];
            });
            setPersistedIds((current) =>
                current.includes(savedTour.id) ? current : [...current, savedTour.id]
            );
            setTourSaved(true);
            setTourError(null);
        } catch {
            setTourError("상품 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setSavingTour(false);
        }
    };

    const handleDeleteTour = async () => {
        if (!selectedTour) return;

        const targetId = selectedTour.id;
        const targetWasPersisted = persistedIds.includes(targetId);

        try {
            if (targetWasPersisted) {
                const response = await fetch(`/api/cms/tours?id=${targetId}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    throw new Error("CMS_TOUR_DELETE_FAILED");
                }
            }

            setTours((current) => current.filter((tour) => tour.id !== targetId));
            setSavedTours((current) => current.filter((tour) => tour.id !== targetId));
            setPersistedIds((current) => current.filter((id) => id !== targetId));
            setTourSaved(false);
            setTourError(null);
        } catch {
            setTourError("상품 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    const handleAddOption = () => {
        setTourOptionsContent((current) => ({
            options: [...current.options, buildNewOption(current.options)],
        }));
        setOptionsSaved(false);
        setOptionsError(null);
    };

    const handleDeleteOption = (index: number) => {
        setTourOptionsContent((current) => ({
            options: current.options.filter((_, optionIndex) => optionIndex !== index),
        }));
        setOptionsSaved(false);
    };

    const handleUpdateOption = (
        index: number,
        updater: (option: CmsTourOption) => CmsTourOption
    ) => {
        setTourOptionsContent((current) => ({
            options: current.options.map((option, optionIndex) =>
                optionIndex === index ? updater(option) : option
            ),
        }));
        setOptionsSaved(false);
    };

    const handleSaveOptions = async () => {
        setSavingOptions(true);
        setOptionsSaved(false);

        try {
            const response = await fetch("/api/cms/tour-options", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tourOptionsContent),
            });

            if (!response.ok) {
                throw new Error("CMS_TOUR_OPTIONS_SAVE_FAILED");
            }

            const data = (await response.json()) as {
                tourOptions: CmsTourOptionsContent;
            };
            const normalized = normalizeCmsTourOptionsContent(data.tourOptions);
            setTourOptionsContent(normalized);
            setSavedTourOptionsContent(normalized);
            setOptionsSaved(true);
            setOptionsError(null);
        } catch {
            setOptionsError("추가옵션 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setSavingOptions(false);
        }
    };

    const sectionTitle = isOptionsSection
        ? "추가옵션 설정"
        : `${getCmsTourRegionMeta(activeRegion ?? "central").label} 상품 관리`;
    const sectionDescription = isOptionsSection
        ? "상품 공통으로 사용하는 추가옵션 가격과 옵션 목록을 관리합니다."
        : `${getCmsTourRegionMeta(activeRegion ?? "central").label} 지역 상품을 추가, 삭제, 수정하고 이미지를 관리합니다.`;

    return (
        <>
            <CmsUnsavedChangesGuard
                when={isOptionsSection ? optionsDirty : tourDirty}
                isDark={isDark}
            />

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
                                    {sectionTitle}
                                </h1>
                                <p className={`mt-2 text-sm ${mutedTone}`}>{sectionDescription}</p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            {cmsTourRegions.map((region) => (
                                <Link
                                    key={region.key}
                                    href={withLocaleQuery(`/cms/tours/${region.key}`, lang)}
                                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                                        activeRegion === region.key
                                            ? "bg-blue-600 text-white"
                                            : isDark
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
                                    isOptionsSection
                                        ? "bg-blue-600 text-white"
                                        : isDark
                                          ? "bg-slate-950 text-slate-100 hover:bg-slate-800"
                                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                추가옵션 설정
                            </Link>
                            <Link
                                href={withLocaleQuery("/cms/tours/themes", lang)}
                                className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                                    isDark
                                        ? "bg-slate-950 text-slate-100 hover:bg-slate-800"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                테마 관리
                            </Link>
                        </div>
                    </div>

                    {isOptionsSection ? (
                        <>
                            {loadingOptions ? (
                                <p className={mutedTone}>추가옵션 데이터를 불러오는 중입니다...</p>
                            ) : null}
                            <TourOptionsCmsEditor
                                options={tourOptionsContent.options}
                                isDark={isDark}
                                saving={savingOptions}
                                saved={optionsSaved}
                                error={optionsError}
                                onSave={() => void handleSaveOptions()}
                                onAdd={handleAddOption}
                                onDelete={handleDeleteOption}
                                onUpdate={handleUpdateOption}
                            />
                        </>
                    ) : (
                        <TourCmsEditor
                            regionLabel={getCmsTourRegionMeta(activeRegion ?? "central").label}
                            tours={regionTours}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            selectedTour={selectedTour}
                            onUpdate={(updater) => {
                                setTours((current) =>
                                    current.map((tour) =>
                                        tour.id === selectedId ? updater(tour) : tour
                                    )
                                );
                                setTourSaved(false);
                            }}
                            onSave={() => void handleSaveTour()}
                            onAddTour={handleAddTour}
                            onDeleteTour={() => void handleDeleteTour()}
                            tourThemesContent={tourThemesContent}
                            saving={savingTour}
                            saved={tourSaved}
                            loading={loadingTours || loadingThemes}
                            error={themeError ?? tourError}
                            isDark={isDark}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default function TourCmsSectionPage() {
    return (
        <PageShell activeKey="home">
            <TourCmsSectionContent />
        </PageShell>
    );
}
