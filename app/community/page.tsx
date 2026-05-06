"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { type CommunityItem, type CommunityTab, type Locale } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";
import { formatCommunityPostedDate, formatRelativeCommunityTime } from "@/lib/community-time";
import { getCommunityTourHref } from "@/lib/community-tour";
import { CommunityMateCard } from "@/components/community/CommunityMateCard";
import { CommunityQnaCard } from "@/components/community/CommunityQnaCard";
import { CommunityReviewCard } from "@/components/community/CommunityReviewCard";
import { Dropdown } from "@/components/ui/Dropdown";
import { CalendarIcon, CommentIcon, PeopleIcon } from "@/components/ui/SafeIcons";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCmsCommunityContent } from "@/lib/use-cms-community";
import { useCmsTours } from "@/lib/use-cms-tours";
import { executeRecaptcha } from "@/lib/recaptcha-client";

// Locale copy
const cx = {
    ko: {
        tabAll: "전체", tabReview: "후기", tabMate: "동행 찾기", tabQna: "질문",
        writeBtn: "글 작성하기", writeTitle: "새 글 작성",
        writeCancel: "취소", writeSubmit: "등록하기",
        writeSubmitting: "등록 중...",
        typeLabel: "게시판 선택",
        typeReview: "후기", typeMate: "동행 찾기", typeQna: "질문",
        contentPlaceholder: "내용을 입력해주세요.",
        reviewPlaceholder: "여행 후기를 남겨주세요. 투어명, 일정, 느낀 점 등을 자유롭게 작성해보세요.",
        matePlaceholder: "동행을 찾고 있다면 투어명, 출발일, 모집 인원, 연락 방법 등을 적어주세요.",
        qnaPlaceholder: "궁금한 점을 자유롭게 질문해주세요. BlueWolf 운영팀이 답변해드립니다.",
        tourNameLabel: "투어명", tourNamePlaceholder: "예: 고비 사막 5박 6일",
        travelDateLabel: "출발일", travelDatePlaceholder: "예: 2025-08-15",
        maxPeopleLabel: "모집 인원",
        ratingLabel: "별점",
        noItems: "아직 게시글이 없습니다.",
        likes: "좋아요", comments: "댓글",
        commentPlaceholder: "댓글을 입력하세요...",
        commentSubmit: "등록",
        answered: "답변완료", unanswered: "답변대기",
        people: "명",
        recruiting: "모집중",
        full: "모집완료",
        ratingStars: ["매우 나쁨", "나쁨", "보통", "좋음", "매우 좋음"],
        boardTitle: { review: "후기 게시판", mate: "동행 찾기 게시판", qna: "질문 게시판" },
        boardDesc: {
            review: "몽골 여행 경험을 공유해주세요.",
            mate: "함께 여행할 동행을 찾아보세요.",
            qna: "궁금한 점을 BlueWolf에게 물어보세요.",
        },
        photoLabel: "사진 첨부",
        photoDrop: "클릭하거나 사진을 여기에 드래그하세요",
        photoRemaining: "장 더 추가 가능",
        photoRemove: "사진 삭제",
        writeError: "글 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        writeNeedContent: "내용을 입력해주세요.",
        writeNeedTourName: "투어명을 입력해주세요.",
        writeNeedTravelDate: "출발일을 입력해주세요.",
        writeNeedTravelDateFormat: "출발일은 YYYY-MM-DD 형식으로 입력해주세요.",
    },
    ja: {
        tabAll: "すべて", tabReview: "レビュー", tabMate: "同行募集", tabQna: "質問",
        writeBtn: "投稿する", writeTitle: "新規投稿",
        writeCancel: "キャンセル", writeSubmit: "投稿",
        writeSubmitting: "投稿中...",
        typeLabel: "掲示板選択",
        typeReview: "レビュー", typeMate: "同行募集", typeQna: "質問",
        contentPlaceholder: "内容を入力してください。",
        reviewPlaceholder: "旅行の感想をご記入ください。ツアー名、日程、感じたことなど自由にどうぞ。",
        matePlaceholder: "同行者を探している場合は、ツアー名・出発日・募集人数・連絡方法などをご記入ください。",
        qnaPlaceholder: "気になることを自由に質問してください。BlueWolfのスタッフがお答えします。",
        tourNameLabel: "ツアー名", tourNamePlaceholder: "例: ゴビ砂漠 5泊6日",
        travelDateLabel: "出発日", travelDatePlaceholder: "例: 2025-08-15",
        maxPeopleLabel: "募集人数",
        ratingLabel: "評価",
        noItems: "まだ投稿がありません。",
        likes: "いいね", comments: "コメント",
        commentPlaceholder: "コメントを入力...",
        commentSubmit: "投稿",
        answered: "回答済", unanswered: "回答待ち",
        people: "名",
        recruiting: "募集中",
        full: "募集終了",
        ratingStars: ["とても悪い", "悪い", "普通", "良い", "とても良い"],
        boardTitle: { review: "レビュー掲示板", mate: "同行募集掲示板", qna: "質問掲示板" },
        boardDesc: {
            review: "モンゴル旅行の体験をシェアしてください。",
            mate: "一緒に旅行する同行者を探しましょう。",
            qna: "気になることをBlueWolfにお気軽に聞いてください。",
        },
        photoLabel: "写真を添付",
        photoDrop: "クリックまたは写真をドラッグ",
        photoRemaining: "枚追加可能",
        photoRemove: "削除",
        writeError: "投稿の保存に失敗しました。しばらくしてから再度お試しください。",
        writeNeedContent: "内容を入力してください。",
        writeNeedTourName: "ツアー名を入力してください。",
        writeNeedTravelDate: "出発日を入力してください。",
        writeNeedTravelDateFormat: "出発日は YYYY-MM-DD 形式で入力してください。",
    },
    en: {
        tabAll: "All", tabReview: "Reviews", tabMate: "Find Companions", tabQna: "Q&A",
        writeBtn: "Write post", writeTitle: "New post",
        writeCancel: "Cancel", writeSubmit: "Submit",
        writeSubmitting: "Saving...",
        typeLabel: "Board",
        typeReview: "Review", typeMate: "Find Companion", typeQna: "Question",
        contentPlaceholder: "Enter your message.",
        reviewPlaceholder: "Share your travel experience. Feel free to write about the tour, schedule, and impressions.",
        matePlaceholder: "Looking for travel companions? Include tour name, departure date, group size, and contact info.",
        qnaPlaceholder: "Ask anything! The BlueWolf team will answer your questions.",
        tourNameLabel: "Tour name", tourNamePlaceholder: "e.g. Gobi Desert 5N6D",
        travelDateLabel: "Departure", travelDatePlaceholder: "e.g. 2025-08-15",
        maxPeopleLabel: "Group size",
        ratingLabel: "Rating",
        noItems: "No posts yet.",
        likes: "Likes", comments: "Comments",
        commentPlaceholder: "Write a comment...",
        commentSubmit: "Post",
        answered: "Answered", unanswered: "Pending",
        people: " people",
        recruiting: "Open",
        full: "Full",
        ratingStars: ["Very bad", "Bad", "Average", "Good", "Excellent"],
        boardTitle: { review: "Review Board", mate: "Companion Board", qna: "Q&A Board" },
        boardDesc: {
            review: "Share your Mongolia travel experience.",
            mate: "Find companions for your upcoming trip.",
            qna: "Ask BlueWolf anything about your trip.",
        },
        photoLabel: "Attach photos",
        photoDrop: "Click or drag photos here",
        photoRemaining: " more photos allowed",
        photoRemove: "Remove",
        writeError: "Failed to save your post. Please try again in a moment.",
        writeNeedContent: "Please enter your message.",
        writeNeedTourName: "Please enter the tour name.",
        writeNeedTravelDate: "Please enter the departure date.",
        writeNeedTravelDateFormat: "Please enter the departure date in YYYY-MM-DD format.",
    },
} as const;

type WriteFormPhoto = {
    id: string;
    file: File;
    previewUrl: string;
};

type WriteFormSubmitInput = {
    type: Exclude<CommunityTab, "all">;
    text: string;
    tourTitle?: string;
    travelDate?: string;
    maxPeople?: number;
    rating?: number;
    photos?: File[];
};

function createWriteFormPhotoId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
    const sz = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    className={`${sz} ${i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

// Write form
function WriteForm({
    isDark,
    h,
    defaultType,
    onSubmit,
    onClose,
    isModal = false,
}: {
    isDark: boolean;
    h: (typeof cx)[Locale];
    defaultType: Exclude<CommunityTab, "all">;
    onSubmit: (input: WriteFormSubmitInput) => Promise<void>;
    onClose: () => void;
    isModal?: boolean;
}) {
    const [formType, setFormType] = useState<Exclude<CommunityTab, "all">>(defaultType);
    const [formText, setFormText] = useState("");
    const [tourName, setTourName] = useState("");
    const [travelDate, setTravelDate] = useState("");
    const [maxPeople, setMaxPeople] = useState("4");
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [photoDrafts, setPhotoDrafts] = useState<WriteFormPhoto[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoDraftsRef = useRef<WriteFormPhoto[]>([]);
    const animatedFieldsRef = useRef<HTMLDivElement>(null);
    const [animatedFieldsHeight, setAnimatedFieldsHeight] = useState<number | null>(null);
    const animatedLastHeightRef = useRef(0);
    const animatedFrameOneRef = useRef<number | null>(null);
    const animatedFrameTwoRef = useRef<number | null>(null);
    const MAX_PHOTOS = 5;

    useEffect(() => {
        photoDraftsRef.current = photoDrafts;
    }, [photoDrafts]);

    useEffect(() => {
        return () => {
            photoDraftsRef.current.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
        };
    }, []);

    useLayoutEffect(() => {
        const element = animatedFieldsRef.current;
        if (!element) return;

        const measureHeight = () => Math.ceil(element.getBoundingClientRect().height);

        const transitionToHeight = (nextHeight: number) => {
            const previousHeight = animatedLastHeightRef.current || nextHeight;

            if (previousHeight === nextHeight) {
                animatedLastHeightRef.current = nextHeight;
                setAnimatedFieldsHeight(nextHeight);
                return;
            }

            if (animatedFrameOneRef.current) {
                cancelAnimationFrame(animatedFrameOneRef.current);
            }
            if (animatedFrameTwoRef.current) {
                cancelAnimationFrame(animatedFrameTwoRef.current);
            }

            setAnimatedFieldsHeight(previousHeight);

            animatedFrameOneRef.current = requestAnimationFrame(() => {
                animatedFrameTwoRef.current = requestAnimationFrame(() => {
                    animatedLastHeightRef.current = nextHeight;
                    setAnimatedFieldsHeight(nextHeight);
                });
            });
        };

        const initialHeight = measureHeight();
        animatedLastHeightRef.current = initialHeight;
        setAnimatedFieldsHeight(initialHeight);

        const observer = new ResizeObserver(() => {
            transitionToHeight(measureHeight());
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
            if (animatedFrameOneRef.current) {
                cancelAnimationFrame(animatedFrameOneRef.current);
            }
            if (animatedFrameTwoRef.current) {
                cancelAnimationFrame(animatedFrameTwoRef.current);
            }
        };
    }, []);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
        const remaining = MAX_PHOTOS - photoDrafts.length;
        const nextDrafts = imgs.slice(0, remaining).map((file) => ({
            id: createWriteFormPhotoId(),
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setPhotoDrafts((prev) => [...prev, ...nextDrafts]);
    };

    const removePhoto = (index: number) => {
        setPhotoDrafts((prev) => {
            const target = prev[index];
            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 ${
        isDark
            ? "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500"
            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
    }`;

    const placeholder =
        formType === "review" ? h.reviewPlaceholder
        : formType === "mate" ? h.matePlaceholder
        : h.qnaPlaceholder;
    const maxPeopleOptions = Array.from({ length: 9 }, (_, index) => {
        const count = index + 2;
        return {
            value: String(count),
            label: `${count}${h.people}`,
        };
    });

    const handleSubmit = async () => {
        const trimmedText = formText.trim();
        const trimmedTourName = tourName.trim();
        const trimmedTravelDate = travelDate.trim();

        if (!trimmedText) {
            setSubmitError(h.writeNeedContent);
            return;
        }

        if ((formType === "review" || formType === "mate") && !trimmedTourName) {
            setSubmitError(h.writeNeedTourName);
            return;
        }

        if (formType === "mate" && !trimmedTravelDate) {
            setSubmitError(h.writeNeedTravelDate);
            return;
        }

        if (
            formType === "mate" &&
            trimmedTravelDate &&
            !/^\d{4}-\d{2}-\d{2}$/.test(trimmedTravelDate)
        ) {
            setSubmitError(h.writeNeedTravelDateFormat);
            return;
        }

        setSubmitError("");
        setIsSubmitting(true);

        try {
            await onSubmit({
                type: formType,
                text: trimmedText,
                tourTitle:
                    formType === "review" || formType === "mate" ? trimmedTourName : undefined,
                travelDate: formType === "mate" ? trimmedTravelDate : undefined,
                maxPeople: formType === "mate" ? Math.max(2, Number(maxPeople) || 4) : undefined,
                rating: formType === "review" ? rating : undefined,
                photos: formType === "review" ? photoDrafts.map((draft) => draft.file) : [],
            });
        } catch {
            setSubmitError(h.writeError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`relative z-[140] rounded-[22px] border p-5 ${isModal ? "mt-0" : "mt-5"} ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
            <h2 className={`mb-4 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>{h.writeTitle}</h2>

            {/* 게시판 선택 */}
            <div className="mb-4">
                <p className={`mb-2 text-xs font-extrabold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{h.typeLabel}</p>
                <div className="flex gap-2">
                    {(["mate", "review", "qna"] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFormType(type)}
                            className={`origin-center transform-gpu rounded-full text-xs font-extrabold transition-[transform,padding,background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                                formType === type
                                    ? "scale-[1.04] bg-blue-600 px-4 py-2 text-white shadow-[0_8px_18px_rgba(37,99,235,0.24)]"
                                    : isDark
                                      ? "scale-100 bg-slate-800 px-3.5 py-1.5 text-slate-300 hover:bg-slate-700"
                                      : "scale-100 bg-slate-100 px-3.5 py-1.5 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {type === "review" ? h.typeReview : type === "mate" ? h.typeMate : h.typeQna}
                        </button>
                    ))}
                </div>
            </div>

            <div
                className="overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
                style={animatedFieldsHeight === null ? undefined : { height: animatedFieldsHeight }}
            >
                <div ref={animatedFieldsRef}>
                    {/* 후기: 별점 */}
                    {formType === "review" && (
                        <div className="mb-4">
                            <p className={`mb-2 text-xs font-extrabold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{h.ratingLabel}</p>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onMouseEnter={() => setHoverRating(i + 1)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(i + 1)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <svg className={`h-7 w-7 ${i < (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                                <span className={`ml-2 self-center text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {h.ratingStars[(hoverRating || rating) - 1]}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 후기/동행: 투어명 */}
                    {(formType === "review" || formType === "mate") && (
                        <div className="mb-4">
                            <p className={`mb-2 text-xs font-extrabold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{h.tourNameLabel}</p>
                            <input
                                value={tourName}
                                onChange={(e) => setTourName(e.target.value)}
                                placeholder={h.tourNamePlaceholder}
                                className={inputClass}
                            />
                        </div>
                    )}

                    {/* 동행: 출발일, 모집 인원 */}
                    {formType === "mate" && (
                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className={`mb-2 text-xs font-extrabold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{h.travelDateLabel}</p>
                                <input
                                    value={travelDate}
                                    onChange={(e) => setTravelDate(e.target.value)}
                                    placeholder={h.travelDatePlaceholder}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <p className={`mb-2 text-xs font-extrabold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{h.maxPeopleLabel}</p>
                                <Dropdown
                                    value={maxPeople}
                                    onChange={setMaxPeople}
                                    options={maxPeopleOptions}
                                    isDark={isDark}
                                />
                            </div>
                        </div>
                    )}

                    {/* 후기: 사진 첨부 */}
                    {formType === "review" && (
                        <div className="mb-4">
                            <p className={`mb-2 text-xs font-extrabold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                {h.photoLabel}
                                <span className={`ml-2 font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    ({photoDrafts.length}/{MAX_PHOTOS})
                                </span>
                            </p>

                            {/* 미리보기 그리드 */}
                            {photoDrafts.length > 0 && (
                                <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                                    {photoDrafts.map((draft, i) => (
                                        <div key={draft.id} className="group relative aspect-square overflow-hidden rounded-[14px]">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={draft.previewUrl} alt="" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                title={h.photoRemove}
                                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 업로드 영역 */}
                            {photoDrafts.length < MAX_PHOTOS && (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
                                        isDragging
                                            ? isDark ? "border-blue-400 bg-blue-500/10" : "border-blue-400 bg-blue-50"
                                            : isDark ? "border-white/20 hover:border-blue-400/50 hover:bg-white/5" : "border-slate-300 hover:border-blue-300 hover:bg-blue-50/50"
                                    }`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        handleFiles(e.dataTransfer.files);
                                    }}
                                >
                                    <svg className={`mx-auto mb-2 h-8 w-8 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M3.75 3a.75.75 0 00-.75.75v14.5c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75H3.75zM12 8.25h.008v.008H12V8.25z" />
                                    </svg>
                                    <p className={`text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{h.photoDrop}</p>
                                    <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                        {MAX_PHOTOS - photoDrafts.length}{h.photoRemaining}
                                    </p>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 본문 */}
            <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder={placeholder}
                className={`${inputClass} resize-none`}
                rows={4}
            />

            {submitError ? (
                <p className="mt-3 text-sm font-bold text-rose-500">{submitError}</p>
            ) : null}

            <div className="mt-3 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                        isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                >
                    {h.writeCancel}
                </button>
                <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting}
                    className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                    {isSubmitting ? h.writeSubmitting : h.writeSubmit}
                </button>
            </div>
        </div>
    );
}

function WriteModal({
    isDark,
    h,
    defaultType,
    onSubmit,
    onClose,
}: {
    isDark: boolean;
    h: (typeof cx)[Locale];
    defaultType: Exclude<CommunityTab, "all">;
    onSubmit: (input: WriteFormSubmitInput) => Promise<void>;
    onClose: () => void;
}) {
    useBodyScrollLock(true);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className="animate-fade-in-overlay fixed bottom-0 left-0 right-0 top-0 z-[220] flex h-dvh w-screen items-end justify-center bg-black/45 p-4 backdrop-blur-md sm:items-center sm:p-6"
            onClick={onClose}
        >
            <div
                className="animate-slide-up-modal relative z-10 w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto"
                onClick={(event) => event.stopPropagation()}
            >
                <WriteForm
                    isDark={isDark}
                    h={h}
                    defaultType={defaultType}
                    onSubmit={onSubmit}
                    onClose={onClose}
                    isModal
                />
            </div>
        </div>,
        document.body
    );
}

// Detail modal
function DetailModal({
    item,
    isDark,
    h,
    onClose,
    onEditSaved,
    onMateApply,
    mateApplyLabel,
    mateAppliedLabel,
    mateApplied,
    tourHref,
    viewTourLabel,
}: {
    item: CommunityItem;
    isDark: boolean;
    h: (typeof cx)[Locale];
    onClose: () => void;
    onEditSaved: (community: ReturnType<typeof useCmsCommunityContent>["communityContent"], item: CommunityItem) => void;
    onMateApply: () => void;
    mateApplyLabel: string;
    mateAppliedLabel: string;
    mateApplied: boolean;
    tourHref: string;
    viewTourLabel: string;
}) {
    const { lang } = usePage();
    const { user } = useAuth();
    const [commentText, setCommentText] = useState("");
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likes);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);
    const [editTourTitle, setEditTourTitle] = useState(item.tourTitle ?? "");
    const [editTravelDate, setEditTravelDate] = useState(item.travelDate ?? "");
    const [editMaxPeople, setEditMaxPeople] = useState(String(item.maxPeople ?? 4));
    const [editRating, setEditRating] = useState(item.rating ?? 5);
    const [editError, setEditError] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportContent, setReportContent] = useState("");
    const [reportError, setReportError] = useState("");
    const [reportDone, setReportDone] = useState(false);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const isOwner = Boolean(
        user &&
            (item.authorId?.toLowerCase() === user.id.toLowerCase() ||
                item.author.toLowerCase() === user.id.toLowerCase() ||
                item.author === user.name)
    );
    const isMateFull = item.type === "mate" && (item.currentPeople ?? 0) >= (item.maxPeople ?? 1);
    const mateProgress =
        item.type === "mate" && item.maxPeople
            ? Math.min(100, ((item.currentPeople ?? 0) / item.maxPeople) * 100)
            : 0;

    const panelBg = isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const textMain = isDark ? "text-white" : "text-slate-900";
    const commentBg = isDark ? "bg-slate-950 border-white/10" : "bg-slate-50 border-slate-200";
    const editLabel = lang === "ko" ? "수정" : lang === "ja" ? "編集" : "Edit";
    const reportLabel = lang === "ko" ? "신고" : lang === "ja" ? "通報" : "Report";
    const saveEditLabel = lang === "ko" ? "수정 저장" : lang === "ja" ? "編集を保存" : "Save edits";
    const cancelEditLabel = lang === "ko" ? "취소" : lang === "ja" ? "キャンセル" : "Cancel";
    const reportPlaceholder =
        lang === "ko"
            ? "신고 사유를 입력해주세요."
            : lang === "ja"
              ? "通報理由を入力してください。"
              : "Describe the reason for this report.";
    const reportDoneLabel =
        lang === "ko" ? "신고가 접수되었습니다." : lang === "ja" ? "通報を受け付けました。" : "Report submitted.";

    const handleSaveEdit = async () => {
        const trimmedText = editText.trim();
        if (!trimmedText) {
            setEditError(h.writeNeedContent);
            return;
        }

        setIsSavingEdit(true);
        setEditError("");

        try {
            const response = await fetch("/api/community/posts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    locale: lang,
                    id: item.id,
                    text: trimmedText,
                    tourTitle: editTourTitle,
                    travelDate: editTravelDate,
                    maxPeople: Number(editMaxPeople),
                    rating: editRating,
                }),
            });

            if (!response.ok) {
                throw new Error("COMMUNITY_POST_EDIT_FAILED");
            }

            const data = (await response.json()) as {
                community: ReturnType<typeof useCmsCommunityContent>["communityContent"];
                item: CommunityItem;
            };
            onEditSaved(data.community, data.item);
            setIsEditing(false);
        } catch {
            setEditError(lang === "ko" ? "게시글 수정에 실패했습니다." : lang === "ja" ? "投稿の編集に失敗しました。" : "Failed to edit this post.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleSubmitReport = async () => {
        const content = reportContent.trim();
        if (content.length < 5) {
            setReportError(reportPlaceholder);
            return;
        }

        setIsSubmittingReport(true);
        setReportError("");

        try {
            const recaptchaToken = await executeRecaptcha("report_submit").catch(() => "");
            const response = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetType: "post",
                    targetId: `${lang}:${item.id}`,
                    reportType: "inappropriate",
                    content,
                    recaptchaToken,
                }),
            });

            if (!response.ok) {
                throw new Error("REPORT_FAILED");
            }

            setReportDone(true);
            setReportContent("");
        } catch {
            setReportError(lang === "ko" ? "신고 접수에 실패했습니다." : lang === "ja" ? "通報に失敗しました。" : "Failed to submit the report.");
        } finally {
            setIsSubmittingReport(false);
        }
    };

    useBodyScrollLock(true);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className="animate-fade-in-overlay fixed bottom-0 left-0 right-0 top-0 z-50 flex h-dvh w-screen items-end justify-center bg-black/50 backdrop-blur-md sm:items-center"
            onClick={onClose}
        >
            <div
                className={`animate-slide-up-modal relative z-10 w-full max-w-2xl rounded-t-[28px] border p-6 shadow-2xl sm:rounded-[28px] sm:m-4 ${panelBg} max-h-[85vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                            {item.author[0]}
                        </div>
                        <div>
                            <p className={`text-sm font-black ${textMain}`}>{item.author}</p>
                            <p className={`text-xs ${textMuted}`}>{formatRelativeCommunityTime(item.date, lang)}</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                        {isOwner ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing((value) => !value)}
                                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                                    isDark
                                        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                {editLabel}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => setIsReportOpen((value) => !value)}
                            className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                                isDark
                                    ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            }`}
                        >
                            {reportLabel}
                        </button>
                        <button
                            onClick={onClose}
                            className={`rounded-full p-2 transition ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                        >
                            <svg className={`h-5 w-5 ${textMuted}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 후기 별점 */}
                {item.type === "review" && item.rating && (
                    <div className="mt-4 flex items-center gap-2">
                        <StarRating rating={item.rating} size="md" />
                        <span className={`text-sm font-bold text-amber-500`}>{item.rating}.0</span>
                    </div>
                )}

                {/* 투어/날짜 배지 */}
                {(item.tourTitle || item.travelDate) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {item.tourTitle && (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isDark ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                                {item.tourTitle}
                            </span>
                        )}
                        {item.travelDate && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${isDark ? "border-slate-600 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-600"}`}>
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {item.travelDate}
                            </span>
                        )}
                        {item.type === "mate" && item.maxPeople && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                                (item.currentPeople ?? 0) >= item.maxPeople
                                    ? isDark ? "border-slate-600 bg-slate-800 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-500"
                                    : isDark ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}>
                                <PeopleIcon className="h-3.5 w-3.5" />
                                {item.currentPeople}/{item.maxPeople}{h.people}
                                {" · "}
                                {(item.currentPeople ?? 0) >= item.maxPeople ? h.full : h.recruiting}
                            </span>
                        )}
                        {item.type === "qna" && (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                item.answered
                                    ? isDark ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : isDark ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}>
                                {item.answered ? `A · ${h.answered}` : `Q · ${h.unanswered}`}
                            </span>
                        )}
                    </div>
                )}

                {isEditing ? (
                    <div className={`mt-4 rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                        {(item.type === "review" || item.type === "mate") ? (
                            <label className="mb-3 block">
                                <span className={`mb-1.5 block text-xs font-black ${textMuted}`}>{h.tourNameLabel}</span>
                                <input
                                    value={editTourTitle}
                                    onChange={(event) => setEditTourTitle(event.target.value)}
                                    className={`h-11 w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 ${
                                        isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                                    }`}
                                />
                            </label>
                        ) : null}

                        {item.type === "review" ? (
                            <div className="mb-3">
                                <span className={`mb-1.5 block text-xs font-black ${textMuted}`}>{h.ratingLabel}</span>
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <button key={index} type="button" onClick={() => setEditRating(index + 1)}>
                                            <svg className={`h-6 w-6 ${index < editRating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {item.type === "mate" ? (
                            <div className="mb-3 grid gap-3 sm:grid-cols-2">
                                <label>
                                    <span className={`mb-1.5 block text-xs font-black ${textMuted}`}>{h.travelDateLabel}</span>
                                    <input
                                        value={editTravelDate}
                                        onChange={(event) => setEditTravelDate(event.target.value)}
                                        className={`h-11 w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 ${
                                            isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                                        }`}
                                    />
                                </label>
                                <label>
                                    <span className={`mb-1.5 block text-xs font-black ${textMuted}`}>{h.maxPeopleLabel}</span>
                                    <input
                                        type="number"
                                        min={2}
                                        value={editMaxPeople}
                                        onChange={(event) => setEditMaxPeople(event.target.value)}
                                        className={`h-11 w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 ${
                                            isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                                        }`}
                                    />
                                </label>
                            </div>
                        ) : null}

                        <textarea
                            value={editText}
                            onChange={(event) => setEditText(event.target.value)}
                            rows={5}
                            className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 ${
                                isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                            }`}
                        />
                        {editError ? <p className="mt-2 text-xs font-bold text-rose-500">{editError}</p> : null}
                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className={`rounded-2xl px-4 py-2 text-sm font-black ${isDark ? "bg-slate-800 text-slate-100" : "bg-slate-200 text-slate-700"}`}
                            >
                                {cancelEditLabel}
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={isSavingEdit}
                                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-500 disabled:opacity-60"
                            >
                                {isSavingEdit ? h.writeSubmitting : saveEditLabel}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className={`mt-4 text-sm leading-7 sm:text-base ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {item.text}
                    </p>
                )}

                {isReportOpen ? (
                    <div className={`mt-4 rounded-[22px] border p-4 ${isDark ? "border-rose-500/20 bg-rose-500/5" : "border-rose-100 bg-rose-50/70"}`}>
                        {reportDone ? (
                            <p className={`text-sm font-bold ${isDark ? "text-rose-200" : "text-rose-700"}`}>{reportDoneLabel}</p>
                        ) : (
                            <>
                                <textarea
                                    value={reportContent}
                                    onChange={(event) => setReportContent(event.target.value)}
                                    rows={3}
                                    placeholder={reportPlaceholder}
                                    className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100 ${
                                        isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-rose-100 bg-white text-slate-900"
                                    }`}
                                />
                                {reportError ? <p className="mt-2 text-xs font-bold text-rose-500">{reportError}</p> : null}
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSubmitReport}
                                        disabled={isSubmittingReport}
                                        className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-black text-white transition hover:bg-rose-500 disabled:opacity-60"
                                    >
                                        {isSubmittingReport ? h.writeSubmitting : reportLabel}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : null}
                {item.type === "mate" ? (
                    <div className={`mt-5 rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                        {item.maxPeople ? (
                            <div className="mb-4">
                                <div className="mb-2 flex items-center justify-between text-xs">
                                    <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                                        {item.currentPeople}/{item.maxPeople}{h.people}
                                    </span>
                                    <span className={`font-bold ${isMateFull ? (isDark ? "text-slate-400" : "text-slate-500") : isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                        {isMateFull ? h.full : `${(item.maxPeople - (item.currentPeople ?? 0))}${h.people} ${h.recruiting}`}
                                    </span>
                                </div>
                                <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                                    <div
                                        className={`h-full rounded-full transition-all ${isMateFull ? "bg-slate-400" : "bg-emerald-500"}`}
                                        style={{ width: `${mateProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={onMateApply}
                                disabled={mateApplied || isMateFull}
                                className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
                                    mateApplied
                                        ? isDark
                                            ? "bg-emerald-500/15 text-emerald-300"
                                            : "bg-emerald-50 text-emerald-700"
                                        : isMateFull
                                          ? isDark
                                              ? "bg-slate-800 text-slate-500"
                                              : "bg-slate-100 text-slate-400"
                                          : "bg-violet-600 text-white hover:bg-violet-500"
                                }`}
                            >
                                {mateApplied ? mateAppliedLabel : isMateFull ? h.full : mateApplyLabel}
                            </button>
                            <Link
                                href={tourHref}
                                className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
                                    isDark
                                        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                {viewTourLabel}
                            </Link>
                        </div>
                    </div>
                ) : null}

                {/* 첨부 사진 갤러리 */}
                {item.photos && item.photos.length > 0 && (
                    <div className="mt-5">
                        <div className={`grid gap-2 ${
                            item.photos.length === 1 ? "grid-cols-1"
                            : item.photos.length === 2 ? "grid-cols-2"
                            : "grid-cols-3"
                        }`}>
                            {item.photos.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => setLightboxIndex(i)}
                                    className={`group relative overflow-hidden rounded-[16px] ${
                                        item.photos!.length === 1 ? "aspect-video" : "aspect-square"
                                    } ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                                >
                                    <Image
                                        src={src}
                                        alt=""
                                        fill
                                        sizes="(max-width: 640px) 45vw, 220px"
                                        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                    {/* 4장 이상이면 마지막 칸에 +n 표시 */}
                                    {i === 2 && item.photos!.length > 3 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <span className="text-xl font-black text-white">+{item.photos!.length - 3}</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 좋아요 */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => { setLiked((v) => !v); setLikeCount((v) => liked ? v - 1 : v + 1); }}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                            liked
                                ? "border-blue-400 bg-blue-600 text-white"
                                : isDark ? "border-white/10 bg-slate-800 text-slate-300 hover:border-blue-400/50" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
                        }`}
                    >
                        <svg className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {h.likes} {likeCount}
                    </button>
                    <span className={`inline-flex items-center gap-1.5 text-xs ${textMuted}`}>
                        <CommentIcon className="h-3.5 w-3.5" />
                        {h.comments} {item.comments?.length ?? 0}
                    </span>
                    <span className={`ml-auto text-[11px] ${textMuted}`}>
                        {formatCommunityPostedDate(item.date, lang)}
                    </span>
                </div>

                {/* 댓글 목록 */}
                {(item.comments?.length ?? 0) > 0 && (
                    <div className="mt-5 flex flex-col gap-3">
                        {item.comments!.map((c, i) => (
                            <div key={i} className={`rounded-[16px] border p-4 ${commentBg}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                                            c.author === "BlueWolf"
                                                ? "bg-blue-600 text-white"
                                                : isDark ? "bg-slate-700 text-slate-200" : "bg-slate-200 text-slate-700"
                                        }`}>
                                            {c.author[0]}
                                        </div>
                                        <span className={`text-xs font-black ${c.author === "BlueWolf" ? "text-blue-500" : textMain}`}>
                                            {c.author}
                                            {c.author === "BlueWolf" && (
                                                <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">운영</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className={`text-[11px] ${textMuted}`}>{formatRelativeCommunityTime(c.date, lang)}</span>
                                </div>
                                <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{c.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* 댓글 입력 */}
                <div className="mt-4 flex gap-2">
                    <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={h.commentPlaceholder}
                        className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 ${
                            isDark
                                ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                                : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                        }`}
                    />
                    <button
                        onClick={() => setCommentText("")}
                        className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-[0.98]"
                    >
                        {h.commentSubmit}
                    </button>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && item.photos && (
                <div
                    className="fixed bottom-0 left-0 right-0 top-0 z-[60] flex h-dvh w-screen items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* 이전 */}
                    {lightboxIndex > 0 && (
                        <button
                            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex((v) => (v ?? 1) - 1); }}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <Image
                        src={item.photos[lightboxIndex]}
                        alt=""
                        width={1600}
                        height={1200}
                        className="h-auto max-h-[85vh] w-auto max-w-[90vw] rounded-[18px] object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {/* 다음 */}
                    {lightboxIndex < item.photos.length - 1 && (
                        <button
                            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex((v) => (v ?? 0) + 1); }}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                    {/* 닫기 + 카운트 */}
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                        <span className="text-sm font-bold text-white/70">{lightboxIndex + 1} / {item.photos.length}</span>
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                            onClick={() => setLightboxIndex(null)}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
}

// Main content
function CommunityContent() {
    const { lang, isDark } = usePage();
    const h = cx[lang];
    const { user } = useAuth();
    const { tourItems } = useCmsTours();
    const { communityContent, setCommunityContent } = useCmsCommunityContent();

    const [activeTab, setActiveTab] = useState<CommunityTab>("all");
    const [animKey, setAnimKey] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [appliedMateIds, setAppliedMateIds] = useState<number[]>([]);

    const handleTabChange = (tab: CommunityTab) => {
        setActiveTab(tab);
        setAnimKey((v) => v + 1);
    };

    const handleMateApply = (targetItem: CommunityItem) => {
        if (targetItem.type !== "mate") return;

        const alreadyApplied = appliedMateIds.includes(targetItem.id);
        const isFull = (targetItem.currentPeople ?? 0) >= (targetItem.maxPeople ?? 1);

        if (alreadyApplied || isFull) return;

        setAppliedMateIds((prev) => [...prev, targetItem.id]);
    };

    const uploadCommunityPhotos = async (files: File[]) => {
        if (files.length === 0) return [];

        return Promise.all(
            files.map(async (file) => {
                const formData = new FormData();
                formData.set("file", file);

                const response = await fetch("/api/community/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("UPLOAD_FAILED");
                }

                const data = (await response.json()) as { path: string };
                return data.path;
            })
        );
    };

    const handleWriteSubmit = async (input: WriteFormSubmitInput) => {
        const uploadedPhotos =
            input.type === "review" && input.photos?.length
                ? await uploadCommunityPhotos(input.photos)
                : [];

        const response = await fetch("/api/community/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                locale: lang,
                type: input.type,
                author: user?.id ?? "BlueWolf Guest",
                text: input.text,
                tourTitle: input.tourTitle,
                travelDate: input.travelDate,
                maxPeople: input.maxPeople,
                rating: input.rating,
                photos: uploadedPhotos,
            }),
        });

        if (!response.ok) {
            throw new Error("SAVE_FAILED");
        }

        const data = (await response.json()) as {
            community: typeof communityContent;
            item: CommunityItem;
        };

        setCommunityContent(data.community);
        handleTabChange(input.type);
        setSelectedItemId(data.item.id);
        setShowForm(false);
    };

    const handleEditSaved = (
        nextCommunity: typeof communityContent,
        updatedItem: CommunityItem
    ) => {
        setCommunityContent(nextCommunity);
        setSelectedItemId(updatedItem.id);
    };

    const mateApplyLabel =
        lang === "ko" ? "참가 신청" : lang === "ja" ? "参加申請" : "Join now";
    const mateAppliedLabel =
        lang === "ko" ? "신청 완료" : lang === "ja" ? "申請完了" : "Applied";

    const viewTourLabel =
        lang === "ko" ? "투어 살펴보기" : lang === "ja" ? "ツアーを見る" : "View tour";
    const getTourHref = (item: CommunityItem) =>
        getCommunityTourHref(item.tourTitle, lang, tourItems);

    const localeItems = communityContent.items[lang];
    const allItems = localeItems.map((item) => {
        if (item.type !== "mate" || !appliedMateIds.includes(item.id)) return item;

        return {
            ...item,
            currentPeople: Math.min(
                item.maxPeople ?? (item.currentPeople ?? 0) + 1,
                (item.currentPeople ?? 0) + 1
            ),
        };
    });
    const filteredItems = activeTab === "all" ? allItems : allItems.filter((item) => item.type === activeTab);
    const selectedItem =
        selectedItemId === null ? null : allItems.find((item) => item.id === selectedItemId) ?? null;

    const reviewItems = filteredItems.filter((i) => i.type === "review");
    const mateItems = filteredItems.filter((i) => i.type === "mate");
    const qnaItems = filteredItems.filter((i) => i.type === "qna");

    const sectionBase = `rounded-[24px] border shadow-sm transition-colors duration-300 sm:rounded-[28px] ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;

    const tabs: [CommunityTab, string][] = [
        ["all", h.tabAll],
        ["mate", h.tabMate],
        ["review", h.tabReview],
        ["qna", h.tabQna],
    ];

    const tabColors: Record<CommunityTab, string> = {
        all: "bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.25)]",
        review: "bg-emerald-500 text-white shadow-[0_6px_16px_rgba(16,185,129,0.25)]",
        mate: "bg-violet-500 text-white shadow-[0_6px_16px_rgba(139,92,246,0.25)]",
        qna: "bg-amber-500 text-white shadow-[0_6px_16px_rgba(245,158,11,0.25)]",
    };

    const formDefaultType: Exclude<CommunityTab, "all"> =
        activeTab === "all" ? "mate" : (activeTab as Exclude<CommunityTab, "all">);
    const notices = communityContent.notices[lang].slice(0, 2);
    const boardMore =
        lang === "ko" ? "더보기" : lang === "ja" ? "もっと見る" : "View all";
    const boardMoreHref: Record<Exclude<CommunityTab, "all">, string> = {
        review: withLocaleQuery("/community/reviews", lang),
        mate: withLocaleQuery("/community/mates", lang),
        qna: withLocaleQuery("/community/qna", lang),
    };
    const noticeTitle =
        lang === "ko" ? "공지" : lang === "ja" ? "お知らせ" : "Notices";
    const noticeCta =
        lang === "ko" ? "바로가기" : lang === "ja" ? "開く" : "Open";
    const noticeMore =
        lang === "ko" ? "더보기" : lang === "ja" ? "もっと見る" : "View all";

    return (
        <>
            <div className="flex flex-col gap-4">
                <section
                    className={`animate-fade-up ${sectionBase} p-5 sm:p-6`}
                    style={{ animationDelay: "0ms" }}
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-500">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="9" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6" />
                                    <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </span>
                            <div>
                                <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {noticeTitle}
                                </h2>
                                <p className={`text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {lang === "ko"
                                        ? "중요한 안내를 가장 먼저 확인해보세요."
                                        : lang === "ja"
                                          ? "重要なお知らせを先に確認できます。"
                                          : "Check the latest important updates first."}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={withLocaleQuery("/community/notices", lang)}
                            className={`inline-flex items-center justify-center self-start rounded-full px-4 py-2 text-sm font-extrabold transition ${
                                isDark
                                    ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                            {noticeMore}
                        </Link>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        {notices.map((notice) => {
                            const content = (
                                <div
                                    className={`rounded-[24px] border px-4 py-4 transition sm:px-5 ${
                                        notice.important
                                            ? isDark
                                                ? "border-rose-400/20 bg-rose-500/10"
                                                : "border-rose-200 bg-rose-50/80"
                                            : isDark
                                              ? "border-white/10 bg-white/5"
                                              : "border-slate-200 bg-slate-50"
                                    }`}
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {notice.important ? (
                                                    <span className="inline-flex rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-extrabold text-white">
                                                        {lang === "ko"
                                                            ? "중요"
                                                            : lang === "ja"
                                                              ? "重要"
                                                              : "Important"}
                                                    </span>
                                                ) : null}
                                                <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                    {notice.date}
                                                </span>
                                            </div>
                                            <h3 className={`mt-2 text-base font-black sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                                                {notice.title}
                                            </h3>
                                            <p className={`mt-1 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                                {notice.summary}
                                            </p>
                                        </div>

                                        {notice.href ? (
                                            <span
                                                className={`inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1.5 text-xs font-extrabold ${
                                                    isDark
                                                        ? "bg-slate-800 text-slate-100"
                                                        : "bg-white text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
                                                }`}
                                            >
                                                {noticeCta}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            );

                            return notice.href ? (
                                <Link
                                    key={notice.id}
                                    href={withLocaleQuery(notice.href, lang)}
                                    className="block"
                                >
                                    {content}
                                </Link>
                            ) : (
                                <div key={notice.id}>{content}</div>
                            );
                        })}
                    </div>
                </section>
                {/* 헤더 */}
                <div className={`relative ${showForm ? "z-[120]" : "z-10"} animate-fade-up ${sectionBase} p-5 sm:p-7`} style={{ animationDelay: "0ms" }}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                                {activeTab === "all" ? "커뮤니티"
                                    : activeTab === "review" ? h.boardTitle.review
                                    : activeTab === "mate" ? h.boardTitle.mate
                                    : h.boardTitle.qna}
                            </h1>
                            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                {activeTab === "all"
                                    ? (lang === "ko" ? "후기·동행·질문을 자유롭게 나눠보세요." : lang === "ja" ? "レビュー・同行・質問を自由に共有しましょう。" : "Share reviews, find companions, and ask questions.")
                                    : activeTab === "review" ? h.boardDesc.review
                                    : activeTab === "mate" ? h.boardDesc.mate
                                    : h.boardDesc.qna}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="shrink-0 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.20)] transition hover:bg-blue-500 active:scale-[0.98]"
                        >
                            {h.writeBtn}
                        </button>
                    </div>

                    {/* 탭 */}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {tabs.map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => handleTabChange(key)}
                                className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all duration-700 ease-in-out active:scale-[0.97] ${
                                    activeTab === key
                                        ? tabColors[key]
                                        : isDark
                                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {label}
                                <span className={`ml-1.5 text-xs ${activeTab === key ? "opacity-80" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                                    {key === "all" ? allItems.length
                                        : allItems.filter((i) => i.type === key).length}
                                </span>
                            </button>
                        ))}
                    </div>

                </div>

                {/* 후기 섹션 */}
                {(activeTab === "all" || activeTab === "review") && reviewItems.length > 0 && (
                    <section key={`review-${animKey}`} className={`order-2 animate-fade-up ${sectionBase}`} style={{ animationDelay: "120ms" }}>
                        <div className="border-b p-5 sm:px-7 sm:py-5" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgb(226,232,240)" }}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </span>
                                <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{h.boardTitle.review}</h2>
                                <span className={`ml-1 text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{reviewItems.length}</span>
                                </div>
                                <Link
                                    href={boardMoreHref.review}
                                    className={`inline-flex items-center justify-center self-start rounded-full px-4 py-2 text-sm font-extrabold transition ${
                                        isDark
                                            ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {boardMore}
                                </Link>
                            </div>
                        </div>
                        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                            {reviewItems.map((item, i) => (
                                <div key={item.id} className="h-full animate-fade-up" style={{ animationDelay: `${80 + i * 55}ms` }}>
                                    <CommunityReviewCard
                                        item={item}
                                        isDark={isDark}
                                        locale={lang}
                                        onClick={() => setSelectedItemId(item.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 동행 섹션 */}
                {(activeTab === "all" || activeTab === "mate") && mateItems.length > 0 && (
                    <section key={`mate-${animKey}`} className={`order-1 animate-fade-up ${sectionBase}`} style={{ animationDelay: "60ms" }}>
                        <div className="border-b p-5 sm:px-7 sm:py-5" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgb(226,232,240)" }}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="10" cy="7" r="3" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-3-3.87" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 4.13a4 4 0 010 7.75" />
                                    </svg>
                                </span>
                                <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{h.boardTitle.mate}</h2>
                                <span className={`ml-1 text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{mateItems.length}</span>
                                </div>
                                <Link
                                    href={boardMoreHref.mate}
                                    className={`inline-flex items-center justify-center self-start rounded-full px-4 py-2 text-sm font-extrabold transition ${
                                        isDark
                                            ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {boardMore}
                                </Link>
                            </div>
                        </div>
                        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                            {mateItems.map((item, i) => (
                                <div key={item.id} className="animate-fade-up" style={{ animationDelay: `${80 + i * 55}ms` }}>
                                    <CommunityMateCard
                                        item={item}
                                        isDark={isDark}
                                        locale={lang}
                                        peopleLabel={h.people}
                                        recruitingLabel={h.recruiting}
                                        fullLabel={h.full}
                                        onClick={() => setSelectedItemId(item.id)}
                                        onApply={() => handleMateApply(item)}
                                        applyLabel={mateApplyLabel}
                                        appliedLabel={mateAppliedLabel}
                                        applied={appliedMateIds.includes(item.id)}
                                        tourHref={getTourHref(item)}
                                        viewTourLabel={viewTourLabel}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Q&A 섹션 */}
                {(activeTab === "all" || activeTab === "qna") && qnaItems.length > 0 && (
                    <section key={`qna-${animKey}`} className={`order-3 animate-fade-up ${sectionBase}`} style={{ animationDelay: "180ms" }}>
                        <div className="border-b p-5 sm:px-7 sm:py-5" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgb(226,232,240)" }}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="9" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9a2.5 2.5 0 115 0c0 1.5-2 2.25-2.5 3.5" />
                                        <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
                                    </svg>
                                </span>
                                <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{h.boardTitle.qna}</h2>
                                <span className={`ml-1 text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{qnaItems.length}</span>
                                </div>
                                <Link
                                    href={boardMoreHref.qna}
                                    className={`inline-flex items-center justify-center self-start rounded-full px-4 py-2 text-sm font-extrabold transition ${
                                        isDark
                                            ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {boardMore}
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 p-5 sm:p-6">
                            {qnaItems.map((item, i) => (
                                <div key={item.id} className="animate-fade-up" style={{ animationDelay: `${80 + i * 45}ms` }}>
                                    <CommunityQnaCard
                                        item={item}
                                        isDark={isDark}
                                        locale={lang}
                                        answeredLabel={h.answered}
                                        unansweredLabel={h.unanswered}
                                        onClick={() => setSelectedItemId(item.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {filteredItems.length === 0 && (
                    <div key={`empty-${animKey}`} className={`order-4 animate-fade-up ${sectionBase} p-12 text-center`} style={{ animationDelay: "60ms" }}>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{h.noItems}</p>
                    </div>
                )}

                {/* FAQ 링크 */}
                <div className={`order-5 animate-fade-up ${sectionBase} p-5 sm:p-6`} style={{ animationDelay: "240ms" }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                <CommentIcon className="h-4 w-4" />
                            </span>
                            <div>
                                <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {lang === "ko" ? "자주 묻는 질문" : lang === "ja" ? "よくある質問" : "FAQ"}
                                </p>
                                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {lang === "ko" ? "공식 답변을 한눈에 확인하세요." : lang === "ja" ? "公式回答を確認できます。" : "Find official answers quickly."}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={withLocaleQuery("/faq", lang)}
                            className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                                isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                            }`}
                        >
                            {lang === "ko" ? "FAQ 보기 →" : lang === "ja" ? "FAQ一覧 →" : "View FAQ →"}
                        </Link>
                    </div>
                </div>
            </div>

            {showForm ? (
                <WriteModal
                    isDark={isDark}
                    h={h}
                    defaultType={formDefaultType}
                    onSubmit={handleWriteSubmit}
                    onClose={() => setShowForm(false)}
                />
            ) : null}

            {/* 상세 모달 */}
            {selectedItem && (
                <DetailModal
                    item={selectedItem}
                    isDark={isDark}
                    h={h}
                    onClose={() => setSelectedItemId(null)}
                    onEditSaved={handleEditSaved}
                    onMateApply={() => handleMateApply(selectedItem)}
                    mateApplyLabel={mateApplyLabel}
                    mateAppliedLabel={mateAppliedLabel}
                    mateApplied={appliedMateIds.includes(selectedItem.id)}
                    tourHref={getTourHref(selectedItem)}
                    viewTourLabel={viewTourLabel}
                />
            )}
        </>
    );
}

export default function CommunityPage() {
    return (
        <PageShell activeKey="community">
            <CommunityContent />
        </PageShell>
    );
}


