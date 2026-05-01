"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { executeRecaptcha } from "@/lib/recaptcha-client";

type AuthUser = {
    id: string;
    name: string;
    phone: string;
    email: string;
};

type AuthResult =
    | { ok: true }
    | {
          ok: false;
          code: string;
      };

type AuthContextValue = {
    user: AuthUser | null;
    ready: boolean;
    login: (input: { id: string; password: string }) => Promise<AuthResult>;
    register: (input: {
        id: string;
        password: string;
        name: string;
        phone: string;
        email: string;
        verificationToken: string;
    }) => Promise<AuthResult>;
    resetPassword: (input: {
        id: string;
        password: string;
        verificationToken: string;
    }) => Promise<AuthResult>;
    deleteAccount: (input: { password: string }) => Promise<AuthResult>;
    refreshSession: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
    user: null,
    ready: false,
    login: async () => ({ ok: false, code: "NOT_READY" }),
    register: async () => ({ ok: false, code: "NOT_READY" }),
    resetPassword: async () => ({ ok: false, code: "NOT_READY" }),
    deleteAccount: async () => ({ ok: false, code: "NOT_READY" }),
    refreshSession: async () => undefined,
    logout: async () => undefined,
});

async function parseAuthResponse(response: Response): Promise<AuthResult> {
    if (response.ok) {
        return { ok: true };
    }

    try {
        const data = (await response.json()) as { error?: string };
        return {
            ok: false,
            code: data.error ?? "UNKNOWN_ERROR",
        };
    } catch {
        return {
            ok: false,
            code: "UNKNOWN_ERROR",
        };
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [ready, setReady] = useState(false);

    const loadSession = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/session", {
                method: "GET",
                cache: "no-store",
            });
            const data = (await response.json()) as { user: AuthUser | null };
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        void loadSession();
    }, [loadSession]);

    const login = useCallback(async (input: { id: string; password: string }) => {
        const recaptchaToken = await executeRecaptcha("login").catch(() => "");
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...input, recaptchaToken }),
        });

        const result = await parseAuthResponse(response);
        if (!result.ok) return result;

        await loadSession();
        return { ok: true as const };
    }, [loadSession]);

    const register = useCallback(async (input: {
        id: string;
        password: string;
        name: string;
        phone: string;
        email: string;
        verificationToken: string;
    }) => {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });

        return parseAuthResponse(response);
    }, []);

    const resetPassword = useCallback(async (input: {
        id: string;
        password: string;
        verificationToken: string;
    }) => {
        const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });

        return parseAuthResponse(response);
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } finally {
            setUser(null);
        }
    }, []);

    const deleteAccount = useCallback(async (input: { password: string }) => {
        const response = await fetch("/api/auth/account/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });

        const result = await parseAuthResponse(response);
        if (result.ok) {
            setUser(null);
        }
        return result;
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            ready,
            login,
            register,
            resetPassword,
            deleteAccount,
            refreshSession: loadSession,
            logout,
        }),
        [deleteAccount, loadSession, login, logout, ready, register, resetPassword, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
