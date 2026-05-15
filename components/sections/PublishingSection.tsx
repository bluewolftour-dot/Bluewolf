type PublishingItem = {
    title: string;
    desc: string;
};

export function PublishingSection({
    title = "퍼블리싱 단계",
    desc = "서비스를 공개할 때 바로 운영 가능한 순서로 나눈 구조입니다.",
    items,
    isDark,
}: {
    title?: string;
    desc?: string;
    items: readonly PublishingItem[];
    isDark: boolean;
}) {
    return (
        <section
            className={`rounded-[24px] border p-4 shadow-sm transition-colors duration-300 sm:rounded-[28px] sm:p-6 lg:p-7 ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
        >
            <div>
                <h2 className={`type-title-lg ${isDark ? "text-white" : "text-slate-900"}`}>
                    {title}
                </h2>
                <p className={`mt-2 text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-500"}`}>{desc}</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                {items.map((item, index) => (
                    <div
                        key={item.title}
                        className={`rounded-[24px] border p-4 sm:p-5 ${
                            isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                        }`}
                    >
                        <div className="text-sm font-black text-blue-600">0{index + 1}</div>
                        <h3 className={`type-title-md mt-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            {item.title}
                        </h3>
                        <p className={`mt-3 text-sm leading-7 sm:text-base ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
