import Link from "next/link";
import { type Locale } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

type SiteFooterProps = {
    brand: string;
    description: string;
    copyright?: string;
    isDark: boolean;
    locale: Locale;
};

const footerCopy = {
    ko: {
        about: "회사소개",
        search: "통합 검색",
        guides: "여행 준비 가이드",
        policies: "정책/안전센터",
    },
    ja: {
        about: "会社紹介",
        search: "統合検索",
        guides: "旅行準備ガイド",
        policies: "ポリシー/安全センター",
    },
    en: {
        about: "About",
        search: "Search",
        guides: "Travel guide",
        policies: "Policy center",
    },
} as const;

function getAboutHref(locale: Locale) {
    if (locale === "ko") return "/about";
    return `/about/${locale}`;
}

export function SiteFooter({
    brand,
    description,
    copyright = "© 2026 BlueWolf. All rights reserved.",
    isDark,
    locale,
}: SiteFooterProps) {
    const copy = footerCopy[locale];
    const links = [
        { href: getAboutHref(locale), label: copy.about },
        { href: "/search", label: copy.search },
        { href: "/guides", label: copy.guides },
        { href: "/policies", label: copy.policies },
    ];

    return (
        <footer
            data-site-footer
            className={`border-t transition-colors duration-300 ${
                isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"
            }`}
        >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="text-2xl font-black tracking-tight text-blue-600">{brand}</div>
                        <nav className="flex flex-wrap items-center gap-3">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={withLocaleQuery(link.href, locale)}
                                    className={`inline-flex text-sm font-bold transition ${
                                        isDark ? "text-slate-200 hover:text-blue-300" : "text-slate-700 hover:text-blue-600"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                        {description}
                    </p>
                </div>

                <div className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {copyright}
                </div>
            </div>
        </footer>
    );
}
