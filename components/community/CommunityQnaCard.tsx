"use client";

import { CommentIcon, ThumbIcon } from "@/components/ui/SafeIcons";
import { type CommunityItem, type Locale } from "@/lib/bluewolf-data";
import { formatRelativeCommunityTime } from "@/lib/community-time";

export function CommunityQnaCard({
    item,
    isDark,
    locale,
    answeredLabel,
    unansweredLabel,
    onClick,
}: {
    item: CommunityItem;
    isDark: boolean;
    locale: Locale;
    answeredLabel: string;
    unansweredLabel: string;
    onClick: () => void;
}) {
    const cardBg = isDark ? "border-white/10 bg-slate-950 hover:bg-slate-900" : "border-slate-200 bg-slate-50 hover:bg-white";

    return (
        <article
            role="button"
            tabIndex={0}
            className={`cursor-pointer rounded-[22px] border p-5 transition-[transform,background-color,box-shadow] duration-700 ease-in-out hover:shadow-md ${cardBg}`}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            }}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">
                    Q
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-black leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
                            {item.author}
                        </p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                            item.answered
                                ? isDark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                                : isDark ? "bg-amber-900/40 text-amber-400" : "bg-amber-50 text-amber-700"
                        }`}>
                            {item.answered ? `A · ${answeredLabel}` : `Q · ${unansweredLabel}`}
                        </span>
                    </div>
                    <p className={`mt-1.5 line-clamp-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.text}</p>
                    <div className={`mt-3 flex items-center gap-3 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        <span>{formatRelativeCommunityTime(item.date, locale)}</span>
                        <span className="inline-flex items-center gap-1"><ThumbIcon className="h-3.5 w-3.5" />{item.likes}</span>
                        <span className="inline-flex items-center gap-1"><CommentIcon className="h-3.5 w-3.5" />{item.comments?.length ?? 0}</span>
                    </div>
                </div>
            </div>
            {item.answered && item.comments && item.comments.length > 0 ? (
                <div className={`mt-3 flex gap-2.5 rounded-[14px] border p-3 ${isDark ? "border-blue-500/20 bg-blue-500/5" : "border-blue-100 bg-blue-50"}`}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">A</div>
                    <p className={`line-clamp-2 text-xs leading-5 ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                        {item.comments[0].text}
                    </p>
                </div>
            ) : null}
        </article>
    );
}
