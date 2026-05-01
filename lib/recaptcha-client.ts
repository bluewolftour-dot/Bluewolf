type Grecaptcha = {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
    interface Window {
        grecaptcha?: Grecaptcha;
    }
}

const SCRIPT_ID = "bluewolf-recaptcha-v3";
let recaptchaLoadPromise: Promise<void> | null = null;

function loadRecaptchaScript(siteKey: string) {
    if (typeof document === "undefined") return Promise.resolve();
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) return recaptchaLoadPromise ?? Promise.resolve();

    recaptchaLoadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("RECAPTCHA_LOAD_FAILED"));
        document.head.appendChild(script);
    });
    return recaptchaLoadPromise;
}

export async function executeRecaptcha(action: string) {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();
    if (!siteKey || typeof window === "undefined") return "";

    await loadRecaptchaScript(siteKey);

    return new Promise<string>((resolve, reject) => {
        if (!window.grecaptcha) {
            reject(new Error("RECAPTCHA_NOT_READY"));
            return;
        }

        window.grecaptcha.ready(() => {
            window.grecaptcha
                ?.execute(siteKey, { action })
                .then(resolve)
                .catch(reject);
        });
    });
}
