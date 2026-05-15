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
        eyebrow: "고객센터",
        title: "어떤 도움이 필요하신가요?",
        desc: "예약부터 출발 준비까지 자주 찾는 안내를 빠르게 확인하고, 필요한 경우 바로 상담을 남길 수 있어요.",
        searchPlaceholder: "검색어를 입력해 주세요.",
        noResults: "검색 결과가 없습니다. 다른 키워드로 다시 찾아보세요.",
        listTitle: "자주 묻는 질문",
        listCount: "개의 도움말",
        contactLabel: "1:1 문의",
        bookingLabel: "예약 확인",
    },
    ja: {
        eyebrow: "サポート",
        title: "どのようなサポートが必要ですか？",
        desc: "予約から出発準備まで、よくある案内をすばやく確認し、必要な場合はそのまま相談できます。",
        searchPlaceholder: "検索語を入力してください。",
        noResults: "検索結果がありません。別のキーワードでお試しください。",
        listTitle: "よくある質問",
        listCount: "件のヘルプ",
        contactLabel: "1:1 問い合わせ",
        bookingLabel: "予約確認",
    },
    en: {
        eyebrow: "Support Center",
        title: "What can we help you with?",
        desc: "Find the answers travelers ask for most, then reach support directly if you still need help.",
        searchPlaceholder: "Search help articles",
        noResults: "No results found. Try a different keyword.",
        listTitle: "Frequently asked questions",
        listCount: " articles",
        contactLabel: "Contact support",
        bookingLabel: "Booking lookup",
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

const categoryTokens: Record<SupportCategory, string[]> = {
    all: [],
    booking: ["[예약]", "[booking]", "[予約]"],
    payment: ["[결제]", "[payment]", "[決済]"],
    preparation: ["[출발 준비]", "[pre-departure]", "[出発準備]"],
    onsite: ["[현지 운영]", "[on-site]", "[現地運営]"],
    safety: ["[안전]", "[safety]", "[安全]"],
};

const pageSize = 8;

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

function BookingIcon() {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="h-11 w-11">
            <rect x="9" y="8" width="30" height="32" rx="9" className="fill-blue-600" />
            <path d="M16 18h16M16 25h16M16 32h10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

function SupportIcon() {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="h-11 w-11">
            <circle cx="24" cy="19" r="8" className="fill-blue-100" />
            <path d="M12 38c2.2-6.2 7.1-9.4 12-9.4S33.8 31.8 36 38" className="fill-blue-100" />
            <path d="M12 23v-2a12 12 0 0 1 24 0v2" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
            <path d="M12 24h4v7h-4a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3Zm24 0h-4v7h4a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3Z" className="fill-blue-600" />
        </svg>
    );
}

function FAQContent() {
    const { isDark, lang } = usePage();
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<SupportCategory>("all");
    const [page, setPage] = useState(1);
    const copy = supportCopy[lang];
    const categories = categoryCopy[lang];
    const categoryLabelMap = Object.fromEntries(categories.map((category) => [category.key, category.label])) as Record<
        SupportCategory,
        string
    >;
    const items = faq[lang].map(([question, answer]) => ({
        question,
        answer,
        category: detectCategory(question),
    }));
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
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
    const paginationPages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <>
            <section
                className={`overflow-hidden rounded-[32px] border px-5 py-8 shadow-sm sm:px-8 sm:py-10 lg:px-12 lg:py-14 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-slate-100"
                }`}
            >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
                    <div className="max-w-2xl">
                        <p className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {copy.eyebrow}
                        </p>
                        <h1 className={`type-display mt-3 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                            {copy.title}
                        </h1>
                        <p className={`mt-3 max-w-xl leading-8 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                            {copy.desc}
                        </p>

                        <label className="mt-6 block max-w-md">
                            <span className="sr-only">{copy.searchPlaceholder}</span>
                            <div
                                className={`flex h-14 items-center gap-3 rounded-2xl border px-4 ${
                                    isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"
                                }`}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    className={`h-5 w-5 shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                >
                                    <path
                                        fill="currentColor"
                                        d="m20.4 21.8-5.3-5.3a8 8 0 1 1 1.4-1.4l5.3 5.3-1.4 1.4ZM10.8 17a6.2 6.2 0 1 0 0-12.4 6.2 6.2 0 0 0 0 12.4Z"
                                    />
                                </svg>
                                <input
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setPage(1);
                                    }}
                                    placeholder={copy.searchPlaceholder}
                                    className={`h-full w-full bg-transparent text-sm font-semibold outline-none ${
                                        isDark
                                            ? "text-white placeholder:text-slate-500"
                                            : "text-slate-900 placeholder:text-slate-400"
                                    }`}
                                />
                            </div>
                        </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Link
                            href={withLocaleQuery("/booking", lang)}
                            className={`group flex min-h-40 flex-col items-center justify-center rounded-[28px] border px-5 py-6 text-center transition-colors ${
                                isDark
                                    ? "border-white/10 bg-slate-950 hover:border-blue-400/60"
                                    : "border-white bg-white hover:border-blue-200"
                            }`}
                        >
                            <BookingIcon />
                            <span className={`mt-4 inline-flex items-center gap-1 font-bold ${isDark ? "text-white" : "text-blue-700"}`}>
                                {copy.bookingLabel}
                                <span className="transition-transform group-hover:translate-x-0.5">›</span>
                            </span>
                        </Link>

                        <Link
                            href={withLocaleQuery("/faq#contact-support", lang)}
                            className={`group flex min-h-40 flex-col items-center justify-center rounded-[28px] border px-5 py-6 text-center transition-colors ${
                                isDark
                                    ? "border-white/10 bg-slate-950 hover:border-blue-400/60"
                                    : "border-white bg-white hover:border-blue-200"
                            }`}
                        >
                            <SupportIcon />
                            <span className={`mt-4 inline-flex items-center gap-1 font-bold ${isDark ? "text-white" : "text-blue-700"}`}>
                                {copy.contactLabel}
                                <span className="transition-transform group-hover:translate-x-0.5">›</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            <section
                id="help-topics"
                className="px-1 sm:px-0"
            >
                <div
                    className={`flex gap-1 overflow-x-auto border-b pb-0 ${
                        isDark ? "border-white/10" : "border-slate-200"
                    }`}
                >
                    <div className="sr-only">
                        <h2>{copy.listTitle}</h2>
                        <p>
                            {filteredItems.length}
                            {copy.listCount}
                        </p>
                    </div>
                    <div className="flex min-w-max gap-1">
                        {categories.map((category) => {
                            const active = activeCategory === category.key;

                            return (
                                <button
                                    key={category.key}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(category.key);
                                        setPage(1);
                                    }}
                                    className={`whitespace-nowrap border-b-2 px-3 py-4 text-sm font-bold transition ${
                                        active
                                            ? "border-blue-600 text-blue-600"
                                            : isDark
                                              ? "border-transparent text-slate-400 hover:text-white"
                                              : "border-transparent text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    {category.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-200"}`}>
                    {visibleItems.map((item) => (
                        <details key={item.question} className="group">
                            <summary className="grid cursor-pointer list-none gap-3 py-5 sm:grid-cols-[150px_minmax(0,1fr)_24px] sm:items-center">
                                <span className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {categoryLabelMap[item.category]}
                                </span>
                                <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                    Q. {item.question.replace(/^\[[^\]]+\]\s*/, "")}
                                </span>
                                <span
                                    className={`hidden text-right transition-transform duration-300 group-open:rotate-180 sm:block ${
                                        isDark ? "text-slate-500" : "text-slate-400"
                                    }`}
                                >
                                    ▾
                                </span>
                            </summary>

                            <p
                                className={`pb-5 leading-8 sm:pl-[150px] ${
                                    isDark ? "text-slate-300" : "text-slate-500"
                                }`}
                            >
                                {item.answer}
                            </p>
                        </details>
                    ))}

                    {filteredItems.length === 0 ? (
                        <div className={`py-12 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {copy.noResults}
                        </div>
                    ) : null}
                </div>

                {filteredItems.length > pageSize ? (
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                        {paginationPages.map((pageNumber) => {
                            const active = page === pageNumber;

                            return (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setPage(pageNumber)}
                                    className={`h-9 min-w-9 rounded-full px-3 text-sm font-bold transition ${
                                        active
                                            ? "bg-blue-600 text-white"
                                            : isDark
                                              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                    </div>
                ) : null}
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
