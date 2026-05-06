"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
            <h2 className="text-3xl font-black text-slate-900">문제가 발생했습니다.</h2>
            <p className="mt-4 text-slate-600">
                페이지를 불러오는 중 예상치 못한 오류가 발생했습니다.
            </p>
            <div className="mt-10 flex gap-4">
                <button
                    onClick={() => reset()}
                    className="h-12 rounded-2xl bg-blue-600 px-8 text-sm font-black text-white"
                >
                    다시 시도
                </button>
                <Link
                    href="/"
                    className="flex h-12 items-center rounded-2xl border border-slate-200 px-8 text-sm font-black text-slate-900"
                >
                    홈으로 이동
                </Link>
            </div>
        </div>
    );
}
