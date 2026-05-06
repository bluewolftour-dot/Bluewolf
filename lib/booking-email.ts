import nodemailer from "nodemailer";

type BookingEmailLocale = "ko" | "ja" | "en";
type BookingEmailStatus = "pending" | "confirmed";

export type BookingEmailInput = {
    email: string;
    bookingNo: string;
    customerName: string;
    tourTitle: string;
    departDate: string;
    guests: number;
    locale: string;
    status: BookingEmailStatus;
};

export type BookingCancellationEmailInput = {
    email: string;
    bookingNo: string;
    customerName: string;
    tourTitle: string;
    departDate: string;
    guests: number;
    locale: string;
    cancelReason: string;
    cancelMemo?: string;
    refundMessage?: string;
};

type BookingStatusEmailCopy = {
    subject: string;
    heading: string;
    intro: string;
    bookingNoLabel: string;
    tourLabel: string;
    departDateLabel: string;
    guestsLabel: string;
    footer: string;
};

type BookingCancellationEmailCopy = BookingStatusEmailCopy & {
    cancelReasonLabel: string;
    cancelMemoLabel: string;
    refundMessageLabel: string;
};

type MailResult =
    | { sent: true }
    | { sent: false; reason: "missing_email" | "smtp_not_configured" };

function resolveLocale(locale: string): BookingEmailLocale {
    if (locale === "ja") return "ja";
    if (locale === "en") return "en";
    return "ko";
}

function getSmtpConfig() {
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT ?? 465);
    const user = process.env.SMTP_USER?.trim() ?? "";
    const pass = process.env.SMTP_PASS?.trim() ?? "";
    const from = process.env.SMTP_FROM?.trim() || user;
    const secureEnv = process.env.SMTP_SECURE?.trim() ?? "";
    const secure = secureEnv ? secureEnv.toLowerCase() === "true" : port === 465;

    return {
        host,
        port,
        user,
        pass,
        from,
        secure,
    };
}

export function hasBookingEmailConfig() {
    const config = getSmtpConfig();
    return Boolean(config.host && config.port && config.user && config.pass && config.from);
}

function createTransporter() {
    const config = getSmtpConfig();

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });
}

function pickStatusCopy(locale: BookingEmailLocale, status: BookingEmailStatus): BookingStatusEmailCopy {
    if (locale === "ja") {
        if (status === "pending") {
            return {
                subject: "BlueWolf プラン申請受付のご案内",
                heading: "プラン申請を受け付けました",
                intro: "担当者が内容を確認し、順次ご案内いたします。申請番号は以下でご確認ください。",
                bookingNoLabel: "申請番号",
                tourLabel: "プラン",
                departDateLabel: "出発日",
                guestsLabel: "人数",
                footer: "BlueWolf KR は旅行商品の直接販売者・旅行業者ではなく、実際の旅行契約・日程確定・現地運営は BlueWolf Mongolia が担当します。",
            };
        }

        return {
            subject: "BlueWolf Mongolia 確認完了のご案内",
            heading: "BlueWolf Mongolia の確認が完了しました",
            intro: "BlueWolf Mongolia 側の確認が完了しました。下記の内容をご確認ください。",
            bookingNoLabel: "申請番号",
            tourLabel: "プラン",
            departDateLabel: "出発日",
            guestsLabel: "人数",
            footer: "BlueWolf KR は旅行商品の直接販売者・旅行業者ではなく、実際の旅行契約・日程確定・現地運営は BlueWolf Mongolia が担当します。",
        };
    }

    if (locale === "en") {
        if (status === "pending") {
            return {
                subject: "BlueWolf plan application received",
                heading: "Your plan application has been received",
                intro: "Our team will review your application and follow up shortly. Please keep your application number below.",
                bookingNoLabel: "Application number",
                tourLabel: "Plan",
                departDateLabel: "Departure date",
                guestsLabel: "Guests",
                footer: "BlueWolf KR is not the direct seller or travel operator. The actual travel contract, itinerary confirmation, and local operations are handled by BlueWolf Mongolia.",
            };
        }

        return {
            subject: "BlueWolf Mongolia review completed",
            heading: "BlueWolf Mongolia review has been completed",
            intro: "BlueWolf Mongolia has completed the review for your application.",
            bookingNoLabel: "Application number",
            tourLabel: "Plan",
            departDateLabel: "Departure date",
            guestsLabel: "Guests",
            footer: "BlueWolf KR is not the direct seller or travel operator. The actual travel contract, itinerary confirmation, and local operations are handled by BlueWolf Mongolia.",
        };
    }

    if (status === "pending") {
        return {
            subject: "BlueWolf 플랜 신청 접수 안내",
            heading: "플랜 신청이 접수되었습니다",
            intro: "담당자가 내용을 확인한 뒤 순차적으로 안내드립니다. 아래 신청 번호를 보관해주세요.",
            bookingNoLabel: "신청 번호",
            tourLabel: "플랜",
            departDateLabel: "출발일",
            guestsLabel: "인원",
            footer: "BlueWolf KR은 여행상품의 직접 판매자나 여행업자가 아니며, 실제 여행계약·일정 확정·현지 운영은 BlueWolf Mongolia가 담당합니다.",
        };
    }

    return {
        subject: "BlueWolf Mongolia 확인 완료 안내",
        heading: "BlueWolf Mongolia 확인이 완료되었습니다",
        intro: "BlueWolf Mongolia 측 확인이 완료되었습니다. 아래 내용을 확인해주세요.",
        bookingNoLabel: "신청 번호",
        tourLabel: "플랜",
        departDateLabel: "출발일",
        guestsLabel: "인원",
        footer: "BlueWolf KR은 여행상품의 직접 판매자나 여행업자가 아니며, 실제 여행계약·일정 확정·현지 운영은 BlueWolf Mongolia가 담당합니다.",
    };
}

function pickCancellationCopy(locale: BookingEmailLocale): BookingCancellationEmailCopy {
    if (locale === "ja") {
        return {
            subject: "BlueWolf キャンセル申請受付のご案内",
            heading: "キャンセル申請を受け付けました",
            intro: "担当者が申請内容を確認し、返金やキャンセル確定について順次ご案内いたします。",
            bookingNoLabel: "予約番号",
            tourLabel: "ツアー",
            departDateLabel: "出発日",
            guestsLabel: "人数",
            cancelReasonLabel: "キャンセル理由",
            cancelMemoLabel: "追加メモ",
            refundMessageLabel: "返金案内",
            footer: "ご不明点があれば BlueWolf サポートまでお問い合わせください。",
        };
    }

    if (locale === "en") {
        return {
            subject: "BlueWolf plan package fee refund inquiry received",
            heading: "Your plan package fee refund inquiry has been received",
            intro: "Our team will review your refund inquiry and follow up shortly.",
            bookingNoLabel: "Application number",
            tourLabel: "Plan",
            departDateLabel: "Departure date",
            guestsLabel: "Guests",
            cancelReasonLabel: "Cancellation reason",
            cancelMemoLabel: "Additional notes",
            refundMessageLabel: "Refund information",
            footer: "BlueWolf KR is not the direct seller or travel operator. The actual travel contract, itinerary confirmation, and local operations are handled by BlueWolf Mongolia.",
        };
    }

    return {
        subject: "BlueWolf 플랜 이용료 환불 문의 접수 안내",
        heading: "플랜 이용료 환불 문의가 접수되었습니다",
        intro: "담당자가 신청 내역을 확인한 뒤 환불 관련 내용을 순차적으로 안내드립니다.",
        bookingNoLabel: "신청 번호",
        tourLabel: "플랜",
        departDateLabel: "출발일",
        guestsLabel: "인원",
        cancelReasonLabel: "취소 사유",
        cancelMemoLabel: "추가 메모",
        refundMessageLabel: "환불 안내",
        footer: "BlueWolf KR은 여행상품의 직접 판매자나 여행업자가 아니며, 실제 여행계약·일정 확정·현지 운영은 BlueWolf Mongolia가 담당합니다.",
    };
}

function buildEmailShell(heading: string, intro: string, details: Array<[string, string]>, footer: string) {
    const htmlRows = details
        .filter(([, value]) => value.trim().length > 0)
        .map(
            ([label, value]) =>
                `<p style="margin: 0 0 8px;"><strong>${label}:</strong> ${value}</p>`
        )
        .join("");

    const textRows = details
        .filter(([, value]) => value.trim().length > 0)
        .map(([label, value]) => `${label}: ${value}`);

    return {
        html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
                <h2 style="margin-bottom: 12px;">${heading}</h2>
                <p style="margin: 0 0 20px;">${intro}</p>
                <div style="border: 1px solid #dbe4f0; border-radius: 16px; padding: 20px; background: #f8fbff;">
                    ${htmlRows}
                </div>
                <p style="margin: 20px 0 0;">${footer}</p>
            </div>
        `,
        text: [heading, "", intro, "", ...textRows, "", footer].join("\n"),
    };
}

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<MailResult> {
    const email = to.trim();

    if (!email) {
        return { sent: false, reason: "missing_email" };
    }

    if (!hasBookingEmailConfig()) {
        return { sent: false, reason: "smtp_not_configured" };
    }

    const config = getSmtpConfig();
    const transporter = createTransporter();

    await transporter.sendMail({
        from: config.from,
        to: email,
        subject,
        text,
        html,
    });

    return { sent: true };
}

export async function sendBookingConfirmationEmail(input: BookingEmailInput): Promise<MailResult> {
    const locale = resolveLocale(input.locale);
    const copy = pickStatusCopy(locale, input.status);
    const { html, text } = buildEmailShell(
        copy.heading,
        copy.intro,
        [
            [copy.bookingNoLabel, input.bookingNo],
            [copy.tourLabel, input.tourTitle],
            [copy.departDateLabel, input.departDate],
            [copy.guestsLabel, String(input.guests)],
        ],
        copy.footer
    );

    return sendEmail(input.email, copy.subject, html, text);
}

export async function sendBookingCancellationEmail(
    input: BookingCancellationEmailInput
): Promise<MailResult> {
    const locale = resolveLocale(input.locale);
    const copy = pickCancellationCopy(locale);
    const { html, text } = buildEmailShell(
        copy.heading,
        copy.intro,
        [
            [copy.bookingNoLabel, input.bookingNo],
            [copy.tourLabel, input.tourTitle],
            [copy.departDateLabel, input.departDate],
            [copy.guestsLabel, String(input.guests)],
            [copy.cancelReasonLabel, input.cancelReason],
            [copy.cancelMemoLabel, input.cancelMemo?.trim() ?? ""],
            [copy.refundMessageLabel, input.refundMessage?.trim() ?? ""],
        ],
        copy.footer
    );

    return sendEmail(input.email, copy.subject, html, text);
}
