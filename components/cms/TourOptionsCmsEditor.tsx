"use client";

import Image from "next/image";
import { useState } from "react";
import { type Locale } from "@/lib/bluewolf-data";
import { type CmsTourOption } from "@/lib/cms-tour-options";
import { CmsLocaleTabs, localeLabels } from "@/components/cms/CmsLocaleTabs";
import { CMS_NULL_IMAGE } from "@/lib/cms-image";
import { CmsImageLibraryModal } from "@/components/cms/CmsImageLibraryModal";

function TextField({
    label,
    value,
    onChange,
    inputTone,
    multiline = false,
    readOnly = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    inputTone: string;
    multiline?: boolean;
    readOnly?: boolean;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-bold">{label}</span>
            {multiline ? (
                <textarea
                    rows={3}
                    value={value}
                    readOnly={readOnly}
                    onChange={(event) => onChange(event.target.value)}
                    className={`rounded-2xl border px-4 py-3 ${inputTone} ${readOnly ? "cursor-default opacity-80" : ""}`}
                />
            ) : (
                <input
                    value={value}
                    readOnly={readOnly}
                    onChange={(event) => onChange(event.target.value)}
                    className={`h-12 rounded-2xl border px-4 ${inputTone} ${readOnly ? "cursor-default opacity-80" : ""}`}
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
                value={value}
                onChange={(event) => onChange(Number(event.target.value || 0))}
                className={`h-12 rounded-2xl border px-4 ${inputTone}`}
            />
        </label>
    );
}

function OptionImageCard({
    title,
    src,
    inputTone,
    isDark,
    uploading,
    onChange,
    onUpload,
    onOpenLibrary,
    onRemove,
}: {
    title: string;
    src: string;
    inputTone: string;
    isDark: boolean;
    uploading: boolean;
    onChange: (value: string) => void;
    onUpload: (file: File) => void;
    onOpenLibrary: () => void;
    onRemove: () => void;
}) {
    return (
        <div
            className={`rounded-[22px] border p-4 ${
                isDark ? "border-white/10 bg-slate-950/70" : "border-slate-200 bg-slate-50"
            }`}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-black">{title}</p>
                <div className="flex flex-wrap items-center gap-2">
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
                    onClick={onRemove}
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                        isDark
                            ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                            : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                    }`}
                >
                    삭제
                </button>
                </div>
            </div>

            <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[20px] border border-current/10">
                <Image
                    src={src || CMS_NULL_IMAGE}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 30vw"
                />
            </div>

            <div className="mt-4">
                <TextField
                    label="이미지 경로"
                    value={src}
                    onChange={onChange}
                    inputTone={inputTone}
                />
            </div>
        </div>
    );
}

export function TourOptionsCmsEditor({
    options,
    isDark,
    saving,
    saved,
    error,
    onSave,
    onAdd,
    onDelete,
    onUpdate,
}: {
    options: CmsTourOption[];
    isDark: boolean;
    saving: boolean;
    saved: boolean;
    error: string | null;
    onSave: () => void;
    onAdd: () => void;
    onDelete: (index: number) => void;
    onUpdate: (index: number, updater: (option: CmsTourOption) => CmsTourOption) => void;
}) {
    const inputTone = isDark
        ? "border-white/10 bg-slate-950 text-slate-100"
        : "border-slate-200 bg-slate-50 text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const [activeLocale, setActiveLocale] = useState<Locale>("ko");
    const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [libraryTarget, setLibraryTarget] = useState<{ optionIndex: number; photoIndex: number } | null>(null);

    const updatePhotos = (
        optionIndex: number,
        updater: (photos: string[]) => string[]
    ) => {
        onUpdate(optionIndex, (current) => ({
            ...current,
            photos: updater(current.photos),
        }));
    };

    const uploadPhoto = async (optionIndex: number, photoIndex: number, file: File) => {
        const slot = `tour-option-${optionIndex + 1}-photo-${photoIndex + 1}`;
        setUploadingSlot(slot);
        setUploadError(null);

        const formData = new FormData();
        formData.append("slot", slot);
        formData.append("file", file);

        try {
            const response = await fetch("/api/cms/tour-options/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("CMS_TOUR_OPTION_UPLOAD_FAILED");
            }

            const data = (await response.json()) as { path: string };
            updatePhotos(optionIndex, (photos) =>
                photos.map((photo, index) => (index === photoIndex ? data.path : photo))
            );
        } catch {
            setUploadError(
                "추가옵션 이미지 업로드에 실패했습니다. JPG, PNG 또는 WEBP 파일만 업로드할 수 있습니다."
            );
        } finally {
            setUploadingSlot(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">추가옵션 설정</h2>
                    <p className={`mt-1 text-sm ${mutedTone}`}>
                        가격을 조정하고, 추가옵션 문구와 이미지 구성을 관리할 수 있습니다.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onAdd}
                        className={`inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-bold transition-colors duration-300 ${
                            isDark
                                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                        }`}
                    >
                        옵션 추가
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? "저장 중..." : saved ? "저장 완료" : "변경사항 저장"}
                    </button>
                </div>
            </div>

            <CmsLocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} isDark={isDark} />

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

            {options.length === 0 ? (
                <div
                    className={`rounded-[24px] border border-dashed p-6 text-sm ${
                        isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
                    }`}
                >
                    등록된 추가옵션이 없습니다. 상단의 `옵션 추가` 버튼으로 새 옵션을 만들어주세요.
                </div>
            ) : null}

            <div className="grid gap-4">
                {options.map((option, index) => (
                    <div
                        key={`${option.key}-${index}`}
                        className={`rounded-[24px] border p-5 ${
                            isDark
                                ? "border-white/10 bg-slate-950/70 text-slate-100"
                                : "border-slate-200 bg-white text-slate-900"
                        }`}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-lg font-black">옵션 {index + 1}</p>
                                <p className={`mt-1 text-xs ${mutedTone}`}>
                                    커스텀 페이지와 상품 상세 페이지에서 공통으로 사용하는 옵션입니다.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onDelete(index)}
                                className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                                    isDark
                                        ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                        : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                }`}
                            >
                                옵션 삭제
                            </button>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2 [&>label:first-child]:hidden">
                            <TextField
                                label="옵션 키"
                                value={option.key}
                                onChange={() => {}}
                                inputTone={inputTone}
                                readOnly
                            />
                            <NumberField
                                label="가격 (1인당)"
                                value={option.price}
                                onChange={(value) =>
                                    onUpdate(index, (current) => ({ ...current, price: value }))
                                }
                                inputTone={inputTone}
                            />
                            <TextField
                                label={`${localeLabels[activeLocale]} 제목`}
                                value={option.title[activeLocale]}
                                onChange={(value) =>
                                    onUpdate(index, (current) => ({
                                        ...current,
                                        title: { ...current.title, [activeLocale]: value },
                                    }))
                                }
                                inputTone={inputTone}
                            />
                        </div>

                        <div className="mt-4 grid gap-4">
                            <TextField
                                label={`${localeLabels[activeLocale]} 설명`}
                                value={option.desc[activeLocale]}
                                onChange={(value) =>
                                    onUpdate(index, (current) => ({
                                        ...current,
                                        desc: { ...current.desc, [activeLocale]: value },
                                    }))
                                }
                                inputTone={inputTone}
                                multiline
                            />
                        </div>

                        <div className="mt-6 rounded-[22px] border border-current/10 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-black">옵션 이미지</p>
                                    <p className={`mt-1 text-xs ${mutedTone}`}>
                                        옵션 상세보기 팝업에 노출되는 이미지를 추가하고 수정합니다.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        updatePhotos(index, (photos) => [
                                            ...photos,
                                            CMS_NULL_IMAGE,
                                        ])
                                    }
                                    className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                                        isDark
                                            ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                            : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                                    }`}
                                >
                                    이미지 추가
                                </button>
                            </div>

                            {option.photos.length === 0 ? (
                                <div
                                    className={`mt-4 rounded-[20px] border border-dashed p-4 text-sm ${
                                        isDark
                                            ? "border-white/10 text-slate-400"
                                            : "border-slate-200 text-slate-500"
                                    }`}
                                >
                                    등록된 옵션 이미지가 없습니다. `이미지 추가` 버튼으로 첫 이미지를 추가해주세요.
                                </div>
                            ) : (
                                <div className="mt-4 flex flex-col gap-4">
                                    {option.photos.map((photo, photoIndex) => (
                                        <OptionImageCard
                                            key={`${option.key}-photo-${photoIndex}`}
                                            title={`옵션 이미지 ${photoIndex + 1}`}
                                            src={photo}
                                            inputTone={inputTone}
                                            isDark={isDark}
                                            uploading={
                                                uploadingSlot ===
                                                `tour-option-${index + 1}-photo-${photoIndex + 1}`
                                            }
                                            onChange={(value) =>
                                                updatePhotos(index, (photos) =>
                                                    photos.map((currentPhoto, currentIndex) =>
                                                        currentIndex === photoIndex
                                                            ? value
                                                            : currentPhoto
                                                    )
                                                )
                                            }
                                            onUpload={(file) =>
                                                void uploadPhoto(index, photoIndex, file)
                                            }
                                            onOpenLibrary={() => setLibraryTarget({ optionIndex: index, photoIndex })}
                                            onRemove={() =>
                                                updatePhotos(index, (photos) =>
                                                    photos.filter((_, currentIndex) => currentIndex !== photoIndex)
                                                )
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {libraryTarget ? (
                <CmsImageLibraryModal
                    isDark={isDark}
                    onClose={() => setLibraryTarget(null)}
                    onSelect={(path) =>
                        updatePhotos(libraryTarget.optionIndex, (photos) =>
                            photos.map((photo, index) =>
                                index === libraryTarget.photoIndex ? path : photo
                            )
                        )
                    }
                />
            ) : null}
        </div>
    );
}
