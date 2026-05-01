"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CmsSidebar } from "@/components/cms/CmsSidebar";
import { HomeCmsSectionEditor, homeCmsSectionMeta } from "@/components/cms/HomeCmsSectionEditor";
import { type HomePreviewTarget } from "@/components/cms/HomePreview";
import { CmsUnsavedChangesGuard } from "@/components/cms/CmsUnsavedChangesGuard";
import { useHomeCmsEditorState } from "@/components/cms/useHomeCmsEditorState";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { community, tours as defaultTours } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

const sections = ["hero", "promo"] as const satisfies readonly HomePreviewTarget[];

function isHomeSection(value: string): value is HomePreviewTarget {
    return sections.includes(value as HomePreviewTarget);
}

function HomeCmsSectionContent() {
    const params = useParams<{ section: string }>();
    const { isDark, lang } = usePage();
    const sectionParam = Array.isArray(params.section) ? params.section[0] : params.section;
    const section = isHomeSection(sectionParam) ? sectionParam : "hero";
    const meta = homeCmsSectionMeta[section];

    const {
        homeContent,
        loading,
        saving,
        saved,
        dirty,
        error,
        uploadingSlot,
        onSlideTextChange,
        onSlideImageChange,
        onSlideLinkChange,
        onPromoImageChange,
        onPromoLinkChange,
        onPromoAltChange,
        onSave,
        onUpload,
    } = useHomeCmsEditorState();

    const counts = {
        review: community.ko.filter((item) => item.type === "review").length,
        mate: community.ko.filter((item) => item.type === "mate").length,
        qna: community.ko.filter((item) => item.type === "qna").length,
    };

    const panelTone = isDark
        ? "border-white/10 bg-slate-900 text-slate-100"
        : "border-slate-200 bg-white text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <>
            <CmsUnsavedChangesGuard when={dirty} isDark={isDark} />

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5">
                <CmsSidebar
                    activeCategory="home"
                    toursCount={defaultTours.length}
                    counts={counts}
                    isDark={isDark}
                    hrefBuilder={(category) => withLocaleQuery(`/cms?category=${category}`, lang)}
                />

                <div className="min-w-0 space-y-6">
                    <div className={`rounded-[28px] border p-5 shadow-sm sm:p-6 ${panelTone}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <Link
                                    href={withLocaleQuery("/cms?category=home", lang)}
                                    className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${
                                        isDark
                                            ? "text-slate-300 hover:text-white"
                                            : "text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    <span aria-hidden>←</span>
                                    <span>홈 CMS로 돌아가기</span>
                                </Link>
                                <h1 className="mt-3 text-3xl font-black tracking-tight">
                                    {meta.title}
                                </h1>
                                <p className={`mt-2 text-sm ${mutedTone}`}>{meta.description}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => void onSave()}
                                disabled={saving}
                                className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:opacity-60"
                            >
                                {saving ? "저장 중..." : saved ? "저장 완료" : "변경사항 저장"}
                            </button>
                        </div>

                        {loading ? (
                            <p className={`mt-4 text-sm font-bold ${mutedTone}`}>
                                홈 CMS 데이터를 불러오는 중입니다...
                            </p>
                        ) : null}
                        {error ? (
                            <p
                                className={`mt-4 rounded-2xl px-3 py-2 text-xs font-bold ${
                                    isDark
                                        ? "bg-amber-500/10 text-amber-300"
                                        : "bg-amber-50 text-amber-700"
                                }`}
                            >
                                {error}
                            </p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            {sections.map((item) => (
                                <Link
                                    key={item}
                                    href={withLocaleQuery(`/cms/home/${item}`, lang)}
                                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                                        item === section
                                            ? "bg-blue-600 text-white"
                                            : isDark
                                              ? "bg-slate-950 text-slate-100 hover:bg-slate-800"
                                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {homeCmsSectionMeta[item].title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <HomeCmsSectionEditor
                        section={section}
                        homeContent={homeContent}
                        isDark={isDark}
                        uploadingSlot={uploadingSlot}
                        onSlideTextChange={onSlideTextChange}
                        onSlideImageChange={onSlideImageChange}
                        onSlideLinkChange={onSlideLinkChange}
                        onPromoImageChange={onPromoImageChange}
                        onPromoLinkChange={onPromoLinkChange}
                        onPromoAltChange={onPromoAltChange}
                        onUpload={onUpload}
                    />
                </div>
            </div>
        </>
    );
}

export default function HomeCmsSectionPage() {
    return (
        <PageShell activeKey="home">
            <HomeCmsSectionContent />
        </PageShell>
    );
}
