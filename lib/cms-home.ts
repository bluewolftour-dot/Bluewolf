import { copy, slides, type HeroSlide, type Locale } from "@/lib/bluewolf-data";
import { CMS_NULL_IMAGE, normalizeCmsImagePath } from "@/lib/cms-image";

export type CmsPromoBanner = {
    image: string;
    alt: Record<Locale, string>;
    href?: string;
};

export type CmsHomeContent = {
    heroTitle: string;
    heroDesc: string;
    featuredDesc: string;
    communityTitle: string;
    publishPhase1: string;
    publishPhase2: string;
    publishPhase3: string;
    heroSlides: Record<Locale, HeroSlide[]>;
    promoBanners: CmsPromoBanner[];
};

export const homeUploadSlots = {
    heroSlides: ["hero-slide-1", "hero-slide-2", "hero-slide-3"],
    promoBanners: ["promo-banner-1", "promo-banner-2", "promo-banner-3"],
} as const;

export const cmsInternalLinkOptions = [
    { value: "/", label: "홈 메인" },
    { value: "/#tours", label: "홈 · 인기 여행 코스" },
    { value: "/#booking", label: "홈 · 예약 섹션" },
    { value: "/tours", label: "투어상품" },
    { value: "/booking", label: "예약" },
    { value: "/community", label: "커뮤니티" },
    { value: "/faq", label: "FAQ" },
    { value: "/contact", label: "문의" },
    { value: "/about", label: "About" },
] as const;

const defaultHeroSlideLinks = ["/tours", "/booking", "/community"] as const;
const defaultPromoBannerLinks = ["/tours", "/booking", "/community"] as const;

function buildDefaultHeroSlides(): Record<Locale, HeroSlide[]> {
    return {
        ko: slides.ko.map((slide, index) => ({ ...slide, image: CMS_NULL_IMAGE, href: defaultHeroSlideLinks[index] ?? "/tours" })),
        ja: slides.ja.map((slide, index) => ({ ...slide, image: CMS_NULL_IMAGE, href: defaultHeroSlideLinks[index] ?? "/tours" })),
        en: slides.en.map((slide, index) => ({ ...slide, image: CMS_NULL_IMAGE, href: defaultHeroSlideLinks[index] ?? "/tours" })),
    };
}

export const defaultPromoBanners: CmsPromoBanner[] = [
    {
        image: CMS_NULL_IMAGE,
        href: defaultPromoBannerLinks[0],
        alt: {
            ko: "기간한정 할인 배너 1",
            ja: "期間限定バナー 1",
            en: "Limited-time banner 1",
        },
    },
    {
        image: CMS_NULL_IMAGE,
        href: defaultPromoBannerLinks[1],
        alt: {
            ko: "기간한정 할인 배너 2",
            ja: "期間限定バナー 2",
            en: "Limited-time banner 2",
        },
    },
    {
        image: CMS_NULL_IMAGE,
        href: defaultPromoBannerLinks[2],
        alt: {
            ko: "기간한정 할인 배너 3",
            ja: "期間限定バナー 3",
            en: "Limited-time banner 3",
        },
    },
];

export const defaultHeroSlides = buildDefaultHeroSlides();

export const defaultCmsHomeContent: CmsHomeContent = {
    heroTitle: copy.ko.heroTitle,
    heroDesc: copy.ko.heroDesc,
    featuredDesc: copy.ko.featuredDesc,
    communityTitle: copy.ko.communityTitle,
    publishPhase1: copy.ko.publishPhase1,
    publishPhase2: copy.ko.publishPhase2,
    publishPhase3: copy.ko.publishPhase3,
    heroSlides: structuredClone(defaultHeroSlides),
    promoBanners: structuredClone(defaultPromoBanners),
};

function normalizeHeroSlides(heroSlides: CmsHomeContent["heroSlides"]): CmsHomeContent["heroSlides"] {
    return {
        ko: defaultHeroSlides.ko.map((slide, index) => {
            const current = heroSlides.ko[index];
            return { ...slide, ...current, image: normalizeCmsImagePath(current?.image || slide.image), href: current?.href?.trim() || slide.href };
        }),
        ja: defaultHeroSlides.ja.map((slide, index) => {
            const current = heroSlides.ja[index];
            return { ...slide, ...current, image: normalizeCmsImagePath(current?.image || slide.image), href: current?.href?.trim() || slide.href };
        }),
        en: defaultHeroSlides.en.map((slide, index) => {
            const current = heroSlides.en[index];
            return { ...slide, ...current, image: normalizeCmsImagePath(current?.image || slide.image), href: current?.href?.trim() || slide.href };
        }),
    };
}

function normalizePromoBanners(promoBanners: CmsPromoBanner[]): CmsPromoBanner[] {
    return defaultPromoBanners.map((banner, index) => {
        const current = promoBanners[index];
        return {
            ...banner,
            ...current,
            image: normalizeCmsImagePath(current?.image || banner.image),
            href: current?.href?.trim() || banner.href,
            alt: {
                ...banner.alt,
                ...current?.alt,
            },
        };
    });
}

export function normalizeCmsHomeContent(input?: Partial<CmsHomeContent> | null): CmsHomeContent {
    const merged = {
        ...defaultCmsHomeContent,
        ...(input ?? {}),
        heroSlides: input?.heroSlides ? { ...defaultCmsHomeContent.heroSlides, ...input.heroSlides } : defaultCmsHomeContent.heroSlides,
        promoBanners: input?.promoBanners?.length ? input.promoBanners : defaultCmsHomeContent.promoBanners,
    } satisfies CmsHomeContent;

    return {
        ...merged,
        heroSlides: normalizeHeroSlides({
            ko: merged.heroSlides.ko.length ? merged.heroSlides.ko : defaultCmsHomeContent.heroSlides.ko,
            ja: merged.heroSlides.ja.length ? merged.heroSlides.ja : defaultCmsHomeContent.heroSlides.ja,
            en: merged.heroSlides.en.length ? merged.heroSlides.en : defaultCmsHomeContent.heroSlides.en,
        }),
        promoBanners: normalizePromoBanners(
            merged.promoBanners.length ? merged.promoBanners : defaultCmsHomeContent.promoBanners
        ),
    };
}
