export function isProductionRuntime() {
    return process.env.NODE_ENV === "production";
}

export function readRequiredEnv(name: string) {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function readOptionalEnv(name: string) {
    return process.env[name]?.trim() ?? "";
}

export function readCommaSeparatedEnv(name: string) {
    return readOptionalEnv(name)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}
