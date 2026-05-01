import { type DurationType, type Region, type Theme, type Tour } from "@/lib/bluewolf-data";
import { CMS_NULL_IMAGE, createCmsImagePlaceholders } from "@/lib/cms-image";

export const cmsTourRegions = [
    {
        key: "central" as const,
        label: "중부",
        description: "테를지, 초원, 가족형 일정 상품을 관리합니다.",
        defaultTheme: "family" as const,
        defaultDurationType: "short" as const,
        defaultPrice: 990000,
        defaultGradient: "from-sky-900 to-blue-500",
        heroImage: CMS_NULL_IMAGE,
    },
    {
        key: "north" as const,
        label: "북부",
        description: "홉스골, 숲, 호수 중심 상품을 관리합니다.",
        defaultTheme: "premium" as const,
        defaultDurationType: "long" as const,
        defaultPrice: 2090000,
        defaultGradient: "from-violet-700 to-indigo-400",
        heroImage: CMS_NULL_IMAGE,
    },
    {
        key: "south" as const,
        label: "남부",
        description: "고비, 협곡, 별보기 상품을 관리합니다.",
        defaultTheme: "desert" as const,
        defaultDurationType: "long" as const,
        defaultPrice: 1390000,
        defaultGradient: "from-blue-600 to-blue-400",
        heroImage: CMS_NULL_IMAGE,
    },
    {
        key: "west" as const,
        label: "서부",
        description: "알타이, 장거리, 어드벤처 상품을 관리합니다.",
        defaultTheme: "adventure" as const,
        defaultDurationType: "long" as const,
        defaultPrice: 2390000,
        defaultGradient: "from-cyan-700 to-blue-500",
        heroImage: CMS_NULL_IMAGE,
    },
] as const;

export const cmsThemeOptions: Array<{ value: Theme; label: string }> = [
    { value: "desert", label: "사막" },
    { value: "family", label: "가족" },
    { value: "premium", label: "프리미엄" },
    { value: "adventure", label: "어드벤처" },
];

export const cmsDurationTypeOptions: Array<{ value: DurationType; label: string }> = [
    { value: "short", label: "단기 일정" },
    { value: "long", label: "장기 일정" },
];

export function isCmsTourRegion(value: string): value is Region {
    return cmsTourRegions.some((region) => region.key === value);
}

export function getCmsTourRegionMeta(region: Region) {
    return cmsTourRegions.find((item) => item.key === region) ?? cmsTourRegions[0];
}

export function getNextCmsTourId(tours: Tour[]) {
    return tours.reduce((max, tour) => Math.max(max, tour.id), 0) + 1;
}

export function createDefaultCmsTour(region: Region, id: number): Tour {
    const meta = getCmsTourRegionMeta(region);
    const durationKo = meta.defaultDurationType === "short" ? "3박 4일" : "5박 6일";
    const durationJa = meta.defaultDurationType === "short" ? "3泊4日" : "5泊6日";
    const durationEn = meta.defaultDurationType === "short" ? "3 nights 4 days" : "5 nights 6 days";

    return {
        id,
        region,
        theme: meta.defaultTheme,
        durationType: meta.defaultDurationType,
        price: meta.defaultPrice,
        deposit: 50000,
        gradient: meta.defaultGradient,
        heroImage: meta.heroImage,
        images: createCmsImagePlaceholders(3),
        detailImages: createCmsImagePlaceholders(1),
        title: {
            ko: `${meta.label} 신규 상품`,
            ja: `${meta.label} 新規商品`,
            en: `New ${meta.label} Tour`,
        },
        desc: {
            ko: `${meta.label} 지역 신규 투어 소개 문구를 입력해 주세요.`,
            ja: `${meta.label} エリアの新規ツアー説明を入力してください。`,
            en: `Add a short introduction for this new ${meta.label.toLowerCase()} tour.`,
        },
        tags: {
            ko: [meta.label, "신규"],
            ja: [meta.label, "新規"],
            en: [meta.label, "New"],
        },
        tagColors: {
            ko: {},
            ja: {},
            en: {},
        },
        duration: {
            ko: durationKo,
            ja: durationJa,
            en: durationEn,
        },
        highlights: {
            ko: ["대표 코스", "이미지 수정 필요"],
            ja: ["代表コース", "画像更新が必要"],
            en: ["Signature route", "Update images"],
        },
    };
}
