"use client";

import Image from "next/image";
import { useState } from "react";
import { type Locale } from "@/lib/bluewolf-data";
import { cmsInternalLinkOptions, homeUploadSlots, type CmsHomeContent } from "@/lib/cms-home";
import { type HomePreviewTarget } from "@/components/cms/HomePreview";
import { Dropdown } from "@/components/ui/Dropdown";

const editableLocales = ["ko", "ja", "en"] as const satisfies readonly Locale[];

const localeLabels: Record<Locale, string> = {
    ko: "한국어",
    ja: "일본어",
    en: "영어",
};

export const homeCmsSectionMeta: Record<
    HomePreviewTarget,
    {
        title: string;
        description: string;
    }
> = {
    hero: {
        title: "이벤트 슬라이더 편집",
        description: "슬라이드 이미지와 언어별 문구를 편집합니다.",
    },
    promo: {
        title: "기간한정 슬라이더 편집",
        description: "배너 이미지와 ALT 텍스트를 편집합니다.",
    },
};

function Field({
    label,
    value,
    onChange,
    inputTone,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    inputTone: string;
    multiline?: boolean;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-bold">{label}</span>
            {multiline ? (
                <textarea
                    rows={4}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={`rounded-2xl border px-4 py-3 ${inputTone}`}
                />
            ) : (
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={`h-12 rounded-2xl border px-4 ${inputTone}`}
                />
            )}
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    isDark,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    isDark: boolean;
}) {
    return (
        <div className="grid gap-2">
            <span className="text-sm font-bold">{label}</span>
            <Dropdown
                value={value}
                onChange={onChange}
                options={cmsInternalLinkOptions}
                isDark={isDark}
            />
        </div>
    );
}

function LocaleTabs({
    activeLocale,
    onChange,
    isDark,
}: {
    activeLocale: Locale;
    onChange: (locale: Locale) => void;
    isDark: boolean;
}) {
    return (
        <div className={`mt-5 flex flex-wrap gap-2 rounded-[20px] border p-2 ${isDark ? "border-white/10 bg-slate-950/70" : "border-slate-200 bg-white"}`}>
            {editableLocales.map((locale) => (
                <button
                    key={locale}
                    type="button"
                    onClick={() => onChange(locale)}
                    className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                        activeLocale === locale
                            ? "bg-blue-600 text-white"
                            : isDark
                              ? "bg-slate-900 text-slate-200 hover:bg-slate-800"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                    {localeLabels[locale]}
                </button>
            ))}
        </div>
    );
}

export function HomeCmsSectionEditor({
    section,
    homeContent,
    isDark,
    uploadingSlot,
    onSlideTextChange,
    onSlideImageChange,
    onSlideLinkChange,
    onPromoImageChange,
    onPromoLinkChange,
    onPromoAltChange,
    onUpload,
}: {
    section: HomePreviewTarget;
    homeContent: CmsHomeContent;
    isDark: boolean;
    uploadingSlot: string | null;
    onSlideTextChange: (locale: Locale, index: number, key: "eyebrow" | "title" | "desc", value: string) => void;
    onSlideImageChange: (index: number, value: string) => void;
    onSlideLinkChange: (index: number, value: string) => void;
    onPromoImageChange: (index: number, value: string) => void;
    onPromoLinkChange: (index: number, value: string) => void;
    onPromoAltChange: (index: number, locale: Locale, value: string) => void;
    onUpload: (slot: string, file: File, onApply: (path: string) => void) => Promise<void>;
}) {
    const panelTone = isDark ? "border-white/10 bg-slate-950/70 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-900";
    const inputTone = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const [activeLocale, setActiveLocale] = useState<Locale>("ko");

    if (section === "hero") {
        return (
            <div className={`rounded-[24px] border p-5 ${panelTone}`}>
                <h3 className="text-lg font-black">{homeCmsSectionMeta.hero.title}</h3>
                <p className={`mt-1 text-sm ${mutedTone}`}>{homeCmsSectionMeta.hero.description}</p>
                <LocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} isDark={isDark} />

                <div className="mt-5 space-y-6">
                    {homeContent.heroSlides.ko.map((slide, index) => {
                        const localeSlide = homeContent.heroSlides[activeLocale][index];

                        return (
                            <div key={`hero-slide-${index}`} className="rounded-[24px] border border-current/10 p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-black">슬라이드 {index + 1}</p>
                                        <p className={`mt-1 text-xs ${mutedTone}`}>자동 파일명: {homeUploadSlots.heroSlides[index]}.jpg, .png 또는 .webp</p>
                                    </div>
                                    <label className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}>
                                        {uploadingSlot === homeUploadSlots.heroSlides[index] ? "업로드 중..." : "이미지 업로드"}
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (!file) return;
                                                void onUpload(homeUploadSlots.heroSlides[index], file, (path) => onSlideImageChange(index, path));
                                                event.target.value = "";
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-current/10">
                                        <Image src={slide.image} alt={slide.title} fill className="object-cover" sizes="320px" />
                                    </div>

                                    <div className="min-w-0 rounded-[22px] border border-current/10 p-4">
                                        <p className="text-sm font-black">{localeLabels[activeLocale]}</p>
                                        <div className="mt-4 grid gap-3">
                                            <Field
                                                label="상단 라벨"
                                                value={localeSlide?.eyebrow ?? ""}
                                                onChange={(value) => onSlideTextChange(activeLocale, index, "eyebrow", value)}
                                                inputTone={inputTone}
                                            />
                                            <Field
                                                label="제목"
                                                value={localeSlide?.title ?? ""}
                                                onChange={(value) => onSlideTextChange(activeLocale, index, "title", value)}
                                                inputTone={inputTone}
                                                multiline
                                            />
                                            <Field
                                                label="설명"
                                                value={localeSlide?.desc ?? ""}
                                                onChange={(value) => onSlideTextChange(activeLocale, index, "desc", value)}
                                                inputTone={inputTone}
                                                multiline
                                            />
                                            <SelectField
                                                label="연결 링크"
                                                value={slide.href ?? "/tours"}
                                                onChange={(value) => onSlideLinkChange(index, value)}
                                                isDark={isDark}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-[24px] border p-5 ${panelTone}`}>
            <h3 className="text-lg font-black">{homeCmsSectionMeta.promo.title}</h3>
            <p className={`mt-1 text-sm ${mutedTone}`}>{homeCmsSectionMeta.promo.description}</p>
            <LocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} isDark={isDark} />

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                {homeContent.promoBanners.map((banner, index) => (
                    <div key={`promo-banner-${index}`} className="rounded-[24px] border border-current/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black">배너 {index + 1}</p>
                                <p className={`mt-1 text-xs ${mutedTone}`}>자동 파일명: {homeUploadSlots.promoBanners[index]}.jpg, .png 또는 .webp</p>
                            </div>
                            <label className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}>
                                {uploadingSlot === homeUploadSlots.promoBanners[index] ? "업로드 중..." : "이미지 업로드"}
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        void onUpload(homeUploadSlots.promoBanners[index], file, (path) => onPromoImageChange(index, path));
                                        event.target.value = "";
                                    }}
                                />
                            </label>
                        </div>

                        <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[22px] border border-current/10">
                            <Image src={banner.image} alt={banner.alt.ko} fill className="object-cover" sizes="320px" />
                        </div>

                        <div className="mt-4 grid gap-3">
                            <SelectField
                                label="연결 링크"
                                value={banner.href ?? "/tours"}
                                onChange={(value) => onPromoLinkChange(index, value)}
                                isDark={isDark}
                            />
                            <Field
                                label={`${localeLabels[activeLocale]} ALT`}
                                value={banner.alt[activeLocale]}
                                onChange={(value) => onPromoAltChange(index, activeLocale, value)}
                                inputTone={inputTone}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
