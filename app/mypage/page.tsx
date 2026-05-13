"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";
import { withLocaleQuery } from "@/lib/locale-routing";
import { type Locale } from "@/lib/bluewolf-data";
import { formatPrice } from "@/lib/bluewolf-utils";
import { type CrmBookingRecord } from "@/lib/cms-crm-db";
import { executeRecaptcha } from "@/lib/recaptcha-client";

const myCopy = {
    ko: {
        title: "마이페이지",
        desc: "플랜 신청 내역과 진행 상태, 작성 글, 알림을 한곳에서 확인하세요.",
        loginRequired: "로그인 후 마이페이지를 이용할 수 있습니다.",
        login: "로그인하기",
        nameLabel: "이름",
        emailLabel: "이메일",
        phoneLabel: "전화번호",
        loggedInAs: "로그인 계정",
        profileTitle: "개인정보",
        editProfile: "수정 및 변경",
        cancelEdit: "취소",
        saveProfile: "이름/전화번호 저장",
        saving: "저장 중...",
        saved: "저장되었습니다.",
        sendEmailCode: "인증코드 보내기",
        resendEmailCode: "인증코드 다시 보내기",
        sendingCode: "전송 중...",
        verificationCodeLabel: "이메일 인증코드",
        verificationCodePlaceholder: "6자리 인증코드",
        changeEmail: "인증 후 이메일 변경",
        changingEmail: "변경 중...",
        emailCodeSent: "변경할 이메일로 인증코드를 보냈습니다.",
        emailChanged: "이메일이 변경되었습니다.",
        requestLimited: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        invalidEmail: "이메일 형식을 확인해주세요.",
        invalidCode: "인증코드가 올바르지 않거나 만료되었습니다.",
        emailExists: "이미 사용 중인 이메일입니다.",
        profileFailed: "처리 중 문제가 발생했습니다.",
        bookingsTitle: "회원 진행 상태 조회",
        bookingsDesc: "신청 번호 입력 없이 회원 전용 페이지에서 모든 플랜 신청 내역을 확인할 수 있습니다.",
        bookingsCta: "진행 상태 조회 페이지 열기",
        bookingsBadge: "회원 전용",
        bookingsCountSuffix: "건",
        otherTitle: "그 밖의 메뉴",
        posts: "내가 쓴 글",
        applications: "동행 신청",
        notifications: "알림",
        changePassword: "비밀번호 변경",
        withdrawBtn: "회원탈퇴",
        withdrawModalTitle: "정말 탈퇴하시겠어요?",
        withdrawModalDesc: "회원 정보가 즉시 삭제되며 모든 기기에서 자동 로그아웃됩니다. 이미 진행 중인 플랜 신청 내역은 보존되지만, 마이페이지에서는 더 이상 자동으로 조회할 수 없습니다.",
        withdrawConfirmLabel: "확인을 위해 비밀번호를 입력해주세요.",
        withdrawPasswordPlaceholder: "현재 비밀번호",
        withdrawSubmitBtn: "회원탈퇴 진행",
        withdrawSubmittingBtn: "탈퇴 처리 중...",
        withdrawCancelBtn: "닫기",
        withdrawInvalidPassword: "비밀번호가 올바르지 않습니다.",
        withdrawFailed: "회원탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        withdrawDoneTitle: "회원탈퇴가 완료되었습니다",
        withdrawDoneDesc: "그동안 BlueWolf를 이용해주셔서 감사합니다. 잠시 후 홈으로 이동합니다.",
    },
    ja: {
        title: "マイページ",
        desc: "プラン申請状況、投稿、通知をまとめて確認できます。",
        loginRequired: "ログイン後にマイページを利用できます。",
        login: "ログイン",
        nameLabel: "氏名",
        emailLabel: "メール",
        phoneLabel: "電話番号",
        loggedInAs: "ログインアカウント",
        profileTitle: "会員情報",
        editProfile: "修正・変更",
        cancelEdit: "キャンセル",
        saveProfile: "氏名・電話番号を保存",
        saving: "保存中...",
        saved: "保存しました。",
        sendEmailCode: "認証コード送信",
        resendEmailCode: "認証コード再送信",
        sendingCode: "送信中...",
        verificationCodeLabel: "メール認証コード",
        verificationCodePlaceholder: "6桁の認証コード",
        changeEmail: "認証後にメールを変更",
        changingEmail: "変更中...",
        emailCodeSent: "変更先のメールに認証コードを送信しました。",
        emailChanged: "メールを変更しました。",
        requestLimited: "リクエストが多すぎます。しばらくしてからもう一度お試しください。",
        invalidEmail: "メール形式を確認してください。",
        invalidCode: "認証コードが正しくないか、有効期限が切れています。",
        emailExists: "すでに使用されているメールです。",
        profileFailed: "処理中に問題が発生しました。",
        bookingsTitle: "会員進行状況照会",
        bookingsDesc: "申請番号の入力なしで、会員専用ページで全てのプラン申請を確認できます。",
        bookingsCta: "進行状況照会ページを開く",
        bookingsBadge: "会員専用",
        bookingsCountSuffix: "件",
        otherTitle: "そのほかのメニュー",
        posts: "投稿一覧",
        applications: "同行申請",
        notifications: "通知",
        changePassword: "パスワード変更",
        withdrawBtn: "退会",
        withdrawModalTitle: "本当に退会しますか？",
        withdrawModalDesc: "会員情報はすぐに削除され、すべての端末から自動的にログアウトされます。進行中のプラン申請履歴は保持されますが、マイページからは自動で確認できなくなります。",
        withdrawConfirmLabel: "確認のためパスワードを入力してください。",
        withdrawPasswordPlaceholder: "現在のパスワード",
        withdrawSubmitBtn: "退会を実行する",
        withdrawSubmittingBtn: "処理中...",
        withdrawCancelBtn: "閉じる",
        withdrawInvalidPassword: "パスワードが正しくありません。",
        withdrawFailed: "退会処理中に問題が発生しました。しばらくしてから再度お試しください。",
        withdrawDoneTitle: "退会が完了しました",
        withdrawDoneDesc: "BlueWolf をご利用いただきありがとうございました。まもなくホームへ移動します。",
    },
    en: {
        title: "My Page",
        desc: "Manage your plan applications, posts, applications, and notifications in one place.",
        loginRequired: "Please log in to use My Page.",
        login: "Log in",
        nameLabel: "Name",
        emailLabel: "Email",
        phoneLabel: "Phone",
        loggedInAs: "Signed in as",
        profileTitle: "Profile",
        editProfile: "Edit profile",
        cancelEdit: "Cancel",
        saveProfile: "Save name and phone",
        saving: "Saving...",
        saved: "Saved.",
        sendEmailCode: "Send verification code",
        resendEmailCode: "Resend verification code",
        sendingCode: "Sending...",
        verificationCodeLabel: "Email verification code",
        verificationCodePlaceholder: "6-digit code",
        changeEmail: "Verify and change email",
        changingEmail: "Changing...",
        emailCodeSent: "A verification code has been sent to the new email.",
        emailChanged: "Email changed.",
        requestLimited: "Too many requests. Please try again later.",
        invalidEmail: "Please check the email format.",
        invalidCode: "The code is invalid or expired.",
        emailExists: "This email is already in use.",
        profileFailed: "Something went wrong.",
        bookingsTitle: "Member progress lookup",
        bookingsDesc: "View all your plan applications on the members-only page without entering an application number.",
        bookingsCta: "Open progress lookup",
        bookingsBadge: "Members only",
        bookingsCountSuffix: " bookings",
        otherTitle: "Other menus",
        posts: "My posts",
        applications: "Companion applications",
        notifications: "Notifications",
        changePassword: "Change password",
        withdrawBtn: "Delete account",
        withdrawModalTitle: "Are you sure you want to leave?",
        withdrawModalDesc: "Your account will be deleted immediately and you'll be signed out everywhere. Existing plan applications remain on file, but you can no longer view them automatically from My Page.",
        withdrawConfirmLabel: "Enter your current password to confirm.",
        withdrawPasswordPlaceholder: "Current password",
        withdrawSubmitBtn: "Delete account",
        withdrawSubmittingBtn: "Processing...",
        withdrawCancelBtn: "Close",
        withdrawInvalidPassword: "That password is incorrect.",
        withdrawFailed: "Something went wrong while deleting your account. Please try again later.",
        withdrawDoneTitle: "Your account has been deleted",
        withdrawDoneDesc: "Thank you for traveling with BlueWolf. Redirecting to the home page shortly.",
    },
} satisfies Record<Locale, Record<string, string>>;

const bookingSummaryCopy = {
    ko: {
        recent: "최근 예약",
        bookingNo: "예약번호",
        departDate: "출발일",
        guests: "인원",
        guestsUnit: "명",
        deposit: "플랜료",
        empty: "아직 플랜 신청 내역이 없습니다.",
        pending: "BlueWolf Mongolia 검토 중",
        confirmed: "BlueWolf Mongolia 확인 완료",
        paid: "플랜 패키지 결제 완료",
        completed: "여행 완료",
        cancelled: "예약 취소",
    },
    ja: {
        recent: "最近の予約",
        bookingNo: "予約番号",
        departDate: "出発日",
        guests: "人数",
        guestsUnit: "名",
        deposit: "プランパッケージ利用料",
        empty: "まだプラン申請履歴がありません。",
        pending: "BlueWolf Mongolia 検討中",
        confirmed: "BlueWolf Mongolia 確認完了",
        paid: "プランパッケージ決済完了",
        completed: "旅行完了",
        cancelled: "予約取消",
    },
    en: {
        recent: "Latest booking",
        bookingNo: "Booking no.",
        departDate: "Departure",
        guests: "Guests",
        guestsUnit: "",
        deposit: "Plan package fee",
        empty: "No plan applications yet.",
        pending: "BlueWolf Mongolia reviewing",
        confirmed: "BlueWolf Mongolia review completed",
        paid: "Plan package fee paid",
        completed: "Completed",
        cancelled: "Cancelled",
    },
} as const;

function getBookingTitle(booking: CrmBookingRecord, lang: Locale) {
    return booking.customTitle || booking.tour?.title[lang] || booking.tour?.title.ko || "-";
}

function getBookingStatusLabel(status: string, lang: Locale) {
    const text = bookingSummaryCopy[lang];
    if (status === "confirmed") return text.confirmed;
    if (status === "paid") return text.paid;
    if (status === "completed") return text.completed;
    if (status === "cancelled") return text.cancelled;
    return text.pending;
}

function getBookingStatusClass(status: string, isDark: boolean) {
    if (status === "cancelled") return "bg-red-500/10 text-red-500";
    if (status === "confirmed") return "bg-blue-600/10 text-blue-600";
    if (status === "paid" || status === "completed") return "bg-emerald-500/10 text-emerald-500";
    return isDark ? "bg-amber-400/10 text-amber-300" : "bg-amber-100 text-amber-700";
}

function getProfileErrorMessage(code: string, copy: Record<string, string>) {
    if (code === "INVALID_EMAIL") return copy.invalidEmail;
    if (code === "INVALID_CODE" || code === "EMAIL_NOT_VERIFIED") return copy.invalidCode;
    if (code === "EMAIL_EXISTS") return copy.emailExists;
    if (code === "RATE_LIMITED" || code === "RECAPTCHA_REQUIRED" || code === "RECAPTCHA_FAILED") return copy.requestLimited;
    return copy.profileFailed;
}

export default function MyPage() {
    return (
        <PageShell activeKey="none">
            <MyPageContent />
        </PageShell>
    );
}

function MyPageContent() {
    const { user, ready, refreshSession } = useAuth();
    const router = useRouter();
    const { isDark, lang } = usePage();
    const c = myCopy[lang];
    const panel = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white";
    const subPanel = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";
    const textMain = isDark ? "text-white" : "text-slate-950";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const inputClass = isDark
        ? "border-white/10 bg-slate-950 text-white placeholder:text-slate-600 focus:border-blue-500"
        : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-blue-500";
    const summaryText = bookingSummaryCopy[lang];

    const [bookingOverview, setBookingOverview] = useState<{
        count: number;
        recent: CrmBookingRecord | null;
    } | null>(null);
    const [profileName, setProfileName] = useState("");
    const [profilePhone, setProfilePhone] = useState("");
    const [profileEmail, setProfileEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [profileSaving, setProfileSaving] = useState(false);
    const [emailSending, setEmailSending] = useState(false);
    const [emailChanging, setEmailChanging] = useState(false);
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        setProfileName(user.name ?? "");
        setProfilePhone(user.phone ?? "");
        setProfileEmail(user.email ?? "");
        setVerificationCode("");
        setEmailCodeSent(false);
        setProfileMessage("");
        setEmailMessage("");
    }, [user]);

    function resetProfileForm() {
        if (!user) return;
        setProfileName(user.name ?? "");
        setProfilePhone(user.phone ?? "");
        setProfileEmail(user.email ?? "");
        setVerificationCode("");
        setEmailCodeSent(false);
        setProfileMessage("");
        setEmailMessage("");
    }

    useEffect(() => {
        if (!user) return;

        let cancelled = false;
        async function load() {
            try {
                const response = await fetch("/api/crm/bookings/mine", { cache: "no-store" });
                if (!response.ok) {
                    if (!cancelled) setBookingOverview({ count: 0, recent: null });
                    return;
                }
                const data = (await response.json()) as { bookings: CrmBookingRecord[] };
                if (!cancelled) {
                    setBookingOverview({
                        count: data.bookings.length,
                        recent: data.bookings[0] ?? null,
                    });
                }
            } catch {
                if (!cancelled) setBookingOverview({ count: 0, recent: null });
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [user]);

    async function saveProfile() {
        if (!user) return;

        setProfileSaving(true);
        setProfileMessage("");
        try {
            const response = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profileName,
                    phone: profilePhone,
                }),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => ({}))) as { error?: string };
                setProfileMessage(getProfileErrorMessage(data.error ?? "", c));
                return;
            }

            await refreshSession();
            setProfileMessage(c.saved);
            setIsProfileEditing(false);
        } catch {
            setProfileMessage(c.profileFailed);
        } finally {
            setProfileSaving(false);
        }
    }

    async function sendEmailCode() {
        if (!user) return;

        setEmailSending(true);
        setEmailMessage("");
        setVerificationCode("");
        try {
            const recaptchaToken = await executeRecaptcha("email_verification_send").catch(() => "");
            const response = await fetch("/api/auth/email-verification/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: profileEmail,
                    locale: lang,
                    recaptchaToken,
                }),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => ({}))) as { error?: string };
                setEmailMessage(getProfileErrorMessage(data.error ?? "", c));
                return;
            }

            setEmailCodeSent(true);
            setEmailMessage(c.emailCodeSent);
        } catch {
            setEmailMessage(c.profileFailed);
        } finally {
            setEmailSending(false);
        }
    }

    async function changeEmail() {
        if (!user) return;

        setEmailChanging(true);
        setEmailMessage("");
        try {
            const verifyResponse = await fetch("/api/auth/email-verification/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: profileEmail,
                    code: verificationCode,
                }),
            });
            const verifyData = (await verifyResponse.json().catch(() => ({}))) as {
                error?: string;
                verificationToken?: string;
            };

            if (!verifyResponse.ok || !verifyData.verificationToken) {
                setEmailMessage(getProfileErrorMessage(verifyData.error ?? "INVALID_CODE", c));
                return;
            }

            const updateResponse = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: profileEmail,
                    verificationToken: verifyData.verificationToken,
                }),
            });

            if (!updateResponse.ok) {
                const data = (await updateResponse.json().catch(() => ({}))) as { error?: string };
                setEmailMessage(getProfileErrorMessage(data.error ?? "", c));
                return;
            }

            await refreshSession();
            setEmailCodeSent(false);
            setVerificationCode("");
            setEmailMessage(c.emailChanged);
            setIsProfileEditing(false);
        } catch {
            setEmailMessage(c.profileFailed);
        } finally {
            setEmailChanging(false);
        }
    }

    if (!ready) {
        return <div className={`rounded-[28px] border p-8 ${panel}`} />;
    }

    if (!user) {
        return (
            <section className={`rounded-[32px] border p-8 text-center ${panel}`}>
                <h1 className={`text-3xl font-black ${textMain}`}>{c.title}</h1>
                <p className={`mt-3 ${textMuted}`}>{c.loginRequired}</p>
                <Link
                    href={withLocaleQuery("/login", lang)}
                    className="mt-6 inline-flex h-12 items-center rounded-2xl bg-blue-600 px-6 text-sm font-black text-white"
                >
                    {c.login}
                </Link>
            </section>
        );
    }

    return (
        <>
            <section className={`rounded-[32px] border px-6 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6 ${panel}`}>
                <p className="text-sm font-black text-blue-500">
                    {c.loggedInAs} · {user.id}
                </p>
                <h1 className={`mt-2 text-3xl font-black ${textMain}`}>{c.title}</h1>
                <p className={`mt-3 ${textMuted}`}>{c.desc}</p>
                <div className={`mt-6 rounded-[24px] border p-5 ${subPanel}`}>
                    <h2 className={`text-xl font-black ${textMain}`}>{c.profileTitle}</h2>

                    {!isProfileEditing ? (
                        <div className="mt-5 grid gap-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className={textMuted}>{c.nameLabel}</span>
                                <strong className={textMain}>{user.name || "-"}</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className={textMuted}>{c.emailLabel}</span>
                                <strong className={textMain}>{user.email || "-"}</strong>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className={textMuted}>{c.phoneLabel}</span>
                                <strong className={textMain}>{user.phone || "-"}</strong>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                <label className="grid gap-2 text-sm font-black">
                                    <span className={textMuted}>{c.nameLabel}</span>
                                    <input
                                        value={profileName}
                                        onChange={(event) => setProfileName(event.target.value)}
                                        className={`h-12 rounded-2xl border px-4 outline-none transition ${inputClass}`}
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-black">
                                    <span className={textMuted}>{c.phoneLabel}</span>
                                    <input
                                        value={profilePhone}
                                        onChange={(event) => setProfilePhone(event.target.value)}
                                        className={`h-12 rounded-2xl border px-4 outline-none transition ${inputClass}`}
                                    />
                                </label>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={saveProfile}
                                    disabled={profileSaving}
                                    className="inline-flex h-11 items-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {profileSaving ? c.saving : c.saveProfile}
                                </button>
                                {profileMessage ? <span className={`text-sm font-bold ${textMuted}`}>{profileMessage}</span> : null}
                            </div>

                            <div className={`mt-6 rounded-[20px] border p-4 ${isDark ? "border-white/10 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                                <label className="grid gap-2 text-sm font-black">
                                    <span className={textMuted}>{c.emailLabel}</span>
                                    <input
                                        type="email"
                                        value={profileEmail}
                                        onChange={(event) => {
                                            setProfileEmail(event.target.value);
                                            setEmailCodeSent(false);
                                            setVerificationCode("");
                                        }}
                                        className={`h-12 rounded-2xl border px-4 outline-none transition ${inputClass}`}
                                    />
                                </label>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={sendEmailCode}
                                        disabled={emailSending || profileEmail.trim().toLowerCase() === user.email.toLowerCase()}
                                        className="inline-flex h-11 items-center rounded-2xl bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                                    >
                                        {emailSending ? c.sendingCode : emailCodeSent ? c.resendEmailCode : c.sendEmailCode}
                                    </button>
                                    {emailMessage ? <span className={`text-sm font-bold ${textMuted}`}>{emailMessage}</span> : null}
                                </div>

                                {emailCodeSent ? (
                                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                                        <label className="grid gap-2 text-sm font-black">
                                            <span className={textMuted}>{c.verificationCodeLabel}</span>
                                            <input
                                                value={verificationCode}
                                                onChange={(event) => setVerificationCode(event.target.value)}
                                                placeholder={c.verificationCodePlaceholder}
                                                inputMode="numeric"
                                                className={`h-12 rounded-2xl border px-4 outline-none transition ${inputClass}`}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={changeEmail}
                                            disabled={emailChanging || verificationCode.trim().length < 1}
                                            className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {emailChanging ? c.changingEmail : c.changeEmail}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href={withLocaleQuery("/mypage/password", lang)}
                        className={`text-sm font-bold underline-offset-4 transition hover:underline ${
                            isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                        }`}
                    >
                        {c.changePassword}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (isProfileEditing) {
                                    resetProfileForm();
                                    setIsProfileEditing(false);
                                    return;
                                }
                                setIsProfileEditing(true);
                            }}
                            className={`inline-flex h-10 items-center rounded-2xl px-4 text-sm font-black transition ${
                                isProfileEditing
                                    ? isDark
                                        ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    : "bg-blue-600 text-white hover:bg-blue-500"
                            }`}
                        >
                            {isProfileEditing ? c.cancelEdit : c.editProfile}
                        </button>
                        {isProfileEditing ? (
                            <button
                                type="button"
                                onClick={() => setWithdrawOpen(true)}
                                className={`inline-flex h-10 items-center rounded-2xl border px-4 text-sm font-black transition ${
                                    isDark
                                        ? "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                        : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                }`}
                            >
                                {c.withdrawBtn}
                            </button>
                        ) : null}
                    </div>
                </div>
            </section>

            <Link
                href={withLocaleQuery("/mypage/bookings", lang)}
                className={`group relative overflow-hidden rounded-[32px] border p-6 transition hover:border-blue-400 sm:p-8 ${panel}`}
            >
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl transition group-hover:bg-blue-500/20" />
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1 text-xs font-black text-blue-600">
                            {c.bookingsBadge}
                        </span>
                        <h2 className={`mt-3 text-2xl font-black ${textMain}`}>{c.bookingsTitle}</h2>
                        <p className={`mt-2 max-w-xl text-sm leading-7 ${textMuted}`}>{c.bookingsDesc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {bookingOverview ? (
                            <div className="flex items-end justify-end gap-1 text-right">
                                <span className={`text-4xl font-black leading-none ${textMain}`}>{bookingOverview.count}</span>
                                <span className={`pb-1 text-xs font-bold ${textMuted}`}>{c.bookingsCountSuffix}</span>
                            </div>
                        ) : null}
                        <span className="inline-flex h-12 items-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition group-hover:bg-blue-500">
                            {c.bookingsCta} →
                        </span>
                    </div>
                </div>
                <div className={`relative mt-5 rounded-[24px] border p-5 ${subPanel}`}>
                    {bookingOverview?.recent ? (
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-black ${getBookingStatusClass(bookingOverview.recent.status, isDark)}`}>
                                    {getBookingStatusLabel(bookingOverview.recent.status, lang)}
                                </span>
                                <span className={`text-xs font-bold ${textMuted}`}>{summaryText.recent}</span>
                            </div>
                            <h3 className={`mt-3 text-xl font-black ${textMain}`}>
                                {getBookingTitle(bookingOverview.recent, lang)}
                            </h3>
                            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <dt className={`font-bold ${textMuted}`}>{summaryText.bookingNo}</dt>
                                    <dd className={`mt-1 font-black ${textMain}`}>{bookingOverview.recent.bookingNo}</dd>
                                </div>
                                <div>
                                    <dt className={`font-bold ${textMuted}`}>{summaryText.departDate}</dt>
                                    <dd className={`mt-1 font-black ${textMain}`}>{bookingOverview.recent.departDate || "-"}</dd>
                                </div>
                                <div>
                                    <dt className={`font-bold ${textMuted}`}>{summaryText.guests}</dt>
                                    <dd className={`mt-1 font-black ${textMain}`}>
                                        {bookingOverview.recent.guests}{summaryText.guestsUnit}
                                    </dd>
                                </div>
                                <div>
                                    <dt className={`font-bold ${textMuted}`}>{summaryText.deposit}</dt>
                                    <dd className={`mt-1 font-black ${textMain}`}>{formatPrice(bookingOverview.recent.depositAmount)}</dd>
                                </div>
                            </dl>
                        </div>
                    ) : (
                        <p className={`text-sm font-bold ${textMuted}`}>{summaryText.empty}</p>
                    )}
                </div>
            </Link>

            <section className="grid gap-3 sm:grid-cols-3">
                {[
                    { title: c.posts, href: "/mypage/posts" },
                    { title: c.applications, href: "/community/mates" },
                    { title: c.notifications, href: "/notifications" },
                ].map((item) => (
                    <Link
                        key={item.title}
                        href={withLocaleQuery(item.href, lang)}
                        className={`rounded-2xl border p-5 transition hover:border-blue-400 ${subPanel}`}
                    >
                        <p className={`text-base font-black ${textMain}`}>{item.title}</p>
                        <p className={`mt-1 text-xs ${textMuted}`}>→</p>
                    </Link>
                ))}
            </section>

            {withdrawOpen ? (
                <WithdrawModal
                    isDark={isDark}
                    c={c}
                    onClose={() => setWithdrawOpen(false)}
                    onCompleted={() => {
                        setWithdrawOpen(false);
                        router.replace(withLocaleQuery("/", lang));
                    }}
                />
            ) : null}
        </>
    );
}

function WithdrawModal({
    isDark,
    c,
    onClose,
    onCompleted,
}: {
    isDark: boolean;
    c: (typeof myCopy)[Locale];
    onClose: () => void;
    onCompleted: () => void;
}) {
    const { deleteAccount } = useAuth();
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [done, setDone] = useState(false);

    useBodyScrollLock(true);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !submitting) onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => {
            window.removeEventListener("keydown", handleKey);
        };
    }, [onClose, submitting]);

    useEffect(() => {
        if (!done) return;
        const timeoutId = window.setTimeout(() => {
            onCompleted();
        }, 1500);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [done, onCompleted]);

    if (typeof document === "undefined") return null;

    const textMain = isDark ? "text-white" : "text-slate-950";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        if (!password.trim()) {
            setErrorMessage(c.withdrawInvalidPassword);
            return;
        }

        setSubmitting(true);
        setErrorMessage("");
        const result = await deleteAccount({ password });

        if (!result.ok) {
            setErrorMessage(
                result.code === "INVALID_CREDENTIALS"
                    ? c.withdrawInvalidPassword
                    : c.withdrawFailed
            );
            setSubmitting(false);
            return;
        }

        setDone(true);
    }

    return createPortal(
        <div
            className={`fixed inset-0 z-[140] flex h-dvh w-screen items-center justify-center p-4 backdrop-blur-md sm:p-6 ${
                isDark ? "bg-slate-950/70" : "bg-slate-900/35"
            }`}
        >
            <button
                type="button"
                aria-label="close"
                onClick={() => {
                    if (!submitting) onClose();
                }}
                className="absolute inset-0"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="withdraw-modal-title"
                className={`relative z-10 w-full max-w-md rounded-[28px] border p-6 shadow-2xl sm:p-7 ${
                    isDark
                        ? "border-white/10 bg-slate-900 text-slate-100"
                        : "border-slate-200 bg-white text-slate-900"
                }`}
            >
                {done ? (
                    <div className="text-center">
                        <p className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600">
                            BlueWolf
                        </p>
                        <h2 id="withdraw-modal-title" className={`mt-3 text-2xl font-black tracking-tight ${textMain}`}>
                            {c.withdrawDoneTitle}
                        </h2>
                        <p className={`mt-3 text-sm leading-7 ${textMuted}`}>{c.withdrawDoneDesc}</p>
                    </div>
                ) : (
                    <>
                        <p className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-xs font-black text-red-600">
                            {c.withdrawBtn}
                        </p>
                        <h2 id="withdraw-modal-title" className={`mt-3 text-2xl font-black tracking-tight ${textMain}`}>
                            {c.withdrawModalTitle}
                        </h2>
                        <p className={`mt-3 text-sm leading-7 ${textMuted}`}>{c.withdrawModalDesc}</p>

                        <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
                            <label className="grid gap-2 text-sm font-black">
                                <span className={textMuted}>{c.withdrawConfirmLabel}</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder={c.withdrawPasswordPlaceholder}
                                    autoComplete="current-password"
                                    className={`h-12 rounded-2xl border px-4 outline-none transition ${
                                        isDark
                                            ? "border-white/10 bg-slate-950 text-white placeholder:text-slate-600 focus:border-red-400"
                                            : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-red-300"
                                    }`}
                                />
                            </label>
                            {errorMessage ? (
                                <p className="text-xs font-bold text-red-500">{errorMessage}</p>
                            ) : null}

                            <div className="mt-2 flex flex-wrap justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={submitting}
                                    className={`inline-flex h-11 items-center rounded-2xl border px-5 text-sm font-bold transition disabled:opacity-50 ${
                                        isDark
                                            ? "border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700"
                                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                                    }`}
                                >
                                    {c.withdrawCancelBtn}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex h-11 items-center rounded-2xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-500 disabled:opacity-60"
                                >
                                    {submitting ? c.withdrawSubmittingBtn : c.withdrawSubmitBtn}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}
