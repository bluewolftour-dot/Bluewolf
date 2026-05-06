"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { regionLandingContent } from "@/lib/site-structure";
import { useCmsTours } from "@/lib/use-cms-tours";
import { formatPrice } from "@/lib/bluewolf-utils";
import { withLocaleQuery } from "@/lib/locale-routing";
import type { Region } from "@/lib/bluewolf-data";

const regionKeys: Region[] = ["south", "north", "central", "west"];

export default function RegionLandingPage() {
    return (
        <PageShell activeKey="tours">
            <RegionLandingContent />
        </PageShell>
    );
}

function RegionLandingContent() {
    const params = useParams<{ region: string }>();
    const { isDark, lang } = usePage();
    const { tourItems } = useCmsTours();
    const region = regionKeys.includes(params.region as Region) ? params.region as Region : "south";
    const content = regionLandingContent[region];
    const items = tourItems.filter((tour) => tour.region === region);
    const panel = isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white";
    const card = isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50";
    const perPersonLabel = lang === "ko" ? "1인 기준" : lang === "ja" ? "1名基準" : "Per person";

    return (
        <>
            <section className={`rounded-[32px] border p-8 ${panel}`}>
                <p className="text-sm font-black text-blue-500">{content.label[lang]}</p>
                <h1 className={`mt-2 text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-950"}`}>
                    {content.title[lang]}
                </h1>
                <p className={`mt-4 max-w-3xl leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {content.summary[lang]}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                    {content.highlights.map((highlight) => (
                        <span key={highlight[lang]} className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                            {highlight[lang]}
                        </span>
                    ))}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((tour) => (
                    <Link key={tour.id} href={withLocaleQuery(`/tours/${tour.id}`, lang)} className={`rounded-[28px] border p-6 transition hover:border-blue-400 ${card}`}>
                        <p className="text-sm font-black text-blue-500">{tour.duration[lang]}</p>
                        <h2 className={`mt-2 text-xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
                            {tour.title[lang]}
                        </h2>
                        <p className={`mt-3 line-clamp-3 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {tour.desc[lang]}
                        </p>
                        <div className="mt-4 text-blue-500">
                            <span className="block text-[11px] font-extrabold leading-none">{perPersonLabel}</span>
                            <span className="mt-1 block text-lg font-black leading-tight">{formatPrice(tour.price)}</span>
                        </div>
                    </Link>
                ))}
            </section>
        </>
    );
}
