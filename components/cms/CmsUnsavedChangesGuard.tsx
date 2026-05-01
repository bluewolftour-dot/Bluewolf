"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";

const EXIT_DURATION_MS = 260;

function isModifiedClick(event: MouseEvent) {
    return (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
    );
}

export function CmsUnsavedChangesGuard({
    when,
    isDark,
}: {
    when: boolean;
    isDark: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const allowNavigationRef = useRef(false);
    const closeTimeoutRef = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);

    useBodyScrollLock(open);

    const clearTimers = useCallback(() => {
        if (closeTimeoutRef.current !== null) {
            window.clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        if (frameRef.current !== null) {
            window.cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
    }, []);

    const showDialog = useCallback((href: string) => {
        clearTimers();
        setPendingHref(href);
        setOpen(true);
        frameRef.current = window.requestAnimationFrame(() => {
            setVisible(true);
            frameRef.current = null;
        });
    }, [clearTimers]);

    const hideDialog = useCallback((clearHref = true) => {
        clearTimers();
        setVisible(false);
        closeTimeoutRef.current = window.setTimeout(() => {
            setOpen(false);
            if (clearHref) {
                setPendingHref(null);
            }
            closeTimeoutRef.current = null;
        }, EXIT_DURATION_MS);
    }, [clearTimers]);

    useEffect(() => {
        if (!when) {
            const timeoutId = window.setTimeout(() => {
                hideDialog();
                allowNavigationRef.current = false;
            }, 0);

            return () => {
                window.clearTimeout(timeoutId);
            };
        }

        return;
    }, [hideDialog, when]);

    useEffect(() => {
        if (!when) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (allowNavigationRef.current) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [showDialog, when]);

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (
                !when ||
                allowNavigationRef.current ||
                event.defaultPrevented ||
                isModifiedClick(event)
            ) {
                return;
            }

            const target = event.target;
            if (!(target instanceof Element)) return;

            const anchor = target.closest("a[href]");
            if (!(anchor instanceof HTMLAnchorElement)) return;
            if (anchor.target && anchor.target !== "_self") return;
            if (anchor.hasAttribute("download")) return;
            if (anchor.dataset.skipUnsavedCheck === "true") return;

            const href = anchor.href;
            if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

            const nextUrl = new URL(href, window.location.href);
            const currentUrl = new URL(window.location.href);

            if (
                nextUrl.origin === currentUrl.origin &&
                nextUrl.pathname === currentUrl.pathname &&
                nextUrl.search === currentUrl.search &&
                nextUrl.hash === currentUrl.hash
            ) {
                return;
            }

            event.preventDefault();
            showDialog(nextUrl.toString());
        };

        document.addEventListener("click", handleDocumentClick, true);
        return () => {
            document.removeEventListener("click", handleDocumentClick, true);
        };
    }, [showDialog, when]);

    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);

    const handleContinueEditing = () => {
        hideDialog();
    };

    const handleLeavePage = () => {
        if (!pendingHref) return;
        allowNavigationRef.current = true;
        window.location.assign(pendingHref);
    };

    if (typeof document === "undefined" || !open) return null;

    const modal = (
        <div
            className={`fixed bottom-0 left-0 right-0 top-0 z-[140] flex h-dvh w-screen items-center justify-center p-4 backdrop-blur-md transition-[background-color,opacity] duration-[260ms] ease-out sm:p-6 ${
                visible
                    ? isDark
                        ? "bg-slate-950/70 opacity-100"
                        : "bg-slate-900/35 opacity-100"
                    : "bg-transparent opacity-0"
            }`}
        >
            <button
                type="button"
                aria-label="팝업 닫기"
                onClick={handleContinueEditing}
                className="absolute inset-0"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="cms-unsaved-title"
                className={`relative z-10 w-full max-w-md rounded-[28px] border p-6 shadow-2xl transition-[opacity,transform] duration-[420ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:p-7 ${
                    isDark
                        ? "border-white/10 bg-slate-900 text-slate-100"
                        : "border-slate-200 bg-white text-slate-900"
                } ${
                    visible
                        ? "translate-y-0 scale-100 opacity-100"
                        : "translate-y-4 scale-[0.96] opacity-0"
                }`}
            >
                <h2 id="cms-unsaved-title" className="text-2xl font-black tracking-tight">
                    저장되지 않은 변경 사항이 있어요
                </h2>
                <p
                    className={`mt-3 text-sm leading-6 ${
                        isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                >
                    지금 페이지를 벗어나면 저장하지 않은 수정 내용이 사라집니다. 저장하지 않고
                    이동할까요?
                </p>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleContinueEditing}
                        className={`inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-bold transition-colors ${
                            isDark
                                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                        }`}
                    >
                        계속 편집
                    </button>
                    <button
                        type="button"
                        onClick={handleLeavePage}
                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                    >
                        저장 없이 이동
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
