"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CmsSidebar } from "@/components/cms/CmsSidebar";
import { CmsUnsavedChangesGuard } from "@/components/cms/CmsUnsavedChangesGuard";
import { TourRegionImageCmsEditor } from "@/components/cms/TourRegionImageCmsEditor";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { cmsTourRegions } from "@/lib/cms-tour-admin";
import {
    defaultCmsTourRegionCardsContent,
    normalizeCmsTourRegionCardsContent,
    type CmsTourRegionCardsContent,
} from "@/lib/cms-tour-region-cards";
import { community, tours as defaultTours, type Tour } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

function serializeJson<T>(value: T) {
    return JSON.stringify(value);
}

function TourRegionImagesContent() {
    const { isDark, lang } = usePage();
    const [tours, setTours] = useState<Tour[]>(defaultTours);
    const [regionCardsContent, setRegionCardsContent] = useState<CmsTourRegionCardsContent>(
        defaultCmsTourRegionCardsContent
    );
    const [savedRegionCardsContent, setSavedRegionCardsContent] =
        useState<CmsTourRegionCardsContent>(defaultCmsTourRegionCardsContent);
    const [regionCardsError, setRegionCardsError] = useState<string | null>(null);
    const [savingRegionCards, setSavingRegionCards] = useState(false);
    const [regionCardsSaved, setRegionCardsSaved] = useState(false);

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
                const response = await fetch("/api/cms/tour-region-cards", {
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error("CMS_TOUR_REGION_CARDS_FETCH_FAILED");
                }

                const data = (await response.json()) as {
                    regionCards: CmsTourRegionCardsContent;
                };
                if (!active) return;

                const normalized = normalizeCmsTourRegionCardsContent(data.regionCards);
                setRegionCardsContent(normalized);
                setSavedRegionCardsContent(normalized);
                setRegionCardsError(null);
            } catch {
                if (!active) return;
                setRegionCardsContent(defaultCmsTourRegionCardsContent);
                setSavedRegionCardsContent(defaultCmsTourRegionCardsContent);
                setRegionCardsError(
                    "여행지 선택 카드 이미지를 불러오지 못해 기본 이미지를 표시하고 있습니다."
                );
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const regionCardsDirty = useMemo(
        () => serializeJson(regionCardsContent) !== serializeJson(savedRegionCardsContent),
        [regionCardsContent, savedRegionCardsContent]
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

    const handleSaveRegionCards = async () => {
        setSavingRegionCards(true);
        setRegionCardsSaved(false);

        try {
            const response = await fetch("/api/cms/tour-region-cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regionCardsContent),
            });

            if (!response.ok) {
                throw new Error("CMS_TOUR_REGION_CARDS_SAVE_FAILED");
            }

            const data = (await response.json()) as {
                regionCards: CmsTourRegionCardsContent;
            };
            const normalized = normalizeCmsTourRegionCardsContent(data.regionCards);
            setRegionCardsContent(normalized);
            setSavedRegionCardsContent(normalized);
            setRegionCardsSaved(true);
            setRegionCardsError(null);
        } catch {
            setRegionCardsError(
                "여행지 선택 카드 이미지를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."
            );
        } finally {
            setSavingRegionCards(false);
        }
    };

    return (
        <>
            <CmsUnsavedChangesGuard when={regionCardsDirty} isDark={isDark} />

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
                                    여행지 선택 이미지
                                </h1>
                                <p className={`mt-2 text-sm ${mutedTone}`}>
                                    “어디로 여행을 떠나고 싶으신가요?” 영역의 카드 이미지를
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
                                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors"
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
                        </div>
                    </div>

                    <TourRegionImageCmsEditor
                        content={regionCardsContent}
                        isDark={isDark}
                        saving={savingRegionCards}
                        saved={regionCardsSaved}
                        error={regionCardsError}
                        onSave={() => void handleSaveRegionCards()}
                        onUpdate={(region, value) => {
                            setRegionCardsContent((current) => ({
                                images: {
                                    ...current.images,
                                    [region]: value,
                                },
                            }));
                            setRegionCardsSaved(false);
                        }}
                    />
                </div>
            </div>
        </>
    );
}

export default function TourRegionImagesPage() {
    return (
        <PageShell activeKey="home">
            <TourRegionImagesContent />
        </PageShell>
    );
}
