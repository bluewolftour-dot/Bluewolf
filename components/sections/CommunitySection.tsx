import { type CommunityItem, type CommunityTab } from "@/lib/bluewolf-data";

export function CommunitySection({
    t,
    communityTab,
    setCommunityTab,
    communityItems,
    faqItems,
    isDark,
}: {
    t: {
        communityTitle: string;
        faqTitle: string;
        tabAll: string;
        tabReview: string;
        tabMate: string;
        tabQna: string;
    };
    communityTab: CommunityTab;
    setCommunityTab: (tab: CommunityTab) => void;
    communityItems: CommunityItem[];
    faqItems: readonly (readonly [string, string])[];
    isDark: boolean;
}) {
    return (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-5">
            <div
                id="community"
                className={`rounded-[24px] border p-4 shadow-sm transition-colors duration-300 sm:rounded-[28px] sm:p-7 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                }`}
            >
                <h2 className={`type-title-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t.communityTitle}
                </h2>

                <div className="mt-5 flex flex-wrap gap-2">
                    {[
                        ["all", t.tabAll],
                        ["review", t.tabReview],
                        ["mate", t.tabMate],
                        ["qna", t.tabQna],
                    ].map(([key, label]) => {
                        const active = communityTab === key;

                        return (
                            <button
                                key={key}
                                onClick={() => setCommunityTab(key as CommunityTab)}
                                className={`group relative overflow-hidden rounded-full px-3 py-2 text-xs font-extrabold transition-all duration-300 sm:px-4 sm:text-sm ${
                                    active
                                        ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.20)]"
                                        : isDark
                                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                          : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                            >
                                <span
                                    className={`pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ${
                                        active
                                            ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.20),transparent_58%)] opacity-100"
                                            : "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_58%)] group-hover:opacity-100"
                                    }`}
                                />
                                <span className="relative z-10">{label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-5 grid gap-3">
                    {communityItems.map((item, index) => (
                        <div
                            key={`${item.author}-${index}`}
                            className={`rounded-[22px] border p-4 ${
                                isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                            }`}
                        >
                            <div className={`text-sm font-black sm:text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                                {item.author}
                            </div>
                            <p className={`mt-2 text-sm leading-7 sm:text-base ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div
                id="faq"
                className={`rounded-[24px] border p-4 shadow-sm transition-colors duration-300 sm:rounded-[28px] sm:p-7 ${
                    isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
                }`}
            >
                <h2 className={`type-title-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t.faqTitle}
                </h2>

                <div className="mt-5 grid gap-3">
                    {faqItems.map(([question, answer]) => (
                        <details
                            key={question}
                            className={`rounded-[22px] border p-4 ${
                                isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                            }`}
                        >
                            <summary className={`cursor-pointer list-none text-sm font-black sm:text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                                {question}
                            </summary>
                            <p className={`mt-3 text-sm leading-7 sm:text-base ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                                {answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
