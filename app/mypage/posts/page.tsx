"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { CommunityReviewCard } from "@/components/community/CommunityReviewCard";
import { CommunityMateCard } from "@/components/community/CommunityMateCard";
import { CommunityQnaCard } from "@/components/community/CommunityQnaCard";
import { withLocaleQuery } from "@/lib/locale-routing";
import type { CommunityItem } from "@/lib/bluewolf-data";

export default function MyPostsPage() {
    const { isDark, lang } = usePage();
    const { user, ready } = useAuth();
    const [items, setItems] = useState<CommunityItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMyPosts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch("/api/community/mine");
            const data = await response.json();
            if (data.items) {
                setItems(data.items);
            }
        } catch (err) {
            console.error("Failed to load my posts:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (ready && user) {
            void loadMyPosts();
        } else if (ready && !user) {
            setLoading(false);
        }
    }, [ready, user, loadMyPosts]);

    const panelTone = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";

    const labels = {
        ko: { title: "내가 쓴 글", empty: "작성한 게시글이 없습니다.", back: "마이페이지로 돌아가기", people: "명", recruiting: "모집중", full: "모집완료", answered: "답변완료", unanswered: "답변대기" },
        ja: { title: "投稿一覧", empty: "投稿した記事がありません。", back: "マイページに戻る", people: "名", recruiting: "募集中", full: "募集終了", answered: "回答済", unanswered: "回答待ち" },
        en: { title: "My Posts", empty: "No posts yet.", back: "Back to My Page", people: " people", recruiting: "Open", full: "Full", answered: "Answered", unanswered: "Pending" },
    }[lang];

    return (
        <PageShell activeKey="none">
            <div className="mx-auto w-full max-w-5xl py-10 px-4">
                <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Link
                            href={withLocaleQuery("/mypage", lang)}
                            className={`text-sm font-bold transition hover:text-blue-500 ${mutedTone}`}
                        >
                            ← {labels.back}
                        </Link>
                        <h1 className="mt-2 text-4xl font-black tracking-tight">{labels.title}</h1>
                    </div>
                </header>

                {!user && ready ? (
                    <div className={`rounded-[32px] border p-12 text-center ${panelTone}`}>
                        <p className="text-lg font-bold">로그인이 필요한 서비스입니다.</p>
                    </div>
                ) : loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`h-64 animate-pulse rounded-[28px] border ${panelTone} opacity-50`} />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className={`rounded-[32px] border p-12 text-center ${panelTone}`}>
                        <p className="text-lg font-bold">{labels.empty}</p>
                        <Link
                            href={withLocaleQuery("/community", lang)}
                            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-blue-600 px-8 text-sm font-black text-white"
                        >
                            커뮤니티 바로가기
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.type}`} className="h-full">
                                {item.type === "review" && (
                                    <CommunityReviewCard
                                        item={item}
                                        isDark={isDark}
                                        locale={lang}
                                        onClick={() => {}}
                                    />
                                )}
                                {item.type === "mate" && (
                                    <CommunityMateCard
                                        item={item}
                                        isDark={isDark}
                                        locale={lang}
                                        peopleLabel={labels.people}
                                        recruitingLabel={labels.recruiting}
                                        fullLabel={labels.full}
                                        onClick={() => {}}
                                        onApply={() => {}}
                                        applyLabel=""
                                        appliedLabel=""
                                        applied={false}
                                        tourHref="#"
                                        viewTourLabel=""
                                    />
                                )}
                                {item.type === "qna" && (
                                    <CommunityQnaCard
                                        item={item}
                                        isDark={isDark}
                                        locale={lang}
                                        answeredLabel={labels.answered}
                                        unansweredLabel={labels.unanswered}
                                        onClick={() => {}}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    );
}
