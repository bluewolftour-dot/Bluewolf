import { regionDestinations } from "@/components/tours/tours-customize-data";
import { type Locale, type Region, tours } from "@/lib/bluewolf-data";
import { CMS_NULL_IMAGE, normalizeCmsImagePath } from "@/lib/cms-image";

const regionOrder: Region[] = ["south", "north", "central", "west"];
const locales: Locale[] = ["ko", "ja", "en"];

export type CmsTourCustomizeDestination = {
    id: string;
    image: string;
    title: Record<Locale, string>;
    desc: Record<Locale, string>;
};

export type CmsTourCustomizeActivity = {
    id: string;
    image: string;
    price: number;
    title: Record<Locale, string>;
    desc: Record<Locale, string>;
};

export type CmsTourCustomizeRegionContent = {
    basePrice: number;
    destinations: CmsTourCustomizeDestination[];
    activities: CmsTourCustomizeActivity[];
};

export type CmsTourCustomizeContent = {
    regions: Record<Region, CmsTourCustomizeRegionContent>;
};

export type LocalizedCmsTourCustomizeRegion = {
    basePrice: number;
    destinations: Array<{
        id: string;
        image: string;
        title: string;
        desc: string;
    }>;
    activities: Array<{
        id: string;
        image: string;
        price: number;
        title: string;
        desc: string;
    }>;
};

function getDefaultBasePrice(region: Region) {
    const regionTours = tours.filter((tour) => tour.region === region);
    if (regionTours.length === 0) return 0;
    return Math.min(...regionTours.map((tour) => tour.price));
}

function buildDefaultDestinations(region: Region): CmsTourCustomizeDestination[] {
    return regionDestinations.ko[region].map((item, index) => ({
        id: `${region}-destination-${index + 1}`,
        image: normalizeCmsImagePath(item.image),
        title: {
            ko: item.title,
            ja: regionDestinations.ja[region][index]?.title ?? item.title,
            en: regionDestinations.en[region][index]?.title ?? item.title,
        },
        desc: {
            ko: item.desc,
            ja: regionDestinations.ja[region][index]?.desc ?? item.desc,
            en: regionDestinations.en[region][index]?.desc ?? item.desc,
        },
    }));
}

const defaultActivities: Record<Region, Array<Omit<CmsTourCustomizeActivity, "id" | "image"> & { image?: string }>> = {
    south: [
        {
            price: 50000,
            title: { ko: "낙타 체험", ja: "ラクダ体験", en: "Camel riding" },
            desc: {
                ko: "고비 사막의 모래언덕에서 낙타를 타고 사막 풍경을 천천히 즐깁니다.",
                ja: "ゴビ砂漠の砂丘でラクダに乗り、砂漠の景色をゆっくり楽しみます。",
                en: "Ride a camel across the Gobi dunes and take in the desert scenery at a slower pace.",
            },
        },
        {
            price: 30000,
            title: { ko: "사막 별보기", ja: "砂漠の星空鑑賞", en: "Desert stargazing" },
            desc: {
                ko: "빛 공해가 적은 사막 밤하늘에서 별과 은하수를 감상합니다.",
                ja: "光の少ない砂漠の夜空で星や天の川を眺めます。",
                en: "Watch the stars and Milky Way under the dark southern desert sky.",
            },
        },
        {
            price: 40000,
            title: { ko: "협곡 트레킹", ja: "渓谷トレッキング", en: "Canyon trekking" },
            desc: {
                ko: "욜링암 협곡의 바위길을 따라 걸으며 고비의 지형을 가까이서 봅니다.",
                ja: "ヨリーンアム渓谷の岩道を歩き、ゴビの地形を間近で感じます。",
                en: "Walk through Yolyn Am Canyon and explore the dramatic rock formations up close.",
            },
        },
    ],
    north: [
        {
            price: 60000,
            title: { ko: "호수 보트 투어", ja: "湖ボートツアー", en: "Lake boat tour" },
            desc: {
                ko: "홉스골 호수 위에서 맑은 물빛과 산 풍경을 함께 감상합니다.",
                ja: "フブスグル湖で澄んだ湖水と山の景色を楽しみます。",
                en: "Cruise on Khuvsgul Lake with clear water and mountain views around you.",
            },
        },
        {
            price: 50000,
            title: { ko: "승마 트레킹", ja: "乗馬トレッキング", en: "Horse trekking" },
            desc: {
                ko: "호숫가와 숲길을 따라 말과 함께 북부 자연을 경험합니다.",
                ja: "湖畔や森の道を馬で進み、北部の自然を体験します。",
                en: "Ride along lakeside and forest trails in Mongolia's northern landscape.",
            },
        },
        {
            price: 70000,
            title: { ko: "순록 마을 방문", ja: "トナカイ村訪問", en: "Reindeer village visit" },
            desc: {
                ko: "북부 소수민족의 순록 문화와 생활 방식을 가까이서 만납니다.",
                ja: "北部少数民族のトナカイ文化と暮らしにふれます。",
                en: "Visit a reindeer community and learn about northern nomadic life.",
            },
        },
    ],
    central: [
        {
            price: 40000,
            title: { ko: "초원 승마", ja: "草原乗馬", en: "Steppe horseback riding" },
            desc: {
                ko: "테를지 초원에서 짧고 부담 없는 승마 체험을 즐깁니다.",
                ja: "テレルジの草原で気軽な乗馬体験を楽しみます。",
                en: "Enjoy an accessible horseback ride across the Terelj steppe.",
            },
        },
        {
            price: 30000,
            title: { ko: "유목민 게르 방문", ja: "遊牧民ゲル訪問", en: "Nomad ger visit" },
            desc: {
                ko: "현지 유목민 게르를 방문해 차와 간단한 문화를 체험합니다.",
                ja: "現地の遊牧民ゲルを訪れ、お茶や文化体験を楽しみます。",
                en: "Visit a local ger for tea and a short introduction to nomadic culture.",
            },
        },
        {
            price: 35000,
            title: { ko: "칭기즈칸 전망대", ja: "チンギスハーン展望台", en: "Chinggis Khan viewpoint" },
            desc: {
                ko: "칭기즈칸 동상 전망대에서 초원의 스케일을 한눈에 봅니다.",
                ja: "チンギスハーン像の展望台から草原を一望します。",
                en: "Take in wide steppe views from the Chinggis Khan statue viewpoint.",
            },
        },
    ],
    west: [
        {
            price: 80000,
            title: { ko: "독수리 문화 체험", ja: "鷹匠文化体験", en: "Eagle culture experience" },
            desc: {
                ko: "서부 카자흐 유목민의 독수리 사냥 문화를 가까이서 배웁니다.",
                ja: "西部カザフ遊牧民の鷹匠文化を間近で学びます。",
                en: "Learn about Kazakh eagle hunting traditions in western Mongolia.",
            },
        },
        {
            price: 60000,
            title: { ko: "알타이 트레킹", ja: "アルタイトレッキング", en: "Altai trekking" },
            desc: {
                ko: "알타이 산맥의 능선과 계곡을 따라 서부의 대자연을 걷습니다.",
                ja: "アルタイ山脈の稜線や谷を歩き、西部の大自然を感じます。",
                en: "Trek through ridges and valleys in the Altai Mountains.",
            },
        },
        {
            price: 50000,
            title: { ko: "카자흐 전통 마을", ja: "カザフ伝統村", en: "Kazakh village visit" },
            desc: {
                ko: "올기 주변 마을에서 카자흐 음식과 생활 문화를 경험합니다.",
                ja: "ウルギー周辺の村でカザフの食と暮らしにふれます。",
                en: "Experience Kazakh food and daily culture in a village near Ulgii.",
            },
        },
    ],
};

function buildDefaultActivities(region: Region): CmsTourCustomizeActivity[] {
    return defaultActivities[region].map((item, index) => ({
        id: `${region}-activity-${index + 1}`,
        image: normalizeCmsImagePath(item.image || CMS_NULL_IMAGE),
        price: item.price,
        title: item.title,
        desc: item.desc,
    }));
}

export const defaultCmsTourCustomizeContent: CmsTourCustomizeContent = {
    regions: {
        south: {
            basePrice: getDefaultBasePrice("south"),
            destinations: buildDefaultDestinations("south"),
            activities: buildDefaultActivities("south"),
        },
        north: {
            basePrice: getDefaultBasePrice("north"),
            destinations: buildDefaultDestinations("north"),
            activities: buildDefaultActivities("north"),
        },
        central: {
            basePrice: getDefaultBasePrice("central"),
            destinations: buildDefaultDestinations("central"),
            activities: buildDefaultActivities("central"),
        },
        west: {
            basePrice: getDefaultBasePrice("west"),
            destinations: buildDefaultDestinations("west"),
            activities: buildDefaultActivities("west"),
        },
    },
};

function normalizeDestination(
    destination: Partial<CmsTourCustomizeDestination> | null | undefined,
    region: Region,
    index: number,
    fallback?: CmsTourCustomizeDestination
): CmsTourCustomizeDestination {
    return {
        id:
            destination?.id?.trim() ||
            fallback?.id ||
            `${region}-destination-${index + 1}`,
        image: normalizeCmsImagePath(destination?.image || fallback?.image || CMS_NULL_IMAGE),
        title: {
            ko: destination?.title?.ko ?? fallback?.title.ko ?? "",
            ja: destination?.title?.ja ?? fallback?.title.ja ?? "",
            en: destination?.title?.en ?? fallback?.title.en ?? "",
        },
        desc: {
            ko: destination?.desc?.ko ?? fallback?.desc.ko ?? "",
            ja: destination?.desc?.ja ?? fallback?.desc.ja ?? "",
            en: destination?.desc?.en ?? fallback?.desc.en ?? "",
        },
    };
}

function normalizeActivity(
    activity: Partial<CmsTourCustomizeActivity> | null | undefined,
    region: Region,
    index: number,
    fallback?: CmsTourCustomizeActivity
): CmsTourCustomizeActivity {
    return {
        id:
            activity?.id?.trim() ||
            fallback?.id ||
            `${region}-activity-${index + 1}`,
        image: normalizeCmsImagePath(activity?.image || fallback?.image || CMS_NULL_IMAGE),
        price: Math.max(0, Number(activity?.price ?? fallback?.price) || 0),
        title: {
            ko: activity?.title?.ko ?? fallback?.title.ko ?? "",
            ja: activity?.title?.ja ?? fallback?.title.ja ?? "",
            en: activity?.title?.en ?? fallback?.title.en ?? "",
        },
        desc: {
            ko: activity?.desc?.ko ?? fallback?.desc.ko ?? "",
            ja: activity?.desc?.ja ?? fallback?.desc.ja ?? "",
            en: activity?.desc?.en ?? fallback?.desc.en ?? "",
        },
    };
}

export function normalizeCmsTourCustomizeContent(
    input?: Partial<CmsTourCustomizeContent> | null
): CmsTourCustomizeContent {
    return {
        regions: Object.fromEntries(
            regionOrder.map((region) => {
                const sourceRegion = input?.regions?.[region];
                const fallbackRegion = defaultCmsTourCustomizeContent.regions[region];
                const destinations = Array.isArray(sourceRegion?.destinations)
                    ? sourceRegion.destinations.map((destination, index) =>
                          normalizeDestination(destination, region, index, fallbackRegion.destinations[index])
                      )
                    : fallbackRegion.destinations;
                const activities = Array.isArray(sourceRegion?.activities)
                    ? sourceRegion.activities.map((activity, index) =>
                          normalizeActivity(activity, region, index, fallbackRegion.activities[index])
                      )
                    : fallbackRegion.activities;

                return [
                    region,
                    {
                        basePrice: Math.max(
                            0,
                            Number(sourceRegion?.basePrice ?? fallbackRegion.basePrice) || 0
                        ),
                        destinations,
                        activities,
                    },
                ];
            })
        ) as Record<Region, CmsTourCustomizeRegionContent>,
    };
}

export function localizeCmsTourCustomizeContent(
    content: CmsTourCustomizeContent,
    locale: Locale
): Record<Region, LocalizedCmsTourCustomizeRegion> {
    return Object.fromEntries(
        regionOrder.map((region) => [
            region,
            {
                basePrice: content.regions[region].basePrice,
                destinations: content.regions[region].destinations.map((destination) => ({
                    id: destination.id,
                    image: destination.image,
                    title: destination.title[locale],
                    desc: destination.desc[locale],
                })),
                activities: content.regions[region].activities.map((activity) => ({
                    id: activity.id,
                    image: activity.image,
                    price: activity.price,
                    title: activity.title[locale],
                    desc: activity.desc[locale],
                })),
            },
        ])
    ) as Record<Region, LocalizedCmsTourCustomizeRegion>;
}

export function createCmsTourCustomizeActivity(region: Region, existingIds: string[]) {
    let nextNumber = existingIds.length + 1;
    let id = `${region}-activity-${nextNumber}`;

    while (existingIds.includes(id)) {
        nextNumber += 1;
        id = `${region}-activity-${nextNumber}`;
    }

    return {
        id,
        image: CMS_NULL_IMAGE,
        price: 0,
        title: Object.fromEntries(locales.map((locale) => [locale, ""])) as Record<Locale, string>,
        desc: Object.fromEntries(locales.map((locale) => [locale, ""])) as Record<Locale, string>,
    } satisfies CmsTourCustomizeActivity;
}

export function createCmsTourCustomizeDestination(region: Region, existingIds: string[]) {
    let nextNumber = existingIds.length + 1;
    let id = `${region}-destination-${nextNumber}`;

    while (existingIds.includes(id)) {
        nextNumber += 1;
        id = `${region}-destination-${nextNumber}`;
    }

    return {
        id,
        image: CMS_NULL_IMAGE,
        title: Object.fromEntries(locales.map((locale) => [locale, ""])) as Record<Locale, string>,
        desc: Object.fromEntries(locales.map((locale) => [locale, ""])) as Record<Locale, string>,
    } satisfies CmsTourCustomizeDestination;
}
