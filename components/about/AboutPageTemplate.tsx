"use client";

import Link from "next/link";
import { copy, type Locale } from "@/lib/bluewolf-data";
import { buildAccountMenuItems } from "@/lib/account-menu";
import { authCopy } from "@/lib/auth-copy";
import { buildHeaderNav } from "@/lib/header-nav";
import { withLocaleQuery } from "@/lib/locale-routing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useTheme } from "@/app/theme";

export type AboutCopy = {
    brand: string;
    login: string;
    badge: string;
    title: string;
    desc: string;
    missionTitle: string;
    missionDesc: string;
    valuesTitle: string;
    values: {
        title: string;
        desc: string;
    }[];
    processTitle: string;
    process: string[];
    ctaTitle: string;
    ctaDesc: string;
    ctaPrimary: string;
    ctaSecondary: string;
    footerDesc: string;
    footerCopyright: string;
};

export function AboutPageTemplate({
    t,
    locale,
}: {
    t: AboutCopy;
    locale: Locale;
}) {
    const { isDark } = useTheme();

    const headerCopy = copy[locale];
    const authText = authCopy[locale];
    const navItems = buildHeaderNav({
        locale,
        t: headerCopy,
    });
    const accountMenuItems = buildAccountMenuItems(locale);

    return (
        <div
            className={`flex min-h-screen flex-col transition-colors duration-300 ${
                isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
            }`}
        >
            <SiteHeader
                brand={t.brand}
                navItems={navItems}
                activeKey="about"
                loginLabel={t.login}
                loginHref={withLocaleQuery("/login", locale)}
                logoutLabel={authText.logout}
                accountMenuItems={accountMenuItems}
                isDark={isDark}
                rightSlot={<LanguageSwitcher currentLocale={locale} isDark={isDark} mode="link" />}
            />

            <main className="animate-site-page-enter mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10">
                <section
                    className={`rounded-[32px] border p-8 shadow-sm transition-colors duration-300 lg:p-10 ${
                        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                    }`}
                >
                    <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">
                        {t.badge}
                    </span>

                    <h1
                        className={`type-display mt-5 max-w-4xl ${
                            isDark ? "text-white" : "text-slate-900"
                        }`}
                    >
                        {t.title}
                    </h1>

                    <p
                        className={`type-body mt-5 max-w-3xl ${
                            isDark ? "text-slate-300" : "text-slate-500"
                        }`}
                    >
                        {t.desc}
                    </p>
                </section>

                <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div
                        className={`rounded-[28px] border p-7 shadow-sm transition-colors duration-300 ${
                            isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                        }`}
                    >
                        <h2 className={`type-title-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                            {t.missionTitle}
                        </h2>
                        <p className={`type-body mt-4 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                            {t.missionDesc}
                        </p>
                    </div>

                    <div
                        className={`rounded-[28px] border p-7 shadow-sm transition-colors duration-300 ${
                            isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                        }`}
                    >
                        <h2 className={`type-title-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                            {t.processTitle}
                        </h2>
                        <div className="mt-4 grid gap-3">
                            {t.process.map((item, index) => (
                                <div
                                    key={`${index}-${item}`}
                                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                                        isDark ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-700"
                                    }`}
                                >
                                    {index + 1}. {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    className={`rounded-[28px] border p-7 shadow-sm transition-colors duration-300 ${
                        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                    }`}
                >
                    <h2 className={`type-title-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                        {t.valuesTitle}
                    </h2>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {t.values.map((value) => (
                            <div
                                key={value.title}
                                className={`rounded-[24px] border p-5 transition-colors duration-300 ${
                                    isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                                }`}
                            >
                                <h3 className={`type-title-md ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {value.title}
                                </h3>
                                <p className={`type-body mt-3 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-[28px] border border-blue-500/20 bg-blue-600 p-8 text-white shadow-sm">
                    <h2 className="type-title-lg">{t.ctaTitle}</h2>
                    <p className="type-body mt-3 max-w-2xl text-blue-100">{t.ctaDesc}</p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href={withLocaleQuery("/tours", locale)}
                            className="rounded-2xl bg-white px-5 py-4 font-bold text-slate-900 transition hover:bg-slate-100"
                        >
                            {t.ctaPrimary}
                        </Link>
                        <Link
                            href={withLocaleQuery("/", locale)}
                            className="rounded-2xl bg-white/10 px-5 py-4 font-bold text-white transition hover:bg-white/20"
                        >
                            {t.ctaSecondary}
                        </Link>
                    </div>
                </section>
            </main>

            <SiteFooter
                brand={t.brand}
                description={t.footerDesc}
                copyright={t.footerCopyright}
                isDark={isDark}
                locale={locale}
            />
        </div>
    );
}
