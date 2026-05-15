"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Notification } from "@/lib/notifications";

export function NotificationsClient() {
    const { isDark } = usePage();
    const { user, ready } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch("/api/notifications");
            const data = await response.json();
            if (data.notifications) {
                setNotifications(data.notifications);
            }
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (ready && user) {
            void loadNotifications();
        } else if (ready && !user) {
            setLoading(false);
        }
    }, [ready, user, loadNotifications]);

    const markRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "read", notificationId: id }),
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "read_all" }),
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    };

    const lang = "ko"; // 실제로는 현재 언어 설정을 가져와야 함

    const panelTone = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <PageShell activeKey="booking">
            <div className="mx-auto w-full max-w-3xl py-10">
                <header className="mb-10 flex items-end justify-between px-4 sm:px-0">
                    <div>
                        <p className="text-sm font-black text-blue-500">Notifications</p>
                        <h1 className="type-display mt-2">알림 센터</h1>
                    </div>
                    {user && notifications.some((n) => !n.isRead) && (
                        <button
                            onClick={markAllRead}
                            className={`text-sm font-bold transition hover:text-blue-500 ${mutedTone}`}
                        >
                            모두 읽음 처리
                        </button>
                    )}
                </header>

                {!user && ready ? (
                    <div className={`rounded-[32px] border p-12 text-center ${panelTone}`}>
                        <p className="text-lg font-bold">로그인이 필요한 서비스입니다.</p>
                        <Link
                            href="/login"
                            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-blue-600 px-8 text-sm font-black text-white"
                        >
                            로그인 하러 가기
                        </Link>
                    </div>
                ) : loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`h-28 animate-pulse rounded-[28px] border ${panelTone} opacity-50`} />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className={`rounded-[32px] border p-12 text-center ${panelTone}`}>
                        <p className="text-lg font-bold">도착한 알림이 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {notifications.map((n) => (
                            <article
                                key={n.id}
                                onClick={() => !n.isRead && markRead(n.id)}
                                className={`group relative cursor-pointer rounded-[28px] border p-6 transition-all duration-300 hover:border-blue-400/50 hover:shadow-lg ${panelTone} ${
                                    n.isRead ? "opacity-60" : "border-blue-500/30"
                                }`}
                            >
                                {!n.isRead && (
                                    <span className="absolute right-6 top-6 size-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                )}
                                <div className="flex flex-col gap-1">
                                    <h3 className="type-title-md">{n.title[lang as keyof typeof n.title]}</h3>
                                    <p className={`mt-1 text-sm leading-7 ${strongMuted(isDark)}`}>
                                        {n.content[lang as keyof typeof n.content]}
                                    </p>
                                    <p className={`mt-3 text-xs font-bold ${mutedTone}`}>
                                        {new Date(n.createdAt).toLocaleString("ko-KR")}
                                    </p>
                                </div>
                                {n.link && (
                                    <Link
                                        href={n.link}
                                        className="mt-4 inline-flex items-center text-xs font-black text-blue-500"
                                    >
                                        자세히 보기 →
                                    </Link>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    );
}

function strongMuted(isDark: boolean) {
    return isDark ? "text-slate-300" : "text-slate-700";
}
