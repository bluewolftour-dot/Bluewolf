"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { faq } from "@/lib/bluewolf-data";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { withLocaleQuery } from "@/lib/locale-routing";
import { type Locale } from "@/lib/bluewolf-types";
import { CustomerSupportSections } from "@/components/support/CustomerSupportSections";

type SupportCategory = "all" | "booking" | "payment" | "preparation" | "onsite" | "safety";

const supportCopy = {
    ko: {
        badge: "고객센터",
        title: "무엇을 도와드릴까요?",
        desc: "예약부터 결제, 출발 준비, 현지 이용까지 필요한 답변을 빠르게 찾아보세요.",
        searchPlaceholder: "궁금한 내용을 검색하세요",
        noResults: "검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요.",
        popularTitle: "빠른 도움",
        helpTitle: "자주 찾는 도움말",
    },
    ja: {
        badge: "サポート",
        title: "どのようなことでお困りですか？",
        desc: "予約、決済、出発準備、現地利用まで必要な回答をすばやく確認できます。",
        searchPlaceholder: "知りたい内容を検索",
        noResults: "検索結果がありません。別のキーワードでお試しください。",
        popularTitle: "クイックサポート",
        helpTitle: "よく見られるヘルプ",
    },
    en: {
        badge: "Support Center",
        title: "How can we help?",
        desc: "Find answers for booking, payments, trip preparation, and on-site support in one place.",
        searchPlaceholder: "Search help articles",
        noResults: "No results found. Try a different keyword.",
        popularTitle: "Quick help",
        helpTitle: "Popular help topics",
    },
} as const;

const categoryCopy: Record<Locale, Array<{ key: SupportCategory; label: string }>> = {
    ko: [
        { key: "all", label: "전체" },
        { key: "booking", label: "예약" },
        { key: "payment", label: "결제" },
        { key: "preparation", label: "출발 준비" },
        { key: "onsite", label: "현지 이용" },
        { key: "safety", label: "안전·통신" },
    ],
    ja: [
        { key: "all", label: "すべて" },
        { key: "booking", label: "予約" },
        { key: "payment", label: "決済" },
        { key: "preparation", label: "出発準備" },
        { key: "onsite", label: "現地利用" },
        { key: "safety", label: "安全・通信" },
    ],
    en: [
        { key: "all", label: "All" },
        { key: "booking", label: "Booking" },
        { key: "payment", label: "Payment" },
        { key: "preparation", label: "Preparation" },
        { key: "onsite", label: "On-site" },
        { key: "safety", label: "Safety" },
    ],
};

const quickActions = {
    ko: [
        { title: "예약 확인", desc: "예약 번호 또는 회원 계정으로 진행 상태를 확인하세요.", href: "/booking" },
        { title: "결제·환불", desc: "결제 방식과 취소·환불 기준을 확인하세요.", href: "/faq#help-topics" },
        { title: "여행 준비", desc: "비자, 준비물, 출발 전 안내를 확인하세요.", href: "/guides" },
        { title: "1:1 문의", desc: "일정이나 맞춤 요청을 직접 남겨주세요.", href: "/faq#contact-support" },
    ],
    ja: [
        { title: "予約確認", desc: "予約番号または会員情報で進行状況を確認できます。", href: "/booking" },
        { title: "決済・返金", desc: "決済方法とキャンセル・返金基準を確認できます。", href: "/faq#help-topics" },
        { title: "旅行準備", desc: "ビザ、持ち物、出発前案内を確認できます。", href: "/guides" },
        { title: "1:1 問い合わせ", desc: "日程や個別相談を直接送信できます。", href: "/faq#contact-support" },
    ],
    en: [
        { title: "Booking lookup", desc: "Check progress with your booking number or member account.", href: "/booking" },
        { title: "Payment & refunds", desc: "Review payment methods and refund rules.", href: "/faq#help-topics" },
        { title: "Trip preparation", desc: "Check visas, packing, and pre-departure guidance.", href: "/guides" },
        { title: "Contact support", desc: "Send itinerary or custom-plan questions directly.", href: "/faq#contact-support" },
    ],
} as const;

const categoryTokens: Record<SupportCategory, string[]> = {
    all: [],
    booking: ["[예약]", "[booking]", "[予約]"],
    payment: ["[결제]", "[payment]", "[決済]"],
    preparation: ["[출발 준비]", "[pre-departure]", "[出発準備]"],
    onsite: ["[현지 운영]", "[on-site]", "[現地運営]"],
    safety: ["[안전]", "[safety]", "[安全]"],
};

function normalizeSearchText(value: string) {
    return value.toLowerCase();
}

function detectCategory(question: string): SupportCategory {
    const normalized = normalizeSearchText(question);

    return (
        (Object.entries(categoryTokens) as Array<[SupportCategory, string[]]>).find(([key, tokens]) => {
            if (key === "all") return false;
            return tokens.some((token) => normalized.includes(token.toLowerCase()));
        })?.[0] ?? "all"
    );
}

function FAQContent() {
    const { isDark, lang } = usePage();
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<SupportCategory>("all");
    const items = faq[lang].map(([question, answer]) => ({
        question,
        answer,
        category: detectCategory(question),
    }));
    const copy = supportCopy[lang];
    const categories = categoryCopy[lang];
    const filteredItems = useMemo(() => {
        const normalizedQuery = normalizeSearchText(query.trim());

        return items.filter((item) => {
            const matchesCategory = activeCategory === "all" || item.category === activeCategory;
            const matchesQuery =
                !normalizedQuery ||
                normalizeSearchText(`${item.question} ${item.answer}`).includes(normalizedQuery);

            return matchesCategory && matchesQuery;
        });
    }, [activeCategory, items, query]);

    return (
        <>
            <section
                className={`overflow-hidden rounded-[32px] border p-6 shadow-sm sm:p-8 lg:p-10 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                }`}
            >
                <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">
                    {copy.badge}
                </span>

                <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,430px)] lg:items-end">
                    <div>
                        <h1 className={`type-display ${isDark ? "text-white" : "text-slate-900"}`}>
                            {copy.title}
                        </h1>
                        <p className={`mt-4 max-w-2xl leading-8 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                            {copy.desc}
                        </p>
                    </div>

                    <label className="block">
                        <span className="sr-only">{copy.searchPlaceholder}</span>
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={copy.searchPlaceholder}
                            className={`h-14 w-full rounded-2xl border px-5 text-base font-bold outline-none transition focus:border-blue-400 ${
                                isDark
                                    ? "border-white/10 bg-slate-950 text-white placeholder:text-slate-500"
                                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                            }`}
                        />
                    </label>
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className={`type-title-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                        {copy.popularTitle}
                    </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {quickActions[lang].map((item) => (
                        <Link
                            key={item.title}
                            href={withLocaleQuery(item.href, lang)}
                            className={`rounded-[24px] border p-5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 ${
                                isDark
                                    ? "border-white/10 bg-slate-900 hover:border-blue-400/60"
                                    : "border-slate-200 bg-white hover:border-blue-300"
                            }`}
                        >
                            <p className={`font-black ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</p>
                            <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <section
                id="help-topics"
                className={`rounded-[28px] border p-5 shadow-sm sm:p-6 lg:p-7 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                }`}
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className={`type-title-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                        {copy.helpTitle}
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const active = activeCategory === category.key;

                            return (
                                <button
                                    key={category.key}
                                    type="button"
                                    onClick={() => setActiveCategory(category.key)}
                                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                                        active
                                            ? "bg-blue-600 text-white"
                                            : isDark
                                              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                              : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                                >
                                    {category.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-5 grid gap-3">
                    {filteredItems.map((item, index) => (
                        <details
                            key={item.question}
                            className={`group rounded-[24px] border p-5 open:shadow-sm ${
                                isDark
                                    ? "border-white/10 bg-slate-950 open:bg-slate-900"
                                    : "border-slate-200 bg-slate-50 open:bg-white"
                            }`}
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-blue-50 px-2 text-sm font-black text-blue-700">
                                        {index + 1}
                                    </span>
                                    <span className={`font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {item.question}
                                    </span>
                                </div>

                                <span
                                    className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-180 ${
                                        isDark ? "text-slate-500" : "text-slate-400"
                                    }`}
                                >
                                    ▾
                                </span>
                            </summary>

                            <p className={`mt-4 pl-11 leading-8 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                                {item.answer}
                            </p>
                        </details>
                    ))}

                    {filteredItems.length === 0 ? (
                        <div
                            className={`rounded-[24px] border p-8 text-center text-sm ${
                                isDark ? "border-white/10 bg-slate-950 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                        >
                            {copy.noResults}
                        </div>
                    ) : null}
                </div>
            </section>

            <div id="contact-support" className="scroll-mt-28">
                <CustomerSupportSections />
            </div>
        </>
    );
}

export default function FAQClient() {
    return (
        <PageShell activeKey="faq">
            <FAQContent />
        </PageShell>
    );
}
