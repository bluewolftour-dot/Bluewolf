"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/ThemeToggle";
import { useAuth } from "@/components/auth/AuthProvider";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";

type HeaderNavItem = {
    key: string;
    href: string;
    label: string;
};

type AccountMenuItem = {
    key: string;
    href: string;
    label: string;
};

type MovingStyle = {
    left: number;
    top: number;
    width: number;
    height: number;
};

function useSlidingBackground<T extends string>(
    activeKey: T,
    hoverKey: T | null,
    dependencyKey?: string
) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const itemRefs = useRef<Record<string, HTMLElement | null>>({});
    const [pillStyle, setPillStyle] = useState<MovingStyle | null>(null);

    const targetKey = hoverKey ?? activeKey;

    useLayoutEffect(() => {
        const update = () => {
            const container = containerRef.current;
            const target = itemRefs.current[targetKey];

            if (!container || !target) return;

            const containerBox = container.getBoundingClientRect();
            const targetBox = target.getBoundingClientRect();

            setPillStyle({
                left: targetBox.left - containerBox.left,
                top: targetBox.top - containerBox.top,
                width: targetBox.width,
                height: targetBox.height,
            });
        };

        const frameId = window.requestAnimationFrame(update);

        const container = containerRef.current;
        const target = itemRefs.current[targetKey];

        let resizeObserver: ResizeObserver | null = null;

        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                update();
            });

            if (container) resizeObserver.observe(container);
            if (target) resizeObserver.observe(target);
        }

        window.addEventListener("resize", update);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", update);
            resizeObserver?.disconnect();
        };
    }, [targetKey, dependencyKey]);

    return {
        containerRef,
        itemRefs,
        pillStyle,
        targetKey,
    };
}

const actionButtonBase =
    "relative inline-flex h-11 items-center justify-center rounded-2xl border text-sm font-bold transition-[background-color,border-color,box-shadow,transform] duration-700 ease-in-out active:scale-[0.96] active:translate-y-0";
const glassButtonLight =
    "border-white/80 bg-transparent text-slate-800 hover:bg-white/20";
const glassButtonDark =
    "border-white/12 bg-transparent text-slate-100 hover:bg-white/15";

const loginButtonClass = `${actionButtonBase} overflow-hidden px-4`;
const iconButtonClass = `${actionButtonBase} w-11 min-w-11 px-0`;

const loginOverlay =
    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_62%)]";
const loginShine =
    "pointer-events-none absolute inset-y-0 left-[-35%] w-[42%] -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-[left,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:left-[130%] group-hover:opacity-100";

function MenuIcon({
    open,
    className = "",
}: {
    open: boolean;
    className?: string;
}) {
    return (
        <span className={`relative block h-5 w-5 ${className}`}>
            <svg
                viewBox="0 0 24 24"
                className={`absolute inset-0 h-5 w-5 transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "scale-75 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
            </svg>

            <svg
                viewBox="0 0 24 24"
                className={`absolute inset-0 h-5 w-5 transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "scale-100 opacity-100 rotate-0" : "scale-75 opacity-0 -rotate-90"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
            </svg>
        </span>
    );
}

function HeaderNav({
    navItems,
    activeKey,
    isDark,
}: {
    navItems: HeaderNavItem[];
    activeKey: string;
    isDark: boolean;
}) {
    const [hoveredNav, setHoveredNav] = useState<string | null>(null);

    const navDependencyKey = useMemo(
        () => navItems.map((item) => `${item.key}:${item.label}:${item.href}`).join("|"),
        [navItems]
    );

    const {
        containerRef: navContainerRef,
        itemRefs: navItemRefs,
        pillStyle: navPillStyle,
        targetKey: navTargetKey,
    } = useSlidingBackground(activeKey, hoveredNav, navDependencyKey);

    return (
        <div
            ref={navContainerRef}
            className="relative flex flex-nowrap items-center gap-2"
            onMouseLeave={() => setHoveredNav(null)}
        >
            {navPillStyle && (
                <span
                    className="pointer-events-none absolute rounded-full bg-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-[left,top,width,height] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={navPillStyle}
                />
            )}

            {navItems.map((item) => {
                const isActive = navTargetKey === item.key;
                const className = `relative z-10 inline-flex shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    isActive
                        ? "text-white"
                        : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-500 hover:text-slate-900"
                }`;

                if (item.href.startsWith("#")) {
                    return (
                        <a
                            key={item.key}
                            href={item.href}
                            className={className}
                            onMouseEnter={() => setHoveredNav(item.key)}
                            ref={(el) => {
                                navItemRefs.current[item.key] = el;
                            }}
                        >
                            {item.label}
                        </a>
                    );
                }

                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={className}
                        onMouseEnter={() => setHoveredNav(item.key)}
                        ref={(el) => {
                            navItemRefs.current[item.key] = el;
                        }}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </div>
    );
}

export function SiteHeader({
    brand,
    navItems,
    activeKey,
    loginLabel,
    loginHref,
    logoutLabel,
    accountMenuItems = [],
    isDark,
    rightSlot,
}: {
    brand: string;
    navItems: HeaderNavItem[];
    activeKey: string;
    loginLabel: string;
    loginHref: string;
    logoutLabel: string;
    accountMenuItems?: AccountMenuItem[];
    isDark: boolean;
    rightSlot?: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileAccountMode, setMobileAccountMode] = useState(false);
    const { user, logout } = useAuth();
    const homeHref = navItems.find((item) => item.key === "home")?.href ?? "/";

    useBodyScrollLock(mobileOpen);

    useEffect(() => {
        const closeOnResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileOpen(false);
                setMobileAccountMode(false);
            }
        };

        window.addEventListener("resize", closeOnResize);
        return () => window.removeEventListener("resize", closeOnResize);
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;

        const close = () => {
            setMobileOpen(false);
            setMobileAccountMode(false);
        };
        window.addEventListener("hashchange", close);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("hashchange", close);
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileOpen]);

    const handleLogout = async () => {
        await logout();
        setMobileOpen(false);
        setMobileAccountMode(false);
    };

    const buttonTone = isDark ? glassButtonDark : glassButtonLight;
    const accountChipClass = isDark
        ? "border-white/10 bg-slate-900 text-slate-100"
        : "border-slate-200 bg-white text-slate-800";
    const accountDropdownClass = isDark
        ? "border-white/10 bg-slate-950/96 text-slate-100 shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
        : "border-slate-200 bg-white/96 text-slate-900 shadow-[0_24px_50px_rgba(15,23,42,0.16)]";
    const accountItemClass = isDark
        ? "text-slate-200 hover:bg-white/10 hover:text-white"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950";
    const mobileMenuItems = mobileAccountMode && user ? accountMenuItems : navItems;
    const mobileAccountHref = accountMenuItems[0]?.href ?? loginHref;

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
                    isDark
                        ? "border-b border-white/10 bg-slate-950/72 backdrop-blur-xl"
                        : "border-b border-white/60 bg-white/72 backdrop-blur-xl"
                }`}
            >
                <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
                    <div className="lg:hidden">
                        <div className="flex items-start justify-between gap-3">
                            <Link href={homeHref} className="flex min-w-0 items-center gap-2 font-black text-lg">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-xs text-white shadow-lg">
                                    BW
                                </div>
                                <span className="truncate">{brand}</span>
                            </Link>

                            <div className="flex shrink-0 items-start gap-2">
                                <div className="[&>button]:h-9 [&>button]:w-9">
                                    <ThemeToggle />
                                </div>
                                <div className="[&>div]:h-9 [&_button]:h-9 [&_button]:min-w-9 [&_button]:px-2 [&_button]:text-[11px]">
                                    {rightSlot}
                                </div>
                                {user ? (
                                    <Link
                                        href={mobileAccountHref}
                                        className={`grid h-9 w-9 place-items-center rounded-full border text-xs font-black ${
                                            isDark
                                                ? "border-white/10 bg-slate-900 text-slate-100"
                                                : "border-slate-200 bg-white text-slate-800"
                                        }`}
                                        aria-label={user.id}
                                    >
                                        {user.id.slice(0, 1).toUpperCase()}
                                    </Link>
                                ) : (
                                    <Link
                                        href={loginHref}
                                        className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.24)]"
                                        aria-label={loginLabel}
                                    >
                                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21a8 8 0 0 0-16 0" />
                                            <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <nav className="mt-2 flex items-end gap-4 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {navItems.map((item) => {
                                const isActive = activeKey === item.key;
                                const className = `relative shrink-0 px-1 pb-1 pt-2 text-[13px] font-black leading-none transition-colors ${
                                    isActive
                                        ? "text-blue-600"
                                        : isDark
                                          ? "text-slate-200"
                                          : "text-slate-950"
                                }`;

                                const activeBar = isActive ? (
                                    <span className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-blue-600" />
                                ) : null;

                                if (item.href.startsWith("#")) {
                                    return (
                                        <a key={item.key} href={item.href} className={className}>
                                            <span>{item.label}</span>
                                            {activeBar}
                                        </a>
                                    );
                                }

                                return (
                                    <Link key={item.key} href={item.href} className={className}>
                                        <span>{item.label}</span>
                                        {activeBar}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="relative hidden items-center justify-between gap-3 lg:flex">
                        <div className="flex min-w-0 flex-1 items-center">
                            <div
                                className={`transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    mobileOpen
                                        ? "pointer-events-none opacity-0 -translate-y-1"
                                        : "opacity-100 translate-y-0"
                                } lg:pointer-events-auto lg:opacity-100 lg:translate-y-0`}
                            >
                                <Link href={homeHref} className="flex min-w-0 items-center gap-3 font-black text-lg sm:text-xl">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg sm:h-11 sm:w-11">
                                        BW
                                    </div>
                                    <span className="truncate">{brand}</span>
                                </Link>
                            </div>

                            <div
                                className={`absolute left-0 flex items-center gap-2 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
                                    mobileOpen
                                        ? "pointer-events-auto opacity-100 translate-y-0"
                                        : "pointer-events-none opacity-0 -translate-y-1"
                                }`}
                            >
                                {user ? (
                                    <button
                                        type="button"
                                        onClick={() => setMobileAccountMode((prev) => !prev)}
                                        className={`inline-flex h-11 max-w-[180px] items-center gap-2 rounded-2xl border px-4 text-sm font-bold transition ${accountChipClass}`}
                                        aria-expanded={mobileAccountMode}
                                    >
                                        <span className="truncate">{user.id}</span>
                                        <svg
                                            viewBox="0 0 20 20"
                                            className={`h-4 w-4 transition-transform duration-300 ${mobileAccountMode ? "rotate-180" : ""}`}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M5 8l5 5 5-5" />
                                        </svg>
                                    </button>
                                ) : (
                                    <Link
                                        href={loginHref}
                                        className={`group ${loginButtonClass} border-blue-600 bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] active:scale-[0.96] active:shadow-[0_6px_14px_rgba(37,99,235,0.24)]`}
                                    >
                                        <span className={loginOverlay} />
                                        <span className={loginShine} />
                                        <span className="relative z-10">{loginLabel}</span>
                                    </Link>
                                )}

                                {rightSlot}
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <HeaderNav navItems={navItems} activeKey={activeKey} isDark={isDark} />
                            </div>
                        </div>

                        <div className="hidden flex-1 justify-end lg:flex">
                            <div className="flex shrink-0 items-center gap-2">
                                <ThemeToggle />

                                {user ? (
                                    <div className="group relative">
                                        <button
                                            type="button"
                                            className={`inline-flex h-11 max-w-[190px] items-center gap-2 rounded-2xl border px-4 text-sm font-bold transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${accountChipClass}`}
                                            aria-haspopup="menu"
                                        >
                                            <span className="truncate">{user.id}</span>
                                            <svg
                                                viewBox="0 0 20 20"
                                                className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 8l5 5 5-5" />
                                            </svg>
                                        </button>
                                        <span className="absolute right-0 top-full block h-3 w-56" aria-hidden="true" />
                                        <div
                                            className={`pointer-events-none absolute right-0 top-[calc(100%+8px)] z-[70] w-56 rounded-[22px] border p-2 opacity-0 backdrop-blur-xl will-change-[opacity] transition-opacity duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 ${accountDropdownClass}`}
                                            role="menu"
                                        >
                                            {accountMenuItems.map((item) => (
                                                <Link
                                                    key={item.key}
                                                    href={item.href}
                                                    className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${accountItemClass}`}
                                                    role="menuitem"
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => void handleLogout()}
                                                className={`mt-1 block w-full rounded-2xl px-4 py-3 text-left text-sm font-black transition ${accountItemClass}`}
                                                role="menuitem"
                                            >
                                                {logoutLabel}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href={loginHref}
                                        className={`group ${loginButtonClass} ${
                                            isDark
                                                ? "border-white/10 bg-slate-900 text-slate-100 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                                                : "border-slate-200 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                                        }`}
                                    >
                                        <span className={loginOverlay} />
                                        <span className={loginShine} />
                                        <span className="relative z-10">{loginLabel}</span>
                                    </Link>
                                )}

                                {rightSlot}
                            </div>
                        </div>

                        <div className="flex flex-1 justify-end lg:hidden">
                            <div className="flex items-center gap-2">
                                <ThemeToggle />

                                <button
                                    type="button"
                                    aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
                                    onClick={() => setMobileOpen((prev) => !prev)}
                                    className={`${iconButtonClass} ${buttonTone} shadow-[0_10px_28px_rgba(15,23,42,0.10)]`}
                                >
                                    <MenuIcon open={mobileOpen} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="h-[93px] lg:h-[77px]" aria-hidden="true" />

            <div
                onClick={() => {
                    setMobileOpen(false);
                    setMobileAccountMode(false);
                }}
                className={`fixed inset-0 z-40 backdrop-blur-md bg-slate-950/24 lg:hidden transition-opacity ease-out ${
                    mobileOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
                style={{ transitionDuration: mobileOpen ? "320ms" : "200ms" }}
                aria-hidden="true"
            />

            <div
                className={`fixed inset-x-0 top-[93px] z-50 will-change-transform lg:hidden ${
                    mobileOpen
                        ? "pointer-events-auto"
                        : "pointer-events-none"
                }`}
                style={{
                    transform: mobileOpen ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.97)",
                    opacity: mobileOpen ? 1 : 0,
                    transition: mobileOpen
                        ? "transform 380ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms cubic-bezier(0.22, 1, 0.36, 1)"
                        : "transform 220ms cubic-bezier(0.55, 0, 1, 0.45), opacity 180ms ease-in",
                }}
            >
                <div className="mx-auto w-full max-w-7xl">
                    <div className="rounded-b-[28px] px-0 pb-2 pt-3 bg-transparent">
                        <nav className="grid gap-4 px-3 pt-2 sm:px-4">
                            {mobileMenuItems.map((item, index) => {
                                const isActive = activeKey === item.key;
                                const className = `rounded-[24px] px-5 py-4 text-base font-extrabold backdrop-blur-2xl transition-colors duration-150 ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)]"
                                        : isDark
                                          ? "border border-white/12 bg-white/8 text-slate-50 shadow-[0_10px_24px_rgba(15,23,42,0.14)] hover:bg-white/12"
                                          : "border border-white/70 bg-white/34 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:bg-white/48"
                                }`;

                                const style = {
                                    transform: mobileOpen ? "translateY(0)" : "translateY(6px)",
                                    opacity: mobileOpen ? 1 : 0,
                                    transition: mobileOpen
                                        ? `transform 400ms cubic-bezier(0.22, 1, 0.36, 1) ${50 + index * 35}ms, opacity 300ms ease-out ${50 + index * 35}ms`
                                        : "transform 150ms ease-in, opacity 120ms ease-in",
                                };

                                if (item.href.startsWith("#")) {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            className={className}
                                            style={style}
                                            onClick={() => {
                                                setMobileOpen(false);
                                                setMobileAccountMode(false);
                                            }}
                                        >
                                            {item.label}
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className={className}
                                        style={style}
                                        onClick={() => {
                                            setMobileOpen(false);
                                            setMobileAccountMode(false);
                                        }}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            {mobileAccountMode && user ? (
                                <button
                                    type="button"
                                    onClick={() => void handleLogout()}
                                    className={`rounded-[24px] px-5 py-4 text-left text-base font-extrabold backdrop-blur-2xl transition-colors duration-150 ${
                                        isDark
                                            ? "border border-white/12 bg-white/8 text-slate-50 shadow-[0_10px_24px_rgba(15,23,42,0.14)] hover:bg-white/12"
                                            : "border border-white/70 bg-white/34 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:bg-white/48"
                                    }`}
                                    style={{
                                        transform: mobileOpen ? "translateY(0)" : "translateY(6px)",
                                        opacity: mobileOpen ? 1 : 0,
                                        transition: mobileOpen
                                            ? `transform 400ms cubic-bezier(0.22, 1, 0.36, 1) ${50 + mobileMenuItems.length * 35}ms, opacity 300ms ease-out ${50 + mobileMenuItems.length * 35}ms`
                                            : "transform 150ms ease-in, opacity 120ms ease-in",
                                    }}
                                >
                                    {logoutLabel}
                                </button>
                            ) : null}
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}
