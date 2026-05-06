import Image from "next/image";
import { CalendarPicker } from "@/components/ui/CalendarPicker";
import { Dropdown } from "@/components/ui/Dropdown";
import { copy, type Locale, type Tour } from "@/lib/bluewolf-data";
import { useCmsTours } from "@/lib/use-cms-tours";
import { formatPrice } from "@/lib/bluewolf-utils";

type CopyValue = (typeof copy)[Locale];

const inputClass =
    "h-12 sm:h-14 rounded-2xl border px-4 sm:px-5 text-[15px] sm:text-[16px] font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

const primaryButton =
    "group relative overflow-hidden rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-300 hover:bg-blue-500 sm:px-5 sm:py-4";
const secondaryButton =
    "group relative overflow-hidden rounded-2xl px-4 py-3 font-bold transition-all duration-300 sm:px-5 sm:py-4";

const overlaySpan =
    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)]";
const shineSpan =
    "pointer-events-none absolute inset-y-0 left-[-30%] w-[40%] -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100";

export function ApplicationSection({
    t,
    lang,
    selectedPlanId,
    setSelectedPlanId,
    departDate,
    setDepartDate,
    guestCount,
    setGuestCount,
    selectedPlan,
    planPackageFeePrice,
    totalPrice,
    paymentDone,
    setPaymentDone,
    isDark,
}: {
    t: CopyValue;
    lang: Locale;
    selectedPlanId: number;
    setSelectedPlanId: (id: number) => void;
    departDate: string;
    setDepartDate: (value: string) => void;
    guestCount: number;
    setGuestCount: (count: number) => void;
    selectedPlan: Tour;
    planPackageFeePrice: number;
    totalPrice: number;
    paymentDone: boolean;
    setPaymentDone: (value: boolean) => void;
    isDark: boolean;
}) {
    const { tourItems: plans } = useCmsTours();
    const scheduleLabel = {
        ko: "일정",
        ja: "日程",
        en: "Schedule",
    }[lang];

    const highlightsLabel = {
        ko: "관광 포인트",
        ja: "見どころ",
        en: "Highlights",
    }[lang];

    const highlightsDesc = {
        ko: "이 일정에서 방문하거나 중심으로 경험하게 될 주요 장소입니다.",
        ja: "この日程で訪問または中心に体験する主要スポットです。",
        en: "Key places and experiences included in this itinerary.",
    }[lang];

    return (
        <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-5">
            <div
                id="application"
                className={`rounded-[24px] border p-4 shadow-sm transition-colors duration-300 sm:rounded-[28px] sm:p-7 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                }`}
            >
                <h2 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t.applicationTitle}
                </h2>
                <p className={`mt-3 text-sm leading-7 sm:text-base ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    {t.applicationDesc}
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <label className="grid gap-2 md:col-span-2">
                        <span className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {t.selectPlan}
                        </span>
                        <Dropdown
                            value={selectedPlanId}
                            onChange={(value) => setSelectedPlanId(Number(value))}
                            options={plans.map((plan) => ({
                                value: plan.id,
                                label: plan.title[lang],
                            }))}
                            isDark={isDark}
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {t.departDate}
                        </span>
                        <CalendarPicker
                            value={departDate}
                            onChange={setDepartDate}
                            placeholder={t.datePlaceholder}
                            weekdays={t.weekdays}
                            deleteLabel={t.delete}
                            todayLabel={t.today}
                            locale={lang}
                            isDark={isDark}
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {t.guests}
                        </span>
                        <Dropdown
                            value={guestCount}
                            onChange={(value) => setGuestCount(Number(value))}
                            options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
                            isDark={isDark}
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {t.name}
                        </span>
                        <input
                            className={`${inputClass} ${
                                isDark
                                    ? "border-white/10 bg-slate-950 text-slate-100 focus:bg-slate-900"
                                    : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                            }`}
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {t.phone}
                        </span>
                        <input
                            className={`${inputClass} ${
                                isDark
                                    ? "border-white/10 bg-slate-950 text-slate-100 focus:bg-slate-900"
                                    : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                            }`}
                        />
                    </label>

                    <label className="grid gap-2 md:col-span-2">
                        <span className={`text-sm font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            {t.memo}
                        </span>
                        <textarea
                            className={`min-h-[110px] rounded-2xl border px-4 py-4 text-[15px] sm:min-h-[120px] sm:px-5 sm:text-[16px] font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 ${
                                isDark
                                    ? "border-white/10 bg-slate-950 text-slate-100 focus:bg-slate-900"
                                    : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"
                            }`}
                        />
                    </label>
                </div>

                <div
                    className={`mt-6 grid gap-3 rounded-[24px] border p-4 sm:p-5 ${
                        isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                    }`}
                >
                    <div className={`flex items-center justify-between gap-3 text-sm font-bold sm:text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        <span>{t.selectedPlan}</span>
                        <span className="text-right">{selectedPlan.title[lang]}</span>
                    </div>
                    <div className={`flex items-center justify-between gap-3 text-sm font-bold sm:text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        <span>{t.guestsLabel}</span>
                        <span>{guestCount}</span>
                    </div>
                    <div className={`flex items-center justify-between gap-3 text-sm font-bold sm:text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        <span>{t.planPackageFee}</span>
                        <span>{formatPrice(planPackageFeePrice)}</span>
                    </div>
                    <div
                        className={`flex items-center justify-between gap-3 border-t border-dashed pt-3 text-base font-black sm:text-lg ${
                            isDark ? "border-white/10 text-white" : "border-slate-300 text-slate-900"
                        }`}
                    >
                        <span>{t.totalPrice}</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button onClick={() => setPaymentDone(true)} className={primaryButton}>
                        <span className={overlaySpan} />
                        <span className={shineSpan} />
                        <span className="relative z-10">{t.payPlanPackageFee}</span>
                    </button>

                    <button
                        className={`${secondaryButton} ${
                            isDark
                                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                                : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                        }`}
                    >
                        <span className={overlaySpan} />
                        <span className={shineSpan} />
                        <span className="relative z-10">{t.getQuote}</span>
                    </button>
                </div>

                <p className={`mt-4 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    {paymentDone ? t.payDone : t.payReady}
                </p>
            </div>

            <div
                className={`rounded-[24px] border p-4 shadow-sm transition-colors duration-300 sm:rounded-[28px] sm:p-7 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                }`}
            >
                <div
                    className={`relative overflow-hidden rounded-[24px] border sm:rounded-[26px] ${
                        isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-100"
                    }`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${selectedPlan.gradient} opacity-20`} />
                    <div className="relative aspect-[16/10]">
                        <Image
                            src={selectedPlan.heroImage}
                            alt={selectedPlan.title[lang]}
                            fill
                            className="object-cover"
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.24))]" />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                            {selectedPlan.tags[lang].map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-white/25 bg-white/14 px-3 py-2 text-xs font-extrabold text-white backdrop-blur-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-6">
                    <h3 className={`text-2xl font-black tracking-tight sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                        {selectedPlan.title[lang]}
                    </h3>
                    <p className={`mt-3 text-sm leading-7 sm:text-base ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                        {selectedPlan.desc[lang]}
                    </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div
                        className={`rounded-[22px] border p-4 ${
                            isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                        }`}
                    >
                        <div className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {scheduleLabel}
                        </div>
                        <div className={`mt-2 text-base font-black sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                            {selectedPlan.duration[lang]}
                        </div>
                    </div>

                    <div
                        className={`rounded-[22px] border p-4 ${
                            isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                        }`}
                    >
                        <div className={`text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {t.priceLabel}
                        </div>
                        <div className={`mt-2 text-base font-black sm:text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                            {formatPrice(selectedPlan.price)}
                        </div>
                    </div>
                </div>

                <div
                    className={`mt-6 rounded-[24px] border p-4 sm:p-5 ${
                        isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                    }`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h4 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                {highlightsLabel}
                            </h4>
                            <p className={`mt-1 text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                {highlightsDesc}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {selectedPlan.highlights[lang].map((spot) => (
                            <div
                                key={spot}
                                className={`rounded-[18px] border px-4 py-3 text-sm font-bold ${
                                    isDark
                                        ? "border-white/10 bg-slate-900 text-slate-100"
                                        : "border-slate-200 bg-white text-slate-900"
                                }`}
                            >
                                <span className="mr-2 text-blue-600">•</span>
                                {spot}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
