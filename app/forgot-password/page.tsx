"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { authCopy } from "@/lib/auth-copy";
import { getLocaleFromSearchParam, withLocaleQuery } from "@/lib/locale-routing";
import { executeRecaptcha } from "@/lib/recaptcha-client";

type Step = "id" | "verify" | "password";

type FieldErrors = {
    id?: string;
    code?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
    success?: string;
};

type AuthText = (typeof authCopy)[keyof typeof authCopy];

function resolveSendCodeError(copy: AuthText, code: string) {
    switch (code) {
        case "USER_NOT_FOUND":
            return copy.userNotFound;
        case "EMAIL_NOT_REGISTERED":
            return copy.forgotEmailNotRegistered;
        case "SMTP_NOT_CONFIGURED":
            return copy.systemError;
        case "RATE_LIMITED":
        case "RECAPTCHA_REQUIRED":
        case "RECAPTCHA_FAILED":
            return copy.requestLimited;
        default:
            return copy.systemError;
    }
}

function resolveVerifyCodeError(copy: AuthText, code: string) {
    switch (code) {
        case "USER_NOT_FOUND":
            return copy.userNotFound;
        case "INVALID_CODE":
            return copy.invalidVerificationCode;
        default:
            return copy.systemError;
    }
}

function resolveResetError(copy: AuthText, code: string) {
    switch (code) {
        case "USER_NOT_FOUND":
            return copy.userNotFound;
        case "EMAIL_NOT_VERIFIED":
            return copy.emailVerificationRequired;
        default:
            return copy.systemError;
    }
}

function ForgotPasswordContent() {
    const searchParams = useSearchParams();
    const { resetPassword } = useAuth();
    const lang = getLocaleFromSearchParam(searchParams.get("lang")) ?? "ko";
    const t = authCopy[lang];
    const loginHref = withLocaleQuery("/login", lang);

    const [step, setStep] = useState<Step>("id");
    const [id, setId] = useState("");
    const [code, setCode] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [verificationToken, setVerificationToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSendCode = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        if (sendingCode) return;

        const trimmedId = id.trim();
        if (!trimmedId) {
            setErrors({ id: t.requiredUserId });
            return;
        }
        if (trimmedId.length < 4) {
            setErrors({ id: t.invalidUserId });
            return;
        }

        setSendingCode(true);
        setErrors({});

        try {
            const recaptchaToken = await executeRecaptcha("forgot_password_send").catch(() => "");
            const response = await fetch("/api/auth/forgot-password/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: trimmedId, locale: lang, recaptchaToken }),
            });

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                setErrors({ id: resolveSendCodeError(t, payload?.error ?? "UNKNOWN_ERROR") });
                return;
            }

            const payload = (await response.json()) as { maskedEmail: string };
            setMaskedEmail(payload.maskedEmail);
            setVerificationToken("");
            setCode("");
            setStep("verify");
        } catch {
            setErrors({ id: t.systemError });
        } finally {
            setSendingCode(false);
        }
    };

    const handleVerifyCode = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        if (verifyingCode) return;

        const trimmedCode = code.trim();
        if (!trimmedCode) {
            setErrors({ code: t.requiredVerificationCode });
            return;
        }

        setVerifyingCode(true);
        setErrors({});

        try {
            const response = await fetch("/api/auth/forgot-password/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: id.trim(), code: trimmedCode }),
            });

            const payload = (await response.json().catch(() => null)) as
                | { verificationToken?: string; error?: string }
                | null;

            if (!response.ok || !payload?.verificationToken) {
                setErrors({
                    code: resolveVerifyCodeError(t, payload?.error ?? "UNKNOWN_ERROR"),
                });
                return;
            }

            setVerificationToken(payload.verificationToken);
            setStep("password");
        } catch {
            setErrors({ code: t.systemError });
        } finally {
            setVerifyingCode(false);
        }
    };

    const handleSubmitPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;

        const nextErrors: FieldErrors = {};
        if (!password.trim()) nextErrors.password = t.requiredPassword;
        else if (password.trim().length < 6) nextErrors.password = t.invalidPassword;

        if (!confirmPassword.trim()) nextErrors.confirmPassword = t.requiredPassword;
        else if (confirmPassword !== password) nextErrors.confirmPassword = t.passwordMismatch;

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setSubmitting(true);
        setErrors({});

        const result = await resetPassword({ id: id.trim(), password, verificationToken });
        setSubmitting(false);

        if (!result.ok) {
            if (result.code === "EMAIL_NOT_VERIFIED") {
                setVerificationToken("");
                setCode("");
                setStep("verify");
                setErrors({ code: t.invalidVerificationCode });
                return;
            }
            setErrors({ form: resolveResetError(t, result.code) });
            return;
        }

        setErrors({ success: t.resetDone });
    };

    const handleChangeId = () => {
        setStep("id");
        setCode("");
        setVerificationToken("");
        setMaskedEmail("");
        setErrors({});
    };

    return (
        <PageShell activeKey="home">
            <section className="mx-auto w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm sm:p-8">
                <h1 className="type-display">{t.forgotTitle}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">{t.forgotDesc}</p>

                <ol className="mt-6 grid gap-2 text-xs font-bold sm:grid-cols-3">
                    <StepIndicator label={t.forgotStep1Title} active={step === "id"} done={step !== "id"} />
                    <StepIndicator
                        label={t.forgotStep2Title}
                        active={step === "verify"}
                        done={step === "password"}
                    />
                    <StepIndicator label={t.forgotStep3Title} active={step === "password"} done={false} />
                </ol>

                {step === "id" ? (
                    <form className="mt-6 flex flex-col gap-5" onSubmit={(event) => void handleSendCode(event)}>
                        <p className="text-sm leading-7 text-slate-500">{t.forgotStep1Desc}</p>
                        <div>
                            <label className="text-sm font-bold text-slate-700" htmlFor="forgot-id">
                                {t.userIdLabel}
                            </label>
                            <input
                                id="forgot-id"
                                value={id}
                                onChange={(event) => setId(event.target.value)}
                                autoComplete="username"
                                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.id ? (
                                <p className="mt-2 text-xs font-semibold text-rose-500">{errors.id}</p>
                            ) : null}
                        </div>

                        <button
                            type="submit"
                            disabled={sendingCode}
                            className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {sendingCode ? t.sendingVerificationCode : t.forgotSendCodeBtn}
                        </button>

                        <p className="text-sm text-slate-600">
                            <Link
                                href={loginHref}
                                className="font-bold text-blue-600 transition-colors duration-300 hover:text-blue-700"
                            >
                                {t.goLogin}
                            </Link>
                        </p>
                    </form>
                ) : null}

                {step === "verify" ? (
                    <form className="mt-6 flex flex-col gap-5" onSubmit={(event) => void handleVerifyCode(event)}>
                        <p className="text-sm leading-7 text-slate-500">
                            {t.forgotStep2Desc.replace("{email}", maskedEmail)}
                        </p>
                        <div>
                            <label className="text-sm font-bold text-slate-700" htmlFor="forgot-code">
                                {t.verificationCodeLabel}
                            </label>
                            <input
                                id="forgot-code"
                                value={code}
                                onChange={(event) => setCode(event.target.value)}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder={t.verificationCodePlaceholder}
                                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold tracking-[0.4em] outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.code ? (
                                <p className="mt-2 text-xs font-semibold text-rose-500">{errors.code}</p>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="submit"
                                disabled={verifyingCode}
                                className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {verifyingCode ? t.verifyingVerificationCode : t.verifyVerificationCode}
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleSendCode()}
                                disabled={sendingCode}
                                className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {sendingCode ? t.sendingVerificationCode : t.forgotResendCodeBtn}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleChangeId}
                            className="self-start text-xs font-bold text-blue-600 transition-colors duration-300 hover:text-blue-700"
                        >
                            {t.forgotChangeIdBtn}
                        </button>
                    </form>
                ) : null}

                {step === "password" ? (
                    <form className="mt-6 flex flex-col gap-5" onSubmit={(event) => void handleSubmitPassword(event)}>
                        <p className="text-sm leading-7 text-emerald-600">{t.forgotStep3Desc}</p>
                        <div>
                            <label className="text-sm font-bold text-slate-700" htmlFor="forgot-password">
                                {t.passwordLabel}
                            </label>
                            <input
                                id="forgot-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password"
                                placeholder={t.passwordHint}
                                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.password ? (
                                <p className="mt-2 text-xs font-semibold text-rose-500">{errors.password}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700" htmlFor="forgot-confirm-password">
                                {t.confirmPasswordLabel}
                            </label>
                            <input
                                id="forgot-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                autoComplete="new-password"
                                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.confirmPassword ? (
                                <p className="mt-2 text-xs font-semibold text-rose-500">{errors.confirmPassword}</p>
                            ) : null}
                        </div>

                        {errors.form ? (
                            <p className="text-sm font-semibold text-rose-500">{errors.form}</p>
                        ) : null}
                        {errors.success ? (
                            <p className="text-sm font-semibold text-emerald-600">{errors.success}</p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {t.forgotButton}
                        </button>

                        {errors.success ? (
                            <Link
                                href={loginHref}
                                className="self-start text-sm font-bold text-blue-600 transition-colors duration-300 hover:text-blue-700"
                            >
                                {t.goLogin}
                            </Link>
                        ) : null}
                    </form>
                ) : null}
            </section>
        </PageShell>
    );
}

function StepIndicator({
    label,
    active,
    done,
}: {
    label: string;
    active: boolean;
    done: boolean;
}) {
    const className = active
        ? "rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700"
        : done
          ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700"
          : "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500";

    return <li className={className}>{label}</li>;
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
