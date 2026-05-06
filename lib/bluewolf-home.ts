import { normalizeCmsImagePath } from "@/lib/cms-image";
import { type HeroSlide, type Locale } from "@/lib/bluewolf-types";

function normalizeSlidesByLocale(source: Record<Locale, HeroSlide[]>) {
    return Object.fromEntries(
        Object.entries(source).map(([locale, items]) => [
            locale,
            items.map((item) => ({
                ...item,
                image: normalizeCmsImagePath(item.image),
            })),
        ])
    ) as Record<Locale, HeroSlide[]>;
}

export const slides: Record<Locale, HeroSlide[]> = normalizeSlidesByLocale({
    ko: [
        {
            eyebrow: "고비 사막 시그니처",
            title: "별빛 아래에서 만나는\n몽골의 가장 깊은 밤",
            desc: "사막, 협곡, 게르 숙박, 별보기까지 BlueWolf 대표 코스를 감각적인 배너로 소개합니다.",
            image: "/images/hero-gobi.jpg",
        },
        {
            eyebrow: "테를지 & 초원",
            title: "주말처럼 가볍게 떠나는\n몽골 입문 여행",
            desc: "짧은 일정으로도 충분히 만족할 수 있는 자연 중심 코스를 빠르게 탐색해보세요.",
            image: "/images/hero-terelj.jpg",
        },
        {
            eyebrow: "홉스골 프리미엄",
            title: "호수와 숲이 있는 북부 몽골을\n더 여유롭게 경험하세요",
            desc: "밝고 깨끗한 분위기의 카드형 배너로 프리미엄 일정도 자연스럽게 노출할 수 있습니다.",
            image: "/images/hero-khuvsgul.jpg",
        },
    ],
    ja: [
        {
            eyebrow: "ゴビ砂漠シグネチャー",
            title: "星空の下で出会う\nモンゴルの深い夜",
            desc: "砂漠、渓谷、ゲル宿泊、星空観察まで代表コースを明るいバナーで紹介します。",
            image: "/images/hero-gobi.jpg",
        },
        {
            eyebrow: "テレルジ＆草原",
            title: "週末のように軽やかに出発する\nモンゴル入門旅",
            desc: "短い日程でも満足感の高い自然中心コースをすばやく見つけられます。",
            image: "/images/hero-terelj.jpg",
        },
        {
            eyebrow: "フブスグル プレミアム",
            title: "湖と森がある北モンゴルを\nもっとゆったり体験",
            desc: "明るくクリーンなカード型バナーでプレミアム商品も自然に見せられます。",
            image: "/images/hero-khuvsgul.jpg",
        },
    ],
    en: [
        {
            eyebrow: "Gobi Signature",
            title: "Meet Mongolia's deepest night\nunder a sky full of stars",
            desc: "Introduce BlueWolf's core route with a bright, polished banner featuring desert, canyon, ger stay, and stargazing.",
            image: "/images/hero-gobi.jpg",
        },
        {
            eyebrow: "Terelj & Steppe",
            title: "An easy first Mongolia trip\nthat feels light and flexible",
            desc: "Highlight short and approachable itineraries in a cleaner slide layout for quick browsing.",
            image: "/images/hero-terelj.jpg",
        },
        {
            eyebrow: "Khuvsgul Premium",
            title: "Experience northern Mongolia\nwith more space and calm",
            desc: "Use a bright card-style slide to naturally feature premium lake and forest journeys.",
            image: "/images/hero-khuvsgul.jpg",
        },
    ],
});
