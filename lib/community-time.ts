import { type Locale } from "@/lib/bluewolf-data";

function parseCommunityDate(value?: string) {
    if (!value) return null;
    const normalized = value.includes("T") ? value : `${value}T00:00:00`;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pad(value: number) {
    return String(value).padStart(2, "0");
}

export function formatRelativeCommunityTime(value: string, locale: Locale) {
    const target = parseCommunityDate(value);
    if (!target) return value;

    const diffMs = Date.now() - target.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (locale === "ko") {
        if (diffMinutes < 60) return `${diffMinutes}분 전`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}시간 전`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}일 전`;
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 5) return `${diffWeeks}주 전`;
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths}개월 전`;
        return `${Math.floor(diffDays / 365)}년 전`;
    }

    if (locale === "ja") {
        if (diffMinutes < 60) return `${diffMinutes}分前`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}時間前`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}日前`;
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 5) return `${diffWeeks}週間前`;
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths}か月前`;
        return `${Math.floor(diffDays / 365)}年前`;
    }

    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

export function formatCommunityPostedDate(value: string, locale: Locale) {
    const target = parseCommunityDate(value);
    if (!target) return value;

    const formatted = `${target.getFullYear()}.${pad(target.getMonth() + 1)}.${pad(target.getDate())}`;

    if (locale === "ko") {
        return `${formatted} 작성됨`;
    }

    if (locale === "ja") {
        return `${formatted} 作成`;
    }

    return `Posted on ${formatted}`;
}
