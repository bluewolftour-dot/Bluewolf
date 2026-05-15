"use client";

import { useState, type FormEvent } from "react";
import { PageShell, usePage } from "@/components/layout/PageShell";
import { executeRecaptcha } from "@/lib/recaptcha-client";
import type { ReportType } from "@/lib/reports";

export function ReportClient() {
    const { isDark } = usePage();
    const [targetType, setTargetType] = useState<"post" | "user" | "other">("post");
    const [reportType, setReportType] = useState<ReportType>("spam");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        setResult(null);

        try {
            const recaptchaToken = await executeRecaptcha("report_submit").catch(() => "");
            const response = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetType,
                    reportType,
                    content,
                    recaptchaToken,
                }),
            });

            if (response.ok) {
                setResult({ ok: true, message: "신고가 정상적으로 접수되었습니다. 운영팀에서 검토 후 처리하겠습니다." });
                setContent("");
            } else {
                setResult({ ok: false, message: "신고 접수에 실패했습니다. 잠시 후 다시 시도해 주세요." });
            }
        } catch {
            setResult({ ok: false, message: "오류가 발생했습니다." });
        } finally {
            setSubmitting(false);
        }
    };

    const panelTone = isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900";
    const fieldTone = isDark ? "border-white/10 bg-slate-950 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-950";
    const mutedTone = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <PageShell activeKey="community">
            <div className="mx-auto w-full max-w-2xl py-10 px-4">
                <header className="mb-10 text-center">
                    <p className="text-sm font-black text-blue-500">Community Safety</p>
                    <h1 className="type-display mt-2">커뮤니티 신고</h1>
                    <p className={`mt-3 text-sm leading-7 ${mutedTone}`}>
                        부적절한 게시글이나 사용자를 발견하셨나요? 상세 내용을 보내주시면 운영팀에서 신속히 검토하겠습니다.
                    </p>
                </header>

                <div className={`rounded-[32px] border p-6 sm:p-10 ${panelTone}`}>
                    {result ? (
                        <div className="text-center">
                            <div className={`mb-6 rounded-2xl p-6 ${result.ok ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                <p className="text-lg font-black">{result.message}</p>
                            </div>
                            <button
                                onClick={() => setResult(null)}
                                className="h-12 rounded-2xl bg-blue-600 px-8 text-sm font-black text-white"
                            >
                                추가 신고하기
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-6">
                            <div>
                                <label className="mb-2 block text-sm font-black">신고 대상</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["post", "user", "other"] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setTargetType(type)}
                                            className={`h-12 rounded-2xl text-xs font-black transition ${
                                                targetType === type
                                                    ? "bg-blue-600 text-white"
                                                    : isDark ? "bg-slate-950 text-slate-400" : "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {type === "post" ? "게시글/댓글" : type === "user" ? "사용자" : "기타"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black">신고 유형</label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value as ReportType)}
                                    className={`h-12 w-full rounded-2xl border px-4 text-sm font-bold outline-none focus:border-blue-500 ${fieldTone}`}
                                >
                                    <option value="spam">스팸 / 홍보성</option>
                                    <option value="abuse">욕설 / 비방 / 혐오 표현</option>
                                    <option value="inappropriate">부적절한 콘텐츠</option>
                                    <option value="other">기타 사유</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-black">상세 내용</label>
                                <textarea
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="신고 사유를 구체적으로 적어주세요. (예: 특정 게시글 링크, 위반 내용 등)"
                                    className={`min-h-40 w-full resize-none rounded-2xl border px-4 py-4 text-sm font-semibold outline-none focus:border-blue-500 ${fieldTone}`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-4 h-14 w-full rounded-2xl bg-blue-600 text-sm font-black text-white transition hover:bg-blue-500 disabled:opacity-50"
                            >
                                {submitting ? "접수 중..." : "신고 접수하기"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <div className={`rounded-3xl border p-6 ${panelTone}`}>
                        <h3 className="font-black">운영팀 검토</h3>
                        <p className={`mt-2 text-xs leading-6 ${mutedTone}`}>
                            접수된 모든 신고는 24시간 이내에 운영팀이 직접 확인하며, 위반 사항 발견 시 즉시 조치합니다.
                        </p>
                    </div>
                    <div className={`rounded-3xl border p-6 ${panelTone}`}>
                        <h3 className="font-black">허위 신고 주의</h3>
                        <p className={`mt-2 text-xs leading-6 ${mutedTone}`}>
                            고의적인 허위 신고는 서비스 이용에 제한을 받을 수 있으니 신중하게 작성해 주시기 바랍니다.
                        </p>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
