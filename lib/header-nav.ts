import { type Locale } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

type HeaderCopySource = {
    navTours?: string;
    navPlans?: string;
    navBooking?: string;
    navApplication?: string;
    navCommunity: string;
    navFaq: string;
};

export type HeaderNavItem = {
    key: string;
    href: string;
    label: string;
};

const fixedHeaderLabel = {
    ko: { home: "홈", contact: "문의" },
    ja: { home: "ホーム", contact: "お問い合わせ" },
    en: { home: "Home", contact: "Contact" },
} as const;

export function buildHeaderNav({
    locale,
    t,
    isAuthenticated = false,
}: {
    locale: Locale;
    t: HeaderCopySource;
    isAuthenticated?: boolean;
}): HeaderNavItem[] {
    const fixed = fixedHeaderLabel[locale];
    const bookingHref = isAuthenticated
        ? withLocaleQuery("/mypage/bookings", locale)
        : withLocaleQuery("/booking", locale);

    return [
        { key: "home", href: withLocaleQuery("/", locale), label: fixed.home },
        { key: "tours", href: withLocaleQuery("/tours", locale), label: t.navTours ?? t.navPlans ?? "Tours" },
        { key: "booking", href: bookingHref, label: t.navBooking ?? t.navApplication ?? "Booking" },
        { key: "community", href: withLocaleQuery("/community", locale), label: t.navCommunity },
        { key: "faq", href: withLocaleQuery("/faq", locale), label: t.navFaq },
        { key: "contact", href: withLocaleQuery("/contact", locale), label: fixed.contact },
    ];
}
