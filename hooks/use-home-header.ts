"use client";

import { useMemo } from "react";
import { buildAccountMenuItems } from "@/lib/account-menu";
import { authCopy } from "@/lib/auth-copy";
import { copy, type Locale } from "@/lib/bluewolf-data";
import { buildHeaderNav } from "@/lib/header-nav";

type CopyValue = (typeof copy)[Locale];

export function useHomeHeader(lang: Locale, t: CopyValue) {
    const navItems = useMemo(
        () => buildHeaderNav({ locale: lang, t }),
        [lang, t]
    );
    const accountMenuItems = useMemo(
        () => buildAccountMenuItems(lang),
        [lang]
    );

    return {
        authText: authCopy[lang],
        navItems,
        accountMenuItems,
    };
}
