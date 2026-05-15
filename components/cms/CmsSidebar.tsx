"use client";

import Link from "next/link";

export type CmsCategory = "home" | "tours" | "community" | "library";

export function getCmsCategoryFromParam(value: string | null): CmsCategory {
    if (value === "tours" || value === "community" || value === "library") {
        return value;
    }

    return "home";
}

function CategoryLink({
    active,
    title,
    desc,
    href,
    isDark,
}: {
    active: boolean;
    title: string;
    desc: string;
    href: string;
    isDark: boolean;
}) {
    return (
        <Link
            href={href}
            className={`block rounded-2xl border px-4 py-3 text-left transition-colors duration-300 ${
                active
                    ? "border-blue-500 bg-blue-600 text-white"
                    : isDark
                      ? "border-white/10 bg-slate-950 text-slate-100 hover:bg-slate-800"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
            }`}
        >
            <p className="text-sm font-black">{title}</p>
            <p className="mt-1 text-xs opacity-75">{desc}</p>
        </Link>
    );
}

export function CmsSidebar({
    activeCategory,
    toursCount,
    counts,
    isDark,
    hrefBuilder,
}: {
    activeCategory: CmsCategory;
    toursCount: number;
    counts: { review: number; mate: number; qna: number };
    isDark: boolean;
    hrefBuilder: (category: CmsCategory) => string;
}) {
    const panelTone = isDark
        ? "border-white/10 bg-slate-900 text-slate-100"
        : "border-slate-200 bg-white text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <section
            className={`sticky top-[88px] z-20 self-start rounded-[24px] border p-4 shadow-sm sm:p-5 ${panelTone}`}
        >
            <h1 className="type-title-lg">CMS</h1>
            <p className={`mt-2 text-sm leading-6 ${mutedTone}`}>
                카테고리별로 운영 화면과 콘텐츠를 관리할 수 있습니다.
            </p>

            <div className="mt-4 grid gap-3">
                <CategoryLink
                    active={activeCategory === "home"}
                    title="홈"
                    desc="이벤트 슬라이더, 기간한정 슬라이더"
                    href={hrefBuilder("home")}
                    isDark={isDark}
                />
                <CategoryLink
                    active={activeCategory === "tours"}
                    title="투어상품"
                    desc={`${toursCount}개 상품 편집 및 저장`}
                    href={hrefBuilder("tours")}
                    isDark={isDark}
                />
                <CategoryLink
                    active={activeCategory === "community"}
                    title="커뮤니티"
                    desc={`후기 ${counts.review}개 동행 ${counts.mate}개 질문 ${counts.qna}개`}
                    href={hrefBuilder("community")}
                    isDark={isDark}
                />
                <CategoryLink
                    active={activeCategory === "library"}
                    title="라이브러리"
                    desc="업로드 이미지 선택 및 삭제"
                    href={hrefBuilder("library")}
                    isDark={isDark}
                />
            </div>
        </section>
    );
}
