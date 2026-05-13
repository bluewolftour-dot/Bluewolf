"use client";

import Link from "next/link";
import { faq } from "@/lib/bluewolf-data";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { withLocaleQuery } from "@/lib/locale-routing";

const faqCopy = {
    ko: {
        desc: "예약, 결제, 출발 준비, 현지 운영, 안전·통신 등 BlueWolf 여행 전 과정에서 자주 묻는 질문을 정리했습니다.",
        ctaTitle: "더 궁금한 점이 있으신가요?",
        ctaDesc: "일정·인원·출발 희망일에 맞춰 플랜 상담과 견적 안내를 도와드립니다.",
        ctaPrimary: "플랜 상담 시작",
        ctaSecondary: "문의 페이지",
    },
    ja: {
        desc: "予約・決済・出発準備・現地運営・安全と通信など、BlueWolf 旅行の全工程でよく寄せられる質問をまとめました。",
        ctaTitle: "他にもご不明な点がございますか？",
        ctaDesc: "日程・人数・希望出発日に合わせてプラン相談と見積もりをご案内します。",
        ctaPrimary: "プラン相談を開始",
        ctaSecondary: "お問い合わせ",
    },
    en: {
        desc: "Common questions covering booking, payment, pre-departure preparation, on-site operations, and safety for your BlueWolf trip.",
        ctaTitle: "Still have questions?",
        ctaDesc: "Tell us your dates, party size, and ideal departure window, and we'll help with a plan and quote.",
        ctaPrimary: "Start planning",
        ctaSecondary: "Contact us",
    },
} as const;

function FAQContent() {
    const { isDark, lang, t } = usePage();
    const items = faq[lang];
    const copy = faqCopy[lang];

    return (
        <>
            <section
                className={`rounded-[32px] border p-8 shadow-sm lg:p-10 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                }`}
            >
                <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">
                    FAQ
                </span>

                <h1
                    className={`mt-5 text-4xl font-black tracking-tight lg:text-5xl ${
                        isDark ? "text-white" : "text-slate-900"
                    }`}
                >
                    {t.faqTitle}
                </h1>

                <p
                    className={`mt-4 max-w-3xl text-base leading-8 ${
                        isDark ? "text-slate-300" : "text-slate-500"
                    }`}
                >
                    {copy.desc}
                </p>
            </section>

            <section
                className={`rounded-[28px] border p-6 shadow-sm lg:p-7 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                }`}
            >
                <div className="grid gap-3">
                    {items.map(([question, answer], index) => (
                        <details
                            key={question}
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
                                    <span
                                        className={`text-base font-black tracking-tight ${
                                            isDark ? "text-white" : "text-slate-900"
                                        }`}
                                    >
                                        {question}
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

                            <p
                                className={`mt-4 pl-11 leading-8 ${
                                    isDark ? "text-slate-300" : "text-slate-500"
                                }`}
                            >
                                {answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="rounded-[28px] border border-blue-500/20 bg-blue-600 p-8 text-white shadow-sm">
                <h2 className="text-2xl font-black tracking-tight">{copy.ctaTitle}</h2>

                <p className="mt-3 max-w-2xl leading-8 text-blue-100">{copy.ctaDesc}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href={withLocaleQuery("/booking", lang)}
                        className="rounded-2xl bg-white px-5 py-4 font-bold text-slate-900 transition-[transform,background-color] duration-700 ease-in-out hover:bg-slate-100 active:scale-[0.97] active:translate-y-0"
                    >
                        {copy.ctaPrimary}
                    </Link>

                    <Link
                        href={withLocaleQuery("/contact", lang)}
                        className="rounded-2xl bg-white/10 px-5 py-4 font-bold text-white transition-[transform,background-color] duration-700 ease-in-out hover:bg-white/20 active:scale-[0.97] active:translate-y-0"
                    >
                        {copy.ctaSecondary}
                    </Link>
                </div>
            </section>
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
