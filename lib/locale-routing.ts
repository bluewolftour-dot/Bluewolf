import { type Locale } from "@/lib/bluewolf-data";

export function getLocaleFromSearchParam(value: string | null): Locale | null {
    if (value === "ko" || value === "ja" || value === "en") {
        return value;
    }

    return null;
}

export function withLocaleQuery(href: string, locale: Locale): string {
    if (href.startsWith("#")) {
        return href;
    }

    const [pathWithQuery, hash = ""] = href.split("#");
    const [pathname, query = ""] = pathWithQuery.split("?");
    const params = new URLSearchParams(query);

    if (locale === "ko") {
        params.delete("lang");
    } else {
        params.set("lang", locale);
    }

    const nextQuery = params.toString();
    const nextHash = hash ? `#${hash}` : "";

    return `${pathname}${nextQuery ? `?${nextQuery}` : ""}${nextHash}`;
}
