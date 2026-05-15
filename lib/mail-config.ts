import nodemailer from "nodemailer";

export type MailProfile = "kr" | "mongolia";

export type MailConfig = {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
};

function readProfileValue(profile: MailProfile, key: string) {
    const prefix = profile === "kr" ? "SMTP_KR" : "SMTP_MONGOLIA";
    return process.env[`${prefix}_${key}`]?.trim() ?? "";
}

export function getMailConfig(profile: MailProfile): MailConfig {
    const host = readProfileValue(profile, "HOST") || "smtp.gmail.com";
    const portValue = readProfileValue(profile, "PORT");
    const port = Number(portValue || 465);
    const user = readProfileValue(profile, "USER") || "";
    const pass = readProfileValue(profile, "PASS") || "";
    const from = readProfileValue(profile, "FROM") || user;
    const secureEnv = readProfileValue(profile, "SECURE") || "";
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

export function hasMailConfig(profile: MailProfile) {
    const config = getMailConfig(profile);
    return Boolean(config.host && config.port && config.user && config.pass && config.from);
}

export function createMailTransporter(profile: MailProfile) {
    const config = getMailConfig(profile);

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
