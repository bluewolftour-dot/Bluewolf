"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { authCopy } from "@/lib/auth-copy";
import { getLocaleFromSearchParam, withLocaleQuery } from "@/lib/locale-routing";

type FieldErrors = {
    id?: string;
    password?: string;
    form?: string;
};

type AuthText = (typeof authCopy)[keyof typeof authCopy];

function resolveError(copy: AuthText, code: string) {
    switch (code) {
        case "INVALID_CREDENTIALS":
            return copy.loginFailed;
        case "ACCOUNT_LOCKED":
            return copy.accountLocked;
        case "RATE_LIMITED":
            return copy.requestLimited;
        case "INVALID_INPUT":
            return copy.systemError;
        default:
            return copy.systemError;
    }
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, login, ready } = useAuth();
    const lang = getLocaleFromSearchParam(searchParams.get("lang")) ?? "ko";
    const t = authCopy[lang];
    const homeHref = withLocaleQuery("/", lang);
    const signupHref = withLocaleQuery("/signup", lang);
    const forgotHref = withLocaleQuery("/forgot-password", lang);

    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const nextErrors: FieldErrors = {};

        if (!id.trim()) nextErrors.id = t.requiredUserId;
        else if (id.trim().length < 4) nextErrors.id = t.invalidUserId;

        if (!password.trim()) nextErrors.password = t.requiredPassword;
        else if (password.trim().length < 6) nextErrors.password = t.invalidPassword;

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        const result = await login({
            id,
            password,
        });
        setSubmitting(false);

        if (!result.ok) {
            setErrors({ form: resolveError(t, result.code) });
            return;
        }

        router.push(homeHref);
    };

    return (
        <PageShell activeKey="home">
            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
                <div className="rounded-[28px] bg-[linear-gradient(145deg,#0f172a_0%,#1d4ed8_45%,#38bdf8_100%)] p-8 text-white shadow-[0_22px_60px_rgba(29,78,216,0.22)] sm:p-10">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold tracking-[0.18em] text-white/90">
                        BLUEWOLF ACCOUNT
                    </span>
                    <h1 className="type-display mt-5">{t.loginTitle}</h1>
                    <p className="mt-4 max-w-md text-sm leading-7 text-blue-50 sm:text-base">
                        {t.loginDesc}
                    </p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm sm:p-8">
                    {ready && user ? (
                        <div className="flex h-full flex-col justify-between gap-8">
                            <div>
                                <p className="text-sm font-bold text-blue-600">{t.loggedIn}</p>
                                <h2 className="type-title-lg mt-3">{user.id}</h2>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={homeHref}
                                    className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white transition-colors duration-300 hover:bg-blue-700"
                                >
                                    {t.continue}
                                </Link>
                                <Link
                                    href={homeHref}
                                    className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors duration-300 hover:bg-slate-50"
                                >
                                    {t.home}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="flex h-full flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
                            <div>
                                <label className="text-sm font-bold text-slate-700" htmlFor="login-id">
                                    {t.userIdLabel}
                                </label>
                                <input
                                    id="login-id"
                                    value={id}
                                    onChange={(event) => setId(event.target.value)}
                                    className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                                    placeholder={t.userIdLabel}
                                />
                                {errors.id ? <p className="mt-2 text-xs font-semibold text-rose-500">{errors.id}</p> : null}
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700" htmlFor="login-password">
                                    {t.passwordLabel}
                                </label>
                                <input
                                    id="login-password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                                    placeholder="********"
                                />
                                <p className="mt-2 text-xs text-slate-600">{t.passwordHint}</p>
                                {errors.password ? <p className="mt-2 text-xs font-semibold text-rose-500">{errors.password}</p> : null}
                            </div>

                            {errors.form ? <p className="text-sm font-semibold text-rose-500">{errors.form}</p> : null}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-blue-700 hover:shadow-[0_18px_36px_rgba(37,99,235,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {t.loginButton}
                            </button>

                            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                <Link href={forgotHref} className="text-sm font-bold text-blue-600 transition-colors duration-300 hover:text-blue-700">
                                    {t.forgotPassword}
                                </Link>
                                <p className="text-sm text-slate-600">
                                    {t.needAccount}{" "}
                                    <Link href={signupHref} className="font-bold text-blue-600 transition-colors duration-300 hover:text-blue-700">
                                        {t.goSignup}
                                    </Link>
                                </p>
                            </div>

                            <Link
                                href={homeHref}
                                className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-colors duration-300 hover:bg-slate-50"
                            >
                                {t.home}
                            </Link>
                        </form>
                    )}
                </div>
            </section>
        </PageShell>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    );
}
