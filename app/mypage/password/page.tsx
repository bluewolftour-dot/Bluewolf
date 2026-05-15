"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { withLocaleQuery } from "@/lib/locale-routing";
import { type Locale } from "@/lib/bluewolf-data";

const passwordCopy = {
    ko: {
        title: "비밀번호 변경",
        desc: "현재 비밀번호를 확인한 뒤 새 비밀번호를 설정합니다. 변경 후에는 다른 기기에서 자동 로그아웃됩니다.",
        loginRequired: "로그인 후 이용할 수 있습니다.",
        loginCta: "로그인하기",
        currentLabel: "현재 비밀번호",
        currentPlaceholder: "현재 비밀번호",
        newLabel: "새 비밀번호",
        newPlaceholder: "6자 이상 입력해주세요",
        confirmLabel: "새 비밀번호 확인",
        confirmPlaceholder: "새 비밀번호 다시 입력",
        submitBtn: "비밀번호 변경",
        submittingBtn: "변경 중...",
        backToMypage: "← 마이페이지로 돌아가기",
        successTitle: "비밀번호가 변경되었습니다",
        successDesc: "이 기기에서는 로그인이 유지되고, 다른 기기에서는 자동 로그아웃됩니다.",
        backNow: "마이페이지로 이동",
        requiredCurrent: "현재 비밀번호를 입력해주세요.",
        invalidNew: "새 비밀번호는 6자 이상이어야 합니다.",
        mismatch: "새 비밀번호가 서로 일치하지 않습니다.",
        sameAsCurrent: "새 비밀번호가 현재 비밀번호와 같습니다.",
        invalidCurrent: "현재 비밀번호가 올바르지 않습니다.",
        failed: "비밀번호 변경 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    },
    ja: {
        title: "パスワード変更",
        desc: "現在のパスワードを確認した上で、新しいパスワードを設定します。変更後は他の端末から自動的にログアウトされます。",
        loginRequired: "ログイン後にご利用いただけます。",
        loginCta: "ログイン",
        currentLabel: "現在のパスワード",
        currentPlaceholder: "現在のパスワード",
        newLabel: "新しいパスワード",
        newPlaceholder: "6文字以上で入力してください",
        confirmLabel: "新しいパスワードの確認",
        confirmPlaceholder: "新しいパスワードを再入力",
        submitBtn: "パスワードを変更",
        submittingBtn: "変更中...",
        backToMypage: "← マイページへ戻る",
        successTitle: "パスワードが変更されました",
        successDesc: "この端末ではログインを維持し、他の端末では自動的にログアウトされます。",
        backNow: "マイページへ移動",
        requiredCurrent: "現在のパスワードを入力してください。",
        invalidNew: "新しいパスワードは6文字以上で入力してください。",
        mismatch: "新しいパスワードが一致しません。",
        sameAsCurrent: "新しいパスワードが現在のパスワードと同じです。",
        invalidCurrent: "現在のパスワードが正しくありません。",
        failed: "パスワード変更中に問題が発生しました。しばらくしてから再度お試しください。",
    },
    en: {
        title: "Change password",
        desc: "Confirm your current password and set a new one. You'll be signed out from other devices after the change.",
        loginRequired: "Please log in to continue.",
        loginCta: "Log in",
        currentLabel: "Current password",
        currentPlaceholder: "Current password",
        newLabel: "New password",
        newPlaceholder: "At least 6 characters",
        confirmLabel: "Confirm new password",
        confirmPlaceholder: "Re-enter the new password",
        submitBtn: "Change password",
        submittingBtn: "Updating...",
        backToMypage: "← Back to My Page",
        successTitle: "Your password has been changed",
        successDesc: "This device stays signed in. All other devices have been signed out.",
        backNow: "Go to My Page",
        requiredCurrent: "Please enter your current password.",
        invalidNew: "New password must be at least 6 characters.",
        mismatch: "New passwords do not match.",
        sameAsCurrent: "New password is the same as the current one.",
        invalidCurrent: "Your current password is incorrect.",
        failed: "Something went wrong while updating your password. Please try again later.",
    },
} satisfies Record<Locale, Record<string, string>>;

export default function ChangePasswordPage() {
    return (
        <PageShell activeKey="none">
            <ChangePasswordContent />
        </PageShell>
    );
}

function ChangePasswordContent() {
    const { user, ready } = useAuth();
    const { isDark, lang } = usePage();
    const c = passwordCopy[lang];
    const panel = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white";
    const subPanel = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";
    const textMain = isDark ? "text-white" : "text-slate-950";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const inputClass = isDark
        ? "border-white/10 bg-slate-950 text-white placeholder:text-slate-600 focus:border-blue-500"
        : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-blue-500";
    const labelClass = `text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    if (!ready) {
        return <div className={`rounded-[28px] border p-8 ${panel}`} />;
    }

    if (!user) {
        return (
            <section className={`rounded-[32px] border p-10 text-center ${panel}`}>
                <h1 className={`type-display ${textMain}`}>{c.title}</h1>
                <p className={`mt-3 ${textMuted}`}>{c.loginRequired}</p>
                <Link
                    href={withLocaleQuery("/login", lang)}
                    className="mt-6 inline-flex h-12 items-center rounded-2xl bg-blue-600 px-6 text-sm font-black text-white"
                >
                    {c.loginCta}
                </Link>
            </section>
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;

        const trimmedCurrent = currentPassword.trim();
        const trimmedNew = newPassword.trim();
        const trimmedConfirm = confirmPassword.trim();

        if (!trimmedCurrent) {
            setErrorMessage(c.requiredCurrent);
            return;
        }
        if (trimmedNew.length < 6) {
            setErrorMessage(c.invalidNew);
            return;
        }
        if (trimmedNew !== trimmedConfirm) {
            setErrorMessage(c.mismatch);
            return;
        }
        if (trimmedNew === trimmedCurrent) {
            setErrorMessage(c.sameAsCurrent);
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/auth/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: trimmedCurrent,
                    newPassword: trimmedNew,
                }),
            });

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                if (payload?.error === "INVALID_CREDENTIALS") {
                    setErrorMessage(c.invalidCurrent);
                } else if (payload?.error === "SAME_PASSWORD") {
                    setErrorMessage(c.sameAsCurrent);
                } else if (payload?.error === "INVALID_INPUT") {
                    setErrorMessage(c.invalidNew);
                } else {
                    setErrorMessage(c.failed);
                }
                return;
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setDone(true);
        } catch {
            setErrorMessage(c.failed);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className={`mx-auto w-full max-w-2xl rounded-[32px] border p-6 sm:p-8 ${panel}`}>
            <Link
                href={withLocaleQuery("/mypage", lang)}
                className={`text-xs font-bold transition ${
                    isDark ? "text-slate-400 hover:text-blue-400" : "text-slate-500 hover:text-blue-600"
                }`}
            >
                {c.backToMypage}
            </Link>

            <h1 className={`type-display mt-3 ${textMain}`}>{c.title}</h1>
            <p className={`mt-2 text-sm leading-7 ${textMuted}`}>{c.desc}</p>

            {done ? (
                <div className={`mt-6 rounded-2xl border p-6 text-center ${subPanel}`}>
                    <p className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600">
                        BlueWolf
                    </p>
                    <p className={`mt-3 text-xl font-black ${textMain}`}>{c.successTitle}</p>
                    <p className={`mt-2 text-sm leading-7 ${textMuted}`}>{c.successDesc}</p>
                    <Link
                        href={withLocaleQuery("/mypage", lang)}
                        className="mt-5 inline-flex h-11 items-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-500"
                    >
                        {c.backNow}
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
                    <label className="grid gap-2">
                        <span className={labelClass}>{c.currentLabel}</span>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            placeholder={c.currentPlaceholder}
                            autoComplete="current-password"
                            className={`h-12 rounded-2xl border px-4 text-sm font-semibold outline-none transition ${inputClass}`}
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className={labelClass}>{c.newLabel}</span>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder={c.newPlaceholder}
                            autoComplete="new-password"
                            className={`h-12 rounded-2xl border px-4 text-sm font-semibold outline-none transition ${inputClass}`}
                        />
                    </label>
                    <label className="grid gap-2">
                        <span className={labelClass}>{c.confirmLabel}</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder={c.confirmPlaceholder}
                            autoComplete="new-password"
                            className={`h-12 rounded-2xl border px-4 text-sm font-semibold outline-none transition ${inputClass}`}
                        />
                    </label>

                    {errorMessage ? (
                        <p className="text-sm font-bold text-red-500">{errorMessage}</p>
                    ) : null}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-12 items-center rounded-2xl bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? c.submittingBtn : c.submitBtn}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}
