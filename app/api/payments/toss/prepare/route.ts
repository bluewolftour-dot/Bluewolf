import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { createCrmPaymentOrder, getCmsTourById, getCrmBookings } from "@/lib/cms-crm-db";
import { validateBookingAvailability, validateDepartDate } from "@/lib/booking-rules";
import {
    buildTossCustomerKey,
    buildTossOrderId,
    getTossClientKey,
    hasTossPaymentsConfig,
} from "@/lib/toss-payments";

type PreparePaymentBody = {
    tourId?: number;
    customPlan?: {
        title?: string;
        summary?: string;
        totalAmount?: number;
    };
    customerName?: string;
    email?: string;
    phone?: string;
    departDate?: string;
    guests?: number;
    locale?: string;
    paymentMethod?: string;
    optionKeys?: string[];
    memo?: string;
};

const CUSTOM_PLAN_DEPOSIT_PER_PERSON = 50000;
const SESSION_COOKIE = "bluewolf_session";

function buildOrderName(locale: string, title: string) {
    if (locale === "ja") return `${title} 予約金`;
    if (locale === "en") return `${title} deposit`;
    return `${title} 예약금`;
}

function resolveLocale(locale: string) {
    if (locale === "ja") return "ja";
    if (locale === "en") return "en";
    return "ko";
}

export async function POST(request: NextRequest) {
    if (!hasTossPaymentsConfig()) {
        return NextResponse.json(
            { error: "Toss Payments keys are not configured." },
            { status: 500 }
        );
    }

    const body = (await request.json()) as PreparePaymentBody;
    const tourId = Number(body.tourId);
    const customPlanTitle = body.customPlan?.title?.trim() ?? "";
    const customPlanSummary = body.customPlan?.summary?.trim() ?? "";
    const customPlanTotalAmount = Math.max(0, Math.round(Number(body.customPlan?.totalAmount ?? 0)));
    const isCustomPlan = customPlanTitle.length > 0;
    const customerName = body.customerName?.trim() ?? "";
    const requestedEmail = body.email?.trim().toLowerCase() ?? "";
    const phone = body.phone?.trim() ?? "";
    const departDate = body.departDate?.trim() ?? "";
    const guests = Number(body.guests);
    const locale = body.locale?.trim() || "ko";
    const paymentMethod = body.paymentMethod?.trim() ?? "";
    const optionKeys = Array.isArray(body.optionKeys)
        ? body.optionKeys.map((key) => key.trim()).filter(Boolean)
        : [];
    const memo = body.memo?.trim() ?? "";

    const tour = Number.isInteger(tourId) ? getCmsTourById(tourId) : null;
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);
    const email = user?.email?.trim().toLowerCase() || requestedEmail;

    if (!tour && !isCustomPlan) {
        return NextResponse.json({ error: "A valid tour is required." }, { status: 400 });
    }

    if (!customerName || !email || !phone || !departDate || !Number.isFinite(guests) || guests < 1) {
        return NextResponse.json(
            { error: "Missing required payment information." },
            { status: 400 }
        );
    }

    const availability = isCustomPlan
        ? validateDepartDate(departDate)
        : validateBookingAvailability({
              tourId,
              departDate,
              guests,
              bookings: getCrmBookings(),
          });

    if (!availability.ok) {
        return NextResponse.json(
            {
                error: availability.message,
                code: availability.code,
                capacity: availability.capacity,
                remainingSeats: availability.remainingSeats,
            },
            { status: 409 }
        );
    }

    if (!paymentMethod || paymentMethod === "bank") {
        return NextResponse.json(
            { error: "Only PG payment methods can prepare a Toss payment." },
            { status: 400 }
        );
    }

    const amount = isCustomPlan ? CUSTOM_PLAN_DEPOSIT_PER_PERSON * guests : (tour?.deposit ?? 0) * guests;

    if (!Number.isFinite(amount) || amount < 1) {
        return NextResponse.json(
            { error: "A valid payment amount is required." },
            { status: 400 }
        );
    }

    const orderId = buildTossOrderId();
    const customerKey = buildTossCustomerKey(orderId);
    const origin = request.nextUrl.origin;
    const languageQuery = locale === "ko" ? "" : `?lang=${encodeURIComponent(locale)}`;
    const successUrl = `${origin}/payment/success${languageQuery}`;
    const failUrl = `${origin}/payment/fail${languageQuery}${languageQuery ? "&" : "?"}${
        isCustomPlan ? "custom=1" : `tour=${tour?.id ?? ""}`
    }`;

    const order = createCrmPaymentOrder({
        orderId,
        tourId: tour?.id ?? 0,
        customTitle: isCustomPlan ? customPlanTitle : "",
        customSummary: isCustomPlan ? customPlanSummary : "",
        totalAmount: isCustomPlan ? customPlanTotalAmount : (tour?.price ?? 0) * guests,
        customerName,
        email,
        phone,
        departDate,
        guests,
        locale,
        paymentMethod,
        optionKeys,
        memo,
        amount,
    });

    if (!order) {
        return NextResponse.json(
            { error: "Failed to create a payment order." },
            { status: 500 }
        );
    }

    const orderTitle = isCustomPlan ? customPlanTitle : tour?.title[resolveLocale(locale)] ?? "";

    return NextResponse.json({
        clientKey: getTossClientKey(),
        orderId,
        customerKey,
        orderName: buildOrderName(locale, orderTitle),
        amount,
        customerName,
        customerMobilePhone: phone,
        successUrl,
        failUrl,
    });
}
