"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollRestorer() {
    const pathname = usePathname();
    const prevPathname = useRef(pathname);
    const isPopRef = useRef(false);
    const pathnameRef = useRef(pathname);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // 스크롤 할 때마다 현재 위치 저장 (debounce)
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const onScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                sessionStorage.setItem(`_scroll:${pathnameRef.current}`, String(window.scrollY));
            }, 100);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    // popstate(뒤로/앞으로) 감지
    useEffect(() => {
        history.scrollRestoration = "manual";
        const onPopState = () => {
            isPopRef.current = true;
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    // pathname 변경 시 paint 직전 스크롤 처리
    useLayoutEffect(() => {
        if (pathname === prevPathname.current) return;
        prevPathname.current = pathname;

        if (isPopRef.current) {
            isPopRef.current = false;
            const saved = sessionStorage.getItem(`_scroll:${pathname}`);
            window.scrollTo(0, saved ? parseInt(saved, 10) : 0);
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
