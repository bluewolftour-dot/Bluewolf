import { type Locale, type Region } from "@/lib/bluewolf-data";
import { CMS_NULL_IMAGE } from "@/lib/cms-image";

export type TourRegionCardMeta = {
    defaultImage: string;
    gradient: string;
    subtitle: Record<Locale, string>;
    label: Record<Locale, string>;
    desc: Record<Locale, string>;
};

export const tourRegionCardMeta: Record<Region, TourRegionCardMeta> = {
    south: {
        defaultImage: CMS_NULL_IMAGE,
        gradient: "from-blue-900/55 to-blue-600/35",
        subtitle: {
            ko: "고비 사막",
            ja: "ゴビ砂漠",
            en: "Gobi Desert",
        },
        label: {
            ko: "남부",
            ja: "南部",
            en: "South",
        },
        desc: {
            ko: "4박~7박 · 사막, 협곡, 별보기",
            ja: "4泊〜7泊 · 砂漠、渓谷、星空",
            en: "4–7 nights · Desert, canyon, stargazing",
        },
    },
    north: {
        defaultImage: CMS_NULL_IMAGE,
        gradient: "from-violet-900/55 to-indigo-600/35",
        subtitle: {
            ko: "홉스골 호수",
            ja: "フブスグル湖",
            en: "Khuvsgul Lake",
        },
        label: {
            ko: "북부",
            ja: "北部",
            en: "North",
        },
        desc: {
            ko: "4박~7박 · 호수, 숲, 승마",
            ja: "4泊〜7泊 · 湖、森、乗馬",
            en: "4–7 nights · Lake, forest, horse riding",
        },
    },
    central: {
        defaultImage: CMS_NULL_IMAGE,
        gradient: "from-sky-900/55 to-blue-600/35",
        subtitle: {
            ko: "테를지 초원",
            ja: "テレルジ草原",
            en: "Terelj Steppe",
        },
        label: {
            ko: "중부",
            ja: "中部",
            en: "Central",
        },
        desc: {
            ko: "1박~5박 · 초원, 온천, 가족 여행",
            ja: "1泊〜5泊 · 草原、温泉、家族旅行",
            en: "1–5 nights · Steppe, hot springs, family travel",
        },
    },
    west: {
        defaultImage: CMS_NULL_IMAGE,
        gradient: "from-amber-900/55 to-orange-600/35",
        subtitle: {
            ko: "알타이 산맥",
            ja: "アルタイ山脈",
            en: "Altai Mountains",
        },
        label: {
            ko: "서부",
            ja: "西部",
            en: "West",
        },
        desc: {
            ko: "7박~12박 · 산악, 독수리 사냥, 어드벤처",
            ja: "7泊〜12泊 · 山岳、鷹狩り、アドベンチャー",
            en: "7–12 nights · Mountains, eagle hunting, adventure",
        },
    },
};

export const tourRegionOrder: Region[] = ["south", "north", "central", "west"];
