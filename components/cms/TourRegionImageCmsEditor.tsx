"use client";

import Image from "next/image";
import { useState } from "react";
import { type Locale, type Region } from "@/lib/bluewolf-data";
import { type CmsTourRegionCardsContent } from "@/lib/cms-tour-region-cards";
import { CmsLocaleTabs, localeLabels } from "@/components/cms/CmsLocaleTabs";
import { CmsImageLibraryModal } from "@/components/cms/CmsImageLibraryModal";
import { getCmsTourRegionMeta } from "@/lib/cms-tour-admin";
import { tourRegionCardMeta, tourRegionOrder } from "@/lib/tour-region-cards";
import { CMS_UPLOAD_MAX_BYTES, resolveUploadErrorMessage } from "@/lib/cms-upload-errors";

function TextField({
    label,
    value,
    onChange,
    inputTone,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    inputTone: string;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-bold">{label}</span>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`h-12 rounded-2xl border px-4 ${inputTone}`}
            />
        </label>
    );
}

function RegionImageCard({
    region,
    locale,
    image,
    inputTone,
    isDark,
    uploading,
    onChange,
    onUpload,
    onOpenLibrary,
}: {
    region: Region;
    locale: Locale;
    image: string;
    inputTone: string;
    isDark: boolean;
    uploading: boolean;
    onChange: (value: string) => void;
    onUpload: (file: File) => void;
    onOpenLibrary: () => void;
}) {
    const meta = tourRegionCardMeta[region];
    const regionInfo = getCmsTourRegionMeta(region);
    const subtitle = meta.subtitle[locale];
    const label = meta.label[locale];

    return (
        <section
            className={`rounded-[28px] border p-5 sm:p-6 ${
                isDark ? "border-white/10 bg-slate-950/70 text-slate-100" : "border-slate-200 bg-white text-slate-900"
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-black">{regionInfo.label} 카드 이미지</h3>
                    <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        투어상품 페이지 상단 지역 선택 카드의 이미지를 수정합니다.
                    </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                <button
                    type="button"
                    onClick={onOpenLibrary}
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                        isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                >
                    라이브러리 선택
                </button>
                <label
                    className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                        isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                >
                    {uploading ? "업로드 중..." : "이미지 업로드"}
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            onUpload(file);
                            event.target.value = "";
                        }}
                    />
                </label>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px]">
                <div className="group relative w-full text-left">
                    <div className="relative h-56 overflow-hidden rounded-[24px] sm:h-64">
                        <Image
                            src={image}
                            alt={subtitle}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1280px) 100vw, 60vw"
                        />
                        <div
                            className={`absolute inset-0 rounded-[inherit] bg-gradient-to-b ${meta.gradient}`}
                        />
                        <div className="absolute inset-0 flex flex-col justify-between rounded-[inherit] p-5 text-white">
                            <div>
                                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold backdrop-blur-sm">
                                    {label}
                                </span>
                            </div>
                            <div>
                                <p className="text-2xl font-black tracking-tight sm:text-3xl">
                                    {subtitle}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-white/80">
                                    {localeLabels[locale]} 미리보기 문구
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <TextField
                    label="이미지 경로"
                    value={image}
                    onChange={onChange}
                    inputTone={inputTone}
                />
            </div>
        </section>
    );
}

export function TourRegionImageCmsEditor({
    content,
    isDark,
    saving,
    saved,
    error,
    onSave,
    onUpdate,
}: {
    content: CmsTourRegionCardsContent;
    isDark: boolean;
    saving: boolean;
    saved: boolean;
    error: string | null;
    onSave: () => void;
    onUpdate: (region: Region, value: string) => void;
}) {
    const inputTone = isDark
        ? "border-white/10 bg-slate-950 text-slate-100"
        : "border-slate-200 bg-slate-50 text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const [activeLocale, setActiveLocale] = useState<Locale>("ko");
    const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [libraryRegion, setLibraryRegion] = useState<Region | null>(null);

    const uploadImage = async (region: Region, file: File) => {
        const slot = `tour-region-${region}`;
        setUploadingSlot(slot);
        setUploadError(null);

        if (file.size > CMS_UPLOAD_MAX_BYTES) {
            setUploadError(resolveUploadErrorMessage("FILE_TOO_LARGE"));
            setUploadingSlot(null);
            return;
        }

        const formData = new FormData();
        formData.append("slot", slot);
        formData.append("file", file);

        try {
            const response = await fetch("/api/cms/tours/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 413) throw new Error("FILE_TOO_LARGE");
                const data = (await response.json().catch(() => ({}))) as { error?: string };
                throw new Error(data.error || "UPLOAD_FAILED");
            }

            const data = (await response.json()) as { path: string };
            onUpdate(region, data.path);
        } catch (err) {
            const code = err instanceof Error ? err.message : "";
            setUploadError(resolveUploadErrorMessage(code));
        } finally {
            setUploadingSlot(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">여행지 선택 카드 이미지</h2>
                    <p className={`mt-1 text-sm ${mutedTone}`}>
                        &quot;어디로 여행을 떠나고 싶으신가요?&quot; 영역의 카드 이미지를 관리합니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? "저장 중..." : saved ? "저장 완료" : "변경사항 저장"}
                </button>
            </div>

            <CmsLocaleTabs
                activeLocale={activeLocale}
                onChange={setActiveLocale}
                isDark={isDark}
            />

            <p className={`text-sm ${mutedTone}`}>
                언어 버튼은 카드 문구 미리보기용입니다. 이미지는 한국어, 일본어, 영어 화면에 공통으로 적용됩니다.
            </p>

            {error ? (
                <p
                    className={`rounded-2xl px-3 py-2 text-xs font-bold ${
                        isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"
                    }`}
                >
                    {error}
                </p>
            ) : null}

            {uploadError ? (
                <p
                    className={`rounded-2xl px-3 py-2 text-xs font-bold ${
                        isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"
                    }`}
                >
                    {uploadError}
                </p>
            ) : null}

            <div className="flex flex-col gap-5">
                {tourRegionOrder.map((region) => (
                    <RegionImageCard
                        key={region}
                        region={region}
                        locale={activeLocale}
                        image={content.images[region]}
                        inputTone={inputTone}
                        isDark={isDark}
                        uploading={uploadingSlot === `tour-region-${region}`}
                        onChange={(value) => onUpdate(region, value)}
                        onUpload={(file) => void uploadImage(region, file)}
                        onOpenLibrary={() => setLibraryRegion(region)}
                    />
                ))}
            </div>
            {libraryRegion ? (
                <CmsImageLibraryModal
                    isDark={isDark}
                    onClose={() => setLibraryRegion(null)}
                    onSelect={(path) => onUpdate(libraryRegion, path)}
                />
            ) : null}
        </div>
    );
}
