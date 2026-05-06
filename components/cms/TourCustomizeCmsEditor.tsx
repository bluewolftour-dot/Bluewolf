"use client";

import Image from "next/image";
import { useState } from "react";
import { CmsLocaleTabs, localeLabels } from "@/components/cms/CmsLocaleTabs";
import { cmsTourRegions } from "@/lib/cms-tour-admin";
import {
    type CmsTourCustomizeActivity,
    type CmsTourCustomizeContent,
    type CmsTourCustomizeDestination,
} from "@/lib/cms-tour-customize";
import { type Locale, type Region } from "@/lib/bluewolf-data";
import { CMS_NULL_IMAGE } from "@/lib/cms-image";
import { CmsImageLibraryModal } from "@/components/cms/CmsImageLibraryModal";

function TextField({
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

function NumberField({
    label,
    value,
    onChange,
    inputTone,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    inputTone: string;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-bold">{label}</span>
            <input
                type="number"
                min={0}
                value={value}
                onChange={(event) => onChange(Number(event.target.value || 0))}
                className={`h-12 rounded-2xl border px-4 ${inputTone}`}
            />
        </label>
    );
}

function ChevronIcon({
    expanded,
    isDark,
}: {
    expanded: boolean;
    isDark: boolean;
}) {
    return (
        <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={`h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                expanded ? "rotate-180" : "rotate-0"
            } ${isDark ? "text-slate-300" : "text-slate-500"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m4 7 6 6 6-6" />
        </svg>
    );
}

function DestinationCard({
    destination,
    locale,
    inputTone,
    isDark,
    uploading,
    onUpdate,
    onDelete,
    onUpload,
    onOpenLibrary,
}: {
    destination: CmsTourCustomizeDestination;
    locale: Locale;
    inputTone: string;
    isDark: boolean;
    uploading: boolean;
    onUpdate: (updater: (current: CmsTourCustomizeDestination) => CmsTourCustomizeDestination) => void;
    onDelete: () => void;
    onUpload: (file: File) => void;
    onOpenLibrary: () => void;
}) {
    return (
        <div
            className={`rounded-[24px] border p-5 ${
                isDark
                    ? "border-white/10 bg-slate-950/70 text-slate-100"
                    : "border-slate-200 bg-white text-slate-900"
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-black">
                        {destination.title[locale] || "새 여행지"}
                    </p>
                    <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        커스텀 상세 페이지에서 노출되는 여행지 카드입니다.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onOpenLibrary}
                        className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                            isDark
                                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                        }`}
                    >
                        라이브러리 선택
                    </button>
                    <label
                        className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                            isDark
                                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
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
                    <button
                        type="button"
                        onClick={onDelete}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                            isDark
                                ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        }`}
                    >
                        삭제
                    </button>
                </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="space-y-4">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-current/10">
                        <Image
                            src={destination.image || CMS_NULL_IMAGE}
                            alt={destination.title[locale] || "Destination preview"}
                            fill
                            className="object-cover"
                            sizes="280px"
                        />
                    </div>
                    <TextField
                        label="이미지 경로"
                        value={destination.image}
                        onChange={(value) =>
                            onUpdate((current) => ({ ...current, image: value }))
                        }
                        inputTone={inputTone}
                    />
                </div>

                <div className="space-y-4">
                    <TextField
                        label={`${localeLabels[locale]} 제목`}
                        value={destination.title[locale]}
                        onChange={(value) =>
                            onUpdate((current) => ({
                                ...current,
                                title: { ...current.title, [locale]: value },
                            }))
                        }
                        inputTone={inputTone}
                    />
                    <TextField
                        label={`${localeLabels[locale]} 설명`}
                        value={destination.desc[locale]}
                        onChange={(value) =>
                            onUpdate((current) => ({
                                ...current,
                                desc: { ...current.desc, [locale]: value },
                            }))
                        }
                        inputTone={inputTone}
                        multiline
                    />
                    <div
                        className={`rounded-[20px] border px-4 py-3 text-xs font-bold ${
                            isDark
                                ? "border-white/10 bg-slate-900 text-slate-400"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                    >
                        여행지 ID: {destination.id}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityCard({
    activity,
    locale,
    inputTone,
    isDark,
    uploading,
    onUpdate,
    onDelete,
    onUpload,
    onOpenLibrary,
}: {
    activity: CmsTourCustomizeActivity;
    locale: Locale;
    inputTone: string;
    isDark: boolean;
    uploading: boolean;
    onUpdate: (updater: (current: CmsTourCustomizeActivity) => CmsTourCustomizeActivity) => void;
    onDelete: () => void;
    onUpload: (file: File) => void;
    onOpenLibrary: () => void;
}) {
    return (
        <div
            className={`rounded-[24px] border p-5 ${
                isDark
                    ? "border-white/10 bg-slate-950/70 text-slate-100"
                    : "border-slate-200 bg-white text-slate-900"
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-black">
                        {activity.title[locale] || "새 액티비티"}
                    </p>
                    <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        커스텀 상세 페이지에서 노출되는 지역별 액티비티입니다.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onOpenLibrary}
                        className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                            isDark
                                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                        }`}
                    >
                        라이브러리 선택
                    </button>
                    <label
                        className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                            isDark
                                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
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
                    <button
                        type="button"
                        onClick={onDelete}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                            isDark
                                ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        }`}
                    >
                        삭제
                    </button>
                </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="space-y-4">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-current/10">
                        <Image
                            src={activity.image || CMS_NULL_IMAGE}
                            alt={activity.title[locale] || "Activity preview"}
                            fill
                            className="object-cover"
                            sizes="280px"
                        />
                    </div>
                    <TextField
                        label="이미지 경로"
                        value={activity.image}
                        onChange={(value) =>
                            onUpdate((current) => ({ ...current, image: value }))
                        }
                        inputTone={inputTone}
                    />
                </div>

                <div className="space-y-4">
                    <NumberField
                        label="가격"
                        value={activity.price}
                        onChange={(value) =>
                            onUpdate((current) => ({ ...current, price: value }))
                        }
                        inputTone={inputTone}
                    />
                    <TextField
                        label={`${localeLabels[locale]} 제목`}
                        value={activity.title[locale]}
                        onChange={(value) =>
                            onUpdate((current) => ({
                                ...current,
                                title: { ...current.title, [locale]: value },
                            }))
                        }
                        inputTone={inputTone}
                    />
                    <TextField
                        label={`${localeLabels[locale]} 내용`}
                        value={activity.desc[locale]}
                        onChange={(value) =>
                            onUpdate((current) => ({
                                ...current,
                                desc: { ...current.desc, [locale]: value },
                            }))
                        }
                        inputTone={inputTone}
                        multiline
                    />
                    <div
                        className={`rounded-[20px] border px-4 py-3 text-xs font-bold ${
                            isDark
                                ? "border-white/10 bg-slate-900 text-slate-400"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                    >
                        액티비티 ID: {activity.id}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TourCustomizeCmsEditor({
    content,
    isDark,
    saving,
    saved,
    error,
    onSave,
    onUpdateBasePrice,
    onAddDestination,
    onDeleteDestination,
    onUpdateDestination,
    onAddActivity,
    onDeleteActivity,
    onUpdateActivity,
}: {
    content: CmsTourCustomizeContent;
    isDark: boolean;
    saving: boolean;
    saved: boolean;
    error: string | null;
    onSave: () => void;
    onUpdateBasePrice: (region: Region, value: number) => void;
    onAddDestination: (region: Region) => void;
    onDeleteDestination: (region: Region, destinationId: string) => void;
    onUpdateDestination: (
        region: Region,
        destinationId: string,
        updater: (current: CmsTourCustomizeDestination) => CmsTourCustomizeDestination
    ) => void;
    onAddActivity: (region: Region) => void;
    onDeleteActivity: (region: Region, activityId: string) => void;
    onUpdateActivity: (
        region: Region,
        activityId: string,
        updater: (current: CmsTourCustomizeActivity) => CmsTourCustomizeActivity
    ) => void;
}) {
    const inputTone = isDark
        ? "border-white/10 bg-slate-950 text-slate-100"
        : "border-slate-200 bg-slate-50 text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const [activeLocale, setActiveLocale] = useState<Locale>("ko");
    const [activeRegion, setActiveRegion] = useState<Region | null>(cmsTourRegions[0]?.key ?? "south");
    const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [libraryTarget, setLibraryTarget] = useState<
        | { type: "destination"; region: Region; id: string }
        | { type: "activity"; region: Region; id: string }
        | null
    >(null);

    const uploadImage = async (region: Region, destinationId: string, file: File) => {
        const slot = `tour-customize-${region}-${destinationId}`;
        setUploadingSlot(slot);
        setUploadError(null);

        const formData = new FormData();
        formData.append("slot", slot);
        formData.append("file", file);

        try {
            const response = await fetch("/api/cms/tour-customize/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("CMS_TOUR_CUSTOMIZE_UPLOAD_FAILED");
            }

            const data = (await response.json()) as { path: string };
            onUpdateDestination(region, destinationId, (current) => ({
                ...current,
                image: data.path,
            }));
        } catch {
            setUploadError(
                "이미지 업로드에 실패했습니다. JPG, PNG 또는 WEBP 파일만 업로드할 수 있습니다."
            );
        } finally {
            setUploadingSlot(null);
        }
    };

    const uploadActivityImage = async (region: Region, activityId: string, file: File) => {
        const slot = `tour-customize-${region}-${activityId}`;
        setUploadingSlot(slot);
        setUploadError(null);

        const formData = new FormData();
        formData.append("slot", slot);
        formData.append("file", file);

        try {
            const response = await fetch("/api/cms/tour-customize/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("CMS_TOUR_CUSTOMIZE_UPLOAD_FAILED");
            }

            const data = (await response.json()) as { path: string };
            onUpdateActivity(region, activityId, (current) => ({
                ...current,
                image: data.path,
            }));
        } catch {
            setUploadError(
                "이미지 업로드에 실패했습니다. JPG, PNG 또는 WEBP 파일만 업로드할 수 있습니다."
            );
        } finally {
            setUploadingSlot(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">
                        여행지 리스트 / 예상 시작 금액
                    </h2>
                    <p className={`mt-1 text-sm ${mutedTone}`}>
                        지역 버튼을 세로로 나눠 두고, 클릭하면 아래로 펼쳐지는 방식으로
                        여행지와 예상 시작 금액을 관리합니다.
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
                언어 버튼으로 제목과 설명 미리보기를 전환할 수 있고, 이미지와 예상 시작
                금액은 모든 언어에 공통 적용됩니다.
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

            <div className="flex flex-col gap-4">
                {cmsTourRegions.map((regionMeta) => {
                    const regionContent = content.regions[regionMeta.key];
                    const expanded = activeRegion === regionMeta.key;

                    return (
                        <section
                            key={regionMeta.key}
                            className={`overflow-hidden rounded-[28px] border ${
                                isDark
                                    ? "border-white/10 bg-slate-950/70 text-slate-100"
                                    : "border-slate-200 bg-white text-slate-900"
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveRegion((current) =>
                                        current === regionMeta.key ? null : regionMeta.key
                                    )
                                }
                                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors duration-300 hover:bg-black/[0.03] sm:px-6"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xl font-black">
                                            {regionMeta.label}
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                                                isDark
                                                    ? "bg-slate-800 text-slate-200"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            여행지 {regionContent.destinations.length}개
                                        </span>
                                    </div>
                                    <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm ${mutedTone}`}>
                                        <span>
                                            예상 시작 금액 ₩{regionContent.basePrice.toLocaleString()}
                                        </span>
                                        <span>{expanded ? "열려 있음" : "클릭해서 펼치기"}</span>
                                    </div>
                                </div>
                                <ChevronIcon expanded={expanded} isDark={isDark} />
                            </button>

                            <div
                                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="border-t border-current/10 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-black">
                                                    {regionMeta.label} 여행지 관리
                                                </h3>
                                                <p className={`mt-1 text-sm ${mutedTone}`}>
                                                    여행지를 추가하거나 삭제하고, 제목과 설명, 예상
                                                    시작 금액을 수정할 수 있습니다.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onAddDestination(regionMeta.key)}
                                                className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                                                    isDark
                                                        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                                        : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                                                }`}
                                            >
                                                여행지 추가
                                            </button>
                                        </div>

                                        <div className="mt-5 max-w-sm">
                                            <NumberField
                                                label="예상 시작 금액"
                                                value={regionContent.basePrice}
                                                onChange={(value) =>
                                                    onUpdateBasePrice(regionMeta.key, value)
                                                }
                                                inputTone={inputTone}
                                            />
                                        </div>

                                        {regionContent.destinations.length === 0 ? (
                                            <div
                                                className={`mt-5 rounded-[24px] border border-dashed p-5 text-sm ${
                                                    isDark
                                                        ? "border-white/10 text-slate-400"
                                                        : "border-slate-200 text-slate-500"
                                                }`}
                                            >
                                                아직 등록된 여행지가 없습니다. `여행지 추가` 버튼으로 새
                                                항목을 만들어 주세요.
                                            </div>
                                        ) : (
                                            <div className="mt-5 flex flex-col gap-4">
                                                {regionContent.destinations.map((destination) => (
                                                    <DestinationCard
                                                        key={destination.id}
                                                        destination={destination}
                                                        locale={activeLocale}
                                                        inputTone={inputTone}
                                                        isDark={isDark}
                                                        uploading={
                                                            uploadingSlot ===
                                                            `tour-customize-${regionMeta.key}-${destination.id}`
                                                        }
                                                        onUpdate={(updater) =>
                                                            onUpdateDestination(
                                                                regionMeta.key,
                                                                destination.id,
                                                                updater
                                                            )
                                                        }
                                                        onDelete={() =>
                                                            onDeleteDestination(
                                                                regionMeta.key,
                                                                destination.id
                                                            )
                                                        }
                                                        onUpload={(file) =>
                                                            void uploadImage(
                                                                regionMeta.key,
                                                                destination.id,
                                                                file
                                                            )
                                                        }
                                                        onOpenLibrary={() =>
                                                            setLibraryTarget({
                                                                type: "destination",
                                                                region: regionMeta.key,
                                                                id: destination.id,
                                                            })
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-8 flex flex-wrap items-start justify-between gap-3 border-t border-current/10 pt-6">
                                            <div>
                                                <h3 className="text-lg font-black">
                                                    {regionMeta.label} 액티비티 관리
                                                </h3>
                                                <p className={`mt-1 text-sm ${mutedTone}`}>
                                                    지역별 액티비티의 가격, 내용, 사진을 관리합니다.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onAddActivity(regionMeta.key)}
                                                className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                                                    isDark
                                                        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                                        : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                                                }`}
                                            >
                                                액티비티 추가
                                            </button>
                                        </div>

                                        {regionContent.activities.length === 0 ? (
                                            <div
                                                className={`mt-5 rounded-[24px] border border-dashed p-5 text-sm ${
                                                    isDark
                                                        ? "border-white/10 text-slate-400"
                                                        : "border-slate-200 text-slate-500"
                                                }`}
                                            >
                                                아직 등록된 액티비티가 없습니다. `액티비티 추가` 버튼으로 새
                                                항목을 만들 수 있습니다.
                                            </div>
                                        ) : (
                                            <div className="mt-5 flex flex-col gap-4">
                                                {regionContent.activities.map((activity) => (
                                                    <ActivityCard
                                                        key={activity.id}
                                                        activity={activity}
                                                        locale={activeLocale}
                                                        inputTone={inputTone}
                                                        isDark={isDark}
                                                        uploading={
                                                            uploadingSlot ===
                                                            `tour-customize-${regionMeta.key}-${activity.id}`
                                                        }
                                                        onUpdate={(updater) =>
                                                            onUpdateActivity(
                                                                regionMeta.key,
                                                                activity.id,
                                                                updater
                                                            )
                                                        }
                                                        onDelete={() =>
                                                            onDeleteActivity(
                                                                regionMeta.key,
                                                                activity.id
                                                            )
                                                        }
                                                        onUpload={(file) =>
                                                            void uploadActivityImage(
                                                                regionMeta.key,
                                                                activity.id,
                                                                file
                                                            )
                                                        }
                                                        onOpenLibrary={() =>
                                                            setLibraryTarget({
                                                                type: "activity",
                                                                region: regionMeta.key,
                                                                id: activity.id,
                                                            })
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
            {libraryTarget ? (
                <CmsImageLibraryModal
                    isDark={isDark}
                    onClose={() => setLibraryTarget(null)}
                    onSelect={(path) => {
                        if (libraryTarget.type === "destination") {
                            onUpdateDestination(libraryTarget.region, libraryTarget.id, (current) => ({
                                ...current,
                                image: path,
                            }));
                        } else {
                            onUpdateActivity(libraryTarget.region, libraryTarget.id, (current) => ({
                                ...current,
                                image: path,
                            }));
                        }
                    }}
                />
            ) : null}
        </div>
    );
}
