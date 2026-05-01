"use client";

import Image from "next/image";
import { CameraIcon, CommentIcon, PinIcon, ThumbIcon } from "@/components/ui/SafeIcons";
import { type CommunityItem, type Locale } from "@/lib/bluewolf-data";
import { formatRelativeCommunityTime } from "@/lib/community-time";

function ReviewStars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
                <svg
                    key={index}
                    className={`h-3.5 w-3.5 ${index < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export function CommunityReviewCard({
    item,
    isDark,
    locale,
    onClick,
}: {
    item: CommunityItem;
    isDark: boolean;
    locale: Locale;
    onClick: () => void;
}) {
    const photos = item.photos ?? [];
    const cardBg = isDark ? "border-white/10 bg-slate-950 hover:bg-slate-900" : "border-slate-200 bg-slate-50 hover:bg-white";

    return (
        <article
            role="button"
            tabIndex={0}
            className={`flex h-full cursor-pointer flex-col rounded-[22px] border p-5 transition-[transform,background-color,box-shadow] duration-700 ease-in-out hover:shadow-md ${cardBg}`}
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
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                        {item.author[0]}
                    </div>
                    <div>
                        <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{item.author}</p>
                        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {formatRelativeCommunityTime(item.date, locale)}
                        </p>
                    </div>
                </div>
                {item.rating ? <ReviewStars rating={item.rating} /> : null}
            </div>

            {item.tourTitle ? (
                <p className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    <PinIcon className="h-3.5 w-3.5" />
                    {item.tourTitle}
                </p>
            ) : null}

            <div className="flex-1">
                <p className={`mt-2 line-clamp-4 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.text}</p>

                {photos.length ? (
                    <div className={`mt-3 grid gap-1.5 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
                        {photos.slice(0, 3).map((photo, index) => (
                            <div key={`${item.id}-${index}`} className="relative aspect-square overflow-hidden rounded-[10px]">
                                <Image
                                    src={photo}
                                    alt={item.tourTitle ?? item.author}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 180px"
                                    className="object-cover"
                                />
                                {index === 2 && photos.length > 3 ? (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/50">
                                        <span className="text-sm font-black text-white">+{photos.length - 3}</span>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className={`mt-3 flex items-center gap-3 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                <span className="inline-flex items-center gap-1"><ThumbIcon className="h-3.5 w-3.5" />{item.likes}</span>
                <span className="inline-flex items-center gap-1"><CommentIcon className="h-3.5 w-3.5" />{item.comments?.length ?? 0}</span>
                {photos.length ? <span className="inline-flex items-center gap-1"><CameraIcon className="h-3.5 w-3.5" />{photos.length}</span> : null}
            </div>
        </article>
    );
}
