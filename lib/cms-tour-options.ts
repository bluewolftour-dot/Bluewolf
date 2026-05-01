import { type Locale } from "@/lib/bluewolf-data";
import { OPTION_PRICE, pageCopy, type OptionInfo, type OptionKey } from "@/components/tours/tours-customize-data";
import { normalizeCmsImageList } from "@/lib/cms-image";

export type CmsTourOption = {
    key: OptionKey;
    price: number;
    title: Record<Locale, string>;
    desc: Record<Locale, string>;
    details: Record<Locale, string[]>;
    photos: string[];
};

export type CmsTourOptionsContent = {
    options: CmsTourOption[];
};

const legacyOptionKeyMap: Record<string, OptionKey> = {
    premiumGer: "customOption1",
    airportPickup: "customOption2",
    privateGuide: "customOption3",
    campfire: "customOption4",
    premiumVehicle: "customOption5",
};

function normalizeOptionKey(key: string | undefined, fallbackKey: OptionKey): OptionKey {
    const trimmed = key?.trim();
    if (!trimmed) return fallbackKey;
    return legacyOptionKeyMap[trimmed] ?? trimmed;
}

function buildDefaultTourOptions(): CmsTourOption[] {
    return pageCopy.ko.options.map((koOption) => {
        const jaOption = pageCopy.ja.options.find((option) => option.key === koOption.key) ?? pageCopy.ja.options[0] ?? koOption;
        const enOption = pageCopy.en.options.find((option) => option.key === koOption.key) ?? pageCopy.en.options[0] ?? koOption;

        return {
            key: koOption.key,
            price: OPTION_PRICE,
            title: {
                ko: koOption.title,
                ja: jaOption.title,
                en: enOption.title,
            },
            desc: {
                ko: koOption.desc,
                ja: jaOption.desc,
                en: enOption.desc,
            },
            details: {
                ko: koOption.details,
                ja: jaOption.details,
                en: enOption.details,
            },
            photos: normalizeCmsImageList(koOption.photos, koOption.photos.length || 1),
        };
    });
}

export const defaultCmsTourOptionsContent: CmsTourOptionsContent = {
    options: buildDefaultTourOptions(),
};

function normalizeOption(option: CmsTourOption, index: number): CmsTourOption {
    const fallback = defaultCmsTourOptionsContent.options[index] ?? defaultCmsTourOptionsContent.options[0];
    const fallbackKey = fallback?.key ?? `customOption${index + 1}`;

    return {
        key: normalizeOptionKey(option.key, fallbackKey),
        price: Number.isFinite(option.price) ? option.price : fallback?.price ?? OPTION_PRICE,
        title: {
            ko: option.title?.ko?.trim() || fallback?.title.ko || "새 옵션",
            ja: option.title?.ja?.trim() || fallback?.title.ja || "新しいオプション",
            en: option.title?.en?.trim() || fallback?.title.en || "New option",
        },
        desc: {
            ko: option.desc?.ko?.trim() || fallback?.desc.ko || "",
            ja: option.desc?.ja?.trim() || fallback?.desc.ja || "",
            en: option.desc?.en?.trim() || fallback?.desc.en || "",
        },
        details: {
            ko: option.details?.ko ?? fallback?.details.ko ?? [],
            ja: option.details?.ja ?? fallback?.details.ja ?? [],
            en: option.details?.en ?? fallback?.details.en ?? [],
        },
        photos: normalizeCmsImageList(
            Array.isArray(option.photos) ? option.photos : fallback?.photos,
            fallback?.photos.length || 1
        ),
    };
}

export function normalizeCmsTourOptionsContent(input?: Partial<CmsTourOptionsContent> | null): CmsTourOptionsContent {
    const rawOptions = input?.options?.length ? input.options : defaultCmsTourOptionsContent.options;

    return {
        options: rawOptions.map((option, index) => normalizeOption(option, index)),
    };
}

export type LocalizedTourOption = OptionInfo & { price: number };

export function localizeTourOptions(content: CmsTourOptionsContent, locale: Locale): LocalizedTourOption[] {
    return content.options.map((option) => ({
        key: option.key,
        price: option.price,
        title: option.title[locale],
        desc: option.desc[locale],
        details: option.details[locale],
        photos: option.photos,
    }));
}
