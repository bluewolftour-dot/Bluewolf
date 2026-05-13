import { type DurationType, type Locale, type Region, type Theme } from "@/lib/bluewolf-data";
import {
    getAllCmsTours,
    getCmsCommunityContent,
    getCmsTourCustomizeContent,
    getCmsTourOptionsContent,
    getCmsTourThemesContent,
} from "@/lib/cms-crm-db";
import { type CmsCommunityContent } from "@/lib/cms-community";
import { localizeCmsTourCustomizeContent } from "@/lib/cms-tour-customize";
import { localizeTourOptions, type CmsTourOptionsContent } from "@/lib/cms-tour-options";
import { getCmsTourThemeLabel, type CmsTourThemesContent } from "@/lib/cms-tour-themes";
import { type CmsTourCustomizeContent } from "@/lib/cms-tour-customize";

export type ContactAssistantMessage = {
    role: "user" | "assistant";
    content: string;
};

type ContactAssistantKnowledge = {
    locale: Locale;
    tours: Awaited<ReturnType<typeof getAllCmsTours>>;
    options: ReturnType<typeof localizeTourOptions>;
    customize: ReturnType<typeof localizeCmsTourCustomizeContent>;
    notices: CmsCommunityContent["notices"][Locale];
    themes: CmsTourThemesContent;
};

const regionLabels: Record<Locale, Record<Region, string>> = {
    ko: {
        south: "남부",
        north: "북부",
        central: "중부",
        west: "서부",
    },
    ja: {
        south: "南部",
        north: "北部",
        central: "中部",
        west: "西部",
    },
    en: {
        south: "South",
        north: "North",
        central: "Central",
        west: "West",
    },
};

const themeLabels: Record<Locale, Record<Theme, string>> = {
    ko: {
        desert: "사막",
        family: "가족",
        premium: "프리미엄",
        adventure: "어드벤처",
    },
    ja: {
        desert: "砂漠",
        family: "家族",
        premium: "プレミアム",
        adventure: "アドベンチャー",
    },
    en: {
        desert: "Desert",
        family: "Family",
        premium: "Premium",
        adventure: "Adventure",
    },
};

const durationTypeLabels: Record<Locale, Record<DurationType, string>> = {
    ko: {
        short: "단기 일정",
        long: "장기 일정",
    },
    ja: {
        short: "短期日程",
        long: "長期日程",
    },
    en: {
        short: "Short itinerary",
        long: "Long itinerary",
    },
};

const regionAliases: Record<Region, string[]> = {
    south: ["남부", "south", "南部"],
    north: ["북부", "north", "北部"],
    central: ["중부", "central", "中部"],
    west: ["서부", "west", "西部"],
};

const themeAliases: Record<Theme, string[]> = {
    desert: ["사막", "desert", "砂漠"],
    family: ["가족", "family", "家族"],
    premium: ["프리미엄", "premium", "プレミアム"],
    adventure: ["어드벤처", "adventure", "アドベンチャー"],
};

const intentKeywords = {
    options: ["옵션", "추가옵션", "add-on", "addon", "option", "options", "オプション"],
    notices: ["공지", "공지사항", "notice", "notices", "announcement", "お知らせ", "공지글"],
    price: ["가격", "금액", "비용", "얼마", "price", "cost", "料金", "値段"],
    recommend: ["추천", "어울려", "맞는", "recommend", "best", "おすすめ"],
    booking: ["예약", "booking", "reserve", "reservation", "予約", "신청", "플랜 신청", "progress", "status"],
    contact: ["문의", "연락", "상담", "contact", "email", "phone", "営業時間", "メール", "전화"],
    community: ["커뮤니티", "후기", "리뷰", "동행", "질문", "community", "review", "mate", "qna", "口コミ"],
    faq: ["faq", "자주 묻는 질문", "질문", "faqページ", "frequently asked"],
};

const contactInfo = {
    email: "contact@bluewolf.kr",
    phone: "+82-2-0000-0000",
    hours: "Mon-Fri 09:00-18:00 KST",
    address: "123 Teheran-ro, Gangnam-gu, Seoul",
};

function normalizeSearchText(value: string) {
    return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function includesAny(source: string, candidates: string[]) {
    return candidates.some((candidate) =>
        normalizeSearchText(source).includes(normalizeSearchText(candidate))
    );
}

function formatWon(locale: Locale, value: number) {
    if (locale === "ja") {
        return `₩${value.toLocaleString("ja-JP")}`;
    }

    if (locale === "en") {
        return `₩${value.toLocaleString("en-US")}`;
    }

    return `₩${value.toLocaleString("ko-KR")}`;
}

function localizePathLabel(locale: Locale, path: string) {
    if (locale === "ja") {
        return `関連ページ: ${path}`;
    }

    if (locale === "en") {
        return `Related page: ${path}`;
    }

    return `관련 페이지: ${path}`;
}

function localizeContactLine(locale: Locale) {
    if (locale === "ja") {
        return `有人サポート: ${contactInfo.email} / ${contactInfo.phone} / ${contactInfo.hours}`;
    }

    if (locale === "en") {
        return `Human support: ${contactInfo.email} / ${contactInfo.phone} / ${contactInfo.hours}`;
    }

    return `상담: ${contactInfo.email} / ${contactInfo.phone} / ${contactInfo.hours}`;
}

async function buildKnowledge(locale: Locale): Promise<ContactAssistantKnowledge> {
    const [tours, optionsContent, customizeContent, communityContent, themes] = await Promise.all([
        getAllCmsTours(),
        getCmsTourOptionsContent(),
        getCmsTourCustomizeContent(),
        getCmsCommunityContent(),
        getCmsTourThemesContent(),
    ]);

    return {
        locale,
        tours,
        options: localizeTourOptions(optionsContent as CmsTourOptionsContent, locale),
        customize: localizeCmsTourCustomizeContent(customizeContent as CmsTourCustomizeContent, locale),
        notices: communityContent.notices[locale],
        themes: themes as CmsTourThemesContent,
    };
}

function findMatchedRegion(searchText: string) {
    return (Object.entries(regionAliases) as Array<[Region, string[]]>).find(([, aliases]) =>
        includesAny(searchText, aliases)
    )?.[0];
}

function findMatchedTheme(searchText: string, knowledge: ContactAssistantKnowledge) {
    return knowledge.themes.themes.find((theme) => {
        const aliases = [
            theme.key,
            theme.label.ko,
            theme.label.ja,
            theme.label.en,
            themeLabels.ko[theme.key as Theme],
            themeLabels.ja[theme.key as Theme],
            themeLabels.en[theme.key as Theme],
            ...((themeAliases[theme.key as Theme] ?? []) as string[]),
        ].filter(Boolean);

        return includesAny(searchText, aliases);
    })?.key;
}

function findMatchedTour(searchText: string, knowledge: ContactAssistantKnowledge) {
    const normalized = normalizeSearchText(searchText);
    return knowledge.tours.find((tour) =>
        normalized.includes(normalizeSearchText(tour.title[knowledge.locale]))
    );
}

function findMatchedOption(searchText: string, knowledge: ContactAssistantKnowledge) {
    const normalized = normalizeSearchText(searchText);
    return knowledge.options.find((option) =>
        normalized.includes(normalizeSearchText(option.title))
    );
}

function findMatchedDestination(searchText: string, knowledge: ContactAssistantKnowledge) {
    const normalized = normalizeSearchText(searchText);

    for (const [region, content] of Object.entries(knowledge.customize) as Array<
        [Region, ContactAssistantKnowledge["customize"][Region]]
    >) {
        const destination = content.destinations.find((item) =>
            normalized.includes(normalizeSearchText(item.title))
        );

        if (destination) {
            return { region, destination };
        }
    }

    return null;
}

function buildTourReply(knowledge: ContactAssistantKnowledge, tour: ContactAssistantKnowledge["tours"][number]) {
    const locale = knowledge.locale;
    const regionLabel = regionLabels[locale][tour.region];
    const themeLabel = getCmsTourThemeLabel(knowledge.themes, tour.theme, locale);
    const durationLabel = durationTypeLabels[locale][tour.durationType];
    const highlights = tour.highlights[locale].slice(0, 4).join(", ");

    if (locale === "ja") {
        return [
            `${tour.title[locale]}をご案内します。`,
            `- 地域: ${regionLabel}`,
            `- テーマ: ${themeLabel}`,
            `- 日程タイプ: ${durationLabel}`,
            `- 期間: ${tour.duration[locale]}`,
            `- 価格: ${formatWon(locale, tour.price)}`,
            `- プランパッケージ利用料: ${formatWon(locale, tour.deposit)}`,
            `- ハイライト: ${highlights}`,
            localizePathLabel(locale, `/tours/${tour.id}`),
        ].join("\n");
    }

    if (locale === "en") {
        return [
            `Here is the summary for ${tour.title[locale]}.`,
            `- Region: ${regionLabel}`,
            `- Theme: ${themeLabel}`,
            `- Itinerary type: ${durationLabel}`,
            `- Duration: ${tour.duration[locale]}`,
            `- Price: ${formatWon(locale, tour.price)}`,
            `- Plan package fee: ${formatWon(locale, tour.deposit)}`,
            `- Highlights: ${highlights}`,
            localizePathLabel(locale, `/tours/${tour.id}`),
        ].join("\n");
    }

    return [
        `${tour.title[locale]} 기준으로 안내드릴게요.`,
        `- 지역: ${regionLabel}`,
        `- 테마: ${themeLabel}`,
        `- 일정 유형: ${durationLabel}`,
        `- 기간: ${tour.duration[locale]}`,
        `- 가격: ${formatWon(locale, tour.price)}`,
        `- 플랜료: ${formatWon(locale, tour.deposit)}`,
        `- 하이라이트: ${highlights}`,
        localizePathLabel(locale, `/tours/${tour.id}`),
    ].join("\n");
}

function buildRegionReply(knowledge: ContactAssistantKnowledge, region: Region) {
    const locale = knowledge.locale;
    const regionLabel = regionLabels[locale][region];
    const regionTours = knowledge.tours.filter((tour) => tour.region === region).slice(0, 3);
    const regionCustomize = knowledge.customize[region];
    const destinations = regionCustomize.destinations.slice(0, 3).map((item) => item.title).join(", ");

    if (locale === "ja") {
        return [
            `${regionLabel}エリアの内容をご案内します。`,
            `- 開始価格: ${formatWon(locale, regionCustomize.basePrice)}`,
            `- 代表旅行地: ${destinations || "-"}`,
            `- 関連ツアー: ${
                regionTours.map((tour) => `${tour.title[locale]} (${formatWon(locale, tour.price)})`).join(", ") || "-"
            }`,
            localizePathLabel(locale, "/tours"),
        ].join("\n");
    }

    if (locale === "en") {
        return [
            `Here is the ${regionLabel} region summary.`,
            `- Starting price: ${formatWon(locale, regionCustomize.basePrice)}`,
            `- Featured destinations: ${destinations || "-"}`,
            `- Related tours: ${
                regionTours.map((tour) => `${tour.title[locale]} (${formatWon(locale, tour.price)})`).join(", ") || "-"
            }`,
            localizePathLabel(locale, "/tours"),
        ].join("\n");
    }

    return [
        `${regionLabel} 지역 기준으로 안내드릴게요.`,
        `- 예상 시작 금액: ${formatWon(locale, regionCustomize.basePrice)}`,
        `- 대표 여행지: ${destinations || "-"}`,
        `- 관련 투어: ${
            regionTours.map((tour) => `${tour.title[locale]} (${formatWon(locale, tour.price)})`).join(", ") || "-"
        }`,
        localizePathLabel(locale, "/tours"),
    ].join("\n");
}

function buildDestinationReply(
    knowledge: ContactAssistantKnowledge,
    region: Region,
    destination: ContactAssistantKnowledge["customize"][Region]["destinations"][number]
) {
    const locale = knowledge.locale;
    const regionLabel = regionLabels[locale][region];
    const regionCustomize = knowledge.customize[region];

    if (locale === "ja") {
        return [
            `${destination.title}をご案内します。`,
            `- 地域: ${regionLabel}`,
            `- 説明: ${destination.desc}`,
            `- この地域の開始価格: ${formatWon(locale, regionCustomize.basePrice)}`,
            localizePathLabel(locale, "/tours/customize"),
        ].join("\n");
    }

    if (locale === "en") {
        return [
            `Here is the summary for ${destination.title}.`,
            `- Region: ${regionLabel}`,
            `- Description: ${destination.desc}`,
            `- Region starting price: ${formatWon(locale, regionCustomize.basePrice)}`,
            localizePathLabel(locale, "/tours/customize"),
        ].join("\n");
    }

    return [
        `${destination.title} 여행지를 안내드릴게요.`,
        `- 지역: ${regionLabel}`,
        `- 설명: ${destination.desc}`,
        `- 이 지역 예상 시작 금액: ${formatWon(locale, regionCustomize.basePrice)}`,
        localizePathLabel(locale, "/tours/customize"),
    ].join("\n");
}

function buildOptionReply(
    knowledge: ContactAssistantKnowledge,
    option?: ContactAssistantKnowledge["options"][number]
) {
    const locale = knowledge.locale;

    if (option) {
        const details = option.details.join(", ");

        if (locale === "ja") {
            return [
                `${option.title}オプションをご案内します。`,
                `- 料金(1人あたり): ${formatWon(locale, option.price)}`,
                `- 説明: ${option.desc}`,
                `- 詳細: ${details}`,
                localizePathLabel(locale, "/tours/customize"),
            ].join("\n");
        }

        if (locale === "en") {
            return [
                `Here is the ${option.title} add-on.`,
                `- Price per person: ${formatWon(locale, option.price)}`,
                `- Description: ${option.desc}`,
                `- Details: ${details}`,
                localizePathLabel(locale, "/tours/customize"),
            ].join("\n");
        }

        return [
            `${option.title} 옵션을 안내드릴게요.`,
            `- 1인당 가격: ${formatWon(locale, option.price)}`,
            `- 설명: ${option.desc}`,
            `- 상세: ${details}`,
            localizePathLabel(locale, "/tours/customize"),
        ].join("\n");
    }

    const optionLines = knowledge.options
        .map((item) => `- ${item.title}: ${formatWon(locale, item.price)} / 1인`)
        .join("\n");

    if (locale === "ja") {
        return [`現在の追加オプション一覧です。`, optionLines, localizePathLabel(locale, "/tours/customize")].join("\n");
    }

    if (locale === "en") {
        return [`Here are the current add-on options.`, optionLines, localizePathLabel(locale, "/tours/customize")].join("\n");
    }

    return [`현재 추가 옵션 목록입니다.`, optionLines, localizePathLabel(locale, "/tours/customize")].join("\n");
}

function buildNoticeReply(knowledge: ContactAssistantKnowledge) {
    const locale = knowledge.locale;
    const notices = knowledge.notices.slice(0, 3);
    const noticeLines = notices
        .map((notice) => `- ${notice.title} (${notice.date}): ${notice.summary}`)
        .join("\n");

    if (locale === "ja") {
        return [`現在確認できるお知らせです。`, noticeLines || "- 登録されたお知らせはありません。", localizePathLabel(locale, "/community/notices")].join("\n");
    }

    if (locale === "en") {
        return [`Here are the current site notices.`, noticeLines || "- No notices are currently registered.", localizePathLabel(locale, "/community/notices")].join("\n");
    }

    return [`현재 확인되는 공지사항입니다.`, noticeLines || "- 등록된 공지사항이 없습니다.", localizePathLabel(locale, "/community/notices")].join("\n");
}

function buildRecommendationReply(
    knowledge: ContactAssistantKnowledge,
    tours: ContactAssistantKnowledge["tours"]
) {
    const locale = knowledge.locale;
    const picks = tours.slice(0, 3);
    const lines = picks
        .map(
            (tour) =>
                `- ${tour.title[locale]} | ${tour.duration[locale]} | ${formatWon(locale, tour.price)} | ${regionLabels[locale][tour.region]}`
        )
        .join("\n");

    if (locale === "ja") {
        return [`おすすめ候補はこちらです。`, lines || "- 条件に合うツアーが見つかりませんでした。", localizePathLabel(locale, "/tours")].join("\n");
    }

    if (locale === "en") {
        return [`Here are the best matching tours.`, lines || "- I could not find a tour matching that condition.", localizePathLabel(locale, "/tours")].join("\n");
    }

    return [`조건에 맞는 추천 투어입니다.`, lines || "- 조건에 맞는 투어를 찾지 못했습니다.", localizePathLabel(locale, "/tours")].join("\n");
}

function buildContactReply(locale: Locale) {
    if (locale === "ja") {
        return [
            `スタッフへの問い合わせ先です。`,
            `- メール: ${contactInfo.email}`,
            `- 電話: ${contactInfo.phone}`,
            `- 営業時間: ${contactInfo.hours}`,
            `- 住所: ${contactInfo.address}`,
            localizeContactLine(locale),
            localizePathLabel(locale, "/contact"),
        ].join("\n");
    }

    if (locale === "en") {
        return [
            `Here is the human support contact information.`,
            `- Email: ${contactInfo.email}`,
            `- Phone: ${contactInfo.phone}`,
            `- Business hours: ${contactInfo.hours}`,
            `- Address: ${contactInfo.address}`,
            localizeContactLine(locale),
            localizePathLabel(locale, "/contact"),
        ].join("\n");
    }

    return [
        `상담 연락처를 안내드릴게요.`,
        `- 이메일: ${contactInfo.email}`,
        `- 전화: ${contactInfo.phone}`,
        `- 운영 시간: ${contactInfo.hours}`,
        `- 주소: ${contactInfo.address}`,
        localizeContactLine(locale),
        localizePathLabel(locale, "/contact"),
    ].join("\n");
}

function buildBookingReply(locale: Locale) {
    if (locale === "ja") {
        return [`플랜 신청 및 진행 상태 조회 안내는 조회 페이지에서 확인하실 수 있습니다.`, localizePathLabel(locale, "/booking"), localizeContactLine(locale)].join("\n");
    }

    if (locale === "en") {
        return [`For plan application support, please check the progress page.`, localizePathLabel(locale, "/booking"), localizeContactLine(locale)].join("\n");
    }

    return [`플랜 신청 및 진행 상태 조회 안내는 조회 페이지에서 확인하실 수 있어요.`, localizePathLabel(locale, "/booking"), localizeContactLine(locale)].join("\n");
}

function buildCommunityReply(locale: Locale) {
    if (locale === "ja") {
        return [`口コミ・同行募集・質問はコミュニティで確認できます。`, localizePathLabel(locale, "/community")].join("\n");
    }

    if (locale === "en") {
        return [`Reviews, travel mates, and questions are available in the community section.`, localizePathLabel(locale, "/community")].join("\n");
    }

    return [`후기, 동행 찾기, 질문 글은 커뮤니티에서 확인하실 수 있어요.`, localizePathLabel(locale, "/community")].join("\n");
}

function buildFaqReply(locale: Locale) {
    if (locale === "ja") {
        return [`よくある質問は FAQ ページで確認できます。`, localizePathLabel(locale, "/faq")].join("\n");
    }

    if (locale === "en") {
        return [`You can check common questions on the FAQ page.`, localizePathLabel(locale, "/faq")].join("\n");
    }

    return [`자주 묻는 질문은 FAQ 페이지에서 확인하실 수 있어요.`, localizePathLabel(locale, "/faq")].join("\n");
}

function buildFallbackReply(knowledge: ContactAssistantKnowledge) {
    const locale = knowledge.locale;
    const topTours = knowledge.tours.slice(0, 3).map((tour) => tour.title[locale]).join(", ");

    if (locale === "ja") {
        return [
            `今のサイト内容からご案内できる内容は、ツアー価格、追加オプション、地域別開始価格、お知らせ、予約案内です。`,
            `例: ${topTours}`,
            localizePathLabel(locale, "/tours"),
            localizeContactLine(locale),
        ].join("\n");
    }

    if (locale === "en") {
        return [
            `I can help with tour prices, add-on options, regional starting prices, notices, and booking guidance using the current site data.`,
            `Examples: ${topTours}`,
            localizePathLabel(locale, "/tours"),
            localizeContactLine(locale),
        ].join("\n");
    }

    return [
        `현재 사이트 데이터 기준으로 투어 가격, 추가 옵션, 지역별 시작 금액, 공지사항, 플랜 신청 안내를 도와드릴 수 있어요.`,
        `예시 투어: ${topTours}`,
        localizePathLabel(locale, "/tours"),
        localizeContactLine(locale),
    ].join("\n");
}

export async function answerContactAssistantQuestion(
    locale: Locale,
    messages: ContactAssistantMessage[]
) {
    const knowledge = await buildKnowledge(locale);
    const userMessages = messages
        .filter((message) => message.role === "user")
        .map((message) => message.content.trim())
        .filter(Boolean);
    const currentQuestion = userMessages[userMessages.length - 1] ?? "";
    const searchText = userMessages.slice(-3).join(" ");

    const matchedTour = findMatchedTour(searchText, knowledge);
    const matchedOption = findMatchedOption(searchText, knowledge);
    const matchedRegion = findMatchedRegion(searchText);
    const matchedTheme = findMatchedTheme(searchText, knowledge);
    const matchedDestination = findMatchedDestination(searchText, knowledge);

    if (includesAny(currentQuestion, intentKeywords.contact)) {
        return buildContactReply(locale);
    }

    if (includesAny(currentQuestion, intentKeywords.booking)) {
        return buildBookingReply(locale);
    }

    if (includesAny(currentQuestion, intentKeywords.faq)) {
        return buildFaqReply(locale);
    }

    if (includesAny(currentQuestion, intentKeywords.notices)) {
        return buildNoticeReply(knowledge);
    }

    if (matchedOption || includesAny(currentQuestion, intentKeywords.options)) {
        return buildOptionReply(knowledge, matchedOption);
    }

    if (matchedTour) {
        return buildTourReply(knowledge, matchedTour);
    }

    if (matchedDestination) {
        return buildDestinationReply(knowledge, matchedDestination.region, matchedDestination.destination);
    }

    if (matchedTheme) {
        return buildRecommendationReply(
            knowledge,
            knowledge.tours.filter((tour) => tour.theme === matchedTheme)
        );
    }

    if (matchedRegion) {
        return buildRegionReply(knowledge, matchedRegion);
    }

    if (includesAny(currentQuestion, intentKeywords.recommend) || includesAny(currentQuestion, intentKeywords.price)) {
        return buildRecommendationReply(knowledge, knowledge.tours);
    }

    if (includesAny(currentQuestion, intentKeywords.community)) {
        return buildCommunityReply(locale);
    }

    return buildFallbackReply(knowledge);
}
