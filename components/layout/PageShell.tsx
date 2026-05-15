"use client";

import { Suspense, createContext, useContext, useMemo } from "react";
import type React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { copy, type Locale } from "@/lib/bluewolf-data";
import { buildAccountMenuItems } from "@/lib/account-menu";
import { authCopy } from "@/lib/auth-copy";
import { buildHeaderNav } from "@/lib/header-nav";
import { getLocaleFromSearchParam, withLocaleQuery } from "@/lib/locale-routing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useTheme } from "@/app/theme";
import { useAuth } from "@/components/auth/AuthProvider";

export type PageKey = "none" | "home" | "about" | "tours" | "booking" | "community" | "faq" | "contact";

type CopyValue = (typeof copy)[Locale];

type PageContextValue = {
    lang: Locale;
    isDark: boolean;
    t: CopyValue;
};

const PageContext = createContext<PageContextValue>({
    lang: "ko",
    isDark: false,
    t: copy.ko,
});

export function usePage() {
    return useContext(PageContext);
}

export function PageShell({
    activeKey,
    children,
}: {
    activeKey: PageKey;
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={null}>
            <PageShellContent activeKey={activeKey}>{children}</PageShellContent>
        </Suspense>
    );
}

function PageShellContent({
    activeKey,
    children,
}: {
    activeKey: PageKey;
    children: React.ReactNode;
}) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = getLocaleFromSearchParam(searchParams.get("lang")) ?? "ko";
    const t = copy[lang];
    const authText = authCopy[lang];

    const isAuthenticated = Boolean(user);
    const navItems = useMemo(
        () => buildHeaderNav({ locale: lang, t, isAuthenticated }),
        [lang, t, isAuthenticated]
    );
    const accountMenuItems = useMemo(
        () => buildAccountMenuItems(lang),
        [lang]
    );

    const handleLocaleChange = (nextLocale: Locale) => {
        const currentHref = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        router.replace(withLocaleQuery(currentHref, nextLocale));
    };

    return (
        <PageContext.Provider value={{ lang, isDark, t }}>
            <div
                className={`flex min-h-screen flex-col transition-colors duration-300 ${
                    isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
                }`}
            >
                <SiteHeader
                    brand={t.brand}
                    navItems={navItems}
                    activeKey={activeKey}
                    loginLabel={t.login}
                    loginHref={withLocaleQuery("/login", lang)}
                    logoutLabel={authText.logout}
                    accountMenuItems={accountMenuItems}
                    isDark={isDark}
                    rightSlot={
                        <LanguageSwitcher
                            currentLocale={lang}
                            isDark={isDark}
                            mode="button"
                            onChange={handleLocaleChange}
                        />
                    }
                />

                <main
                    key={`${pathname}-${lang}`}
                    className="animate-site-page-enter mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-4 sm:py-6 lg:gap-6"
                >
                    {children}
                </main>

                <SiteFooter brand={t.brand} description={t.footer} isDark={isDark} locale={lang} />
            </div>
        </PageContext.Provider>
    );
}
