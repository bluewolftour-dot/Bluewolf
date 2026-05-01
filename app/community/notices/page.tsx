"use client";

import Link from "next/link";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { withLocaleQuery } from "@/lib/locale-routing";
import { useCmsCommunityContent } from "@/lib/use-cms-community";

function CommunityNoticesContent() {
    const { lang, isDark } = usePage();
    const { communityContent } = useCmsCommunityContent();
    const notices = communityContent.notices[lang];

    const copy = {
        ko: {
            title: "공지 모아보기",
            desc: "커뮤니티 운영 안내와 여행 관련 공지를 한 번에 확인해보세요.",
            back: "커뮤니티로 돌아가기",
            important: "중요",
            cta: "바로가기",
        },
        ja: {
            title: "お知らせ一覧",
            desc: "コミュニティ運営案内と旅行関連のお知らせをまとめて確認できます。",
            back: "コミュニティに戻る",
            important: "重要",
            cta: "開く",
        },
        en: {
            title: "All notices",
            desc: "See community updates and travel-related notices in one place.",
            back: "Back to community",
            important: "Important",
            cta: "Open",
        },
    }[lang];

    const sectionBase = isDark
        ? "rounded-[28px] border border-white/10 bg-slate-900/80 shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur"
        : "rounded-[28px] border border-slate-200 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.08)]";

    return (
        <div className="flex flex-col gap-4">
            <section className={`${sectionBase} p-5 sm:p-7`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Community Notices
                        </p>
                        <h1 className={`mt-1 text-2xl font-black tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                            {copy.title}
                        </h1>
                        <p className={`mt-2 text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {copy.desc}
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
                        {copy.back}
                    </Link>
                </div>
            </section>

            <section className={`${sectionBase} p-5 sm:p-6`}>
                <div className="flex flex-col gap-3">
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
                                                    {copy.important}
                                                </span>
                                            ) : null}
                                            <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                {notice.date}
                                            </span>
                                        </div>
                                        <h2 className={`mt-2 text-base font-black sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                                            {notice.title}
                                        </h2>
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
                                            {copy.cta}
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
        </div>
    );
}

export default function CommunityNoticesPage() {
    return (
        <PageShell activeKey="community">
            <CommunityNoticesContent />
        </PageShell>
    );
}
