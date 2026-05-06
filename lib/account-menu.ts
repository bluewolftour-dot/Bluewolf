import { type Locale } from "@/lib/bluewolf-data";
import { withLocaleQuery } from "@/lib/locale-routing";

export type AccountMenuItem = {
    key: string;
    href: string;
    label: string;
};

const accountMenuCopy = {
    ko: {
        mypage: "마이페이지",
        applications: "예약내역",
        community: "커뮤니티 관리",
        mates: "참가 신청 내역",
        notifications: "알림센터",
    },
    ja: {
        mypage: "マイページ",
        applications: "予約履歴",
        community: "コミュニティ管理",
        mates: "参加申請履歴",
        notifications: "通知センター",
    },
    en: {
        mypage: "My page",
        applications: "Applications",
        community: "Community",
        mates: "Companion applications",
        notifications: "Notifications",
    },
} as const;

export function buildAccountMenuItems(locale: Locale): AccountMenuItem[] {
    const copy = accountMenuCopy[locale];

    return [
        { key: "mypage", href: withLocaleQuery("/mypage", locale), label: copy.mypage },
        { key: "applications", href: withLocaleQuery("/mypage/applications", locale), label: copy.applications },
        { key: "community", href: withLocaleQuery("/community", locale), label: copy.community },
        { key: "mates", href: withLocaleQuery("/community/mates", locale), label: copy.mates },
        { key: "notifications", href: withLocaleQuery("/notifications", locale), label: copy.notifications },
    ];
}
