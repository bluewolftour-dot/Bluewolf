"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { authCopy } from "@/lib/auth-copy";
import { getLocaleFromSearchParam, withLocaleQuery } from "@/lib/locale-routing";
import { executeRecaptcha } from "@/lib/recaptcha-client";

type FieldErrors = {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    verificationCode?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
    success?: string;
};

type AuthText = (typeof authCopy)[keyof typeof authCopy];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolveSignupError(copy: AuthText, code: string) {
    switch (code) {
        case "USER_EXISTS":
            return copy.userExists;
        case "EMAIL_NOT_VERIFIED":
            return copy.emailVerificationRequired;
        default:
            return copy.systemError;
    }
}

function resolveSendCodeError(copy: AuthText, code: string) {
    switch (code) {
        case "INVALID_EMAIL":
            return copy.invalidEmail;
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
        case "INVALID_CODE":
            return copy.invalidVerificationCode;
        default:
            return copy.systemError;
    }
}

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register } = useAuth();
    const lang = getLocaleFromSearchParam(searchParams.get("lang")) ?? "ko";
    const t = authCopy[lang];
    const loginHref = withLocaleQuery("/login", lang);

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationToken, setVerificationToken] = useState("");
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");

    const handleEmailChange = (nextEmail: string) => {
        setEmail(nextEmail);

        if (verifiedEmail && verifiedEmail !== nextEmail.trim().toLowerCase()) {
            setVerificationToken("");
            setVerifiedEmail("");
            setEmailCodeSent(false);
            setVerificationCode("");
            setVerificationMessage("");
        }
    };

    const validate = () => {
        const nextErrors: FieldErrors = {};

        if (!id.trim()) nextErrors.id = t.requiredUserId;
        else if (id.trim().length < 4) nextErrors.id = t.invalidUserId;

        if (!name.trim()) nextErrors.name = t.requiredName;
        if (!phone.trim()) nextErrors.phone = t.requiredPhone;

        if (!email.trim()) nextErrors.email = t.requiredEmail;
        else if (!emailPattern.test(email.trim())) nextErrors.email = t.invalidEmail;

        if (!verificationToken || verifiedEmail !== email.trim().toLowerCase()) {
            nextErrors.email = nextErrors.email ?? t.emailVerificationRequired;
        }

        if (!password.trim()) nextErrors.password = t.requiredPassword;
        else if (password.trim().length < 6) nextErrors.password = t.invalidPassword;

        if (!confirmPassword.trim()) nextErrors.confirmPassword = t.requiredPassword;
        else if (confirmPassword !== password) nextErrors.confirmPassword = t.passwordMismatch;

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSendVerificationCode = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            setErrors((current) => ({ ...current, email: t.requiredEmail }));
            return;
        }

        if (!emailPattern.test(normalizedEmail)) {
            setErrors((current) => ({ ...current, email: t.invalidEmail }));
            return;
        }

        setSendingCode(true);
        setVerificationMessage("");
        setErrors((current) => ({ ...current, email: undefined, verificationCode: undefined, form: undefined }));
        const recaptchaToken = await executeRecaptcha("email_verification_send").catch(() => "");

        const response = await fetch("/api/auth/email-verification/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: normalizedEmail,
                locale: lang,
                recaptchaToken,
            }),
        });

        setSendingCode(false);

        if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null;
            setErrors((current) => ({
                ...current,
                email: resolveSendCodeError(t, payload?.error ?? "UNKNOWN_ERROR"),
            }));
            return;
        }

        setVerificationToken("");
        setVerifiedEmail("");
        setVerificationCode("");
        setEmailCodeSent(true);
        setVerificationMessage(t.verificationCodeSent);
    };

    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            setErrors((current) => ({ ...current, verificationCode: t.requiredVerificationCode }));
            return;
        }

        setVerifyingCode(true);
        setErrors((current) => ({ ...current, verificationCode: undefined, form: undefined }));
        const response = await fetch("/api/auth/email-verification/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                code: verificationCode.trim(),
            }),
        });
        const payload = (await response.json().catch(() => null)) as
            | { verificationToken?: string; error?: string }
            | null;
        setVerifyingCode(false);

        if (!response.ok || !payload?.verificationToken) {
            setErrors((current) => ({
                ...current,
                verificationCode: resolveVerifyCodeError(t, payload?.error ?? "UNKNOWN_ERROR"),
            }));
            return;
        }

        setVerificationToken(payload.verificationToken);
        setVerifiedEmail(email.trim().toLowerCase());
        setVerificationMessage(t.emailVerified);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        const result = await register({
            id,
            name,
            phone,
            email,
            password,
            verificationToken,
        });
        setSubmitting(false);

        if (!result.ok) {
            setErrors({ form: resolveSignupError(t, result.code) });
            return;
        }

        setErrors({ success: t.signupDone });
        window.setTimeout(() => {
            router.push(loginHref);
        }, 700);
    };

    return (
        <PageShell activeKey="home">
            <section className="mx-auto w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm sm:p-8">
                <h1 className="type-display">{t.signupTitle}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">{t.signupDesc}</p>

                <form className="mt-8 flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
                    <div>
                        <label className="text-sm font-bold text-slate-700" htmlFor="signup-id">
                            {t.userIdLabel}
                        </label>
                        <input
                            id="signup-id"
                            value={id}
                            onChange={(event) => setId(event.target.value)}
                            className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                        />
                        {errors.id ? <p className="mt-2 text-xs font-semibold text-rose-500">{errors.id}</p> : null}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-bold text-slate-700" htmlFor="signup-name">
                                {t.nameLabel}
                            </label>
                            <input
                                id="signup-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.name ? <p className="mt-2 text-xs font-semibold text-rose-500">{errors.name}</p> : null}
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700" htmlFor="signup-phone">
                                {t.phoneLabel}
                            </label>
                            <input
                                id="signup-phone"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            />
                            {errors.phone ? <p className="mt-2 text-xs font-semibold text-rose-500">{errors.phone}</p> : null}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-700" htmlFor="signup-email">
                            {t.emailLabel}
                        </label>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(event) => handleEmailChange(event.target.value)}
                                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => void handleSendVerificationCode()}
                                disabled={sendingCode}
                                className="inline-flex h-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {sendingCode ? t.sendingVerificationCode : emailCodeSent ? t.resendVerificationCode : t.sendVerificationCode}
                            </button>
                        </div>
                        {errors.email ? <p className="mt-2 text-xs font-semibold text-rose-500">{errors.email}</p> : null}
                    </div>

                    {(emailCodeSent || verificationToken) ? (
                        <div>
                            <label className="text-sm font-bold text-slate-700" htmlFor="signup-verification-code">
                                {t.verificationCodeLabel}
                            </label>
                            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                                <input
                                    id="signup-verification-code"
                                    value={verificationCode}
                                    onChange={(event) => setVerificationCode(event.target.value)}
                                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                                    placeholder={t.verificationCodePlaceholder}
                                />
                                <button
                                    type="button"
                                    onClick={() => void handleVerifyCode()}
                                    disabled={verifyingCode || Boolean(verificationToken)}
                                    className="inline-flex h-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {verificationToken ? t.emailVerifiedShort : verifyingCode ? t.verifyingVerificationCode : t.verifyVerificationCode}
                                </button>
                            </div>
                            {errors.verificationCode ? (
                                <p className="mt-2 text-xs font-semibold text-rose-500">{errors.verificationCode}</p>
                            ) : null}
                            {verificationMessage ? (
                                <p className={`mt-2 text-xs font-semibold ${verificationToken ? "text-emerald-600" : "text-blue-600"}`}>
                                    {verificationMessage}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <div>
                        <label className="text-sm font-bold text-slate-700" htmlFor="signup-password">
                            {t.passwordLabel}
                        </label>
                        <input
                            id="signup-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            placeholder="********"
                        />
                        {errors.password ? <p className="mt-2 text-xs font-semibold text-rose-500">{errors.password}</p> : null}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-700" htmlFor="signup-confirm-password">
                            {t.confirmPasswordLabel}
                        </label>
                        <input
                            id="signup-confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 focus:border-blue-500 focus:bg-white"
                            placeholder="********"
                        />
                        {errors.confirmPassword ? (
                            <p className="mt-2 text-xs font-semibold text-rose-500">{errors.confirmPassword}</p>
                        ) : null}
                    </div>

                    {errors.form ? <p className="text-sm font-semibold text-rose-500">{errors.form}</p> : null}
                    {errors.success ? <p className="text-sm font-semibold text-emerald-600">{errors.success}</p> : null}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {t.signupButton}
                    </button>

                    <p className="text-sm text-slate-600">
                        {t.haveAccount}{" "}
                        <Link href={loginHref} className="font-bold text-blue-600 transition-colors duration-300 hover:text-blue-700">
                            {t.goLogin}
                        </Link>
                    </p>
                </form>
            </section>
        </PageShell>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={null}>
            <SignupContent />
        </Suspense>
    );
}
