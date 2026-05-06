"use client";

import Link from "next/link";
import { faq } from "@/lib/bluewolf-data";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { withLocaleQuery } from "@/lib/locale-routing";

function FAQContent() {
    const { isDark, lang, t } = usePage();
    const items = faq.ko;

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
                    플랜 신청, 결제, 출발 준비 등 여행 전 과정에서 자주 묻는 질문을 정리했습니다.
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
                <h2 className="text-2xl font-black tracking-tight">
                    더 필요한 내용이 있으면 바로 문의해주세요.
                </h2>

                <p className="mt-3 max-w-2xl leading-8 text-blue-100">
                    일정, 인원, 출발 희망일에 맞춰 플랜 상담과 견적 안내를 도와드립니다.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href={withLocaleQuery("/booking", lang)}
                        className="rounded-2xl bg-white px-5 py-4 font-bold text-slate-900 transition-[transform,background-color] duration-700 ease-in-out hover:bg-slate-100 active:scale-[0.97] active:translate-y-0"
                    >
                        플랜 상담 시작
                    </Link>

                    <Link
                        href={withLocaleQuery("/contact", lang)}
                        className="rounded-2xl bg-white/10 px-5 py-4 font-bold text-white transition-[transform,background-color] duration-700 ease-in-out hover:bg-white/20 active:scale-[0.97] active:translate-y-0"
                    >
                        문의 페이지
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
