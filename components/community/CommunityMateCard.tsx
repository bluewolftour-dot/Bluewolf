"use client";

import Link from "next/link";
import { CommentIcon, ThumbIcon } from "@/components/ui/SafeIcons";
import { type CommunityItem, type Locale } from "@/lib/bluewolf-data";
import { formatRelativeCommunityTime } from "@/lib/community-time";

export function CommunityMateCard({
    item,
    isDark,
    locale,
    peopleLabel,
    recruitingLabel,
    fullLabel,
    applyLabel,
    appliedLabel,
    applied,
    tourHref,
    viewTourLabel,
    onClick,
    onApply,
}: {
    item: CommunityItem;
    isDark: boolean;
    locale: Locale;
    peopleLabel: string;
    recruitingLabel: string;
    fullLabel: string;
    applyLabel: string;
    appliedLabel: string;
    applied: boolean;
    tourHref: string;
    viewTourLabel: string;
    onClick: () => void;
    onApply: () => void;
}) {
    const isFull = (item.currentPeople ?? 0) >= (item.maxPeople ?? 1);
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
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">
                        {item.author[0]}
                    </div>
                    <div>
                        <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{item.author}</p>
                        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {formatRelativeCommunityTime(item.date, locale)}
                        </p>
                    </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${
                    isFull
                        ? isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                        : isDark ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                }`}>
                    {isFull ? fullLabel : recruitingLabel}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {item.tourTitle ? (
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${isDark ? "border-blue-500/30 text-blue-400" : "border-blue-200 text-blue-600"}`}>
                        {item.tourTitle}
                    </span>
                ) : null}
                {item.travelDate ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${isDark ? "border-slate-600 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-12 9h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
                        </svg>
                        {item.travelDate}
                    </span>
                ) : null}
                {item.travelRegion ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${isDark ? "border-slate-600 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 1.75a5.75 5.75 0 00-5.75 5.75c0 4.02 4.62 9.23 5.15 9.82a.75.75 0 001.1 0c.53-.59 5.15-5.8 5.15-9.82A5.75 5.75 0 0010 1.75zm0 7.5A1.75 1.75 0 1110 5.75a1.75 1.75 0 010 3.5z" />
                        </svg>
                        {item.travelRegion}
                    </span>
                ) : null}
            </div>

            {item.maxPeople ? (
                <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                            {item.currentPeople}/{item.maxPeople}{peopleLabel}
                        </span>
                        <span className={`font-bold ${isFull ? isDark ? "text-slate-400" : "text-slate-500" : isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                            {isFull ? fullLabel : `${item.maxPeople - (item.currentPeople ?? 0)}${peopleLabel} ${recruitingLabel}`}
                        </span>
                    </div>
                    <div className={`h-1.5 w-full overflow-hidden rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                        <div
                            className={`h-full rounded-full transition-all ${isFull ? "bg-slate-400" : "bg-emerald-500"}`}
                            style={{ width: `${((item.currentPeople ?? 0) / item.maxPeople) * 100}%` }}
                        />
                    </div>
                </div>
            ) : null}

            <p className={`mt-3 line-clamp-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.text}</p>

            <div className={`mt-3 flex items-center gap-3 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <span className="inline-flex items-center gap-1"><ThumbIcon className="h-3.5 w-3.5" />{item.likes}</span>
                <span className="inline-flex items-center gap-1"><CommentIcon className="h-3.5 w-3.5" />{item.comments?.length ?? 0}</span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onApply();
                    }}
                    disabled={applied || isFull}
                    className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
                        applied
                            ? isDark
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-emerald-50 text-emerald-700"
                            : isFull
                              ? isDark
                                  ? "bg-slate-800 text-slate-500"
                                  : "bg-slate-100 text-slate-400"
                              : "bg-violet-600 text-white hover:bg-violet-500"
                    }`}
                >
                    {applied ? appliedLabel : isFull ? fullLabel : applyLabel}
                </button>
                <Link
                    href={tourHref}
                    onClick={(event) => event.stopPropagation()}
                    className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
                        isDark
                            ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                    {viewTourLabel}
                </Link>
            </div>
        </article>
    );
}
