"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { type CommunityItem, type CommunityTab, type Locale } from "@/lib/bluewolf-data";
import { formatCommunityPostedDate, formatRelativeCommunityTime } from "@/lib/community-time";
import { withLocaleQuery } from "@/lib/locale-routing";
import { getCommunityTourHref } from "@/lib/community-tour";
import { CommunityMateCard } from "@/components/community/CommunityMateCard";
import { CommunityQnaCard } from "@/components/community/CommunityQnaCard";
import { CommunityReviewCard } from "@/components/community/CommunityReviewCard";
import { usePage } from "@/components/layout/PageShell";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";
import { useCmsCommunityContent } from "@/lib/use-cms-community";
import { useCmsTours } from "@/lib/use-cms-tours";
import { Dropdown, type SelectOption } from "@/components/ui/Dropdown";
import { StarIcon } from "@/components/ui/SafeIcons";

type CommunityBoard = Exclude<CommunityTab, "all">;
type BoardSort = "latest" | "likes" | "rating" | "travelSoon" | "travelLate";
type MateRegionFilter = "all" | string;
type MateDurationFilter = "all" | string;
type MateDepartureFilter = "all" | "week" | "month" | "threeMonths" | "sixMonths";

function parseCommunityDate(value?: string) {
    if (!value) return null;
    const normalized = value.includes("T") ? value : `${value}T00:00:00`;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseKstDate(value?: string) {
    if (!value) return null;
    const normalized = value.includes("T") ? value : `${value}T00:00:00+09:00`;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseKstCalendarDate(value?: string) {
    if (!value) return null;
    const datePart = value.slice(0, 10);
    const parsed = new Date(`${datePart}T00:00:00+09:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getUpcomingTravelDate(value?: string, referenceNowKst?: string) {
    const travelDate = parseKstCalendarDate(value);
    if (!travelDate) return null;

    const referenceDate = parseKstCalendarDate(referenceNowKst);
    if (referenceDate && travelDate.getTime() < referenceDate.getTime()) {
        return null;
    }

    return travelDate;
}

function getDepartureLeadDays(item: { travelDate?: string }, referenceNowKst?: string) {
    const currentReference = parseKstDate(referenceNowKst) ?? new Date();
    const travelDate = getUpcomingTravelDate(item.travelDate, referenceNowKst);
    if (!travelDate) return null;
    return Math.max(0, Math.ceil((travelDate.getTime() - currentReference.getTime()) / 86400000));
}

function parseDurationFromTourTitle(title?: string) {
    if (!title) return null;

    const match =
        title.match(/(\d+)\s*박\s*(\d+)\s*일/) ??
        title.match(/(\d+)\s*泊\s*(\d+)\s*日/) ??
        title.match(/(\d+)\s*N\s*(\d+)\s*D/i);

    if (!match) return null;

    return {
        nights: Number(match[1]),
        days: Number(match[2]),
    };
}

function formatDurationText(duration: { nights: number; days: number }, locale: Locale) {
    if (locale === "ja") return `${duration.nights}泊${duration.days}日`;
    if (locale === "en") return `${duration.nights}N${duration.days}D`;
    return `${duration.nights}박 ${duration.days}일`;
}

function BoardDetailModal({
    item,
    locale,
    isDark,
    likesLabel,
    commentsLabel,
    commentPlaceholder,
    commentSubmit,
    peopleLabel,
    recruitingLabel,
    fullLabel,
    answeredLabel,
    unansweredLabel,
    applyLabel,
    appliedLabel,
    mateApplied,
    tourHref,
    viewTourLabel,
    onClose,
    onMateApply,
}: {
    item: CommunityItem;
    locale: Locale;
    isDark: boolean;
    likesLabel: string;
    commentsLabel: string;
    commentPlaceholder: string;
    commentSubmit: string;
    peopleLabel: string;
    recruitingLabel: string;
    fullLabel: string;
    answeredLabel: string;
    unansweredLabel: string;
    applyLabel: string;
    appliedLabel: string;
    mateApplied: boolean;
    tourHref: string;
    viewTourLabel: string;
    onClose: () => void;
    onMateApply: () => void;
}) {
    const [commentText, setCommentText] = useState("");
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likes);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const isMateFull = item.type === "mate" && (item.currentPeople ?? 0) >= (item.maxPeople ?? 1);
    const mateProgress =
        item.type === "mate" && item.maxPeople
            ? Math.min(100, ((item.currentPeople ?? 0) / item.maxPeople) * 100)
            : 0;

    const panelBg = isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const textMain = isDark ? "text-white" : "text-slate-900";
    const commentBg = isDark ? "bg-slate-950 border-white/10" : "bg-slate-50 border-slate-200";

    useBodyScrollLock(true);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className="animate-fade-in-overlay fixed bottom-0 left-0 right-0 top-0 z-50 flex h-dvh w-screen items-end justify-center bg-black/50 backdrop-blur-md sm:items-center"
            onClick={onClose}
        >
            <div
                className={`animate-slide-up-modal relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border p-6 shadow-2xl sm:m-4 sm:rounded-[28px] ${panelBg}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                            {item.author[0]}
                        </div>
                        <div>
                            <p className={`text-sm font-black ${textMain}`}>{item.author}</p>
                            <p className={`text-xs ${textMuted}`}>{formatRelativeCommunityTime(item.date, locale)}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`rounded-full p-2 transition ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                    >
                        <svg className={`h-5 w-5 ${textMuted}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {item.type === "review" && item.rating ? (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: item.rating }).map((_, index) => (
                                <StarIcon key={index} className="h-4 w-4" />
                            ))}
                        </span>
                        <span className="text-sm font-bold text-amber-500">{item.rating}.0</span>
                    </div>
                ) : null}

                {(item.tourTitle || item.travelDate) ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {item.tourTitle ? (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isDark ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                                {item.tourTitle}
                            </span>
                        ) : null}
                        {item.travelDate ? (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isDark ? "border-slate-600 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-600"}`}>
                                {item.travelDate}
                            </span>
                        ) : null}
                        {item.type === "mate" && item.maxPeople ? (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                (item.currentPeople ?? 0) >= item.maxPeople
                                    ? isDark
                                        ? "border-slate-600 bg-slate-800 text-slate-400"
                                        : "border-slate-200 bg-slate-100 text-slate-500"
                                    : isDark
                                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}>
                                {item.currentPeople}/{item.maxPeople}{peopleLabel} · {(item.currentPeople ?? 0) >= item.maxPeople ? fullLabel : recruitingLabel}
                            </span>
                        ) : null}
                        {item.type === "qna" ? (
                            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                item.answered
                                    ? isDark
                                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : isDark
                                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                                      : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}>
                                {item.answered ? answeredLabel : unansweredLabel}
                            </span>
                        ) : null}
                    </div>
                ) : null}

                <p className={`mt-4 text-sm leading-7 sm:text-base ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {item.text}
                </p>

                {item.type === "mate" ? (
                    <div className={`mt-5 rounded-[22px] border p-4 ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                        {item.maxPeople ? (
                            <div className="mb-4">
                                <div className="mb-2 flex items-center justify-between text-xs">
                                    <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                                        {item.currentPeople}/{item.maxPeople}{peopleLabel}
                                    </span>
                                    <span className={`font-bold ${
                                        isMateFull
                                            ? isDark ? "text-slate-400" : "text-slate-500"
                                            : isDark ? "text-emerald-400" : "text-emerald-600"
                                    }`}>
                                        {isMateFull ? fullLabel : `${(item.maxPeople - (item.currentPeople ?? 0))}${peopleLabel} ${recruitingLabel}`}
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
                                {mateApplied ? appliedLabel : isMateFull ? fullLabel : applyLabel}
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

                {item.photos && item.photos.length > 0 ? (
                    <div className="mt-5">
                        <div className={`grid gap-2 ${
                            item.photos.length === 1
                                ? "grid-cols-1"
                                : item.photos.length === 2
                                  ? "grid-cols-2"
                                  : "grid-cols-3"
                        }`}>
                            {item.photos.map((src, index) => (
                                <button
                                    key={`${item.id}-${index}`}
                                    type="button"
                                    onClick={() => setLightboxIndex(index)}
                                    className={`group relative overflow-hidden rounded-[16px] ${
                                        item.photos!.length === 1 ? "aspect-video" : "aspect-square"
                                    } ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                                >
                                    <Image
                                        src={src}
                                        alt={item.tourTitle ?? item.author}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                        sizes="(max-width: 640px) 90vw, 280px"
                                    />
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                    {index === 2 && item.photos!.length > 3 ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <span className="text-xl font-black text-white">+{item.photos!.length - 3}</span>
                                        </div>
                                    ) : null}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setLiked((current) => !current);
                            setLikeCount((current) => liked ? current - 1 : current + 1);
                        }}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                            liked
                                ? "border-blue-400 bg-blue-600 text-white"
                                : isDark
                                  ? "border-white/10 bg-slate-800 text-slate-300 hover:border-blue-400/50"
                                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300"
                        }`}
                    >
                        <svg className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {likesLabel} {likeCount}
                    </button>
                    <span className={`text-xs ${textMuted}`}>
                        {commentsLabel} {item.comments?.length ?? 0}
                    </span>
                    <span className={`ml-auto text-[11px] ${textMuted}`}>
                        {formatCommunityPostedDate(item.date, locale)}
                    </span>
                </div>

                {(item.comments?.length ?? 0) > 0 ? (
                    <div className="mt-5 flex flex-col gap-3">
                        {item.comments!.map((comment, index) => (
                            <div key={`${item.id}-comment-${index}`} className={`rounded-[16px] border p-4 ${commentBg}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                                            comment.author === "BlueWolf"
                                                ? "bg-blue-600 text-white"
                                                : isDark ? "bg-slate-700 text-slate-200" : "bg-slate-200 text-slate-700"
                                        }`}>
                                            {comment.author[0]}
                                        </div>
                                        <span className={`text-xs font-black ${comment.author === "BlueWolf" ? "text-blue-500" : textMain}`}>
                                            {comment.author}
                                        </span>
                                    </div>
                                    <span className={`text-[11px] ${textMuted}`}>{formatRelativeCommunityTime(comment.date, locale)}</span>
                                </div>
                                <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                    {comment.text}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className="mt-4 flex gap-2">
                    <input
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                        placeholder={commentPlaceholder}
                        className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 ${
                            isDark
                                ? "border-white/10 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                                : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setCommentText("")}
                        className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-[0.98]"
                    >
                        {commentSubmit}
                    </button>
                </div>
            </div>

            {lightboxIndex !== null && item.photos ? (
                <div
                    className="fixed bottom-0 left-0 right-0 top-0 z-[60] flex h-dvh w-screen items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setLightboxIndex(null)}
                >
                    {lightboxIndex > 0 ? (
                        <button
                            type="button"
                            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                            onClick={(event) => {
                                event.stopPropagation();
                                setLightboxIndex((current) => (current ?? 1) - 1);
                            }}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : null}
                    <div className="relative h-[80vh] w-[90vw] max-w-5xl">
                        <Image
                            src={item.photos[lightboxIndex]}
                            alt={item.tourTitle ?? item.author}
                            fill
                            className="object-contain"
                            sizes="90vw"
                        />
                    </div>
                    {lightboxIndex < item.photos.length - 1 ? (
                        <button
                            type="button"
                            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                            onClick={(event) => {
                                event.stopPropagation();
                                setLightboxIndex((current) => (current ?? 0) + 1);
                            }}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>,
        document.body
    );
}

export function CommunityBoardPage({ board, referenceNowKst }: { board: CommunityBoard; referenceNowKst?: string }) {
    const { lang, isDark } = usePage();
    const { tourItems } = useCmsTours();
    const { communityContent } = useCmsCommunityContent();
    const sourceItems = communityContent.items[lang].filter((item) => item.type === board);
    const [sortBy, setSortBy] = useState<BoardSort>("latest");
    const [appliedMateIds, setAppliedMateIds] = useState<number[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [hideFullMatePosts, setHideFullMatePosts] = useState(false);
    const [regionFilter, setRegionFilter] = useState<MateRegionFilter>("all");
    const [durationFilter, setDurationFilter] = useState<MateDurationFilter>("all");
    const [departureFilter, setDepartureFilter] = useState<MateDepartureFilter>("all");

    const displayCopy = {
        ko: {
            sectionLabel: "Community Board",
            back: "커뮤니티로 돌아가기",
            viewTour: "투어 살펴보기",
            apply: "참가 신청",
            applied: "신청 완료",
            likes: "좋아요",
            comments: "댓글",
            photos: "사진",
            people: "명",
            recruiting: "모집중",
            full: "모집완료",
            answered: "답변 완료",
            unanswered: "답변 대기",
            hideFull: "모집완료 글 안보기",
            title: {
                review: "후기 모아보기",
                mate: "동행 찾기 모아보기",
                qna: "질문 모아보기",
            },
            desc: {
                review: "여행자들의 실제 후기를 한곳에서 모아보세요.",
                mate: "현재 모집 중인 동행 글을 한 번에 확인해보세요.",
                qna: "여행 관련 질문과 답변을 한곳에서 살펴보세요.",
            },
            empty: {
                review: "아직 등록된 후기가 없습니다.",
                mate: "아직 등록된 동행 찾기 글이 없습니다.",
                qna: "아직 등록된 질문이 없습니다.",
            },
            sorts: {
                latest: "최신순",
                likes: "좋아요 순",
                rating: "별점 순",
                travelSoon: "여행일 빠른순",
                travelLate: "여행일 느린순",
            },
            filters: {
                allRegion: "전체 여행지",
                allDuration: "전체 여행기간",
                allDeparture: "전체 출발 기간",
                region: "여행지",
                duration: "여행기간",
                departure: "출발 기간",
                week: "1주일 뒤",
                month: "1개월 뒤",
                threeMonths: "3개월 뒤",
                sixMonths: "6개월 뒤",
            },
        },
        ja: {
            sectionLabel: "Community Board",
            back: "コミュニティに戻る",
            viewTour: "ツアーを見る",
            apply: "参加申請",
            applied: "申請完了",
            likes: "いいね",
            comments: "コメント",
            photos: "写真",
            people: "名",
            recruiting: "募集中",
            full: "募集完了",
            answered: "回答完了",
            unanswered: "回答待ち",
            hideFull: "募集完了の投稿を隠す",
            title: {
                review: "レビュー一覧",
                mate: "同行募集一覧",
                qna: "質問一覧",
            },
            desc: {
                review: "旅行者のレビューをまとめて確認できます。",
                mate: "現在募集中の同行募集をまとめて見られます。",
                qna: "旅行に関する質問と回答をまとめて確認できます。",
            },
            empty: {
                review: "まだ登録されたレビューがありません。",
                mate: "まだ登録された同行募集がありません。",
                qna: "まだ登録された質問がありません。",
            },
            sorts: {
                latest: "最新順",
                likes: "いいね順",
                rating: "評価順",
                travelSoon: "旅行日が早い順",
                travelLate: "旅行日が遅い順",
            },
            filters: {
                allRegion: "すべての旅行先",
                allDuration: "すべての旅行期間",
                allDeparture: "すべての出発期間",
                region: "旅行先",
                duration: "旅行期間",
                departure: "出発期間",
                week: "1週間後",
                month: "1か月後",
                threeMonths: "3か月後",
                sixMonths: "6か月後",
            },
        },
        en: {
            sectionLabel: "Community Board",
            back: "Back to community",
            viewTour: "View tour",
            apply: "Join now",
            applied: "Applied",
            likes: "Likes",
            comments: "Comments",
            photos: "Photos",
            people: "people",
            recruiting: "Recruiting",
            full: "Full",
            answered: "Answered",
            unanswered: "Waiting",
            hideFull: "Hide full posts",
            title: {
                review: "All reviews",
                mate: "Find companions",
                qna: "All Q&A",
            },
            desc: {
                review: "Browse all traveler reviews in one place.",
                mate: "See all active companion-finding posts at a glance.",
                qna: "Read travel questions and answers in one place.",
            },
            empty: {
                review: "No reviews have been posted yet.",
                mate: "No companion posts have been posted yet.",
                qna: "No questions have been posted yet.",
            },
            sorts: {
                latest: "Latest",
                likes: "Most liked",
                rating: "Top rated",
                travelSoon: "Earliest travel date",
                travelLate: "Latest travel date",
            },
            filters: {
                allRegion: "All regions",
                allDuration: "All durations",
                allDeparture: "All departure windows",
                region: "Region",
                duration: "Duration",
                departure: "Departure window",
                week: "In 1 week",
                month: "In 1 month",
                threeMonths: "In 3 months",
                sixMonths: "In 6 months",
            },
        },
    }[lang];

    const commentFieldPlaceholder =
        lang === "ko" ? "댓글을 입력하세요..."
        : lang === "ja" ? "コメントを入力してください..."
        : "Write a comment...";
    const commentFieldSubmit =
        lang === "ko" ? "등록"
        : lang === "ja" ? "投稿"
        : "Post";

    const sectionBase = isDark
        ? "rounded-[28px] border border-white/10 bg-slate-900/80 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur"
        : "rounded-[28px] border border-slate-200 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.08)]";

    const sortOptions = useMemo<SelectOption[]>(() => {
        const options: SelectOption[] = [
            { value: "latest", label: displayCopy.sorts.latest },
            { value: "likes", label: displayCopy.sorts.likes },
        ];

        if (board === "review") {
            options.push({ value: "rating", label: displayCopy.sorts.rating });
        }

        if (board === "mate") {
            options.push(
                { value: "travelSoon", label: displayCopy.sorts.travelSoon },
                { value: "travelLate", label: displayCopy.sorts.travelLate }
            );
        }

        return options;
    }, [board, displayCopy.sorts]);
    const regionOptions = useMemo<SelectOption[]>(() => {
        if (board !== "mate") return [{ value: "all", label: displayCopy.filters.allRegion }];

        const uniqueRegions = Array.from(
            new Set(
                sourceItems
                    .map((item) => item.travelRegion)
                    .filter((value): value is string => Boolean(value))
            )
        );

        return [
            { value: "all", label: displayCopy.filters.allRegion },
            ...uniqueRegions.map((value) => ({ value, label: value })),
        ];
    }, [board, displayCopy.filters.allRegion, sourceItems]);
    const durationOptions = useMemo<SelectOption[]>(() => {
        if (board !== "mate") return [{ value: "all", label: displayCopy.filters.allDuration }];

        const uniqueDurations = Array.from(
            new Map(
                sourceItems
                    .map((item) => parseDurationFromTourTitle(item.tourTitle))
                    .filter((value): value is { nights: number; days: number } => value !== null)
                    .sort((a, b) => {
                        if (a.nights !== b.nights) return a.nights - b.nights;
                        return a.days - b.days;
                    })
                    .map((value) => [formatDurationText(value, lang), value] as const)
            ).keys()
        );

        return [
            { value: "all", label: displayCopy.filters.allDuration },
            ...uniqueDurations.map((value) => ({ value, label: value })),
        ];
    }, [board, displayCopy.filters.allDuration, lang, sourceItems]);
    const departureOptions = useMemo<SelectOption[]>(
        () => [
            { value: "all", label: displayCopy.filters.allDeparture },
            { value: "week", label: displayCopy.filters.week },
            { value: "month", label: displayCopy.filters.month },
            { value: "threeMonths", label: displayCopy.filters.threeMonths },
            { value: "sixMonths", label: displayCopy.filters.sixMonths },
        ],
        [displayCopy.filters]
    );

    const boardItems = useMemo(
        () =>
            sourceItems.map((item) => {
                if (item.type !== "mate" || !appliedMateIds.includes(item.id)) return item;

                return {
                    ...item,
                    currentPeople: Math.min(
                        item.maxPeople ?? (item.currentPeople ?? 0) + 1,
                        (item.currentPeople ?? 0) + 1
                    ),
                };
            }),
        [appliedMateIds, sourceItems]
    );
    const selectedItem =
        selectedItemId === null ? null : boardItems.find((item) => item.id === selectedItemId) ?? null;
    const handleMateApply = (targetItem: CommunityItem) => {
        if (targetItem.type !== "mate") return;

        const alreadyApplied = appliedMateIds.includes(targetItem.id);
        const isFull = (targetItem.currentPeople ?? 0) >= (targetItem.maxPeople ?? 1);

        if (alreadyApplied || isFull) return;

        setAppliedMateIds((current) => [...current, targetItem.id]);
    };

    const visibleItems = useMemo(
        () =>
            board === "mate" && hideFullMatePosts
                ? boardItems.filter((item) => item.type !== "mate" || (item.currentPeople ?? 0) < (item.maxPeople ?? 1))
                : boardItems,
        [board, boardItems, hideFullMatePosts]
    );
    const filteredItems = useMemo(() => {
        if (board !== "mate") return visibleItems;

        return visibleItems.filter((item) => {
            if (item.type !== "mate") return true;

            const matchesRegion = regionFilter === "all" || item.travelRegion === regionFilter;

            const duration = parseDurationFromTourTitle(item.tourTitle);
            const durationLabel = duration ? formatDurationText(duration, lang) : null;
            const matchesDuration = durationFilter === "all" || durationLabel === durationFilter;

            const leadDays = getDepartureLeadDays(item, referenceNowKst);
            const matchesDeparture =
                departureFilter === "all" ||
                (departureFilter === "week" && leadDays !== null && leadDays <= 7) ||
                (departureFilter === "month" && leadDays !== null && leadDays > 7 && leadDays <= 30) ||
                (departureFilter === "threeMonths" && leadDays !== null && leadDays > 30 && leadDays <= 90) ||
                (departureFilter === "sixMonths" && leadDays !== null && leadDays > 90 && leadDays <= 180);

            return matchesRegion && matchesDuration && matchesDeparture;
        });
    }, [board, departureFilter, durationFilter, lang, referenceNowKst, regionFilter, visibleItems]);

    const sortedItems = useMemo(() => {
        const sorted = [...filteredItems];

        sorted.sort((a, b) => {
            if (sortBy === "likes") {
                return (b.likes ?? 0) - (a.likes ?? 0);
            }

            if (sortBy === "rating" && board === "review") {
                const ratingGap = (b.rating ?? 0) - (a.rating ?? 0);
                if (ratingGap !== 0) return ratingGap;
            }

            if (sortBy === "travelSoon" && board === "mate") {
                return (getUpcomingTravelDate(a.travelDate, referenceNowKst)?.getTime() ?? Number.MAX_SAFE_INTEGER)
                    - (getUpcomingTravelDate(b.travelDate, referenceNowKst)?.getTime() ?? Number.MAX_SAFE_INTEGER);
            }

            if (sortBy === "travelLate" && board === "mate") {
                return (getUpcomingTravelDate(b.travelDate, referenceNowKst)?.getTime() ?? 0)
                    - (getUpcomingTravelDate(a.travelDate, referenceNowKst)?.getTime() ?? 0);
            }

            return (parseCommunityDate(b.date)?.getTime() ?? 0) - (parseCommunityDate(a.date)?.getTime() ?? 0);
        });

        return sorted;
    }, [board, filteredItems, referenceNowKst, sortBy]);

    return (
        <div className="flex flex-col gap-4">
            <section className={`${sectionBase} p-5 sm:p-7`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {displayCopy.sectionLabel}
                        </p>
                        <h1 className={`mt-1 text-2xl font-black tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                            {displayCopy.title[board]}
                        </h1>
                        <p className={`mt-2 text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {displayCopy.desc[board]}
                        </p>
                    </div>

                    <Link
                        href={withLocaleQuery("/community", lang)}
                        className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-extrabold transition ${
                            isDark
                                ? "bg-blue-500 text-white hover:bg-blue-400"
                                : "bg-blue-600 text-white hover:bg-blue-500"
                        }`}
                    >
                        {displayCopy.back}
                    </Link>
                </div>
            </section>

            <section className={`${sectionBase} p-5 sm:p-6`}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full flex-col gap-3 sm:flex-1 sm:flex-row sm:flex-wrap">
                            {board === "mate" ? (
                                <>
                                    <div className="w-full sm:w-[180px]">
                                        <Dropdown
                                            value={regionFilter}
                                            onChange={(value) => setRegionFilter(value)}
                                            options={regionOptions}
                                            isDark={isDark}
                                        />
                                    </div>
                                    <div className="w-full sm:w-[180px]">
                                        <Dropdown
                                            value={durationFilter}
                                            onChange={(value) => setDurationFilter(value)}
                                            options={durationOptions}
                                            isDark={isDark}
                                        />
                                    </div>
                                    <div className="w-full sm:w-[200px]">
                                        <Dropdown
                                            value={departureFilter}
                                            onChange={(value) => setDepartureFilter(value as MateDepartureFilter)}
                                            options={departureOptions}
                                            isDark={isDark}
                                        />
                                    </div>
                                </>
                            ) : null}
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                            {board === "mate" ? (
                                <button
                                    type="button"
                                    onClick={() => setHideFullMatePosts((current) => !current)}
                                    className={`inline-flex h-14 items-center justify-center rounded-2xl border px-5 text-sm font-extrabold transition ${
                                        hideFullMatePosts
                                            ? isDark
                                                ? "border-blue-400 bg-blue-500/15 text-blue-300"
                                                : "border-blue-300 bg-blue-50 text-blue-700"
                                            : isDark
                                              ? "border-white/10 bg-slate-950 text-slate-200 hover:border-white/15"
                                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                                    }`}
                                >
                                    {displayCopy.hideFull}
                                </button>
                            ) : null}
                            <div className="w-full sm:w-[240px]">
                                <Dropdown
                                    value={sortBy}
                                    onChange={(value) => setSortBy(value as BoardSort)}
                                    options={sortOptions}
                                    isDark={isDark}
                                />
                            </div>
                        </div>
                    </div>

                {sortedItems.length === 0 ? (
                    <div className={`rounded-[22px] border p-10 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                        <p className={`text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {displayCopy.empty[board]}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {sortedItems.map((item) => {
                            if (board === "review") {
                                return (
                                    <CommunityReviewCard
                                        key={item.id}
                                        item={item}
                                        isDark={isDark}
                                        locale={lang}
                                        onClick={() => setSelectedItemId(item.id)}
                                    />
                                );
                            }

                            if (board === "mate") {
                                const isApplied = appliedMateIds.includes(item.id);

                                return (
                                    <CommunityMateCard
                                        key={item.id}
                                        item={item}
                                        isDark={isDark}
                                        locale={lang}
                                        peopleLabel={displayCopy.people}
                                        recruitingLabel={displayCopy.recruiting}
                                        fullLabel={displayCopy.full}
                                        applyLabel={displayCopy.apply}
                                        appliedLabel={displayCopy.applied}
                                        applied={isApplied}
                                        tourHref={getCommunityTourHref(item.tourTitle, lang, tourItems)}
                                        onClick={() => setSelectedItemId(item.id)}
                                        onApply={() => handleMateApply(item)}
                                        viewTourLabel={displayCopy.viewTour}
                                    />
                                );
                            }

                            return (
                                <CommunityQnaCard
                                    key={item.id}
                                    item={item}
                                    isDark={isDark}
                                    locale={lang}
                                    answeredLabel={displayCopy.answered}
                                    unansweredLabel={displayCopy.unanswered}
                                    onClick={() => setSelectedItemId(item.id)}
                                />
                            );
                        })}
                    </div>
                )}
            </section>

            {selectedItem ? (
                <BoardDetailModal
                    item={selectedItem}
                    locale={lang}
                    isDark={isDark}
                    likesLabel={displayCopy.likes}
                    commentsLabel={displayCopy.comments}
                    commentPlaceholder={commentFieldPlaceholder}
                    commentSubmit={commentFieldSubmit}
                    peopleLabel={displayCopy.people}
                    recruitingLabel={displayCopy.recruiting}
                    fullLabel={displayCopy.full}
                    answeredLabel={displayCopy.answered}
                    unansweredLabel={displayCopy.unanswered}
                    applyLabel={displayCopy.apply}
                    appliedLabel={displayCopy.applied}
                    mateApplied={appliedMateIds.includes(selectedItem.id)}
                    tourHref={getCommunityTourHref(selectedItem.tourTitle, lang, tourItems)}
                    viewTourLabel={displayCopy.viewTour}
                    onClose={() => setSelectedItemId(null)}
                    onMateApply={() => handleMateApply(selectedItem)}
                />
            ) : null}
        </div>
    );
}
