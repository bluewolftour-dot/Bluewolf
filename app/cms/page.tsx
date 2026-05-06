"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CmsSidebar, getCmsCategoryFromParam } from "@/components/cms/CmsSidebar";
import { CommunityCmsEditor } from "@/components/cms/CommunityCmsEditor";
import { CmsImageLibraryManager } from "@/components/cms/CmsImageLibraryManager";
import { HomeCmsEditor } from "@/components/cms/HomeCmsEditor";
import { TourCmsOverview } from "@/components/cms/TourCmsOverview";
import { CmsUnsavedChangesGuard } from "@/components/cms/CmsUnsavedChangesGuard";
import { AdminGate } from "@/components/auth/AdminGate";
import { PageShell, usePage } from "@/components/layout/PageShell";
import {
    defaultCmsCommunityContent,
    normalizeCmsCommunityContent,
    type CmsCommunityContent,
} from "@/lib/cms-community";
import {
    defaultCmsHomeContent,
    normalizeCmsHomeContent,
    type CmsHomeContent,
} from "@/lib/cms-home";
import { tours as defaultTours, type Tour } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

function serializeJson<T>(value: T) {
    return JSON.stringify(value);
}

function CmsContent() {
    const { isDark, lang } = usePage();
    const searchParams = useSearchParams();
    const activeCategory = getCmsCategoryFromParam(searchParams.get("category"));

    const [homeContent, setHomeContent] = useState<CmsHomeContent>(defaultCmsHomeContent);
    const [loadingHome, setLoadingHome] = useState(true);
    const [homeError, setHomeError] = useState<string | null>(null);

    const [tours, setTours] = useState<Tour[]>(defaultTours);
    const [loadingTours, setLoadingTours] = useState(true);
    const [tourError, setTourError] = useState<string | null>(null);

    const [communityContent, setCommunityContent] =
        useState<CmsCommunityContent>(defaultCmsCommunityContent);
    const [savedCommunityContent, setSavedCommunityContent] =
        useState<CmsCommunityContent>(defaultCmsCommunityContent);
    const [loadingCommunity, setLoadingCommunity] = useState(true);
    const [communityError, setCommunityError] = useState<string | null>(null);
    const [savingCommunity, setSavingCommunity] = useState(false);
    const [communitySaved, setCommunitySaved] = useState(false);

    useEffect(() => {
        void (async () => {
            try {
                const response = await fetch("/api/cms/home", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error("CMS_HOME_FETCH_FAILED");
                }

                const data = (await response.json()) as { home: CmsHomeContent };
                setHomeContent(normalizeCmsHomeContent(data.home));
                setHomeError(null);
            } catch {
                setHomeError("CMS API 연결에 실패해 기본 데이터를 표시하고 있습니다.");
            } finally {
                setLoadingHome(false);
            }
        })();
    }, []);

    useEffect(() => {
        void (async () => {
            try {
                const response = await fetch("/api/cms/community", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error("CMS_COMMUNITY_FETCH_FAILED");
                }

                const data = (await response.json()) as { community: CmsCommunityContent };
                const normalized = normalizeCmsCommunityContent(data.community);
                setCommunityContent(normalized);
                setSavedCommunityContent(normalized);
                setCommunityError(null);
            } catch {
                setCommunityError(
                    "커뮤니티 CMS API 연결에 실패해 기본 커뮤니티 데이터를 표시하고 있습니다."
                );
            } finally {
                setLoadingCommunity(false);
            }
        })();
    }, []);

    useEffect(() => {
        void (async () => {
            try {
                const response = await fetch("/api/cms/tours", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error("CMS_TOURS_FETCH_FAILED");
                }

                const data = (await response.json()) as { tours: Tour[] };
                setTours(data.tours.length > 0 ? data.tours : defaultTours);
                setTourError(
                    data.tours.length > 0
                        ? null
                        : "등록된 상품이 없어 기본 투어 데이터를 표시하고 있습니다."
                );
            } catch {
                setTourError("투어 CMS API 연결에 실패해 기본 투어 데이터를 표시하고 있습니다.");
            } finally {
                setLoadingTours(false);
            }
        })();
    }, []);

    const communityDirty = useMemo(
        () => serializeJson(communityContent) !== serializeJson(savedCommunityContent),
        [communityContent, savedCommunityContent]
    );

    const communityItems = communityContent.items.ko;
    const counts = {
        review: communityItems.filter((item) => item.type === "review").length,
        mate: communityItems.filter((item) => item.type === "mate").length,
        qna: communityItems.filter((item) => item.type === "qna").length,
    };

    const panelTone = isDark
        ? "border-white/10 bg-slate-900 text-slate-100"
        : "border-slate-200 bg-white text-slate-900";

    return (
        <AdminGate isDark={isDark}>
            <CmsUnsavedChangesGuard
                when={activeCategory === "community" && communityDirty}
                isDark={isDark}
            />

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5">
                <CmsSidebar
                    activeCategory={activeCategory}
                    toursCount={tours.length}
                    counts={counts}
                    isDark={isDark}
                    hrefBuilder={(category) => withLocaleQuery(`/cms?category=${category}`, lang)}
                />

                <section className={`min-w-0 rounded-[28px] border p-5 shadow-sm sm:p-6 ${panelTone}`}>
                    {activeCategory === "home" ? (
                        <HomeCmsEditor
                            homeContent={homeContent}
                            isDark={isDark}
                            loading={loadingHome}
                            error={homeError}
                        />
                    ) : null}

                    {activeCategory === "tours" ? (
                        <div className="space-y-4">
                            {tourError ? (
                                <p
                                    className={`rounded-2xl px-3 py-2 text-xs font-bold ${
                                        isDark
                                            ? "bg-amber-500/10 text-amber-300"
                                            : "bg-amber-50 text-amber-700"
                                    }`}
                                >
                                    {tourError}
                                </p>
                            ) : null}
                            {loadingTours ? (
                                <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
                                    투어 CMS 데이터를 불러오는 중입니다...
                                </p>
                            ) : null}
                            <TourCmsOverview
                                tours={tours}
                                isDark={isDark}
                                regionHrefBuilder={(region) =>
                                    withLocaleQuery(`/cms/tours/${region}`, lang)
                                }
                                optionsHref={withLocaleQuery("/cms/tours/options", lang)}
                                regionImagesHref={withLocaleQuery("/cms/tours/region-images", lang)}
                                customizeHref={withLocaleQuery("/cms/tours/customize", lang)}
                                themesHref={withLocaleQuery("/cms/tours/themes", lang)}
                            />
                        </div>
                    ) : null}

                    {activeCategory === "community" ? (
                        <CommunityCmsEditor
                            content={communityContent}
                            onChange={(updater) => {
                                setCommunityContent((current) => updater(current));
                                setCommunitySaved(false);
                            }}
                            onSave={async () => {
                                setSavingCommunity(true);
                                setCommunitySaved(false);

                                try {
                                    const response = await fetch("/api/cms/community", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(communityContent),
                                    });

                                    if (!response.ok) {
                                        throw new Error("CMS_COMMUNITY_SAVE_FAILED");
                                    }

                                    const data = (await response.json()) as {
                                        community: CmsCommunityContent;
                                    };
                                    const normalized = normalizeCmsCommunityContent(data.community);
                                    setCommunityContent(normalized);
                                    setSavedCommunityContent(normalized);
                                    setCommunitySaved(true);
                                    setCommunityError(null);
                                } catch {
                                    setCommunityError(
                                        "커뮤니티 삭제 내용 저장에 실패했습니다. 잠시 후 다시 시도해주세요."
                                    );
                                } finally {
                                    setSavingCommunity(false);
                                }
                            }}
                            saved={communitySaved}
                            saving={savingCommunity}
                            loading={loadingCommunity}
                            error={communityError}
                            isDark={isDark}
                        />
                    ) : null}

                    {activeCategory === "library" ? (
                        <CmsImageLibraryManager isDark={isDark} />
                    ) : null}
                </section>
            </div>
        </AdminGate>
    );
}

export default function CmsPage() {
    return (
        <Suspense fallback={null}>
            <PageShell activeKey="home">
                <CmsContent />
            </PageShell>
        </Suspense>
    );
}
