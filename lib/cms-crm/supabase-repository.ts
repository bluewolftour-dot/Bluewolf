import { tours, type Tour } from "@/lib/bluewolf-data";
import { normalizeCmsTourImages } from "@/lib/cms-image";
import { defaultCmsHomeContent, normalizeCmsHomeContent } from "@/lib/cms-home";
import {
    defaultCmsCommunityContent,
    normalizeCmsCommunityContent,
} from "@/lib/cms-community";
import {
    defaultCmsTourOptionsContent,
    normalizeCmsTourOptionsContent,
} from "@/lib/cms-tour-options";
import {
    defaultCmsTourRegionCardsContent,
    normalizeCmsTourRegionCardsContent,
} from "@/lib/cms-tour-region-cards";
import {
    defaultCmsTourCustomizeContent,
    normalizeCmsTourCustomizeContent,
} from "@/lib/cms-tour-customize";
import {
    defaultCmsTourThemesContent,
    normalizeCmsTourThemesContent,
} from "@/lib/cms-tour-themes";
import {
    supabaseDelete,
    supabaseInsertOne,
    supabasePatch,
    supabaseRpcRequest,
    supabaseRestRequest,
    supabaseSelectOne,
    supabaseUpsertOne,
} from "@/lib/supabase-server";
import type {
    CmsCommunityRecord,
    CmsHomeRecord,
    CmsTourCustomizeRecord,
    CmsTourOptionsRecord,
    CmsTourRecord,
    CmsTourRegionCardsRecord,
    CmsTourThemesRecord,
    CrmBookingRecord,
    CrmInquiryRecord,
    CrmPaymentOrderRecord,
} from "@/lib/cms-crm/types";

type SingletonTable =
    | "cms_home_content"
    | "cms_community_content"
    | "cms_tour_options_content"
    | "cms_tour_region_cards_content"
    | "cms_tour_customize_content"
    | "cms_tour_themes_content";

type SingletonRow = {
    id: number;
    content: unknown;
    updated_at: string;
};

type SupabaseTourRow = {
    id: number;
    region: Tour["region"];
    theme: Tour["theme"];
    duration_type: Tour["durationType"];
    price: number;
    deposit: number;
    gradient: string;
    hero_image: string;
    images: string[];
    detail_images: string[];
    title: Tour["title"];
    description: Tour["desc"];
    tags: Tour["tags"];
    tag_colors: Tour["tagColors"];
    duration: Tour["duration"];
    highlights: Tour["highlights"];
    created_at: string;
    updated_at: string;
};

type SupabaseBookingRow = {
    id: number;
    booking_no: string;
    tour_id: number;
    custom_title: string;
    custom_summary: string;
    total_amount: number;
    deposit_amount: number;
    customer_name: string;
    email: string;
    phone: string;
    depart_date: string;
    guests: number;
    locale: string;
    status: string;
    cancel_reason: string | null;
    cancel_memo: string | null;
    created_at: string;
};

type SupabasePaymentOrderRow = {
    id: number;
    order_id: string;
    tour_id: number;
    custom_title: string;
    custom_summary: string;
    total_amount: number;
    customer_name: string;
    email: string;
    phone: string;
    depart_date: string;
    guests: number;
    locale: string;
    payment_method: string;
    option_keys: string[];
    memo: string;
    amount: number;
    status: string;
    payment_key: string | null;
    booking_no: string | null;
    created_at: string;
    approved_at: string | null;
};

type SupabaseInquiryRow = {
    id: number;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    locale: string;
    status: string;
    created_at: string;
};

type FinalizePaymentRpcResult =
    | {
          ok: true;
          alreadyProcessed: boolean;
          booking: SupabaseBookingRow;
      }
    | {
          ok: false;
          code: "ORDER_NOT_FOUND" | "ORDER_NOT_PAYABLE" | "BOOKING_CREATE_FAILED";
      };

type CreateBookingInput = {
    tourId: number;
    customTitle?: string;
    customSummary?: string;
    totalAmount?: number;
    depositAmount?: number;
    customerName: string;
    email: string;
    phone: string;
    departDate: string;
    guests: number;
    locale: string;
    status?: string;
};

function asRecord(value: unknown) {
    return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function toTour(row: SupabaseTourRow): CmsTourRecord {
    return normalizeCmsTourImages({
        id: Number(row.id),
        region: row.region,
        theme: row.theme,
        durationType: row.duration_type,
        price: Number(row.price),
        deposit: Number(row.deposit),
        gradient: row.gradient,
        heroImage: row.hero_image,
        images: row.images ?? [],
        detailImages: row.detail_images ?? [],
        title: row.title,
        desc: row.description,
        tags: row.tags,
        tagColors: row.tag_colors ?? { ko: {}, ja: {}, en: {} },
        duration: row.duration,
        highlights: row.highlights,
    });
}

function fromTour(tour: CmsTourRecord) {
    const normalized = normalizeCmsTourImages(tour);
    return {
        id: normalized.id,
        region: normalized.region,
        theme: normalized.theme,
        duration_type: normalized.durationType,
        price: normalized.price,
        deposit: normalized.deposit,
        gradient: normalized.gradient,
        hero_image: normalized.heroImage,
        images: normalized.images,
        detail_images: normalized.detailImages,
        title: normalized.title,
        description: normalized.desc,
        tags: normalized.tags,
        tag_colors: normalized.tagColors ?? { ko: {}, ja: {}, en: {} },
        duration: normalized.duration,
        highlights: normalized.highlights,
        updated_at: new Date().toISOString(),
    };
}

async function getSingleton<T>(
    table: SingletonTable,
    fallback: T,
    normalize: (input: Partial<T>) => T
) {
    const row = await supabaseSelectOne<SingletonRow>(table, { id: "eq.1" });
    if (!row) return fallback;

    try {
        return normalize(asRecord(row.content) as Partial<T>);
    } catch {
        return fallback;
    }
}

async function saveSingleton<T>(
    table: SingletonTable,
    input: T,
    normalize: (input: T) => T,
    getSaved: () => Promise<T>
) {
    const normalized = normalize(input);
    await supabaseUpsertOne<SingletonRow>(
        table,
        { id: 1, content: normalized, updated_at: new Date().toISOString() },
        "id"
    );
    return getSaved();
}

function toInquiry(row: SupabaseInquiryRow): CrmInquiryRecord {
    return {
        id: Number(row.id),
        name: row.name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
        locale: row.locale,
        status: row.status,
        createdAt: row.created_at,
    };
}

async function bookingWithTour(row: SupabaseBookingRow): Promise<CrmBookingRecord> {
    return {
        id: Number(row.id),
        bookingNo: row.booking_no,
        tourId: Number(row.tour_id),
        customTitle: row.custom_title ?? "",
        customSummary: row.custom_summary ?? "",
        totalAmount: Number(row.total_amount ?? 0),
        depositAmount: Number(row.deposit_amount ?? 0),
        customerName: row.customer_name,
        email: row.email ?? "",
        phone: row.phone,
        departDate: String(row.depart_date),
        guests: Number(row.guests),
        locale: row.locale,
        status: row.status,
        cancelReason: row.cancel_reason,
        cancelMemo: row.cancel_memo,
        createdAt: row.created_at,
        tour: await getCmsTourById(Number(row.tour_id)),
    };
}

async function paymentOrderWithTour(row: SupabasePaymentOrderRow): Promise<CrmPaymentOrderRecord> {
    return {
        id: Number(row.id),
        orderId: row.order_id,
        tourId: Number(row.tour_id),
        customTitle: row.custom_title ?? "",
        customSummary: row.custom_summary ?? "",
        totalAmount: Number(row.total_amount ?? 0),
        customerName: row.customer_name,
        email: row.email ?? "",
        phone: row.phone,
        departDate: String(row.depart_date),
        guests: Number(row.guests),
        locale: row.locale,
        paymentMethod: row.payment_method,
        optionKeys: row.option_keys ?? [],
        memo: row.memo ?? "",
        amount: Number(row.amount),
        status: row.status,
        paymentKey: row.payment_key,
        bookingNo: row.booking_no,
        createdAt: row.created_at,
        approvedAt: row.approved_at,
        tour: await getCmsTourById(Number(row.tour_id)),
    };
}

async function findCrmBookingByNo(bookingNo: string) {
    const row = await supabaseSelectOne<SupabaseBookingRow>("crm_bookings", {
        booking_no: `eq.${bookingNo.trim()}`,
    });
    return row ? bookingWithTour(row) : null;
}

async function buildCrmBookingNo() {
    const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");

    while (true) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const bookingNo = `BW-${stamp}-${suffix}`;
        const exists = await findCrmBookingByNo(bookingNo);
        if (!exists) return bookingNo;
    }
}

export async function getCmsHomeContent(): Promise<CmsHomeRecord> {
    return getSingleton("cms_home_content", defaultCmsHomeContent, normalizeCmsHomeContent);
}

export async function saveCmsHomeContent(input: CmsHomeRecord) {
    return saveSingleton("cms_home_content", input, normalizeCmsHomeContent, getCmsHomeContent);
}

export async function getCmsCommunityContent(): Promise<CmsCommunityRecord> {
    return getSingleton("cms_community_content", defaultCmsCommunityContent, normalizeCmsCommunityContent);
}

export async function saveCmsCommunityContent(input: CmsCommunityRecord) {
    return saveSingleton("cms_community_content", input, normalizeCmsCommunityContent, getCmsCommunityContent);
}

export async function getCmsTourOptionsContent(): Promise<CmsTourOptionsRecord> {
    return getSingleton("cms_tour_options_content", defaultCmsTourOptionsContent, normalizeCmsTourOptionsContent);
}

export async function saveCmsTourOptionsContent(input: CmsTourOptionsRecord) {
    return saveSingleton("cms_tour_options_content", input, normalizeCmsTourOptionsContent, getCmsTourOptionsContent);
}

export async function getCmsTourRegionCardsContent(): Promise<CmsTourRegionCardsRecord> {
    return getSingleton("cms_tour_region_cards_content", defaultCmsTourRegionCardsContent, normalizeCmsTourRegionCardsContent);
}

export async function saveCmsTourRegionCardsContent(input: CmsTourRegionCardsRecord) {
    return saveSingleton("cms_tour_region_cards_content", input, normalizeCmsTourRegionCardsContent, getCmsTourRegionCardsContent);
}

export async function getCmsTourCustomizeContent(): Promise<CmsTourCustomizeRecord> {
    return getSingleton("cms_tour_customize_content", defaultCmsTourCustomizeContent, normalizeCmsTourCustomizeContent);
}

export async function saveCmsTourCustomizeContent(input: CmsTourCustomizeRecord) {
    return saveSingleton("cms_tour_customize_content", input, normalizeCmsTourCustomizeContent, getCmsTourCustomizeContent);
}

export async function getCmsTourThemesContent(): Promise<CmsTourThemesRecord> {
    return getSingleton("cms_tour_themes_content", defaultCmsTourThemesContent, normalizeCmsTourThemesContent);
}

export async function saveCmsTourThemesContent(input: CmsTourThemesRecord) {
    return saveSingleton("cms_tour_themes_content", input, normalizeCmsTourThemesContent, getCmsTourThemesContent);
}

export async function getAllCmsTours() {
    const rows = await supabaseRestRequest<SupabaseTourRow[]>("cms_tours", {
        query: { select: "*", order: "id.asc" },
    });

    return rows.length > 0 ? rows.map(toTour) : tours;
}

export async function getCmsTourById(id: number) {
    const row = await supabaseSelectOne<SupabaseTourRow>("cms_tours", { id: `eq.${id}` });
    return row ? toTour(row) : tours.find((tour) => tour.id === id) ?? null;
}

export async function saveCmsTour(input: CmsTourRecord) {
    const row = await supabaseUpsertOne<SupabaseTourRow>("cms_tours", fromTour(input), "id");
    return row ? toTour(row) : getCmsTourById(input.id);
}

export async function deleteCmsTour(id: number) {
    const existing = await getCmsTourById(id);
    if (!existing) return null;
    await supabaseDelete("cms_tours", { id: `eq.${id}` });
    return existing;
}

export async function createCrmInquiry(input: Omit<CrmInquiryRecord, "id" | "status" | "createdAt">) {
    const row = await supabaseInsertOne<SupabaseInquiryRow>("crm_inquiries", {
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
        locale: input.locale,
        status: "new",
    });
    return Number(row?.id ?? 0);
}

export async function getCrmInquiries() {
    const rows = await supabaseRestRequest<SupabaseInquiryRow[]>("crm_inquiries", {
        query: { select: "*", order: "created_at.desc" },
    });
    return rows.map(toInquiry);
}

export async function updateCrmInquiryStatus(id: number, status: string) {
    const allowedStatuses = new Set(["new", "checking", "answered", "closed"]);
    const normalizedStatus = allowedStatuses.has(status) ? status : "new";
    const rows = await supabasePatch<SupabaseInquiryRow>(
        "crm_inquiries",
        { id: `eq.${id}` },
        { status: normalizedStatus }
    );
    return rows[0] ? toInquiry(rows[0]) : null;
}

export async function getCrmPaymentOrder(orderId: string) {
    const row = await supabaseSelectOne<SupabasePaymentOrderRow>("crm_payment_orders", {
        order_id: `eq.${orderId.trim()}`,
    });
    return row ? paymentOrderWithTour(row) : null;
}

export async function getCrmPaymentOrders() {
    const rows = await supabaseRestRequest<SupabasePaymentOrderRow[]>("crm_payment_orders", {
        query: { select: "*", order: "created_at.desc" },
    });
    return Promise.all(rows.map(paymentOrderWithTour));
}

export async function getCrmPaymentOrderByBookingNo(bookingNo: string) {
    const rows = await supabaseRestRequest<SupabasePaymentOrderRow[]>("crm_payment_orders", {
        query: {
            booking_no: `eq.${bookingNo.trim()}`,
            select: "*",
            order: "created_at.desc",
            limit: "1",
        },
    });
    return rows[0] ? paymentOrderWithTour(rows[0]) : null;
}

export async function markCrmPaymentOrderCancelledByBookingNo(bookingNo: string) {
    const rows = await supabasePatch<SupabasePaymentOrderRow>(
        "crm_payment_orders",
        { booking_no: `eq.${bookingNo.trim()}` },
        { status: "cancelled" }
    );
    return rows[0] ? paymentOrderWithTour(rows[0]) : null;
}

export async function createCrmPaymentOrder(input: {
    orderId: string;
    tourId: number;
    customTitle?: string;
    customSummary?: string;
    totalAmount?: number;
    customerName: string;
    email: string;
    phone: string;
    departDate: string;
    guests: number;
    locale: string;
    paymentMethod: string;
    optionKeys: string[];
    memo: string;
    amount: number;
}) {
    await supabaseInsertOne<SupabasePaymentOrderRow>("crm_payment_orders", {
        order_id: input.orderId.trim(),
        tour_id: input.tourId,
        custom_title: input.customTitle?.trim() ?? "",
        custom_summary: input.customSummary?.trim() ?? "",
        total_amount: Math.max(0, Math.round(Number(input.totalAmount ?? 0))),
        customer_name: input.customerName.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        depart_date: input.departDate.trim(),
        guests: input.guests,
        locale: input.locale.trim(),
        payment_method: input.paymentMethod.trim(),
        option_keys: input.optionKeys,
        memo: input.memo.trim(),
        amount: input.amount,
        status: "ready",
    });

    return getCrmPaymentOrder(input.orderId);
}

export async function completeCrmPaymentOrder(input: {
    orderId: string;
    paymentKey: string;
    bookingNo: string;
}) {
    const rows = await supabasePatch<SupabasePaymentOrderRow>(
        "crm_payment_orders",
        { order_id: `eq.${input.orderId.trim()}` },
        {
            status: "paid",
            payment_key: input.paymentKey.trim(),
            booking_no: input.bookingNo.trim(),
            approved_at: new Date().toISOString(),
        }
    );
    return rows[0] ? paymentOrderWithTour(rows[0]) : null;
}

export async function finalizeCrmPaymentOrderWithBooking(input: {
    orderId: string;
    paymentKey: string;
    booking: CreateBookingInput;
}): Promise<
    | { ok: true; booking: CrmBookingRecord; alreadyProcessed: boolean }
    | { ok: false; code: "ORDER_NOT_FOUND" | "ORDER_NOT_PAYABLE" | "BOOKING_CREATE_FAILED" }
> {
    const result = await supabaseRpcRequest<FinalizePaymentRpcResult>("bluewolf_finalize_payment_order_with_booking", {
        body: {
            p_order_id: input.orderId.trim(),
            p_payment_key: input.paymentKey.trim(),
            p_tour_id: input.booking.tourId,
            p_custom_title: input.booking.customTitle?.trim() ?? "",
            p_custom_summary: input.booking.customSummary?.trim() ?? "",
            p_total_amount: Math.max(0, Math.round(Number(input.booking.totalAmount ?? 0))),
            p_deposit_amount: Math.max(0, Math.round(Number(input.booking.depositAmount ?? 0))),
            p_customer_name: input.booking.customerName.trim(),
            p_email: input.booking.email.trim(),
            p_phone: input.booking.phone.trim(),
            p_depart_date: input.booking.departDate.trim(),
            p_guests: input.booking.guests,
            p_locale: input.booking.locale.trim(),
            p_status: input.booking.status?.trim() || "pending",
        },
    });

    if (!result.ok) return result;

    return {
        ok: true,
        booking: await bookingWithTour(result.booking),
        alreadyProcessed: result.alreadyProcessed,
    };
}

export async function createCrmBooking(input: CreateBookingInput) {
    const bookingNo = await buildCrmBookingNo();
    const status = input.status?.trim() || "confirmed";
    const tour = await getCmsTourById(input.tourId);
    const totalAmount = Math.max(
        0,
        Math.round(Number(input.totalAmount && input.totalAmount > 0 ? input.totalAmount : (tour?.price ?? 0) * input.guests))
    );
    const depositAmount = Math.max(
        0,
        Math.round(Number(input.depositAmount && input.depositAmount > 0 ? input.depositAmount : (tour?.deposit ?? 0) * input.guests))
    );

    await supabaseInsertOne<SupabaseBookingRow>("crm_bookings", {
        booking_no: bookingNo,
        tour_id: input.tourId,
        custom_title: input.customTitle?.trim() ?? "",
        custom_summary: input.customSummary?.trim() ?? "",
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        customer_name: input.customerName.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        depart_date: input.departDate.trim(),
        guests: input.guests,
        locale: input.locale.trim(),
        status,
    });

    return findCrmBookingByNo(bookingNo);
}

export async function getCrmBookings(): Promise<CrmBookingRecord[]> {
    const rows = await supabaseRestRequest<SupabaseBookingRow[]>("crm_bookings", {
        query: { select: "*", order: "created_at.desc" },
    });
    return Promise.all(rows.map(bookingWithTour));
}

export async function getCrmBookingsByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return [];
    const rows = await supabaseRestRequest<SupabaseBookingRow[]>("crm_bookings", {
        query: {
            email: `eq.${normalized}`,
            select: "*",
            order: "created_at.desc",
        },
    });
    return Promise.all(rows.map(bookingWithTour));
}

export async function updateCrmBookingStatus(id: number, status: string) {
    const allowedStatuses = new Set(["pending", "confirmed", "paid", "completed", "cancelled"]);
    const normalizedStatus = allowedStatuses.has(status) ? status : "pending";
    const rows = await supabasePatch<SupabaseBookingRow>(
        "crm_bookings",
        { id: `eq.${id}` },
        { status: normalizedStatus }
    );
    return rows[0] ? bookingWithTour(rows[0]) : null;
}

export async function getCrmBookingById(id: number) {
    const row = await supabaseSelectOne<SupabaseBookingRow>("crm_bookings", { id: `eq.${id}` });
    return row ? bookingWithTour(row) : null;
}

export async function cancelCrmBookingById(input: {
    id: number;
    cancelReason: string;
    cancelMemo: string;
}) {
    const rows = await supabasePatch<SupabaseBookingRow>(
        "crm_bookings",
        { id: `eq.${input.id}` },
        {
            status: "cancelled",
            cancel_reason: input.cancelReason.trim(),
            cancel_memo: input.cancelMemo.trim(),
        }
    );
    return rows[0] ? bookingWithTour(rows[0]) : null;
}

export async function findCrmBookingByNoForEmail(bookingNo: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return null;
    const rows = await supabaseRestRequest<SupabaseBookingRow[]>("crm_bookings", {
        query: {
            booking_no: `eq.${bookingNo.trim()}`,
            email: `eq.${normalizedEmail}`,
            select: "*",
            order: "created_at.desc",
            limit: "1",
        },
    });
    return rows[0] ? bookingWithTour(rows[0]) : null;
}

export async function findCrmBooking(bookingNo: string, customerName: string) {
    const rows = await supabaseRestRequest<SupabaseBookingRow[]>("crm_bookings", {
        query: {
            booking_no: `eq.${bookingNo.trim()}`,
            customer_name: `eq.${customerName.trim()}`,
            select: "*",
            order: "created_at.desc",
            limit: "1",
        },
    });
    return rows[0] ? bookingWithTour(rows[0]) : null;
}

export async function cancelCrmBooking(input: {
    bookingNo: string;
    customerName: string;
    cancelReason: string;
    cancelMemo: string;
}) {
    const target = await findCrmBooking(input.bookingNo, input.customerName);
    if (!target) return null;
    return cancelCrmBookingById({
        id: target.id,
        cancelReason: input.cancelReason,
        cancelMemo: input.cancelMemo,
    });
}

export async function getCrmOverview() {
    const inquiries = await getCrmInquiries();
    const bookings = await getCrmBookings();

    return {
        inquiryCount: inquiries.length,
        bookingCount: bookings.length,
        cancelledCount: bookings.filter((booking) => booking.status === "cancelled").length,
        latestInquiryAt: inquiries[0]?.createdAt ?? null,
        latestBookingAt: bookings[0]?.createdAt ?? null,
    };
}
