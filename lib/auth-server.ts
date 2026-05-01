import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

const dataDir = path.join(process.cwd(), "data", "auth");
const usersPath = path.join(dataDir, "users.json");
const sessionsPath = path.join(dataDir, "sessions.json");

async function ensureFile(filePath: string) {
    await mkdir(dataDir, { recursive: true });

    try {
        await readFile(filePath, "utf8");
    } catch {
        await writeFile(filePath, "[]", "utf8");
    }
}

async function readList<T>(filePath: string): Promise<T[]> {
    await ensureFile(filePath);
    const raw = await readFile(filePath, "utf8");

    try {
        const parsed = JSON.parse(raw) as T[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeList<T>(filePath: string, data: T[]) {
    await ensureFile(filePath);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function normalizeUserId(value: string) {
    return value.trim().toLowerCase();
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
    const users = await readList<StoredUser>(usersPath);
    const id = normalizeUserId(input.id);

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
    await writeList(usersPath, users);

    return { ok: true as const, user: sanitizeUser(nextUser) };
}

export async function authenticateUser(input: { id: string; password: string }) {
    const users = await readList<StoredUser>(usersPath);
    const id = normalizeUserId(input.id);
    const user = users.find((entry) => entry.id === id);

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

export async function findUserById(id: string) {
    const users = await readList<StoredUser>(usersPath);
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
    const users = await readList<StoredUser>(usersPath);
    const id = normalizeUserId(input.id);
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

    await writeList(usersPath, users);

    const sessions = await readList<StoredSession>(sessionsPath);
    const filtered = sessions.filter(
        (entry) =>
            entry.userId !== id ||
            (input.preserveSessionToken !== undefined && entry.token === input.preserveSessionToken)
    );
    await writeList(sessionsPath, filtered);

    return { ok: true as const };
}

export async function deleteUserAccount(input: { id: string; password: string }) {
    const users = await readList<StoredUser>(usersPath);
    const id = normalizeUserId(input.id);
    const target = users.find((entry) => entry.id === id);

    if (!target) {
        return { ok: false as const, code: "USER_NOT_FOUND" };
    }

    const isValid = await verifyPassword(input.password, target.passwordHash);
    if (!isValid) {
        return { ok: false as const, code: "INVALID_CREDENTIALS" };
    }

    const remaining = users.filter((entry) => entry.id !== id);
    await writeList(usersPath, remaining);
    await deleteSessionsByUserId(id);

    return { ok: true as const };
}

export async function resetUserPassword(input: { id: string; password: string }) {
    const users = await readList<StoredUser>(usersPath);
    const id = normalizeUserId(input.id);
    const targetIndex = users.findIndex((entry) => entry.id === id);

    if (targetIndex === -1) {
        return { ok: false as const, code: "USER_NOT_FOUND" };
    }

    users[targetIndex] = {
        ...users[targetIndex],
        passwordHash: await hashPassword(input.password),
    };

    await writeList(usersPath, users);
    await deleteSessionsByUserId(id);

    return { ok: true as const };
}

export async function updateUserProfile(input: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
}) {
    const users = await readList<StoredUser>(usersPath);
    const id = normalizeUserId(input.id);
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
    await writeList(usersPath, users);

    return { ok: true as const, user: sanitizeUser(nextUser) };
}

export async function createSession(userId: string) {
    const sessions = await readList<StoredSession>(sessionsPath);
    const token = randomBytes(24).toString("hex");

    sessions.push({
        token,
        userId,
        createdAt: new Date().toISOString(),
    });

    await writeList(sessionsPath, sessions);
    return token;
}

export async function getSessionUser(token: string | undefined) {
    if (!token) return null;

    const sessions = await readList<StoredSession>(sessionsPath);
    const session = sessions.find((entry) => entry.token === token);
    if (!session) return null;

    const users = await readList<StoredUser>(usersPath);
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

    const sessions = await readList<StoredSession>(sessionsPath);
    const filtered = sessions.filter((entry) => entry.token !== token);
    await writeList(sessionsPath, filtered);
}

async function deleteSessionsByUserId(userId: string) {
    const sessions = await readList<StoredSession>(sessionsPath);
    const filtered = sessions.filter((entry) => entry.userId !== userId);
    await writeList(sessionsPath, filtered);
}
