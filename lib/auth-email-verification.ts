import { randomBytes, randomInt } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

type VerificationLocale = "ko" | "ja" | "en";

type EmailVerificationRecord = {
    email: string;
    code: string;
    token: string | null;
    expiresAt: string;
    verifiedAt: string | null;
    consumedAt: string | null;
    createdAt: string;
};

const dataDir = path.join(process.cwd(), "data", "auth");
const verificationPath = path.join(dataDir, "email-verifications.json");

function resolveLocale(locale: string): VerificationLocale {
    if (locale === "ja") return "ja";
    if (locale === "en") return "en";
    return "ko";
}

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

async function ensureFile() {
    await mkdir(dataDir, { recursive: true });

    try {
        await readFile(verificationPath, "utf8");
    } catch {
        await writeFile(verificationPath, "[]", "utf8");
    }
}

async function readVerifications() {
    await ensureFile();
    const raw = await readFile(verificationPath, "utf8");

    try {
        const parsed = JSON.parse(raw) as EmailVerificationRecord[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeVerifications(records: EmailVerificationRecord[]) {
    await ensureFile();
    await writeFile(verificationPath, JSON.stringify(records, null, 2), "utf8");
}

function pruneRecords(records: EmailVerificationRecord[]) {
    const now = Date.now();
    return records.filter((record) => {
        if (record.consumedAt) return false;
        return new Date(record.expiresAt).getTime() > now - 1000 * 60 * 60;
    });
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

function hasVerificationMailConfig() {
    const config = getSmtpConfig();
    return Boolean(config.host && config.user && config.pass && config.from);
}

function createCode() {
    return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function createToken() {
    return randomBytes(24).toString("hex");
}

function getCopy(locale: VerificationLocale) {
    if (locale === "ja") {
        return {
            subject: "BlueWolf メール認証コード",
            heading: "メール認証コードをお送りします",
            body: "下記の認証コードを画面に入力してください。コードは10分間有効です。",
            codeLabel: "認証コード",
        };
    }

    if (locale === "en") {
        return {
            subject: "BlueWolf email verification code",
            heading: "Here is your email verification code",
            body: "Enter the code below on the screen. The code is valid for 10 minutes.",
            codeLabel: "Verification code",
        };
    }

    return {
        subject: "BlueWolf 이메일 인증코드",
        heading: "이메일 인증코드를 보내드립니다",
        body: "아래 인증코드를 화면에 입력해주세요. 코드는 10분 동안 유효합니다.",
        codeLabel: "인증코드",
    };
}

async function sendVerificationMail(email: string, code: string, locale: VerificationLocale) {
    if (!hasVerificationMailConfig()) {
        throw new Error("SMTP_NOT_CONFIGURED");
    }

    const config = getSmtpConfig();
    const copy = getCopy(locale);
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });

    await transporter.sendMail({
        from: config.from,
        to: email,
        subject: copy.subject,
        text: `${copy.heading}\n\n${copy.body}\n\n${copy.codeLabel}: ${code}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
                <h2 style="margin-bottom: 12px;">${copy.heading}</h2>
                <p style="margin: 0 0 20px;">${copy.body}</p>
                <div style="display: inline-block; border-radius: 16px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 18px 22px; font-size: 28px; font-weight: 800; letter-spacing: 0.18em;">
                    ${code}
                </div>
            </div>
        `,
    });
}

export async function sendEmailVerificationCode(input: { email: string; locale: string }) {
    const email = normalizeEmail(input.email);
    const locale = resolveLocale(input.locale);
    const code = createCode();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();

    const records = pruneRecords(await readVerifications()).filter((record) => record.email !== email);
    records.push({
        email,
        code,
        token: null,
        expiresAt,
        verifiedAt: null,
        consumedAt: null,
        createdAt,
    });
    await writeVerifications(records);
    await sendVerificationMail(email, code, locale);
}

export async function verifyEmailVerificationCode(input: { email: string; code: string }) {
    const email = normalizeEmail(input.email);
    const code = input.code.trim();
    const records = pruneRecords(await readVerifications());
    const target = records.find(
        (record) =>
            record.email === email &&
            record.code === code &&
            !record.verifiedAt &&
            !record.consumedAt &&
            new Date(record.expiresAt).getTime() > Date.now()
    );

    if (!target) {
        return { ok: false as const, code: "INVALID_CODE" };
    }

    const token = createToken();
    target.token = token;
    target.verifiedAt = new Date().toISOString();
    await writeVerifications(records);

    return { ok: true as const, token };
}

export async function consumeEmailVerification(input: { email: string; token: string }) {
    const email = normalizeEmail(input.email);
    const token = input.token.trim();
    const records = pruneRecords(await readVerifications());
    const target = records.find(
        (record) =>
            record.email === email &&
            record.token === token &&
            Boolean(record.verifiedAt) &&
            !record.consumedAt &&
            new Date(record.expiresAt).getTime() > Date.now()
    );

    if (!target) {
        await writeVerifications(records);
        return false;
    }

    target.consumedAt = new Date().toISOString();
    await writeVerifications(records);
    return true;
}
