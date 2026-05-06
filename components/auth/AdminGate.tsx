"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export function AdminGate({
    children,
    isDark,
}: {
    children: ReactNode;
    isDark: boolean;
}) {
    const { user, ready } = useAuth();
    const isAdmin = Boolean(user?.isAdmin);
    const panel = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-950";
    const muted = isDark ? "text-slate-400" : "text-slate-500";

    if (!ready) {
        return <div className={`rounded-[28px] border p-8 ${panel}`} />;
    }

    if (!isAdmin) {
        return (
            <section className={`rounded-[32px] border p-8 text-center ${panel}`}>
                <p className="text-sm font-black text-blue-500">Admin</p>
                <h1 className="mt-2 text-2xl font-black">관리자 권한이 필요합니다.</h1>
                <p className={`mt-3 text-sm ${muted}`}>
                    CMS/CRM은 관리자 계정으로 로그인한 경우에만 접근할 수 있습니다.
                </p>
                <Link href="/login" className="mt-6 inline-flex h-12 items-center rounded-2xl bg-blue-600 px-6 text-sm font-black text-white">
                    로그인
                </Link>
            </section>
        );
    }

    return <>{children}</>;
}
