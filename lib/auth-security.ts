import { readJsonStore, writeJsonStore } from "@/lib/json-store";
import {
    isSupabaseDatabaseEnabled,
    supabaseDelete,
    supabaseSelectOne,
    supabaseUpsertOne,
} from "@/lib/supabase-server";

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

type SupabaseSecurityEventRow = {
    key: string;
    scope: string;
    count: number;
    reset_at: string;
    blocked_until: string | null;
    locked_until: string | null;
};

const securityPath = "auth/auth-security.json";

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

async function getSupabaseSecurityEvent(key: string) {
    return supabaseSelectOne<SupabaseSecurityEventRow>("app_security_events", {
        key: `eq.${key}`,
    });
}

async function upsertSupabaseSecurityEvent(row: SupabaseSecurityEventRow) {
    await supabaseUpsertOne<SupabaseSecurityEventRow>("app_security_events", row, "key");
}

async function readSecurityStore(): Promise<SecurityStore> {
    const parsed = await readJsonStore<Partial<SecurityStore>>(securityPath, defaultStore);
    return {
        rateLimits: Array.isArray(parsed.rateLimits) ? parsed.rateLimits : [],
        loginFailures: Array.isArray(parsed.loginFailures) ? parsed.loginFailures : [],
    };
}

async function writeSecurityStore(store: SecurityStore) {
    await writeJsonStore(securityPath, store);
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
    if (isSupabaseDatabaseEnabled()) {
        const key = `${input.scope}:${normalizeKey(input.key)}`;
        const now = Date.now();
        const existing = await getSupabaseSecurityEvent(key);

        if (existing?.blocked_until && new Date(existing.blocked_until).getTime() > now) {
            return {
                allowed: false,
                code: "RATE_LIMITED",
                retryAfterSeconds: toRetryAfterSeconds(existing.blocked_until),
            };
        }

        if (!existing || new Date(existing.reset_at).getTime() <= now) {
            await upsertSupabaseSecurityEvent({
                key,
                scope: input.scope,
                count: 1,
                reset_at: new Date(now + input.windowMs).toISOString(),
                blocked_until: null,
                locked_until: null,
            });
            return { allowed: true };
        }

        const nextCount = existing.count + 1;
        const blockedUntil = nextCount > input.limit ? new Date(now + input.blockMs).toISOString() : null;

        await upsertSupabaseSecurityEvent({
            ...existing,
            count: nextCount,
            blocked_until: blockedUntil,
        });

        if (blockedUntil) {
            return {
                allowed: false,
                code: "RATE_LIMITED",
                retryAfterSeconds: toRetryAfterSeconds(blockedUntil),
            };
        }

        return { allowed: true };
    }

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
    if (isSupabaseDatabaseEnabled()) {
        const key = `login-failure:${normalizeKey(input.id)}`;
        const record = await getSupabaseSecurityEvent(key);

        if (record?.locked_until && new Date(record.locked_until).getTime() > Date.now()) {
            return {
                allowed: false,
                code: "ACCOUNT_LOCKED",
                retryAfterSeconds: toRetryAfterSeconds(record.locked_until),
            };
        }

        return { allowed: true };
    }

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
    if (isSupabaseDatabaseEnabled()) {
        const key = `login-failure:${normalizeKey(input.id)}`;
        const now = Date.now();
        const existing = await getSupabaseSecurityEvent(key);

        if (!existing || new Date(existing.reset_at).getTime() <= now) {
            await upsertSupabaseSecurityEvent({
                key,
                scope: "login-failure",
                count: 1,
                reset_at: new Date(now + input.windowMs).toISOString(),
                blocked_until: null,
                locked_until: null,
            });
            return { locked: false, retryAfterSeconds: 0 };
        }

        const nextCount = existing.count + 1;
        const lockedUntil = nextCount >= input.maxFailures ? new Date(now + input.lockMs).toISOString() : null;

        await upsertSupabaseSecurityEvent({
            ...existing,
            count: nextCount,
            locked_until: lockedUntil,
        });

        if (lockedUntil) {
            return {
                locked: true,
                retryAfterSeconds: toRetryAfterSeconds(lockedUntil),
            };
        }

        return { locked: false, retryAfterSeconds: 0 };
    }

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
    if (isSupabaseDatabaseEnabled()) {
        await supabaseDelete("app_security_events", {
            key: `eq.login-failure:${normalizeKey(id)}`,
        });
        return;
    }

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
