"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { useCmsTourThemes } from "@/lib/use-cms-tour-themes";
import { useCmsTours } from "@/lib/use-cms-tours";
import { withLocaleQuery } from "@/lib/locale-routing";
import { formatPrice } from "@/lib/bluewolf-utils";

export default function ThemeLandingPage() {
    return (
        <PageShell activeKey="tours">
            <ThemeLandingContent />
        </PageShell>
    );
}

function ThemeLandingContent() {
    const params = useParams<{ theme: string }>();
    const { isDark, lang } = usePage();
    const { tourThemesContent } = useCmsTourThemes(lang);
    const { tourItems } = useCmsTours();
    const theme = tourThemesContent.themes.find((item) => item.key === params.theme) ?? tourThemesContent.themes[0];
    const items = tourItems.filter((tour) => tour.theme === theme.key);
    const panel = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white";
    const card = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";

    return (
        <>
            <section className={`rounded-[32px] border p-8 ${panel}`}>
                <p className="text-sm font-black text-blue-500">Theme</p>
                <h1 className={`mt-2 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-950"}`}>
                    {theme.label[lang]}
                </h1>
                <p className={`mt-4 max-w-3xl leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {lang === "ko"
                        ? "선택한 테마에 맞는 여행 상품을 모아 보여드립니다."
                        : lang === "ja"
                          ? "選択したテーマに合うツアーをまとめて確認できます。"
                          : "Browse tours that match this travel theme."}
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((tour) => (
                    <Link key={tour.id} href={withLocaleQuery(`/tours/${tour.id}`, lang)} className={`rounded-[28px] border p-6 transition hover:border-blue-400 ${card}`}>
                        <p className="text-sm font-black text-blue-500">{tour.duration[lang]}</p>
                        <h2 className={`mt-2 text-xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>{tour.title[lang]}</h2>
                        <p className={`mt-3 line-clamp-3 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{tour.desc[lang]}</p>
                        <p className="mt-4 text-lg font-black text-blue-500">{formatPrice(tour.price)}</p>
                    </Link>
                ))}
            </section>
        </>
    );
}
