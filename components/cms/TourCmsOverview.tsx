"use client";

import Link from "next/link";
import { cmsTourRegions } from "@/lib/cms-tour-admin";
import { type Region, type Tour } from "@/lib/bluewolf-data";

function OverviewCard({
    title,
    desc,
    href,
    isDark,
    badge,
}: {
    title: string;
    desc: string;
    href: string;
    isDark: boolean;
    badge?: string;
}) {
    return (
        <Link
            href={href}
            className={`group rounded-[24px] border p-5 transition-[background-color,border-color,box-shadow] duration-300 ${
                isDark
                    ? "border-white/10 bg-slate-950 text-slate-100 hover:border-blue-400/40 hover:bg-slate-900"
                    : "border-slate-200 bg-slate-50 text-slate-900 hover:border-blue-300 hover:bg-white"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xl font-black">{title}</p>
                    <p
                        className={`mt-2 text-sm leading-6 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                    >
                        {desc}
                    </p>
                </div>
                {badge ? (
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                        {badge}
                    </span>
                ) : null}
            </div>
        </Link>
    );
}

export function TourCmsOverview({
    tours,
    isDark,
    regionHrefBuilder,
    optionsHref,
    regionImagesHref,
    customizeHref,
    themesHref,
}: {
    tours: Tour[];
    isDark: boolean;
    regionHrefBuilder: (region: Region) => string;
    optionsHref: string;
    regionImagesHref: string;
    customizeHref: string;
    themesHref: string;
}) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black tracking-tight">투어상품 관리</h2>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    지역별 상품 편집 화면으로 이동해서 상품을 추가, 삭제, 수정할 수 있습니다.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {cmsTourRegions.map((region) => {
                    const count = tours.filter((tour) => tour.region === region.key).length;

                    return (
                        <OverviewCard
                            key={region.key}
                            title={region.label}
                            desc={region.description}
                            href={regionHrefBuilder(region.key)}
                            isDark={isDark}
                            badge={`${count}개`}
                        />
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <OverviewCard
                    title="여행지 선택 이미지"
                    desc="투어상품 페이지 상단 지역 카드 이미지를 수정합니다."
                    href={regionImagesHref}
                    isDark={isDark}
                />
                <OverviewCard
                    title="커스텀 여행지 / 시작 금액"
                    desc="커스텀 상세 페이지의 여행지 리스트와 예상 시작 금액을 수정합니다."
                    href={customizeHref}
                    isDark={isDark}
                />
                <OverviewCard
                    title="추가옵션 설정"
                    desc="추가옵션 가격을 수정하고 옵션을 추가하거나 삭제할 수 있습니다."
                    href={optionsHref}
                    isDark={isDark}
                />
                <OverviewCard
                    title="테마 관리"
                    desc="상품에 공통으로 쓰는 테마를 추가, 삭제하고 언어별 이름을 관리합니다."
                    href={themesHref}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}
