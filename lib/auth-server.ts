import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { readJsonListStore, writeJsonListStore } from "@/lib/json-store";
import {
    isSupabaseDatabaseEnabled,
    supabaseDelete,
    supabaseInsertOne,
    supabasePatch,
    supabaseSelectOne,
} from "@/lib/supabase-server";

const scrypt = promisify(scryptCallback);

export type AuthUser = {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: string;
};

type StoredUser = AuthUser & {
    passwordHash: string;
};

type StoredSession = {
    token: string;
    userId: string;
    createdAt: string;
};

type SupabaseUserRow = {
    id: string;
    name: string;
    phone: string;
    email: string;
    password_hash: string;
    created_at: string;
};

type SupabaseSessionRow = {
    token: string;
    user_id: string;
    created_at: string;
    expires_at: string;
};

const usersPath = "auth/users.json";
const sessionsPath = "auth/sessions.json";

function normalizeUserId(value: string) {
    return value.trim().toLowerCase();
}

function toStoredUser(row: SupabaseUserRow): StoredUser {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
    };
}

function buildSessionExpiry(createdAt = new Date()) {
    return new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

async function findSupabaseUserById(id: string) {
    const row = await supabaseSelectOne<SupabaseUserRow>("app_users", {
        id: `eq.${normalizeUserId(id)}`,
    });
    return row ? toStoredUser(row) : null;
}

async function findSupabaseUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const row = await supabaseSelectOne<SupabaseUserRow>("app_users", {
        email: `eq.${normalizedEmail}`,
    });
    return row ? toStoredUser(row) : null;
}

export function sanitizeUser(user: AuthUser) {
    return {
        id: user.id,
        name: user.name ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
    };
}

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedKey = Buffer.from(key, "hex");

    if (storedKey.length !== derivedKey.length) return false;

    return timingSafeEqual(storedKey, derivedKey);
}

export async function createUser(input: {
    id: string;
    password: string;
    name: string;
    phone: string;
    email: string;
}) {
    const id = normalizeUserId(input.id);

    if (isSupabaseDatabaseEnabled()) {
        const existing = await findSupabaseUserById(id);
        if (existing) {
            return { ok: false as const, code: "USER_EXISTS" };
        }

        const createdAt = new Date().toISOString();
        const row = await supabaseInsertOne<SupabaseUserRow>("app_users", {
            id,
            name: input.name.trim(),
            phone: input.phone.trim(),
            email: input.email.trim().toLowerCase(),
            password_hash: await hashPassword(input.password),
            created_at: createdAt,
        });

        if (!row) {
            return { ok: false as const, code: "USER_EXISTS" };
        }

        return { ok: true as const, user: sanitizeUser(toStoredUser(row)) };
    }

    const users = await readJsonListStore<StoredUser>(usersPath);

    if (users.some((user) => user.id === id)) {
        return { ok: false as const, code: "USER_EXISTS" };
    }

    const nextUser: StoredUser = {
        id,
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        passwordHash: await hashPassword(input.password),
        createdAt: new Date().toISOString(),
    };

    users.push(nextUser);
    await writeJsonListStore(usersPath, users);

    return { ok: true as const, user: sanitizeUser(nextUser) };
}

export async function authenticateUser(input: { id: string; password: string }) {
    const id = normalizeUserId(input.id);
    const user = isSupabaseDatabaseEnabled()
        ? await findSupabaseUserById(id)
        : (await readJsonListStore<StoredUser>(usersPath)).find((entry) => entry.id === id) ?? null;

    if (!user) {
        return { ok: false as const, code: "INVALID_CREDENTIALS" };
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
        return { ok: false as const, code: "INVALID_CREDENTIALS" };
    }

    return {
        ok: true as const,
        user: sanitizeUser({
            ...user,
            name: user.name ?? "",
            phone: user.phone ?? "",
            email: user.email ?? "",
        }),
    };
}

export async function findUserByEmail(email: string) {
    if (isSupabaseDatabaseEnabled()) {
        const user = await findSupabaseUserByEmail(email);
        return user ? sanitizeUser(user) : null;
    }

    const users = await readJsonListStore<StoredUser>(usersPath);
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((entry) => entry.email?.toLowerCase() === normalizedEmail);
    return user
        ? sanitizeUser({
              ...user,
              name: user.name ?? "",
              phone: user.phone ?? "",
              email: user.email ?? "",
          })
        : null;
}

export async function findUserById(id: string) {
    if (isSupabaseDatabaseEnabled()) {
        const user = await findSupabaseUserById(id);
        return user ? sanitizeUser(user) : null;
    }

    const users = await readJsonListStore<StoredUser>(usersPath);
    const normalizedId = normalizeUserId(id);
    const user = users.find((entry) => entry.id === normalizedId);
    return user
        ? sanitizeUser({
              ...user,
              name: user.name ?? "",
              phone: user.phone ?? "",
              email: user.email ?? "",
          })
        : null;
}

export async function changeUserPassword(input: {
    id: string;
    currentPassword: string;
    newPassword: string;
    preserveSessionToken?: string;
}) {
    const id = normalizeUserId(input.id);

    if (isSupabaseDatabaseEnabled()) {
        const target = await findSupabaseUserById(id);
        if (!target) {
            return { ok: false as const, code: "USER_NOT_FOUND" };
        }

        const isValid = await verifyPassword(input.currentPassword, target.passwordHash);
        if (!isValid) {
            return { ok: false as const, code: "INVALID_CREDENTIALS" };
        }

        await supabasePatch<SupabaseUserRow>(
            "app_users",
            { id: `eq.${id}` },
            { password_hash: await hashPassword(input.newPassword) }
        );

        const sessionQuery: Record<string, string> = { user_id: `eq.${id}` };
        if (input.preserveSessionToken !== undefined) {
            sessionQuery.token = `neq.${input.preserveSessionToken}`;
        }
        await supabaseDelete("app_sessions", sessionQuery);

        return { ok: true as const };
    }

    const users = await readJsonListStore<StoredUser>(usersPath);
    const targetIndex = users.findIndex((entry) => entry.id === id);

    if (targetIndex === -1) {
        return { ok: false as const, code: "USER_NOT_FOUND" };
    }

    const isValid = await verifyPassword(input.currentPassword, users[targetIndex].passwordHash);
    if (!isValid) {
        return { ok: false as const, code: "INVALID_CREDENTIALS" };
    }

    users[targetIndex] = {
        ...users[targetIndex],
        passwordHash: await hashPassword(input.newPassword),
    };

    await writeJsonListStore(usersPath, users);

    const sessions = await readJsonListStore<StoredSession>(sessionsPath);
    const filtered = sessions.filter(
        (entry) =>
            entry.userId !== id ||
            (input.preserveSessionToken !== undefined && entry.token === input.preserveSessionToken)
    );
    await writeJsonListStore(sessionsPath, filtered);

    return { ok: true as const };
}

export async function deleteUserAccount(input: { id: string; password: string }) {
    const id = normalizeUserId(input.id);

    if (isSupabaseDatabaseEnabled()) {
        const target = await findSupabaseUserById(id);
        if (!target) {
            return { ok: false as const, code: "USER_NOT_FOUND" };
        }

        const isValid = await verifyPassword(input.password, target.passwordHash);
        if (!isValid) {
            return { ok: false as const, code: "INVALID_CREDENTIALS" };
        }

        await supabaseDelete("app_users", { id: `eq.${id}` });
        return { ok: true as const };
    }

    const users = await readJsonListStore<StoredUser>(usersPath);
    const target = users.find((entry) => entry.id === id);

    if (!target) {
        return { ok: false as const, code: "USER_NOT_FOUND" };
    }

    const isValid = await verifyPassword(input.password, target.passwordHash);
    if (!isValid) {
        return { ok: false as const, code: "INVALID_CREDENTIALS" };
    }

    const remaining = users.filter((entry) => entry.id !== id);
    await writeJsonListStore(usersPath, remaining);
    await deleteSessionsByUserId(id);

    return { ok: true as const };
}

export async function resetUserPassword(input: { id: string; password: string }) {
    const id = normalizeUserId(input.id);

    if (isSupabaseDatabaseEnabled()) {
        const target = await findSupabaseUserById(id);
        if (!target) {
            return { ok: false as const, code: "USER_NOT_FOUND" };
        }

        await supabasePatch<SupabaseUserRow>(
            "app_users",
            { id: `eq.${id}` },
            { password_hash: await hashPassword(input.password) }
        );
        await supabaseDelete("app_sessions", { user_id: `eq.${id}` });

        return { ok: true as const };
    }

    const users = await readJsonListStore<StoredUser>(usersPath);
    const targetIndex = users.findIndex((entry) => entry.id === id);

    if (targetIndex === -1) {
        return { ok: false as const, code: "USER_NOT_FOUND" };
    }

    users[targetIndex] = {
        ...users[targetIndex],
        passwordHash: await hashPassword(input.password),
    };

    await writeJsonListStore(usersPath, users);
    await deleteSessionsByUserId(id);

    return { ok: true as const };
}

export async function updateUserProfile(input: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
}) {
    const id = normalizeUserId(input.id);

    if (isSupabaseDatabaseEnabled()) {
        const target = await findSupabaseUserById(id);
        if (!target) {
            return { ok: false as const, code: "USER_NOT_FOUND" };
        }

        const nextEmail = input.email?.trim().toLowerCase();
        if (nextEmail) {
            const existingEmailUser = await findSupabaseUserByEmail(nextEmail);
            if (existingEmailUser && existingEmailUser.id !== id) {
                return { ok: false as const, code: "EMAIL_EXISTS" };
            }
        }

        const rows = await supabasePatch<SupabaseUserRow>(
            "app_users",
            { id: `eq.${id}` },
            {
                ...(input.name !== undefined ? { name: input.name.trim() } : {}),
                ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
                ...(nextEmail !== undefined ? { email: nextEmail } : {}),
            }
        );
        const row = rows[0];
        return row
            ? { ok: true as const, user: sanitizeUser(toStoredUser(row)) }
            : { ok: false as const, code: "USER_NOT_FOUND" };
    }

    const users = await readJsonListStore<StoredUser>(usersPath);
    const targetIndex = users.findIndex((entry) => entry.id === id);

    if (targetIndex === -1) {
        return { ok: false as const, code: "USER_NOT_FOUND" };
    }

    const nextEmail = input.email?.trim().toLowerCase();
    if (nextEmail && users.some((entry) => entry.id !== id && entry.email?.toLowerCase() === nextEmail)) {
        return { ok: false as const, code: "EMAIL_EXISTS" };
    }

    const currentUser = users[targetIndex];
    const nextUser: StoredUser = {
        ...currentUser,
        name: input.name !== undefined ? input.name.trim() : currentUser.name,
        phone: input.phone !== undefined ? input.phone.trim() : currentUser.phone,
        email: nextEmail !== undefined ? nextEmail : currentUser.email,
    };

    users[targetIndex] = nextUser;
    await writeJsonListStore(usersPath, users);

    return { ok: true as const, user: sanitizeUser(nextUser) };
}

export async function createSession(userId: string) {
    const token = randomBytes(24).toString("hex");
    const createdAt = new Date();

    if (isSupabaseDatabaseEnabled()) {
        await supabaseInsertOne<SupabaseSessionRow>("app_sessions", {
            token,
            user_id: normalizeUserId(userId),
            created_at: createdAt.toISOString(),
            expires_at: buildSessionExpiry(createdAt),
        });

        return token;
    }

    const sessions = await readJsonListStore<StoredSession>(sessionsPath);

    sessions.push({
        token,
        userId,
        createdAt: createdAt.toISOString(),
    });

    await writeJsonListStore(sessionsPath, sessions);
    return token;
}

export async function getSessionUser(token: string | undefined) {
    if (!token) return null;

    if (isSupabaseDatabaseEnabled()) {
        const session = await supabaseSelectOne<SupabaseSessionRow>("app_sessions", {
            token: `eq.${token}`,
        });
        if (!session) return null;

        if (new Date(session.expires_at).getTime() <= Date.now()) {
            await supabaseDelete("app_sessions", { token: `eq.${token}` });
            return null;
        }

        const user = await findSupabaseUserById(session.user_id);
        return user ? sanitizeUser(user) : null;
    }

    const sessions = await readJsonListStore<StoredSession>(sessionsPath);
    const session = sessions.find((entry) => entry.token === token);
    if (!session) return null;

    const users = await readJsonListStore<StoredUser>(usersPath);
    const user = users.find((entry) => entry.id === session.userId);
    return user
        ? sanitizeUser({
              ...user,
              name: user.name ?? "",
              phone: user.phone ?? "",
              email: user.email ?? "",
          })
        : null;
}

export async function deleteSession(token: string | undefined) {
    if (!token) return;

    if (isSupabaseDatabaseEnabled()) {
        await supabaseDelete("app_sessions", { token: `eq.${token}` });
        return;
    }

    const sessions = await readJsonListStore<StoredSession>(sessionsPath);
    const filtered = sessions.filter((entry) => entry.token !== token);
    await writeJsonListStore(sessionsPath, filtered);
}

async function deleteSessionsByUserId(userId: string) {
    if (isSupabaseDatabaseEnabled()) {
        await supabaseDelete("app_sessions", { user_id: `eq.${normalizeUserId(userId)}` });
        return;
    }

    const sessions = await readJsonListStore<StoredSession>(sessionsPath);
    const filtered = sessions.filter((entry) => entry.userId !== userId);
    await writeJsonListStore(sessionsPath, filtered);
}
