"use client";

import Image from "next/image";
import { defaultCmsHomeContent, type CmsHomeContent } from "@/lib/cms-home";

export type HomePreviewTarget = "hero" | "promo";

export function HomePreview({
    homeContent,
    isDark,
    activeTarget,
    onSelectTarget,
}: {
    homeContent: CmsHomeContent;
    isDark: boolean;
    activeTarget: HomePreviewTarget | null;
    onSelectTarget: (target: HomePreviewTarget) => void;
}) {
    const previewCardTone = isDark
        ? "border-white/10 bg-slate-900 hover:bg-slate-800"
        : "border-slate-200 bg-white hover:bg-slate-50";
    const activeTone = isDark
        ? "ring-2 ring-blue-400/40 border-blue-400/60"
        : "ring-2 ring-blue-200 border-blue-500";
    const heroPreview = {
        ...defaultCmsHomeContent.heroSlides.ko[0],
        ...homeContent.heroSlides.ko[0],
        image: homeContent.heroSlides.ko[0]?.image?.trim() || defaultCmsHomeContent.heroSlides.ko[0].image,
        eyebrow: homeContent.heroSlides.ko[0]?.eyebrow?.trim() || defaultCmsHomeContent.heroSlides.ko[0].eyebrow,
        title: homeContent.heroSlides.ko[0]?.title?.trim() || defaultCmsHomeContent.heroSlides.ko[0].title,
        desc: homeContent.heroSlides.ko[0]?.desc?.trim() || defaultCmsHomeContent.heroSlides.ko[0].desc,
    };
    const promoPreview = {
        ...defaultCmsHomeContent.promoBanners[0],
        ...homeContent.promoBanners[0],
        image: homeContent.promoBanners[0]?.image?.trim() || defaultCmsHomeContent.promoBanners[0].image,
        alt: {
            ...defaultCmsHomeContent.promoBanners[0].alt,
            ...homeContent.promoBanners[0]?.alt,
            ko: homeContent.promoBanners[0]?.alt?.ko?.trim() || defaultCmsHomeContent.promoBanners[0].alt.ko,
        },
    };

    const previewButton = (target: HomePreviewTarget) =>
        `group block text-left transition-all duration-300 ${activeTarget === target ? activeTone : ""}`;

    const staticCardTone = previewCardTone
        .replace(" hover:bg-slate-800", "")
        .replace(" hover:bg-slate-50", "");

    return (
        <div
            className={`overflow-hidden rounded-[28px] border shadow-[0_18px_48px_rgba(15,23,42,0.08)] ${
                isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-100"
            }`}
        >
            <div
                className={`flex items-center justify-between border-b px-5 py-4 ${
                    isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                }`}
            >
                <div className="text-xl font-black text-blue-600">BlueWolf</div>
                <div
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                        isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-500"
                    }`}
                >
                    CMS Preview
                </div>
            </div>

            <div className={`space-y-5 p-5 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:items-stretch">
                    <button
                        type="button"
                        onClick={() => onSelectTarget("hero")}
                        className={`${previewButton("hero")} relative h-full w-full appearance-none overflow-hidden rounded-[24px] border bg-transparent p-0 ${previewCardTone}`}
                    >
                        <div className="relative h-full min-h-[320px] w-full">
                            <Image
                                src={heroPreview.image}
                                alt={heroPreview.title || "Hero preview"}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                sizes="(max-width: 1280px) 100vw, 60vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                            <div className="absolute inset-x-0 top-0 p-5">
                                <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-extrabold text-blue-700">
                                    이벤트 슬라이더
                                </span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                <p className="text-xs font-bold text-white/75">{heroPreview.eyebrow}</p>
                                <p className="mt-2 whitespace-pre-line text-[30px] font-black leading-tight">
                                    {heroPreview.title}
                                </p>
                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/80">
                                    {heroPreview.desc}
                                </p>
                            </div>
                        </div>
                    </button>

                    <div className="grid h-full gap-4 xl:grid-rows-2">
                        <div className={`rounded-[24px] border ${staticCardTone}`} />
                        <div className={`rounded-[24px] border ${staticCardTone}`} />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onSelectTarget("promo")}
                    className={`${previewButton("promo")} relative w-full overflow-hidden rounded-[24px] border ${previewCardTone}`}
                >
                    <div className="relative min-h-[150px] w-full sm:min-h-[170px] lg:min-h-[190px]">
                        <Image
                            src={promoPreview.image}
                            alt={promoPreview.alt.ko || "Promo preview"}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/20 to-transparent" />
                        <div className="absolute inset-x-0 top-0 p-5">
                            <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-extrabold text-white">
                                기간한정 슬라이더
                            </span>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
