"use client";

import { useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "bluewolf-theme";
const listeners = new Set<() => void>();

function notifyThemeChange() {
    listeners.forEach((listener) => listener());
}

function getStoredTheme(): ThemeMode | null {
    if (typeof window === "undefined") return null;

    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
}

function getSystemTheme(): ThemeMode {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getResolvedTheme(): ThemeMode {
    if (typeof document === "undefined") return "light";

    if (document.documentElement.classList.contains("dark")) {
        return "dark";
    }

    return getStoredTheme() ?? getSystemTheme();
}

function applyTheme(theme: ThemeMode) {
    if (typeof document === "undefined") return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    const mediaQuery =
        typeof window !== "undefined"
            ? window.matchMedia("(prefers-color-scheme: dark)")
            : null;

    const handleStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
            notifyThemeChange();
        }
    };

    const handleSystemThemeChange = () => {
        const storedTheme = getStoredTheme();
        if (!storedTheme) {
            notifyThemeChange();
        }
    };

    window.addEventListener("storage", handleStorage);
    mediaQuery?.addEventListener("change", handleSystemThemeChange);

    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
        mediaQuery?.removeEventListener("change", handleSystemThemeChange);
    };
}

function getSnapshot() {
    return getResolvedTheme();
}

function getServerSnapshot(): ThemeMode {
    return "light";
}

export function setTheme(theme: ThemeMode) {
    applyTheme(theme);
    notifyThemeChange();
}

export function useTheme() {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const isDark = theme === "dark";

    return {
        theme,
        isDark,
        setTheme,
        toggleTheme: () => setTheme(isDark ? "light" : "dark"),
    };
}
