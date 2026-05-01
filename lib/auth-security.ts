import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type RateLimitRecord = {
    key: string;
    count: number;
    resetAt: string;
    blockedUntil: string | null;
};

type LoginFailureRecord = {
    key: string;
    count: number;
    resetAt: string;
    lockedUntil: string | null;
};

type SecurityStore = {
    rateLimits: RateLimitRecord[];
    loginFailures: LoginFailureRecord[];
};

const dataDir = path.join(process.cwd(), "data", "auth");
const securityPath = path.join(dataDir, "auth-security.json");

const defaultStore: SecurityStore = {
    rateLimits: [],
    loginFailures: [],
};

export type LimitResult =
    | { allowed: true }
    | {
          allowed: false;
          code: "RATE_LIMITED" | "ACCOUNT_LOCKED";
          retryAfterSeconds: number;
      };

function normalizeKey(value: string) {
    return value.trim().toLowerCase();
}

function toRetryAfterSeconds(until: string) {
    return Math.max(1, Math.ceil((new Date(until).getTime() - Date.now()) / 1000));
}

async function ensureStoreFile() {
    await mkdir(dataDir, { recursive: true });

    try {
        await readFile(securityPath, "utf8");
    } catch {
        await writeSecurityStore(defaultStore);
    }
}

async function readSecurityStore(): Promise<SecurityStore> {
    await ensureStoreFile();
    const raw = await readFile(securityPath, "utf8");

    try {
        const parsed = JSON.parse(raw) as Partial<SecurityStore>;
        return {
            rateLimits: Array.isArray(parsed.rateLimits) ? parsed.rateLimits : [],
            loginFailures: Array.isArray(parsed.loginFailures) ? parsed.loginFailures : [],
        };
    } catch {
        return defaultStore;
    }
}

async function writeSecurityStore(store: SecurityStore) {
    await mkdir(dataDir, { recursive: true });
    await writeFile(securityPath, JSON.stringify(store, null, 2), "utf8");
}

function pruneStore(store: SecurityStore) {
    const now = Date.now();
    return {
        rateLimits: store.rateLimits.filter((record) => {
            const resetAt = new Date(record.resetAt).getTime();
            const blockedUntil = record.blockedUntil ? new Date(record.blockedUntil).getTime() : 0;
            return resetAt > now || blockedUntil > now;
        }),
        loginFailures: store.loginFailures.filter((record) => {
            const resetAt = new Date(record.resetAt).getTime();
            const lockedUntil = record.lockedUntil ? new Date(record.lockedUntil).getTime() : 0;
            return resetAt > now || lockedUntil > now;
        }),
    };
}

export function getClientIp(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return (
        forwardedFor ||
        request.headers.get("x-real-ip")?.trim() ||
        request.headers.get("cf-connecting-ip")?.trim() ||
        "unknown"
    );
}

export async function checkRateLimit(input: {
    scope: string;
    key: string;
    limit: number;
    windowMs: number;
    blockMs: number;
}): Promise<LimitResult> {
    const store = pruneStore(await readSecurityStore());
    const key = `${input.scope}:${normalizeKey(input.key)}`;
    const now = Date.now();
    const existing = store.rateLimits.find((record) => record.key === key);

    if (existing?.blockedUntil && new Date(existing.blockedUntil).getTime() > now) {
        await writeSecurityStore(store);
        return {
            allowed: false,
            code: "RATE_LIMITED",
            retryAfterSeconds: toRetryAfterSeconds(existing.blockedUntil),
        };
    }

    if (!existing || new Date(existing.resetAt).getTime() <= now) {
        const nextRecord: RateLimitRecord = {
            key,
            count: 1,
            resetAt: new Date(now + input.windowMs).toISOString(),
            blockedUntil: null,
        };
        const nextStore = {
            ...store,
            rateLimits: [...store.rateLimits.filter((record) => record.key !== key), nextRecord],
        };
        await writeSecurityStore(nextStore);
        return { allowed: true };
    }

    existing.count += 1;

    if (existing.count > input.limit) {
        existing.blockedUntil = new Date(now + input.blockMs).toISOString();
        await writeSecurityStore(store);
        return {
            allowed: false,
            code: "RATE_LIMITED",
            retryAfterSeconds: toRetryAfterSeconds(existing.blockedUntil),
        };
    }

    await writeSecurityStore(store);
    return { allowed: true };
}

export async function checkAccountLock(input: { id: string }): Promise<LimitResult> {
    const store = pruneStore(await readSecurityStore());
    const key = normalizeKey(input.id);
    const record = store.loginFailures.find((item) => item.key === key);

    if (record?.lockedUntil && new Date(record.lockedUntil).getTime() > Date.now()) {
        await writeSecurityStore(store);
        return {
            allowed: false,
            code: "ACCOUNT_LOCKED",
            retryAfterSeconds: toRetryAfterSeconds(record.lockedUntil),
        };
    }

    await writeSecurityStore(store);
    return { allowed: true };
}

export async function recordLoginFailure(input: {
    id: string;
    maxFailures: number;
    windowMs: number;
    lockMs: number;
}) {
    const store = pruneStore(await readSecurityStore());
    const key = normalizeKey(input.id);
    const now = Date.now();
    const existing = store.loginFailures.find((record) => record.key === key);

    if (!existing || new Date(existing.resetAt).getTime() <= now) {
        store.loginFailures = [
            ...store.loginFailures.filter((record) => record.key !== key),
            {
                key,
                count: 1,
                resetAt: new Date(now + input.windowMs).toISOString(),
                lockedUntil: null,
            },
        ];
        await writeSecurityStore(store);
        return { locked: false, retryAfterSeconds: 0 };
    }

    existing.count += 1;
    if (existing.count >= input.maxFailures) {
        existing.lockedUntil = new Date(now + input.lockMs).toISOString();
        await writeSecurityStore(store);
        return {
            locked: true,
            retryAfterSeconds: toRetryAfterSeconds(existing.lockedUntil),
        };
    }

    await writeSecurityStore(store);
    return { locked: false, retryAfterSeconds: 0 };
}

export async function clearLoginFailures(id: string) {
    const store = pruneStore(await readSecurityStore());
    const key = normalizeKey(id);
    await writeSecurityStore({
        ...store,
        loginFailures: store.loginFailures.filter((record) => record.key !== key),
    });
}

export function limitedJson(error: LimitResult) {
    if (error.allowed) {
        return {
            body: { error: "UNKNOWN_ERROR" },
            init: { status: 500 },
        };
    }

    return {
        body: {
            error: error.code,
            retryAfterSeconds: error.retryAfterSeconds,
        },
        init: {
            status: error.code === "ACCOUNT_LOCKED" ? 423 : 429,
            headers: {
                "Retry-After": String(error.retryAfterSeconds),
            },
        },
    };
}
