"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CmsSidebar } from "@/components/cms/CmsSidebar";
import { TourCustomizeCmsEditor } from "@/components/cms/TourCustomizeCmsEditor";
import { CmsUnsavedChangesGuard } from "@/components/cms/CmsUnsavedChangesGuard";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { cmsTourRegions } from "@/lib/cms-tour-admin";
import {
    createCmsTourCustomizeDestination,
    createCmsTourCustomizeActivity,
    defaultCmsTourCustomizeContent,
    normalizeCmsTourCustomizeContent,
    type CmsTourCustomizeActivity,
    type CmsTourCustomizeContent,
    type CmsTourCustomizeDestination,
} from "@/lib/cms-tour-customize";
import { community, tours as defaultTours, type Region, type Tour } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

function serializeJson<T>(value: T) {
    return JSON.stringify(value);
}

function TourCustomizeCmsContent() {
    const { isDark, lang } = usePage();
    const [tours, setTours] = useState<Tour[]>(defaultTours);
    const [customizeContent, setCustomizeContent] = useState<CmsTourCustomizeContent>(
        defaultCmsTourCustomizeContent
    );
    const [savedCustomizeContent, setSavedCustomizeContent] =
        useState<CmsTourCustomizeContent>(defaultCmsTourCustomizeContent);
    const [customizeError, setCustomizeError] = useState<string | null>(null);
    const [savingCustomize, setSavingCustomize] = useState(false);
    const [customizeSaved, setCustomizeSaved] = useState(false);

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
                // Keep default count when the API is unavailable.
            }
        })();
    }, []);

    useEffect(() => {
        let active = true;

        void (async () => {
            try {
                const response = await fetch("/api/cms/tour-customize", {
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error("CMS_TOUR_CUSTOMIZE_FETCH_FAILED");
                }

                const data = (await response.json()) as {
                    tourCustomize: CmsTourCustomizeContent;
                };
                if (!active) return;

                const normalized = normalizeCmsTourCustomizeContent(data.tourCustomize);
                setCustomizeContent(normalized);
                setSavedCustomizeContent(normalized);
                setCustomizeError(null);
            } catch {
                if (!active) return;
                setCustomizeContent(defaultCmsTourCustomizeContent);
                setSavedCustomizeContent(defaultCmsTourCustomizeContent);
                setCustomizeError(
                    "커스텀 여행지 데이터를 불러오지 못해 기본 데이터를 표시하고 있습니다."
                );
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const customizeDirty = useMemo(
        () => serializeJson(customizeContent) !== serializeJson(savedCustomizeContent),
        [customizeContent, savedCustomizeContent]
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

    const handleSaveCustomize = async () => {
        setSavingCustomize(true);
        setCustomizeSaved(false);

        try {
            const response = await fetch("/api/cms/tour-customize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(customizeContent),
            });

            if (!response.ok) {
                throw new Error("CMS_TOUR_CUSTOMIZE_SAVE_FAILED");
            }

            const data = (await response.json()) as {
                tourCustomize: CmsTourCustomizeContent;
            };
            const normalized = normalizeCmsTourCustomizeContent(data.tourCustomize);
            setCustomizeContent(normalized);
            setSavedCustomizeContent(normalized);
            setCustomizeSaved(true);
            setCustomizeError(null);
        } catch {
            setCustomizeError(
                "커스텀 여행지 데이터를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
            );
        } finally {
            setSavingCustomize(false);
        }
    };

    const updateDestination = (
        region: Region,
        destinationId: string,
        updater: (current: CmsTourCustomizeDestination) => CmsTourCustomizeDestination
    ) => {
        setCustomizeContent((current) => ({
            regions: {
                ...current.regions,
                [region]: {
                    ...current.regions[region],
                    destinations: current.regions[region].destinations.map((destination) =>
                        destination.id === destinationId ? updater(destination) : destination
                    ),
                },
            },
        }));
        setCustomizeSaved(false);
    };

    const updateActivity = (
        region: Region,
        activityId: string,
        updater: (current: CmsTourCustomizeActivity) => CmsTourCustomizeActivity
    ) => {
        setCustomizeContent((current) => ({
            regions: {
                ...current.regions,
                [region]: {
                    ...current.regions[region],
                    activities: current.regions[region].activities.map((activity) =>
                        activity.id === activityId ? updater(activity) : activity
                    ),
                },
            },
        }));
        setCustomizeSaved(false);
    };

    return (
        <>
            <CmsUnsavedChangesGuard when={customizeDirty} isDark={isDark} />

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
                                <h1 className="mt-3 text-3xl font-black tracking-tight">
                                    커스텀 여행지 / 시작 금액
                                </h1>
                                <p className={`mt-2 text-sm ${mutedTone}`}>
                                    커스텀 상세 페이지의 여행지 리스트와 지역별 예상 시작 금액을
                                    관리합니다.
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
                                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors"
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
                        </div>
                    </div>

                    <TourCustomizeCmsEditor
                        content={customizeContent}
                        isDark={isDark}
                        saving={savingCustomize}
                        saved={customizeSaved}
                        error={customizeError}
                        onSave={() => void handleSaveCustomize()}
                        onUpdateBasePrice={(region, value) => {
                            setCustomizeContent((current) => ({
                                regions: {
                                    ...current.regions,
                                    [region]: {
                                        ...current.regions[region],
                                        basePrice: value,
                                    },
                                },
                            }));
                            setCustomizeSaved(false);
                        }}
                        onAddDestination={(region) => {
                            setCustomizeContent((current) => ({
                                regions: {
                                    ...current.regions,
                                    [region]: {
                                        ...current.regions[region],
                                        destinations: [
                                            ...current.regions[region].destinations,
                                            createCmsTourCustomizeDestination(
                                                region,
                                                current.regions[region].destinations.map(
                                                    (destination) => destination.id
                                                )
                                            ),
                                        ],
                                    },
                                },
                            }));
                            setCustomizeSaved(false);
                        }}
                        onDeleteDestination={(region, destinationId) => {
                            setCustomizeContent((current) => ({
                                regions: {
                                    ...current.regions,
                                    [region]: {
                                        ...current.regions[region],
                                        destinations: current.regions[region].destinations.filter(
                                            (destination) => destination.id !== destinationId
                                        ),
                                    },
                                },
                            }));
                            setCustomizeSaved(false);
                        }}
                        onUpdateDestination={updateDestination}
                        onAddActivity={(region) => {
                            setCustomizeContent((current) => ({
                                regions: {
                                    ...current.regions,
                                    [region]: {
                                        ...current.regions[region],
                                        activities: [
                                            ...current.regions[region].activities,
                                            createCmsTourCustomizeActivity(
                                                region,
                                                current.regions[region].activities.map(
                                                    (activity) => activity.id
                                                )
                                            ),
                                        ],
                                    },
                                },
                            }));
                            setCustomizeSaved(false);
                        }}
                        onDeleteActivity={(region, activityId) => {
                            setCustomizeContent((current) => ({
                                regions: {
                                    ...current.regions,
                                    [region]: {
                                        ...current.regions[region],
                                        activities: current.regions[region].activities.filter(
                                            (activity) => activity.id !== activityId
                                        ),
                                    },
                                },
                            }));
                            setCustomizeSaved(false);
                        }}
                        onUpdateActivity={updateActivity}
                    />
                </div>
            </div>
        </>
    );
}

export default function TourCustomizeCmsPage() {
    return (
        <PageShell activeKey="home">
            <TourCustomizeCmsContent />
        </PageShell>
    );
}
