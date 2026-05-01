"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CmsLocaleTabs, localeLabels } from "@/components/cms/CmsLocaleTabs";
import {
    type CommunityComment,
    type CommunityItem,
    type CommunityNotice,
    type Locale,
} from "@/lib/bluewolf-data";
import { type CmsCommunityContent } from "@/lib/cms-community";

type CommunitySection = "notice" | "mate" | "review" | "qna";
type ManageMode = "posts" | "comments";

type FlattenedComment = {
    index: number;
    postId: number;
    postAuthor: string;
    postDate: string;
    postText: string;
    postTitle?: string;
    comment: CommunityComment;
};

const sectionLabels: Record<CommunitySection, string> = {
    notice: "공지사항",
    mate: "동행 찾기 게시판",
    review: "후기 게시판",
    qna: "질문 게시판",
};

const modeLabels: Record<ManageMode, string> = {
    posts: "게시글 관리",
    comments: "댓글 관리",
};

function SectionCard({
    title,
    desc,
    children,
    isDark,
}: {
    title: string;
    desc?: string;
    children: ReactNode;
    isDark: boolean;
}) {
    return (
        <section
            className={`rounded-[24px] border p-5 ${
                isDark ? "border-white/10 bg-slate-950/70" : "border-slate-200 bg-slate-50"
            }`}
        >
            <div className="mb-4">
                <h3 className="text-base font-black">{title}</h3>
                {desc ? (
                    <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {desc}
                    </p>
                ) : null}
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function EmptyState({ text, isDark }: { text: string; isDark: boolean }) {
    return (
        <div
            className={`rounded-2xl border border-dashed px-4 py-10 text-center text-sm ${
                isDark ? "border-white/10 text-slate-400" : "border-slate-300 text-slate-500"
            }`}
        >
            {text}
        </div>
    );
}

export function CommunityCmsEditor({
    content,
    onChange,
    onSave,
    saved,
    saving,
    loading,
    error,
    isDark,
}: {
    content: CmsCommunityContent;
    onChange: (updater: (current: CmsCommunityContent) => CmsCommunityContent) => void;
    onSave: () => void | Promise<void>;
    saved: boolean;
    saving: boolean;
    loading: boolean;
    error: string | null;
    isDark: boolean;
}) {
    const [activeLocale, setActiveLocale] = useState<Locale>("ko");
    const [activeSection, setActiveSection] = useState<CommunitySection>("notice");
    const [activeMode, setActiveMode] = useState<ManageMode>("posts");

    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";
    const tagTone = isDark
        ? "border-white/10 bg-slate-900 text-slate-300"
        : "border-slate-200 bg-white text-slate-600";

    const noticeItems = content.notices[activeLocale];
    const boardItems = useMemo(() => {
        if (activeSection === "notice") return [] as CommunityItem[];
        return content.items[activeLocale].filter((item) => item.type === activeSection);
    }, [activeLocale, activeSection, content.items]);

    const commentItems = useMemo<FlattenedComment[]>(() => {
        if (activeSection === "notice") return [];

        return boardItems.flatMap((item) =>
            (item.comments ?? []).map((comment, index) => ({
                index,
                postId: item.id,
                postAuthor: item.author,
                postDate: item.date,
                postText: item.text,
                postTitle: item.tourTitle,
                comment,
            }))
        );
    }, [activeSection, boardItems]);

    const sectionCounts = useMemo(
        () => ({
            notice: content.notices[activeLocale].length,
            mate: content.items[activeLocale].filter((item) => item.type === "mate").length,
            review: content.items[activeLocale].filter((item) => item.type === "review").length,
            qna: content.items[activeLocale].filter((item) => item.type === "qna").length,
        }),
        [activeLocale, content]
    );

    const deleteNotice = (id: number) => {
        onChange((current) => ({
            ...current,
            notices: {
                ...current.notices,
                [activeLocale]: current.notices[activeLocale].filter((notice) => notice.id !== id),
            },
        }));
    };

    const deletePost = (id: number) => {
        onChange((current) => ({
            ...current,
            items: {
                ...current.items,
                [activeLocale]: current.items[activeLocale].filter((item) => item.id !== id),
            },
        }));
    };

    const deleteComment = (postId: number, commentIndex: number) => {
        onChange((current) => ({
            ...current,
            items: {
                ...current.items,
                [activeLocale]: current.items[activeLocale].map((item) =>
                    item.id === postId
                        ? {
                              ...item,
                              comments: (item.comments ?? []).filter(
                                  (_, index) => index !== commentIndex
                              ),
                          }
                        : item
                ),
            },
        }));
    };

    const isNoticeSection = activeSection === "notice";
    const availableModes: ManageMode[] = isNoticeSection ? ["posts"] : ["posts", "comments"];
    const effectiveMode = availableModes.includes(activeMode) ? activeMode : "posts";

    const rightTitle = `${sectionLabels[activeSection]} ${modeLabels[effectiveMode]}`;
    const rightCount =
        effectiveMode === "posts"
            ? isNoticeSection
                ? noticeItems.length
                : boardItems.length
            : commentItems.length;

    const switchSection = (section: CommunitySection) => {
        setActiveSection(section);
        setActiveMode("posts");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">커뮤니티 관리</h2>
                    <p className={`mt-1 text-sm ${mutedTone}`}>
                        유저가 작성한 글과 댓글을 확인하고, 필요한 경우 삭제 후 저장할 수 있습니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void onSave()}
                    disabled={saving || loading}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:opacity-60"
                >
                    {saving ? "저장 중..." : saved ? "저장 완료" : "삭제 내용 저장"}
                </button>
            </div>

            {error ? (
                <p
                    className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                        isDark
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-amber-50 text-amber-700"
                    }`}
                >
                    {error}
                </p>
            ) : null}

            {loading ? (
                <p className={`text-sm ${mutedTone}`}>커뮤니티 데이터를 불러오는 중입니다...</p>
            ) : null}

            <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                <div className="space-y-5">
                    <SectionCard
                        title="언어 선택"
                        desc="관리할 언어를 먼저 선택해주세요."
                        isDark={isDark}
                    >
                        <CmsLocaleTabs
                            activeLocale={activeLocale}
                            onChange={setActiveLocale}
                            isDark={isDark}
                        />
                    </SectionCard>

                    <SectionCard
                        title="게시판 선택"
                        desc="게시판을 누르면 아래에 게시글 또는 댓글 관리 메뉴가 열립니다."
                        isDark={isDark}
                    >
                        <div className="space-y-3">
                            {(["notice", "mate", "review", "qna"] as const).map((section) => (
                                <div key={section} className="rounded-[20px] border border-current/10 p-2">
                                    <button
                                        type="button"
                                        onClick={() => switchSection(section)}
                                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-black transition-colors ${
                                            activeSection === section
                                                ? "bg-blue-600 text-white"
                                                : isDark
                                                  ? "bg-slate-900 text-slate-100 hover:bg-slate-800"
                                                  : "bg-white text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        <span className="flex items-center justify-between gap-3">
                                            <span>{sectionLabels[section]}</span>
                                            <span className="text-xs opacity-80">
                                                {sectionCounts[section]}
                                            </span>
                                        </span>
                                    </button>

                                    {activeSection === section ? (
                                        <div className="mt-2 flex flex-col gap-2 pl-3">
                                            {(
                                                section === "notice"
                                                    ? (["posts"] as const)
                                                    : (["posts", "comments"] as const)
                                            ).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setActiveMode(mode)}
                                                    className={`rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${
                                                        effectiveMode === mode
                                                            ? isDark
                                                                ? "bg-blue-500/15 text-blue-300"
                                                                : "bg-blue-50 text-blue-700"
                                                            : isDark
                                                              ? "text-slate-400 hover:bg-slate-900"
                                                              : "text-slate-500 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {modeLabels[mode]}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <SectionCard
                    title={rightTitle}
                    desc={`${localeLabels[activeLocale]} 기준으로 ${rightCount}개가 표시되고 있습니다.`}
                    isDark={isDark}
                >
                    {effectiveMode === "posts" && isNoticeSection ? (
                        noticeItems.length === 0 ? (
                            <EmptyState text="등록된 공지사항이 없습니다." isDark={isDark} />
                        ) : (
                            noticeItems.map((notice: CommunityNotice) => (
                                <div
                                    key={notice.id}
                                    className={`rounded-[22px] border p-4 ${
                                        isDark
                                            ? "border-white/10 bg-slate-900"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {notice.important ? (
                                                    <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-extrabold text-white">
                                                        중요
                                                    </span>
                                                ) : null}
                                                <span className={`text-xs ${mutedTone}`}>{notice.date}</span>
                                            </div>
                                            <h4 className="mt-2 text-base font-black">{notice.title}</h4>
                                            <p className={`mt-2 text-sm leading-6 ${mutedTone}`}>
                                                {notice.summary}
                                            </p>
                                            {notice.href ? (
                                                <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tagTone}`}>
                                                    링크: {notice.href}
                                                </span>
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => deleteNotice(notice.id)}
                                            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                                                isDark
                                                    ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                            }`}
                                        >
                                            공지 삭제
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : null}

                    {effectiveMode === "posts" && !isNoticeSection ? (
                        boardItems.length === 0 ? (
                            <EmptyState text="등록된 게시글이 없습니다." isDark={isDark} />
                        ) : (
                            boardItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`rounded-[22px] border p-4 ${
                                        isDark
                                            ? "border-white/10 bg-slate-900"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-xs font-bold ${mutedTone}`}>
                                                    #{item.id}
                                                </span>
                                                <span className={`text-xs ${mutedTone}`}>{item.date}</span>
                                                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tagTone}`}>
                                                    {item.author || "익명"}
                                                </span>
                                                {item.tourTitle ? (
                                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tagTone}`}>
                                                        {item.tourTitle}
                                                    </span>
                                                ) : null}
                                                {item.type === "mate" && item.travelDate ? (
                                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tagTone}`}>
                                                        {item.travelDate}
                                                    </span>
                                                ) : null}
                                                {item.type === "mate" && item.travelRegion ? (
                                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tagTone}`}>
                                                        {item.travelRegion}
                                                    </span>
                                                ) : null}
                                                {item.type === "review" ? (
                                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tagTone}`}>
                                                        별점 {item.rating ?? 0}/5
                                                    </span>
                                                ) : null}
                                                {item.type === "qna" ? (
                                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tagTone}`}>
                                                        {item.answered ? "답변 완료" : "답변 대기"}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                                                {item.text}
                                            </p>
                                            <div className={`mt-3 flex flex-wrap items-center gap-3 text-xs ${mutedTone}`}>
                                                <span>좋아요 {item.likes}</span>
                                                <span>댓글 {item.comments?.length ?? 0}</span>
                                                {item.type === "review" ? (
                                                    <span>사진 {item.photos?.length ?? 0}장</span>
                                                ) : null}
                                                {item.type === "mate" ? (
                                                    <span>
                                                        인원 {item.currentPeople ?? 0}/{item.maxPeople ?? 0}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => deletePost(item.id)}
                                            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                                                isDark
                                                    ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                            }`}
                                        >
                                            게시글 삭제
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : null}

                    {effectiveMode === "comments" ? (
                        commentItems.length === 0 ? (
                            <EmptyState text="등록된 댓글이 없습니다." isDark={isDark} />
                        ) : (
                            commentItems.map((item) => (
                                <div
                                    key={`${item.postId}-${item.index}`}
                                    className={`rounded-[22px] border p-4 ${
                                        isDark
                                            ? "border-white/10 bg-slate-900"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-xs font-bold ${mutedTone}`}>
                                                    게시글 #{item.postId}
                                                </span>
                                                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tagTone}`}>
                                                    {item.postAuthor}
                                                </span>
                                                <span className={`text-xs ${mutedTone}`}>
                                                    {item.postDate}
                                                </span>
                                                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tagTone}`}>
                                                    댓글 작성자 {item.comment.author}
                                                </span>
                                            </div>
                                            {item.postTitle ? (
                                                <p className={`mt-2 text-xs font-bold ${mutedTone}`}>
                                                    원문 투어명: {item.postTitle}
                                                </p>
                                            ) : null}
                                            <p className={`mt-2 text-xs leading-6 ${mutedTone}`}>
                                                원문: {item.postText}
                                            </p>
                                            <div
                                                className={`mt-3 rounded-2xl border px-4 py-3 ${
                                                    isDark
                                                        ? "border-white/10 bg-slate-950"
                                                        : "border-slate-200 bg-slate-50"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-sm font-black">
                                                        {item.comment.author}
                                                    </span>
                                                    <span className={`text-xs ${mutedTone}`}>
                                                        {item.comment.date}
                                                    </span>
                                                </div>
                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                                                    {item.comment.text}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => deleteComment(item.postId, item.index)}
                                            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                                                isDark
                                                    ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                                                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                            }`}
                                        >
                                            댓글 삭제
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : null}
                </SectionCard>
            </div>
        </div>
    );
}
