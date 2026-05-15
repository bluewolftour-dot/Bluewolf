import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
            <h1 className="text-8xl font-black text-slate-200">404</h1>
            <h2 className="type-title-lg mt-4 text-slate-900">페이지를 찾을 수 없습니다.</h2>
            <p className="mt-4 text-slate-600">
                요청하신 페이지가 삭제되었거나 주소가 올바르지 않습니다.
            </p>
            <Link
                href="/"
                className="mt-10 flex h-12 items-center rounded-2xl bg-blue-600 px-8 text-sm font-black text-white"
            >
                홈으로 이동
            </Link>
        </div>
    );
}
