import { type Locale } from "@/lib/bluewolf-data";

export type CmsTourTheme = {
    key: string;
    label: Record<Locale, string>;
};

export type CmsTourThemesContent = {
    themes: CmsTourTheme[];
};

const defaultThemes: CmsTourTheme[] = [
    {
        key: "desert",
        label: { ko: "사막", ja: "砂漠", en: "Desert" },
    },
    {
        key: "family",
        label: { ko: "가족", ja: "家族", en: "Family" },
    },
    {
        key: "premium",
        label: { ko: "프리미엄", ja: "プレミアム", en: "Premium" },
    },
    {
        key: "adventure",
        label: { ko: "어드벤처", ja: "アドベンチャー", en: "Adventure" },
    },
];

export const defaultCmsTourThemesContent: CmsTourThemesContent = {
    themes: defaultThemes,
};

function sanitizeThemeKey(key: string | undefined, fallback: string) {
    const normalized =
        key
            ?.trim()
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase() || fallback;

    return normalized || fallback;
}

function buildFallbackThemeLabel(locale: Locale, index: number) {
    if (locale === "ja") return `新規テーマ ${index + 1}`;
    if (locale === "en") return `New theme ${index + 1}`;
    return `새 테마 ${index + 1}`;
}

function normalizeTheme(
    theme: Partial<CmsTourTheme> | undefined,
    index: number,
    usedKeys: Set<string>
): CmsTourTheme {
    const fallback = defaultThemes[index] ?? defaultThemes[0];
    let key = sanitizeThemeKey(theme?.key, fallback?.key ?? `custom-theme-${index + 1}`);
    let suffix = 1;

    while (usedKeys.has(key)) {
        key = `${sanitizeThemeKey(theme?.key, fallback?.key ?? `custom-theme-${index + 1}`)}-${suffix}`;
        suffix += 1;
    }
    usedKeys.add(key);

    return {
        key,
        label: {
            ko: theme?.label?.ko?.trim() || fallback?.label.ko || buildFallbackThemeLabel("ko", index),
            ja: theme?.label?.ja?.trim() || fallback?.label.ja || buildFallbackThemeLabel("ja", index),
            en: theme?.label?.en?.trim() || fallback?.label.en || buildFallbackThemeLabel("en", index),
        },
    };
}

export function normalizeCmsTourThemesContent(
    input?: Partial<CmsTourThemesContent> | null
): CmsTourThemesContent {
    const sourceThemes =
        input?.themes && input.themes.length > 0 ? input.themes : defaultCmsTourThemesContent.themes;
    const usedKeys = new Set<string>();

    const normalizedThemes = sourceThemes.map((theme, index) =>
        normalizeTheme(theme, index, usedKeys)
    );

    return {
        themes: normalizedThemes.length > 0 ? normalizedThemes : defaultCmsTourThemesContent.themes,
    };
}

export function createCmsTourTheme(
    content: CmsTourThemesContent,
    initialLabel: string
): CmsTourTheme {
    let nextNumber = content.themes.length + 1;
    let key = `custom-theme-${nextNumber}`;

    while (content.themes.some((theme) => theme.key === key)) {
        nextNumber += 1;
        key = `custom-theme-${nextNumber}`;
    }

    const label = initialLabel.trim() || `새 테마 ${nextNumber}`;

    return {
        key,
        label: {
            ko: label,
            ja: label,
            en: label,
        },
    };
}

export function getCmsTourThemeLabel(
    content: CmsTourThemesContent | null | undefined,
    key: string,
    locale: Locale
) {
    const normalized = normalizeCmsTourThemesContent(content ?? defaultCmsTourThemesContent);
    const theme = normalized.themes.find((item) => item.key === key);
    if (!theme) return key;
    return theme.label[locale] || theme.label.ko || key;
}

export function getCmsTourThemeOptions(
    content: CmsTourThemesContent | null | undefined,
    locale: Locale
) {
    return normalizeCmsTourThemesContent(content ?? defaultCmsTourThemesContent).themes.map(
        (theme) => ({
            value: theme.key,
            label: theme.label[locale] || theme.label.ko || theme.key,
        })
    );
}

