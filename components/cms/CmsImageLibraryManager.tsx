"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ImageUsage = {
    area: string;
    label: string;
};

type PendingDelete = {
    path: string;
    usages: ImageUsage[];
};

type LibraryImage = {
    path: string;
    usages: ImageUsage[];
};

export function CmsImageLibraryManager({ isDark }: { isDark: boolean }) {
    const [images, setImages] = useState<LibraryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [deletingPath, setDeletingPath] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

    const panelTone = isDark ? "border-white/10 bg-slate-950/70" : "border-slate-200 bg-slate-50";
    const cardTone = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white";
    const inputTone = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-900";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";

    const filteredImages = useMemo(
        () =>
            images.filter((image) => {
                const keyword = search.trim().toLowerCase();
                if (!keyword) return true;
                const usageText = image.usages.map((usage) => `${usage.area} ${usage.label}`).join(" ");
                return `${image.path} ${usageText}`.toLowerCase().includes(keyword);
            }),
        [images, search]
    );

    async function loadImages() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/cms/images", { cache: "no-store" });
            if (!response.ok) throw new Error("IMAGE_LIST_FAILED");
            const data = (await response.json()) as {
                images?: string[];
                imageRecords?: LibraryImage[];
            };
            setImages(
                data.imageRecords ??
                    (data.images ?? []).map((image) => ({ path: image, usages: [] }))
            );
        } catch {
            setError("이미지 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }

    async function requestDelete(path: string, force = false) {
        setDeletingPath(path);
        setError(null);
        try {
            const response = await fetch("/api/cms/images", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path, force }),
            });
            const data = (await response.json().catch(() => ({}))) as {
                error?: string;
                usages?: ImageUsage[];
            };

            if (response.status === 409 && data.error === "IMAGE_IN_USE") {
                setPendingDelete({ path, usages: data.usages ?? [] });
                return;
            }

            if (!response.ok) throw new Error(data.error ?? "IMAGE_DELETE_FAILED");

            setImages((current) => current.filter((image) => image.path !== path));
            setPendingDelete(null);
        } catch {
            setError("이미지를 삭제하지 못했습니다.");
        } finally {
            setDeletingPath(null);
        }
    }

    useEffect(() => {
        void loadImages();
    }, []);

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">이미지 라이브러리</h2>
                    <p className={`mt-1 text-sm ${mutedTone}`}>
                        CMS에 업로드된 이미지를 확인하고 스토리지에서 삭제할 수 있습니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void loadImages()}
                    className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                        isDark ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                >
                    새로고침
                </button>
            </div>

            <div className={`rounded-[24px] border p-4 ${panelTone}`}>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="파일명 또는 경로 검색"
                    className={`h-12 w-full rounded-2xl border px-4 text-sm font-bold outline-none focus:border-blue-500 ${inputTone}`}
                />
            </div>

            {error ? (
                <p className={`rounded-2xl px-3 py-2 text-xs font-bold ${isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
                    {error}
                </p>
            ) : null}

            {loading ? (
                <p className={`text-sm ${mutedTone}`}>이미지 목록을 불러오는 중입니다...</p>
            ) : null}

            {!loading && filteredImages.length === 0 ? (
                <div className={`rounded-[24px] border border-dashed p-8 text-center text-sm ${isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                    표시할 이미지가 없습니다.
                </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredImages.map((image) => (
                    <article key={image.path} className={`overflow-hidden rounded-[24px] border ${cardTone}`}>
                        <div className="relative aspect-[16/10] bg-slate-100">
                            <Image src={image.path} alt="" fill className="object-cover" sizes="(max-width: 1280px) 50vw, 320px" />
                        </div>
                        <div className="space-y-3 p-4">
                            <div>
                                <p className={`text-[11px] font-black ${mutedTone}`}>적용 위치</p>
                                {image.usages.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {image.usages.slice(0, 4).map((usage, index) => (
                                            <span
                                                key={`${usage.area}-${usage.label}-${index}`}
                                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                    isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {usage.area} · {usage.label}
                                            </span>
                                        ))}
                                        {image.usages.length > 4 ? (
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                                                +{image.usages.length - 4}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm font-bold text-amber-500">현재 CMS에 적용되지 않음</p>
                                )}
                            </div>
                            <p className={`truncate text-[11px] font-bold ${mutedTone}`} title={image.path}>
                                {image.path.split("/").pop()}
                            </p>
                            <button
                                type="button"
                                onClick={() => void requestDelete(image.path)}
                                disabled={deletingPath === image.path}
                                className={`w-full rounded-2xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-60 ${
                                    isDark ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                }`}
                            >
                                {deletingPath === image.path ? "삭제 중..." : "스토리지에서 삭제"}
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {pendingDelete ? (
                <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className={`w-full max-w-lg rounded-[28px] border p-5 shadow-2xl ${isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}>
                        <h3 className="text-lg font-black">이미지가 사용 중입니다</h3>
                        <p className={`mt-2 text-sm leading-6 ${mutedTone}`}>
                            아래 위치에서 이 이미지가 적용되어 있습니다. 삭제하면 해당 화면의 이미지가 깨질 수 있습니다. 정말 삭제할까요?
                        </p>
                        <div className={`mt-4 max-h-48 overflow-y-auto rounded-2xl border p-3 text-sm ${isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"}`}>
                            {pendingDelete.usages.map((usage, index) => (
                                <p key={`${usage.area}-${usage.label}-${index}`} className="py-1">
                                    <span className="font-black">{usage.area}</span> · {usage.label}
                                </p>
                            ))}
                        </div>
                        <div className="mt-5 flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setPendingDelete(null)}
                                className={`rounded-2xl px-4 py-2 text-sm font-bold ${isDark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-900"}`}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={() => void requestDelete(pendingDelete.path, true)}
                                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-700"
                            >
                                그래도 삭제
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
