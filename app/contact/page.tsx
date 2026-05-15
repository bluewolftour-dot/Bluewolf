"use client";

import {
    type FormEvent,
    type KeyboardEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { Dropdown } from "@/components/ui/Dropdown";
import { type Locale } from "@/lib/bluewolf-data";

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

const contactData = {
    ko: {
        formTitle: "상담 요청",
        formDesc:
            "플랜 신청 변경, 결제 확인, 단체 일정처럼 직접 확인이 필요한 문의는 아래 양식으로 남겨주세요.",
        nameLabel: "이름",
        namePlaceholder: "홍길동",
        emailLabel: "이메일",
        emailPlaceholder: "example@email.com",
        phoneLabel: "연락처",
        phonePlaceholder: "010-0000-0000",
        subjectLabel: "문의 유형",
        subjects: ["투어 문의", "플랜 상담", "결제 문의", "기타"],
        messageLabel: "문의 내용",
        messagePlaceholder: "궁금한 내용을 자세히 적어주세요.",
        submitBtn: "문의 보내기",
        submittingLabel: "전송 중...",
        submitSuccess: "문의가 접수되었습니다. 빠른 시일 안에 연락드릴게요.",
        submitError: "문의 전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        infoTitle: "연락처 정보",
        infoEmail: "이메일",
        infoPhone: "전화",
        infoHours: "운영 시간",
        infoAddress: "주소",
        emailValue: "contact@bluewolf.kr",
        phoneValue: "+82-2-0000-0000",
        hoursValue: "평일 09:00 - 18:00 (KST)",
        addressValue: "서울시 강남구 테헤란로 123",
        quickTitle: "상담이 필요하신가요?",
        quickDesc: "진행 상태 확인이나 일정 조정이 필요하면 이메일로 바로 문의하실 수 있어요.",
        quickButton: "이메일 문의 열기",
    },
    ja: {
        formTitle: "スタッフへの問い合わせ",
        formDesc:
            "予約変更、決済確認、団体日程のように担当者の確認が必要な内容は下記フォームからお問い合わせください。",
        nameLabel: "お名前",
        namePlaceholder: "山田 太郎",
        emailLabel: "メールアドレス",
        emailPlaceholder: "example@email.com",
        phoneLabel: "連絡先",
        phonePlaceholder: "090-0000-0000",
        subjectLabel: "問い合わせ種別",
        subjects: ["ツアー相談", "予約相談", "決済相談", "その他"],
        messageLabel: "問い合わせ内容",
        messagePlaceholder: "知りたい内容を詳しく入力してください。",
        submitBtn: "問い合わせ送信",
        submittingLabel: "送信中...",
        submitSuccess: "お問い合わせを受け付けました。順番にご連絡いたします。",
        submitError: "送信中に問題が発生しました。しばらくしてから再度お試しください。",
        infoTitle: "連絡先情報",
        infoEmail: "メール",
        infoPhone: "電話",
        infoHours: "営業時間",
        infoAddress: "住所",
        emailValue: "contact@bluewolf.kr",
        phoneValue: "+82-2-0000-0000",
        hoursValue: "平日 09:00 - 18:00 (KST)",
        addressValue: "ソウル市 江南区 テヘラン路 123",
        quickTitle: "相談が必要ですか？",
        quickDesc: "進行状況の確認や日程調整が必要な場合は、メールですぐにお問い合わせいただけます。",
        quickButton: "メールで問い合わせる",
    },
    en: {
        formTitle: "Human support request",
        formDesc:
            "For plan changes, payment checks, or group itinerary coordination that needs direct confirmation, send us a message below.",
        nameLabel: "Full name",
        namePlaceholder: "John Doe",
        emailLabel: "Email address",
        emailPlaceholder: "example@email.com",
        phoneLabel: "Phone number",
        phonePlaceholder: "+1 000-000-0000",
        subjectLabel: "Inquiry type",
        subjects: ["Tour inquiry", "Booking support", "Payment issue", "Other"],
        messageLabel: "Message",
        messagePlaceholder: "Tell us what you'd like to know.",
        submitBtn: "Send message",
        submittingLabel: "Sending...",
        submitSuccess: "Your inquiry has been submitted. We'll get back to you soon.",
        submitError: "There was a problem sending your inquiry. Please try again shortly.",
        infoTitle: "Contact information",
        infoEmail: "Email",
        infoPhone: "Phone",
        infoHours: "Business hours",
        infoAddress: "Address",
        emailValue: "contact@bluewolf.kr",
        phoneValue: "+82-2-0000-0000",
        hoursValue: "Mon - Fri 09:00 - 18:00 (KST)",
        addressValue: "123 Teheran-ro, Gangnam-gu, Seoul",
        quickTitle: "Need support?",
        quickDesc: "If you need booking confirmation or itinerary support, you can contact us by email right away.",
        quickButton: "Open email inquiry",
    },
} as const;

const assistantData = {
    ko: {
        badge: "AI 상담",
        title: "최신 사이트 내용을 읽는 BlueWolf AI 상담사",
        desc:
            "투어 추천, 가격, 추가 옵션, 출발 지역, 공지사항까지 사이트의 최신 내용을 바탕으로 바로 안내해드려요.",
        welcome:
            "안녕하세요. BlueWolf AI 상담사입니다. 최신 사이트 내용을 기준으로 투어와 예약 관련 질문에 답해드릴게요. 궁금한 내용을 편하게 물어보세요.",
        placeholder: "예: 고비 사막 투어 가격과 추가 옵션을 알려줘",
        send: "질문 보내기",
        sending: "답변 생성 중...",
        examples: [
            "고비 사막 추천 일정과 가격을 알려줘",
            "가족 여행에 맞는 투어를 추천해줘",
            "추가 옵션에는 무엇이 있고 얼마야?",
        ],
        note: "AI 답변은 홈페이지의 내용 기반으로 생성됩니다.",
        fallback:
            "AI 상담 연결에 문제가 발생했습니다. 잠시 후 다시 시도하거나 아래 상담 요청을 이용해주세요.",
    },
    ja: {
        badge: "AI相談",
        title: "最新サイト内容を読むBlueWolf AI相談",
        desc:
            "ツアーのおすすめ、価格、追加オプション、出発地域、お知らせまで、サイトの最新内容をもとにすぐ案内します。",
        welcome:
            "こんにちは。BlueWolf AI相談です。最新のサイト内容をもとに、ツアーや予約についてご案内します。気になることを気軽に聞いてください。",
        placeholder: "例: ゴビ砂漠ツアーの価格と追加オプションを教えて",
        send: "質問する",
        sending: "回答を作成中...",
        examples: [
            "ゴビ砂漠のおすすめ日程と価格を教えて",
            "家族旅行に合うツアーをおすすめして",
            "追加オプションの内容と料金を教えて",
        ],
        note: "AI回答はホームページの内容をもとに生成されます。",
        fallback:
            "AI相談の接続に問題が発生しました。しばらくしてから再度お試しいただくか、下の有人問い合わせをご利用ください。",
    },
    en: {
        badge: "AI concierge",
        title: "BlueWolf AI concierge with live site knowledge",
        desc:
            "Ask about tours, prices, add-ons, departure regions, and notices using the latest site content.",
        welcome:
            "Hi, I'm the BlueWolf AI concierge. I answer using the latest tour and site data. Ask me anything about planning your trip.",
        placeholder: "e.g. Tell me the Gobi Desert tour price and add-on options",
        send: "Ask AI",
        sending: "Thinking...",
        examples: [
            "Recommend a Gobi Desert itinerary and price",
            "Which tours fit a family trip?",
            "What add-on options are available and how much are they?",
        ],
        note: "AI answers are generated from website content.",
        fallback:
            "The AI concierge is temporarily unavailable. Please try again shortly or use the support form below.",
    },
} as const;

const inputClass =
    "h-12 sm:h-14 w-full rounded-2xl border px-4 sm:px-5 text-[15px] sm:text-[16px] font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50";

function InfoIcon({ children }: { children: ReactNode }) {
    return (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            {children}
        </span>
    );
}

function ContactAiAssistant({ lang, isDark }: { lang: Locale; isDark: boolean }) {
    const copy = assistantData[lang];
    const sectionBase = `rounded-[24px] border p-4 shadow-sm transition-colors duration-300 sm:rounded-[28px] sm:p-7 ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: copy.welcome },
    ]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMessages([{ role: "assistant", content: copy.welcome }]);
        setDraft("");
        setLoading(false);
    }, [copy.welcome]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, loading]);

    const handleAsk = async (messageText?: string) => {
        const question = (messageText ?? draft).trim();
        if (!question || loading) return;

        const nextMessages: ChatMessage[] = [
            ...messages,
            { role: "user", content: question },
        ];

        setMessages(nextMessages);
        setDraft("");
        setLoading(true);

        try {
            const response = await fetch("/api/contact/assistant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    locale: lang,
                    messages: nextMessages,
                }),
            });

            const data = (await response.json()) as {
                answer?: string;
                message?: string;
                error?: string;
            };

            if (!response.ok || !data.answer) {
                throw new Error(data.message || data.error || copy.fallback);
            }

            setMessages((previous) => [
                ...previous,
                { role: "assistant", content: data.answer ?? copy.fallback },
            ]);
        } catch (error) {
            const fallback =
                error instanceof Error && error.message ? error.message : copy.fallback;

            setMessages((previous) => [
                ...previous,
                { role: "assistant", content: fallback },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleAsk();
        }
    };

    return (
        <section className={sectionBase}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">
                        {copy.badge}
                    </span>
                    <h1
                        className={`type-display mt-4 ${
                            isDark ? "text-white" : "text-slate-900"
                        }`}
                    >
                        {copy.title}
                    </h1>
                    <p
                        className={`mt-3 text-sm leading-7 sm:text-base ${
                            isDark ? "text-slate-300" : "text-slate-500"
                        }`}
                    >
                        {copy.desc}
                    </p>
                </div>

                <div
                    className={`rounded-[22px] px-4 py-3 text-sm font-semibold ${
                        isDark ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-600"
                    }`}
                >
                    {copy.note}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                {copy.examples.map((example) => (
                    <button
                        key={example}
                        type="button"
                        onClick={() => void handleAsk(example)}
                        disabled={loading}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                            isDark
                                ? "bg-slate-950 text-slate-200 hover:bg-slate-800"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                        {example}
                    </button>
                ))}
            </div>

            <div
                className={`mt-6 rounded-[24px] border p-4 sm:p-5 ${
                    isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-50"
                }`}
            >
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {messages.map((message, index) => (
                        <div
                            key={`${message.role}-${index}`}
                            className={`flex ${
                                message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[92%] rounded-[20px] px-4 py-3 text-sm leading-7 sm:max-w-[80%] ${
                                    message.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : isDark
                                          ? "bg-slate-900 text-slate-100"
                                          : "bg-white text-slate-700"
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {loading ? (
                        <div className="flex justify-start">
                            <div
                                className={`rounded-[20px] px-4 py-3 text-sm font-semibold ${
                                    isDark
                                        ? "bg-slate-900 text-slate-300"
                                        : "bg-white text-slate-500"
                                }`}
                            >
                                {copy.sending}
                            </div>
                        </div>
                    ) : null}

                    <div ref={endRef} />
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={copy.placeholder}
                        rows={3}
                        className={`min-h-[96px] w-full rounded-2xl border px-4 py-4 text-[15px] font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 sm:text-[16px] ${
                            isDark
                                ? "border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => void handleAsk()}
                        disabled={loading || !draft.trim()}
                        className="shrink-0 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-300 hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400 sm:self-end"
                    >
                        {loading ? copy.sending : copy.send}
                    </button>
                </div>
            </div>
        </section>
    );
}

function ContactContent() {
    const { lang, isDark } = usePage();
    const copy = contactData[lang];
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        subject: copy.subjects[0] as string,
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        setForm({
            name: "",
            email: "",
            phone: "",
            subject: copy.subjects[0] as string,
            message: "",
        });
        setSubmitted(false);
        setSubmitting(false);
        setSubmitError("");
    }, [copy]);

    const inputTone = isDark
        ? "border-white/10 bg-slate-950 text-slate-100 focus:bg-slate-900"
        : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white";

    const sectionBase = `rounded-[24px] border p-4 shadow-sm transition-colors duration-300 sm:rounded-[28px] sm:p-7 ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
    }`;

    const labelClass = `text-sm font-extrabold ${
        isDark ? "text-slate-100" : "text-slate-900"
    }`;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch("/api/crm/inquiries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    locale: lang,
                }),
            });

            if (!response.ok) {
                throw new Error(copy.submitError);
            }

            setSubmitted(true);
        } catch {
            setSubmitError(copy.submitError);
        } finally {
            setSubmitting(false);
        }
    };

    const infoItems = [
        {
            key: copy.infoEmail,
            label: copy.infoEmail,
            value: copy.emailValue,
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            ),
        },
        {
            key: copy.infoPhone,
            label: copy.infoPhone,
            value: copy.phoneValue,
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h2.5a1 1 0 01.95.684l1.1 3.3a1 1 0 01-.34 1.107L7.91 9.91a16.04 16.04 0 006.18 6.18l1.819-1.3a1 1 0 011.107-.34l3.3 1.1A1 1 0 0120.5 16.5V19a2 2 0 01-2 2h-1C9.492 21 3 14.508 3 6.5V5z"
                    />
                </svg>
            ),
        },
        {
            key: copy.infoHours,
            label: copy.infoHours,
            value: copy.hoursValue,
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                </svg>
            ),
        },
        {
            key: copy.infoAddress,
            label: copy.infoAddress,
            value: copy.addressValue,
            icon: (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 1.75a5.75 5.75 0 00-5.75 5.75c0 4.02 4.62 9.23 5.15 9.82a.75.75 0 001.1 0c.53-.59 5.15-5.8 5.15-9.82A5.75 5.75 0 0010 1.75zm0 7.5A1.75 1.75 0 1110 5.75a1.75 1.75 0 010 3.5z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="space-y-4 sm:space-y-5">
            <ContactAiAssistant lang={lang} isDark={isDark} />

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-5">
                <section className={sectionBase}>
                    <h2
                        className={`type-title-lg ${
                            isDark ? "text-white" : "text-slate-900"
                        }`}
                    >
                        {copy.formTitle}
                    </h2>
                    <p
                        className={`mt-3 text-sm leading-7 sm:text-base ${
                            isDark ? "text-slate-300" : "text-slate-500"
                        }`}
                    >
                        {copy.formDesc}
                    </p>

                    {submitted ? (
                        <div className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.4"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <p className="mt-3 font-bold text-emerald-700">{copy.submitSuccess}</p>
                        </div>
                    ) : (
                        <form
                            onSubmit={(event) => void handleSubmit(event)}
                            className="mt-6 grid gap-4 md:grid-cols-2"
                        >
                            <label className="grid gap-2">
                                <span className={labelClass}>{copy.nameLabel}</span>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm((previous) => ({
                                            ...previous,
                                            name: event.target.value,
                                        }))
                                    }
                                    placeholder={copy.namePlaceholder}
                                    className={`${inputClass} ${inputTone}`}
                                />
                            </label>

                            <label className="grid gap-2">
                                <span className={labelClass}>{copy.emailLabel}</span>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm((previous) => ({
                                            ...previous,
                                            email: event.target.value,
                                        }))
                                    }
                                    placeholder={copy.emailPlaceholder}
                                    className={`${inputClass} ${inputTone}`}
                                />
                            </label>

                            <label className="grid gap-2">
                                <span className={labelClass}>{copy.phoneLabel}</span>
                                <input
                                    value={form.phone}
                                    onChange={(event) =>
                                        setForm((previous) => ({
                                            ...previous,
                                            phone: event.target.value,
                                        }))
                                    }
                                    placeholder={copy.phonePlaceholder}
                                    className={`${inputClass} ${inputTone}`}
                                />
                            </label>

                            <label className="grid gap-2">
                                <span className={labelClass}>{copy.subjectLabel}</span>
                                <Dropdown
                                    value={form.subject}
                                    onChange={(value) =>
                                        setForm((previous) => ({
                                            ...previous,
                                            subject: value,
                                        }))
                                    }
                                    options={copy.subjects.map((subject) => ({
                                        value: subject,
                                        label: subject,
                                    }))}
                                    isDark={isDark}
                                />
                            </label>

                            <label className="grid gap-2 md:col-span-2">
                                <span className={labelClass}>{copy.messageLabel}</span>
                                <textarea
                                    required
                                    value={form.message}
                                    onChange={(event) =>
                                        setForm((previous) => ({
                                            ...previous,
                                            message: event.target.value,
                                        }))
                                    }
                                    placeholder={copy.messagePlaceholder}
                                    rows={5}
                                    className={`w-full rounded-2xl border px-4 py-4 text-[15px] font-semibold outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50 sm:px-5 sm:text-[16px] ${inputTone}`}
                                />
                            </label>

                            <div className="space-y-3 md:col-span-2">
                                {submitError ? (
                                    <p className="text-sm font-bold text-rose-500">
                                        {submitError}
                                    </p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="group relative overflow-hidden rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-300 hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
                                >
                                    {submitting ? copy.submittingLabel : copy.submitBtn}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                <div className="flex flex-col gap-4">
                    <section className={sectionBase}>
                        <h2
                            className={`type-title-md ${
                                isDark ? "text-white" : "text-slate-900"
                            }`}
                        >
                            {copy.infoTitle}
                        </h2>

                        <div className="mt-5 grid gap-3">
                            {infoItems.map((item) => (
                                <div
                                    key={item.key}
                                    className={`flex gap-3 rounded-[20px] border p-4 ${
                                        isDark
                                            ? "border-white/10 bg-slate-950"
                                            : "border-slate-200 bg-slate-50"
                                    }`}
                                >
                                    <InfoIcon>{item.icon}</InfoIcon>
                                    <div>
                                        <div
                                            className={`text-xs font-bold ${
                                                isDark ? "text-slate-400" : "text-slate-500"
                                            }`}
                                        >
                                            {item.label}
                                        </div>
                                        <div
                                            className={`mt-0.5 text-sm font-semibold sm:text-base ${
                                                isDark ? "text-slate-100" : "text-slate-900"
                                            }`}
                                        >
                                            {item.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[24px] border border-blue-200 bg-blue-50 p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.75 4.5A2.75 2.75 0 015.5 1.75h9A2.75 2.75 0 0117.25 4.5v6A2.75 2.75 0 0114.5 13.25H9.86l-3.89 3.24A.75.75 0 014.75 15.9v-2.65H5.5A2.75 2.75 0 012.75 10.5v-6z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-black text-blue-900">{copy.quickTitle}</div>
                                <div className="mt-0.5 text-sm font-semibold text-blue-800">
                                    {copy.quickDesc}
                                </div>
                            </div>
                        </div>

                        <a
                            href={`mailto:${copy.emailValue}`}
                            className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-500"
                        >
                            {copy.quickButton}
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default function ContactPage() {
    return (
        <PageShell activeKey="contact">
            <ContactContent />
        </PageShell>
    );
}
