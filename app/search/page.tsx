"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { useCmsTours } from "@/lib/use-cms-tours";
import { useCmsCommunityContent } from "@/lib/use-cms-community";
import { faq } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

export default function SearchPage() {
    return (
        <PageShell activeKey="home">
            <SearchContent />
        </PageShell>
    );
}

function SearchContent() {
    const { isDark, lang } = usePage();
    const { tourItems } = useCmsTours();
    const { communityContent } = useCmsCommunityContent();
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();
    const panel = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white";
    const card = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";

    const results = useMemo(() => {
        if (!q) return [];

        const tourResults = tourItems
            .filter((tour) => `${tour.title[lang]} ${tour.desc[lang]} ${tour.tags[lang].join(" ")}`.toLowerCase().includes(q))
            .map((tour) => ({ type: "Tour", title: tour.title[lang], body: tour.desc[lang], href: `/tours/${tour.id}` }));

        const communityResults = communityContent.items[lang]
            .filter((item) => `${item.author} ${item.tourTitle ?? ""} ${item.text}`.toLowerCase().includes(q))
            .map((item) => ({ type: "Community", title: item.tourTitle ?? item.author, body: item.text, href: "/community" }));

        const faqResults = faq[lang]
            .filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(q))
            .map(([question, answer]) => ({ type: "FAQ", title: question, body: answer, href: "/faq" }));

        return [...tourResults, ...communityResults, ...faqResults];
    }, [communityContent.items, lang, q, tourItems]);

    return (
        <>
            <section className={`rounded-[32px] border p-8 ${panel}`}>
                <p className="text-sm font-black text-blue-500">Search</p>
                <h1 className={`type-display mt-2 ${isDark ? "text-white" : "text-slate-950"}`}>통합 검색</h1>
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="상품, 공지, FAQ, 커뮤니티를 검색하세요"
                    className={`mt-6 h-14 w-full rounded-2xl border px-5 text-base font-bold outline-none transition focus:border-blue-400 ${
                        isDark ? "border-white/10 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"
                    }`}
                />
            </section>
            <section className="grid gap-3">
                {results.map((item, index) => (
                    <Link key={`${item.type}-${index}`} href={withLocaleQuery(item.href, lang)} className={`rounded-[24px] border p-5 transition hover:border-blue-400 ${card}`}>
                        <p className="text-xs font-black text-blue-500">{item.type}</p>
                        <h2 className={`type-title-md mt-1 ${isDark ? "text-white" : "text-slate-950"}`}>{item.title}</h2>
                        <p className={`mt-2 line-clamp-2 text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{item.body}</p>
                    </Link>
                ))}
                {q && results.length === 0 ? (
                    <div className={`rounded-[24px] border p-8 text-center ${card}`}>검색 결과가 없습니다.</div>
                ) : null}
            </section>
        </>
    );
}
