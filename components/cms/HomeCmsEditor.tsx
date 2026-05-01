"use client";

import { useRouter } from "next/navigation";
import { HomePreview, type HomePreviewTarget } from "@/components/cms/HomePreview";
import { usePage } from "@/components/layout/PageShell";
import { type CmsHomeContent } from "@/lib/cms-home";
import { withLocaleQuery } from "@/lib/locale-routing";

export function HomeCmsEditor({
    homeContent,
    isDark,
    loading,
    error,
}: {
    homeContent: CmsHomeContent;
    isDark: boolean;
    loading: boolean;
    error: string | null;
}) {
    const router = useRouter();
    const { lang } = usePage();
    const softPanelTone = isDark ? "border-white/10 bg-slate-950/70 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const activePreviewTarget: HomePreviewTarget | null = null;

    const openEditorPage = (target: HomePreviewTarget) => {
        router.push(withLocaleQuery(`/cms/home/${target}`, lang));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black tracking-tight">홈 관리</h2>
                <p className={`mt-1 text-sm ${mutedTone}`}>프리뷰에서 슬라이더 영역을 클릭하면 전용 편집 페이지로 이동합니다.</p>
            </div>

            {loading ? <p className={`text-sm font-bold ${mutedTone}`}>홈 CMS 데이터를 불러오는 중입니다...</p> : null}
            {error ? <p className={`rounded-2xl px-3 py-2 text-xs font-bold ${isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"}`}>{error}</p> : null}

            <div className={`rounded-[24px] border p-5 ${softPanelTone}`}>
                <p className="text-sm font-black">프리뷰 사용 안내</p>
                <p className={`mt-2 text-sm leading-7 ${mutedTone}`}>
                    이벤트 슬라이더와 기간한정 슬라이더를 클릭하면 각각의 전용 편집 화면으로 바로 이동합니다.
                </p>
            </div>

            <div className={`rounded-[24px] border p-5 ${softPanelTone}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-black">홈 페이지 프리뷰</h3>
                        <p className={`mt-1 text-sm ${mutedTone}`}>실제 홈 화면 흐름에 가깝게 미리보기를 확인하고, 슬라이더 영역만 선택해 편집할 수 있습니다.</p>
                    </div>
                </div>
                <div className="mt-5">
                    <HomePreview
                        homeContent={homeContent}
                        isDark={isDark}
                        activeTarget={activePreviewTarget}
                        onSelectTarget={openEditorPage}
                    />
                </div>
            </div>
        </div>
    );
}
