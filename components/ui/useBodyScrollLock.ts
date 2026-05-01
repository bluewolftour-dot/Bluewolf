"use client";

import { useEffect } from "react";

let lockCount = 0;
let originalBodyOverflow = "";
let originalBodyPaddingRight = "";
let originalHtmlOverflow = "";

export function useBodyScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return;

        const body = document.body;
        const html = document.documentElement;

        if (lockCount === 0) {
            originalBodyOverflow = body.style.overflow;
            originalBodyPaddingRight = body.style.paddingRight;
            originalHtmlOverflow = html.style.overflow;

            const scrollbarWidth = window.innerWidth - html.clientWidth;
            body.style.overflow = "hidden";
            html.style.overflow = "hidden";

            if (scrollbarWidth > 0) {
                body.style.paddingRight = originalBodyPaddingRight
                    ? `calc(${originalBodyPaddingRight} + ${scrollbarWidth}px)`
                    : `${scrollbarWidth}px`;
            }
        }

        lockCount += 1;

        return () => {
            lockCount = Math.max(0, lockCount - 1);

            if (lockCount === 0) {
                body.style.overflow = originalBodyOverflow;
                body.style.paddingRight = originalBodyPaddingRight;
                html.style.overflow = originalHtmlOverflow;
            }
        };
    }, [locked]);
}
