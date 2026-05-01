"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type BluewolfScrollAreaProps = {
    children: ReactNode;
    className?: string;
    thumbClassName?: string;
};

export function BluewolfScrollArea({
    children,
    className = "",
    thumbClassName = "",
}: BluewolfScrollAreaProps) {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [thumb, setThumb] = useState({ top: 12, height: 56, visible: false });

    const updateThumb = () => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const { clientHeight, scrollHeight, scrollTop } = scrollElement;
        const visible = scrollHeight > clientHeight + 1;
        if (!visible) {
            setThumb((current) => (current.visible ? { ...current, visible: false } : current));
            return;
        }

        const trackPadding = 12;
        const trackHeight = Math.max(0, clientHeight - trackPadding * 2);
        const height = Math.max(56, (clientHeight / scrollHeight) * trackHeight);
        const maxTop = trackPadding + Math.max(0, trackHeight - height);
        const scrollRatio = scrollTop / Math.max(1, scrollHeight - clientHeight);
        const top = trackPadding + (maxTop - trackPadding) * scrollRatio;

        setThumb({ top, height, visible });
    };

    useEffect(() => {
        const frameId = window.requestAnimationFrame(updateThumb);
        window.addEventListener("resize", updateThumb);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateThumb);
        };
    });

    return (
        <div className="relative">
            <div
                ref={scrollRef}
                onScroll={updateThumb}
                className={`overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
            >
                {children}
            </div>
            {thumb.visible ? (
                <span
                    className={`pointer-events-none absolute right-3 w-1.5 rounded-full bg-blue-600 ${thumbClassName}`}
                    style={{
                        top: thumb.top,
                        height: thumb.height,
                    }}
                />
            ) : null}
        </div>
    );
}
