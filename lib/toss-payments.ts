import { randomUUID } from "node:crypto";

export const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";
export const TOSS_PAYMENT_URL = "https://api.tosspayments.com/v1/payments";

export function getTossClientKey() {
    return process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY?.trim() ?? "";
}

export function getTossSecretKey() {
    return process.env.TOSS_PAYMENTS_SECRET_KEY?.trim() ?? "";
}

export function hasTossPaymentsConfig() {
    return Boolean(getTossClientKey() && getTossSecretKey());
}

export function buildTossOrderId() {
    return `BW-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

export function buildTossCustomerKey(orderId: string) {
    return `bluewolf-${orderId}`;
}

export function getTossAuthorizationHeader() {
    const secretKey = getTossSecretKey();

    if (!secretKey) {
        throw new Error("Missing TOSS_PAYMENTS_SECRET_KEY.");
    }

    return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}
