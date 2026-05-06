import { randomUUID } from "node:crypto";
import { readOptionalEnv, readRequiredEnv } from "@/lib/env";

export const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";
export const TOSS_PAYMENT_URL = "https://api.tosspayments.com/v1/payments";

export function getTossClientKey() {
    return readOptionalEnv("NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY");
}

export function getTossSecretKey() {
    return readOptionalEnv("TOSS_PAYMENTS_SECRET_KEY");
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
    const secretKey = readRequiredEnv("TOSS_PAYMENTS_SECRET_KEY");

    return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}
