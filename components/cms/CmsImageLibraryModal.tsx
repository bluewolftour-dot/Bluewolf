"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";

export function CmsImageLibraryModal({
    isDark,
    onSelect,
    onClose,
}: {
    isDark: boolean;
    onSelect: (path: string) => void;
    onClose: () => void;
}) {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useBodyScrollLock(true);

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch("/api/cms/images");
                const data = await response.json();
                if (data.images) {
                    setImages(data.images);
                }
            } catch (err) {
                console.error("Failed to load image library:", err);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    const filteredImages = images.filter((img) => 
        img.toLowerCase().includes(search.toLowerCase())
    );

    const panelTone = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900";
    const fieldTone = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-950";

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md sm:p-10 bg-black/50">
            <button type="button" onClick={onClose} className="absolute inset-0 cursor-default" />
            <div className={`relative z-10 flex h-full max-h-[800px] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border shadow-2xl ${panelTone}`}>
                <header className="flex items-center justify-between border-b border-current/10 px-6 py-5">
                    <div>
                        <h2 className="type-title-md">이미지 라이브러리</h2>
                        <p className="mt-1 text-xs font-bold opacity-60">서버에 저장된 기존 이미지를 선택합니다.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`h-10 rounded-xl px-4 text-sm font-bold ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}
                    >
                        닫기
                    </button>
                </header>

                <div className="border-b border-current/10 px-6 py-4">
                    <input
                        type="text"
                        placeholder="이미지 파일명 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`h-11 w-full rounded-xl border px-4 text-sm font-bold outline-none focus:border-blue-500 ${fieldTone}`}
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <p className="animate-pulse text-sm font-bold">이미지 목록을 불러오는 중...</p>
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="flex h-40 flex-col items-center justify-center text-center">
                            <p className="text-sm font-bold opacity-60">검색 결과가 없거나 업로드된 이미지가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {filteredImages.map((src) => (
                                <button
                                    key={src}
                                    type="button"
                                    onClick={() => {
                                        onSelect(src);
                                        onClose();
                                    }}
                                    className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border transition-all hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 ${isDark ? "border-white/5 bg-slate-950" : "border-slate-200 bg-slate-50"}`}
                                >
                                    <Image
                                        src={src}
                                        alt="Gallery image"
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110"
                                        sizes="(max-width: 640px) 50vw, 200px"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <p className="truncate text-[10px] font-bold text-white">{src.split("/").pop()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
