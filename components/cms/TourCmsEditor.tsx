"use client";

import Image from "next/image";
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { tours as defaultTours, type Locale, type Tour } from "@/lib/bluewolf-data";
import { cmsDurationTypeOptions } from "@/lib/cms-tour-admin";
import { CmsLocaleTabs, localeLabels } from "@/components/cms/CmsLocaleTabs";
import { Dropdown } from "@/components/ui/Dropdown";
import { CMS_NULL_IMAGE } from "@/lib/cms-image";
import {
    getTourTagColorClassName,
    getTourTagColorKey,
    isBestTourTag,
    normalizeTourTags,
    tourTagColorOptions,
} from "@/lib/tour-tags";
import { getCmsTourThemeOptions, type CmsTourThemesContent } from "@/lib/cms-tour-themes";

const normalizeTagKey = (tag: string) => tag.trim().toLocaleLowerCase();

function Field({
    label,
    value,
    onChange,
    tone,
    multiline = false,
    type = "text",
}: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    tone: string;
    multiline?: boolean;
    type?: string;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-bold">{label}</span>
            {multiline ? (
                <textarea rows={4} value={String(value)} onChange={(event) => onChange(event.target.value)} className={`rounded-2xl border px-4 py-3 ${tone}`} />
            ) : (
                <input type={type} value={String(value)} onChange={(event) => onChange(event.target.value)} className={`h-12 rounded-2xl border px-4 ${tone}`} />
            )}
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    isDark,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    isDark: boolean;
}) {
    return (
        <div className="grid gap-2">
            <span className="text-sm font-bold">{label}</span>
            <Dropdown value={value} onChange={onChange} options={options} isDark={isDark} />
        </div>
    );
}

function ImageCard({
    title,
    value,
    previewSrc,
    onChange,
    onUpload,
    onRemove,
    removable,
    uploading,
    tone,
    isDark,
}: {
    title: string;
    value: string;
    previewSrc: string;
    onChange: (value: string) => void;
    onUpload: (file: File) => void;
    onRemove?: () => void;
    removable?: boolean;
    uploading: boolean;
    tone: string;
    isDark: boolean;
}) {
    return (
        <div className={`rounded-[24px] border p-4 ${isDark ? "border-white/10 bg-slate-950/70" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black">{title}</p>
                <div className="flex items-center gap-2">
                    <label className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}>
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
                    {removable && onRemove ? (
                        <button type="button" onClick={onRemove} className={`rounded-2xl px-4 py-2 text-sm font-bold ${isDark ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" : "bg-rose-50 text-rose-600 hover:bg-rose-100"}`}>
                            삭제
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[20px] border border-current/10">
                <Image src={previewSrc} alt={title} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 30vw" />
            </div>

            <div className="mt-4">
                <Field label="이미지 경로" value={value} onChange={onChange} tone={tone} />
            </div>
        </div>
    );
}

function SectionCard({
    title,
    desc,
    mutedTone,
    isDark,
    actions,
    children,
}: {
    title: string;
    desc: string;
    mutedTone: string;
    isDark: boolean;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section
            className={`rounded-[28px] border p-5 sm:p-6 ${
                isDark ? "border-white/10 bg-slate-950/60" : "border-slate-200 bg-white"
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-black">{title}</h3>
                    <p className={`mt-1 text-sm leading-6 ${mutedTone}`}>{desc}</p>
                </div>
                {actions}
            </div>
            <div className="mt-5 flex flex-col gap-4">{children}</div>
        </section>
    );
}

export function TourCmsEditor({
    regionLabel,
    tours,
    selectedId,
    onSelect,
    selectedTour,
    onUpdate,
    onSave,
    onAddTour,
    onDeleteTour,
    tourThemesContent,
    saving,
    saved,
    loading,
    error,
    isDark,
}: {
    regionLabel: string;
    tours: Tour[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    selectedTour: Tour | null;
    onUpdate: (updater: (tour: Tour) => Tour) => void;
    onSave: () => void;
    onAddTour: () => void;
    onDeleteTour: () => void;
    tourThemesContent: CmsTourThemesContent;
    saving: boolean;
    saved: boolean;
    loading: boolean;
    error: string | null;
    isDark: boolean;
}) {
    const tone = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const [activeLocale, setActiveLocale] = useState<Locale>("ko");
    const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [tagDrafts, setTagDrafts] = useState<Record<Locale, string>>({
        ko: "",
        ja: "",
        en: "",
    });
    const [tagSuggestOpen, setTagSuggestOpen] = useState(false);
    const tagSuggestRef = useRef<HTMLDivElement | null>(null);

    const updateImageList = (key: "images" | "detailImages", updater: (current: string[], tour: Tour) => string[]) => {
        onUpdate((tour) => ({ ...tour, [key]: updater(tour[key], tour) }));
    };

    const uploadImage = async (slot: string, file: File, onApply: (path: string) => void) => {
        setUploadingSlot(slot);
        setUploadError(null);
        const formData = new FormData();
        formData.append("slot", slot);
        formData.append("file", file);

        try {
            const response = await fetch("/api/cms/tours/upload", { method: "POST", body: formData });
            if (!response.ok) throw new Error("CMS_TOUR_UPLOAD_FAILED");
            const data = (await response.json()) as { path: string };
            onApply(data.path);
        } catch {
            setUploadError("투어 이미지 업로드에 실패했습니다. JPG, PNG 또는 WEBP 파일만 업로드할 수 있습니다.");
        } finally {
            setUploadingSlot(null);
        }
    };

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!tagSuggestRef.current?.contains(event.target as Node)) {
                setTagSuggestOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    const currentTags = useMemo(
        () => (selectedTour ? normalizeTourTags(selectedTour.tags[activeLocale]) : []),
        [activeLocale, selectedTour]
    );
    const themeOptions = useMemo(
        () => getCmsTourThemeOptions(tourThemesContent, activeLocale),
        [activeLocale, tourThemesContent]
    );
    const currentTagDraft = tagDrafts[activeLocale];
    const suggestedTags = useMemo(() => {
        const tagMap = new Map<string, { label: string; count: number }>();

        [...defaultTours, ...tours].forEach((tour) => {
            normalizeTourTags(tour.tags[activeLocale]).forEach((tag) => {
                const key = normalizeTagKey(tag);
                const current = tagMap.get(key);
                if (current) {
                    current.count += 1;
                    return;
                }
                tagMap.set(key, { label: tag, count: 1 });
            });
        });

        const sortLocale =
            activeLocale === "ko" ? "ko-KR" : activeLocale === "ja" ? "ja-JP" : "en-US";

        return Array.from(tagMap.values())
            .sort((a, b) => a.label.localeCompare(b.label, sortLocale))
            .map((entry) => entry.label);
    }, [activeLocale, tours]);
    const filteredTagSuggestions = useMemo(() => {
        const query = normalizeTagKey(currentTagDraft);
        const currentTagKeys = new Set(currentTags.map((tag) => normalizeTagKey(tag)));

        return suggestedTags.filter((tag) => {
            const key = normalizeTagKey(tag);
            if (currentTagKeys.has(key)) return false;
            if (!query) return true;
            return key.includes(query);
        });
    }, [currentTagDraft, currentTags, suggestedTags]);

    const resolveCanonicalTag = (rawTag: string) => {
        const trimmedTag = rawTag.trim();
        if (!trimmedTag) return "";

        const key = normalizeTagKey(trimmedTag);
        const matchedTag = suggestedTags.find((tag) => normalizeTagKey(tag) === key);
        return matchedTag ?? trimmedTag;
    };

    const setTagDraft = (value: string) => {
        setTagDrafts((current) => ({ ...current, [activeLocale]: value }));
    };

    const addTag = (tagValue?: string) => {
        if (!selectedTour) return;

        const nextTag = resolveCanonicalTag(tagValue ?? currentTagDraft);
        if (!nextTag) return;

        onUpdate((tour) => ({
            ...tour,
            tags: {
                ...tour.tags,
                [activeLocale]: normalizeTourTags([...tour.tags[activeLocale], nextTag]),
            },
        }));
        setTagDraft("");
        setTagSuggestOpen(false);
    };

    const removeTag = (tagToRemove: string) => {
        if (!selectedTour) return;

        onUpdate((tour) => ({
            ...tour,
            tags: {
                ...tour.tags,
                [activeLocale]: normalizeTourTags(tour.tags[activeLocale]).filter(
                    (tag) => tag !== tagToRemove
                ),
            },
            tagColors: {
                ...(tour.tagColors ?? { ko: {}, ja: {}, en: {} }),
                [activeLocale]: Object.fromEntries(
                    Object.entries((tour.tagColors ?? { ko: {}, ja: {}, en: {} })[activeLocale] ?? {}).filter(
                        ([tag]) => tag !== tagToRemove
                    )
                ),
            },
        }));
    };

    const updateTagColor = (tag: string, color: string) => {
        if (!selectedTour || isBestTourTag(tag)) return;

        onUpdate((tour) => ({
            ...tour,
            tagColors: {
                ...(tour.tagColors ?? { ko: {}, ja: {}, en: {} }),
                [activeLocale]: {
                    ...((tour.tagColors ?? { ko: {}, ja: {}, en: {} })[activeLocale] ?? {}),
                    [tag]: getTourTagColorKey(tag, color),
                },
            },
        }));
    };

    const handleTagInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addTag();
            return;
        }

        if (event.key === "Escape") {
            setTagSuggestOpen(false);
        }
    };

    return (
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="grid gap-4 self-start">
                <div className={`rounded-[24px] border p-4 ${isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-900"}`}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-lg font-black">{regionLabel} 상품</p>
                            <p className={`mt-1 text-xs ${mutedTone}`}>{tours.length}개 상품 편집 및 저장</p>
                        </div>
                        <button type="button" onClick={onAddTour} className="h-10 rounded-2xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                            상품 추가
                        </button>
                    </div>
                </div>

                {error ? <p className={`rounded-2xl px-3 py-2 text-xs font-bold ${isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"}`}>{error}</p> : null}

                {tours.map((tour) => (
                    <button
                        key={tour.id}
                        type="button"
                        onClick={() => onSelect(tour.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                            selectedId === tour.id
                                ? "border-blue-500 bg-blue-600 text-white"
                                : isDark
                                  ? "border-white/10 bg-slate-950 text-slate-100 hover:bg-slate-800"
                                  : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                        <p className="text-xs font-bold opacity-75">#{tour.id}</p>
                        <p className="mt-1 font-black">{tour.title[activeLocale]}</p>
                        <p className="mt-1 text-xs opacity-75">{tour.duration[activeLocale]}</p>
                    </button>
                ))}

                {!loading && tours.length === 0 ? (
                    <div className={`rounded-[24px] border border-dashed p-5 text-sm ${isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                        아직 등록된 상품이 없습니다. `상품 추가`로 첫 상품을 만들어 주세요.
                    </div>
                ) : null}
            </div>

            <div>
                {selectedTour ? (
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{selectedTour.title[activeLocale]}</h2>
                                <p className={`mt-1 text-sm ${mutedTone}`}>상품 정보와 상세 페이지의 모든 이미지를 이 화면에서 수정할 수 있습니다.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={onDeleteTour} className={`h-12 rounded-2xl px-5 text-sm font-bold ${isDark ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" : "bg-rose-50 text-rose-600 hover:bg-rose-100"}`}>
                                    상품 삭제
                                </button>
                                <button type="button" onClick={onSave} disabled={saving} className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
                                    {saving ? "저장 중..." : saved ? "저장 완료" : "변경사항 저장"}
                                </button>
                            </div>
                        </div>

                        <CmsLocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} isDark={isDark} />

                        {uploadError ? <p className={`rounded-2xl px-3 py-2 text-xs font-bold ${isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"}`}>{uploadError}</p> : null}

                        <SectionCard
                            title="대표 이미지"
                            desc="목록 카드와 상세 상단에 노출되는 메인 이미지를 관리합니다."
                            mutedTone={mutedTone}
                            isDark={isDark}
                        >
                            <ImageCard
                                title="대표 이미지"
                                value={selectedTour.heroImage}
                                previewSrc={selectedTour.heroImage || CMS_NULL_IMAGE}
                                onChange={(value) => onUpdate((tour) => ({ ...tour, heroImage: value }))}
                                onUpload={(file) => void uploadImage(`tour-${selectedTour.id}-hero`, file, (path) => onUpdate((tour) => ({ ...tour, heroImage: path })))}
                                uploading={uploadingSlot === `tour-${selectedTour.id}-hero`}
                                tone={tone}
                                isDark={isDark}
                            />
                        </SectionCard>

                        <SectionCard
                            title="기본 정보"
                            desc="가격, 예약금, 테마, 일정 유형처럼 상품의 공통 기본값을 관리합니다."
                            mutedTone={mutedTone}
                            isDark={isDark}
                        >
                            <div className="flex max-w-2xl flex-col gap-4">
                                <Field label="판매가" value={selectedTour.price} onChange={(value) => onUpdate((tour) => ({ ...tour, price: Number(value || 0) }))} tone={tone} type="number" />
                                <Field label="예약금" value={selectedTour.deposit} onChange={(value) => onUpdate((tour) => ({ ...tour, deposit: Number(value || 0) }))} tone={tone} type="number" />
                                <SelectField label="테마" value={selectedTour.theme} onChange={(value) => onUpdate((tour) => ({ ...tour, theme: value }))} options={themeOptions} isDark={isDark} />
                                <SelectField label="일정 유형" value={selectedTour.durationType} onChange={(value) => onUpdate((tour) => ({ ...tour, durationType: value as Tour["durationType"] }))} options={cmsDurationTypeOptions} isDark={isDark} />
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="다국어 문구"
                            desc={`${localeLabels[activeLocale]} 기준으로 상품명, 설명, 기간 문구를 편집합니다.`}
                            mutedTone={mutedTone}
                            isDark={isDark}
                        >
                            <div className="flex max-w-2xl flex-col gap-4">
                                <Field
                                    label={`${localeLabels[activeLocale]} 제목`}
                                    value={selectedTour.title[activeLocale]}
                                    onChange={(value) =>
                                        onUpdate((tour) => ({ ...tour, title: { ...tour.title, [activeLocale]: value } }))
                                    }
                                    tone={tone}
                                />
                                <Field
                                    label={`${localeLabels[activeLocale]} 설명`}
                                    value={selectedTour.desc[activeLocale]}
                                    onChange={(value) =>
                                        onUpdate((tour) => ({ ...tour, desc: { ...tour.desc, [activeLocale]: value } }))
                                    }
                                    tone={tone}
                                    multiline
                                />
                                <Field
                                    label={`${localeLabels[activeLocale]} 기간`}
                                    value={selectedTour.duration[activeLocale]}
                                    onChange={(value) =>
                                        onUpdate((tour) => ({ ...tour, duration: { ...tour.duration, [activeLocale]: value } }))
                                    }
                                    tone={tone}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="태그 관리"
                            desc={`${localeLabels[activeLocale]} 기준으로 기존 태그를 추천받아 같은 이름으로 추가하고, 필요할 때만 새 태그를 직접 만듭니다.`}
                            mutedTone={mutedTone}
                            isDark={isDark}
                        >
                            <div className="flex max-w-2xl flex-col gap-4">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div ref={tagSuggestRef} className="relative z-20 flex-1">
                                        <label className="grid gap-2">
                                            <span className="text-sm font-bold">{`${localeLabels[activeLocale]} 태그 추가`}</span>
                                            <input
                                                type="text"
                                                value={currentTagDraft}
                                                onChange={(event) => {
                                                    setTagDraft(event.target.value);
                                                    setTagSuggestOpen(true);
                                                }}
                                                onFocus={() => setTagSuggestOpen(true)}
                                                onClick={() => setTagSuggestOpen(true)}
                                                onKeyDown={handleTagInputKeyDown}
                                                placeholder="기존 태그를 선택하거나 새 태그를 입력하세요."
                                                className={`h-12 rounded-2xl border px-4 ${tone}`}
                                            />
                                        </label>

                                        {tagSuggestOpen ? (
                                            <div
                                                className={`absolute left-0 right-0 top-[calc(100%+10px)] z-[100] max-h-[240px] overflow-y-auto rounded-2xl border p-2 shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${
                                                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                                                }`}
                                            >
                                                {filteredTagSuggestions.length > 0 ? (
                                                    filteredTagSuggestions.map((tag) => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => addTag(tag)}
                                                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                                                                isDark
                                                                    ? "text-slate-100 hover:bg-slate-800"
                                                                    : "text-slate-700 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            <span>{tag}</span>
                                                            <span className={mutedTone}>기존 태그 사용</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className={`px-4 py-3 text-sm ${mutedTone}`}>
                                                        {currentTagDraft.trim()
                                                            ? "일치하는 기존 태그가 없습니다. 그대로 추가하면 새 태그로 저장됩니다."
                                                            : "등록된 기존 태그가 없습니다."}
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addTag()}
                                        className="h-12 self-end rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                                    >
                                        태그 추가
                                    </button>
                                </div>

                                <div className="grid gap-3">
                                    {currentTags.length > 0 ? (
                                        currentTags.map((tag) => {
                                            const tagColorMap = selectedTour.tagColors?.[activeLocale] ?? {};
                                            const fixedBest = isBestTourTag(tag);
                                            const colorKey = getTourTagColorKey(tag, tagColorMap[tag]);

                                            return (
                                                <div
                                                    key={tag}
                                                    className={`grid gap-3 rounded-2xl border p-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-center ${
                                                        isDark
                                                            ? "border-white/10 bg-slate-950"
                                                            : "border-slate-200 bg-slate-50"
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-flex w-fit items-center rounded-full px-3 py-2 text-sm font-black ${getTourTagColorClassName(
                                                            tag,
                                                            tagColorMap[tag]
                                                        )}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                    {fixedBest ? (
                                                        <span className={`text-sm font-bold ${mutedTone}`}>
                                                            베스트 태그는 파스텔 레드 고정
                                                        </span>
                                                    ) : (
                                                        <Dropdown
                                                            value={colorKey}
                                                            onChange={(value) => updateTagColor(tag, value)}
                                                            options={tourTagColorOptions}
                                                            isDark={isDark}
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className={`h-11 rounded-2xl px-4 text-sm font-bold transition-colors ${
                                                            isDark
                                                                ? "bg-white/10 text-slate-200 hover:bg-white/20"
                                                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                                        }`}
                                                        aria-label={`${tag} 삭제`}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className={`text-sm ${mutedTone}`}>
                                            아직 등록된 태그가 없습니다. 태그를 추가하면 상품 카드 이미지 상단에 표시됩니다.
                                        </p>
                                    )}
                                </div>

                                <p className={`text-xs leading-6 ${mutedTone}`}>
                                    입력창을 클릭하면 기존 태그가 나오고, 비슷한 이름을 입력하면 추천 목록이 좁혀집니다. 같은 태그는 기존 표기를 그대로 사용해 일관되게 관리됩니다.
                                </p>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="갤러리 이미지"
                            desc="상세 페이지 상단 이미지 섹션에 사용되는 이미지를 순서대로 관리합니다."
                            mutedTone={mutedTone}
                            isDark={isDark}
                            actions={
                                <button
                                    type="button"
                                    onClick={() => updateImageList("images", (current) => [...current, CMS_NULL_IMAGE])}
                                    className={`rounded-2xl px-4 py-2 text-sm font-bold ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
                                >
                                    이미지 추가
                                </button>
                            }
                        >
                            <div className="flex flex-col gap-4">
                                {selectedTour.images.map((src, index) => (
                                    <ImageCard
                                        key={`gallery-${index}`}
                                        title={`갤러리 이미지 ${index + 1}`}
                                        value={src}
                                        previewSrc={src || CMS_NULL_IMAGE}
                                        onChange={(value) => updateImageList("images", (current) => current.map((image, imageIndex) => (imageIndex === index ? value : image)))}
                                        onUpload={(file) => void uploadImage(`tour-${selectedTour.id}-gallery-${index + 1}`, file, (path) => updateImageList("images", (current) => current.map((image, imageIndex) => (imageIndex === index ? path : image))))}
                                        onRemove={() => updateImageList("images", (current) => (current.length <= 1 ? current : current.filter((_, imageIndex) => imageIndex !== index)))}
                                        removable={selectedTour.images.length > 1}
                                        uploading={uploadingSlot === `tour-${selectedTour.id}-gallery-${index + 1}`}
                                        tone={tone}
                                        isDark={isDark}
                                    />
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="상품 상세 이미지"
                            desc="상품 소개 본문 안에 들어가는 상세 이미지를 아래 순서대로 관리합니다."
                            mutedTone={mutedTone}
                            isDark={isDark}
                            actions={
                                <button
                                    type="button"
                                    onClick={() => updateImageList("detailImages", (current) => [...current, CMS_NULL_IMAGE])}
                                    className={`rounded-2xl px-4 py-2 text-sm font-bold ${isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
                                >
                                    이미지 추가
                                </button>
                            }
                        >
                            <div className="flex flex-col gap-4">
                                {selectedTour.detailImages.map((src, index) => (
                                    <ImageCard
                                        key={`detail-${index}`}
                                        title={`상세 이미지 ${index + 1}`}
                                        value={src}
                                        previewSrc={src || CMS_NULL_IMAGE}
                                        onChange={(value) => updateImageList("detailImages", (current) => current.map((image, imageIndex) => (imageIndex === index ? value : image)))}
                                        onUpload={(file) => void uploadImage(`tour-${selectedTour.id}-detail-${index + 1}`, file, (path) => updateImageList("detailImages", (current) => current.map((image, imageIndex) => (imageIndex === index ? path : image))))}
                                        onRemove={() => updateImageList("detailImages", (current) => current.filter((_, imageIndex) => imageIndex !== index))}
                                        removable
                                        uploading={uploadingSlot === `tour-${selectedTour.id}-detail-${index + 1}`}
                                        tone={tone}
                                        isDark={isDark}
                                    />
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                ) : (
                    <p className={mutedTone}>{loading ? "상품 데이터를 불러오는 중..." : "수정할 상품을 먼저 선택해 주세요."}</p>
                )}
            </div>
        </div>
    );
}

