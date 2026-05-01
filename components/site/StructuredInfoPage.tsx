"use client";

import Link from "next/link";
import { PageShell, type PageKey, usePage } from "@/components/layout/PageShell";
import { withLocaleQuery } from "@/lib/locale-routing";

type InfoAction = {
    href: string;
    label: string;
};

type InfoCard = {
    title: string;
    body: string;
    href?: string;
};

export function StructuredInfoPage({
    activeKey = "home",
    eyebrow,
    title,
    description,
    cards,
    actions = [],
}: {
    activeKey?: PageKey;
    eyebrow: string;
    title: string;
    description: string;
    cards: InfoCard[];
    actions?: InfoAction[];
}) {
    return (
        <PageShell activeKey={activeKey}>
            <StructuredInfoPageContent
                eyebrow={eyebrow}
                title={title}
                description={description}
                cards={cards}
                actions={actions}
            />
        </PageShell>
    );
}

function StructuredInfoPageContent({
    eyebrow,
    title,
    description,
    cards,
    actions,
}: {
    eyebrow: string;
    title: string;
    description: string;
    cards: InfoCard[];
    actions: InfoAction[];
}) {
    const { isDark, lang } = usePage();
    const panel = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white";
    const subPanel = isDark ? "border-white/10 bg-slate-950 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600";
    const textMain = isDark ? "text-white" : "text-slate-950";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <>
            <section className={`rounded-[32px] border p-6 shadow-sm sm:p-8 lg:p-10 ${panel}`}>
                <p className="text-sm font-black text-blue-500">{eyebrow}</p>
                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight sm:text-4xl ${textMain}`}>
                            {title}
                        </h1>
                        <p className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base ${textMuted}`}>
                            {description}
                        </p>
                    </div>
                    {actions.length ? (
                        <div className="flex flex-wrap gap-2">
                            {actions.map((action) => (
                                <Link
                                    key={action.href}
                                    href={withLocaleQuery(action.href, lang)}
                                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-500"
                                >
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                {cards.map((card) => {
                    const content = (
                        <article className={`h-full rounded-[28px] border p-6 transition ${subPanel}`}>
                            <h2 className={`text-xl font-black tracking-tight ${textMain}`}>
                                {card.title}
                            </h2>
                            <p className="mt-3 text-sm leading-7">{card.body}</p>
                        </article>
                    );

                    return card.href ? (
                        <Link key={card.title} href={withLocaleQuery(card.href, lang)}>
                            {content}
                        </Link>
                    ) : (
                        <div key={card.title}>{content}</div>
                    );
                })}
            </section>
        </>
    );
}
