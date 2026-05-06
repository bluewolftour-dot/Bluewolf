"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type Locale } from "@/lib/bluewolf-data";
import { getLocaleFromSearchParam, withLocaleQuery } from "@/lib/locale-routing";

export function useHomeLocale(onLocaleChange?: () => void) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = getLocaleFromSearchParam(searchParams.get("lang")) ?? "ko";

    const changeLanguage = (nextLang: Locale) => {
        onLocaleChange?.();
        const currentHref = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        router.replace(withLocaleQuery(currentHref, nextLang));
    };

    return {
        lang,
        pathname,
        mainKey: `${pathname}-${lang}`,
        changeLanguage,
    };
}
