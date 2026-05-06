import { isSupabaseDatabaseEnabled } from "@/lib/supabase-server";

export type * from "@/lib/cms-crm/types";

type SqliteRepository = typeof import("@/lib/cms-crm/sqlite-repository");
type SupabaseRepository = typeof import("@/lib/cms-crm/supabase-repository");
type CmsCrmRepository = SqliteRepository | SupabaseRepository;

let repositoryPromise: Promise<CmsCrmRepository> | null = null;

async function repository() {
    repositoryPromise ??= isSupabaseDatabaseEnabled()
        ? import("@/lib/cms-crm/supabase-repository")
        : import("@/lib/cms-crm/sqlite-repository");
    return repositoryPromise;
}

export async function getCmsHomeContent() {
    return (await repository()).getCmsHomeContent();
}

export async function saveCmsHomeContent(input: Parameters<SqliteRepository["saveCmsHomeContent"]>[0]) {
    return (await repository()).saveCmsHomeContent(input);
}

export async function getCmsCommunityContent() {
    return (await repository()).getCmsCommunityContent();
}

export async function saveCmsCommunityContent(input: Parameters<SqliteRepository["saveCmsCommunityContent"]>[0]) {
    return (await repository()).saveCmsCommunityContent(input);
}

export async function getCmsTourOptionsContent() {
    return (await repository()).getCmsTourOptionsContent();
}

export async function saveCmsTourOptionsContent(input: Parameters<SqliteRepository["saveCmsTourOptionsContent"]>[0]) {
    return (await repository()).saveCmsTourOptionsContent(input);
}

export async function getCmsTourRegionCardsContent() {
    return (await repository()).getCmsTourRegionCardsContent();
}

export async function saveCmsTourRegionCardsContent(input: Parameters<SqliteRepository["saveCmsTourRegionCardsContent"]>[0]) {
    return (await repository()).saveCmsTourRegionCardsContent(input);
}

export async function getCmsTourCustomizeContent() {
    return (await repository()).getCmsTourCustomizeContent();
}

export async function saveCmsTourCustomizeContent(input: Parameters<SqliteRepository["saveCmsTourCustomizeContent"]>[0]) {
    return (await repository()).saveCmsTourCustomizeContent(input);
}

export async function getCmsTourThemesContent() {
    return (await repository()).getCmsTourThemesContent();
}

export async function saveCmsTourThemesContent(input: Parameters<SqliteRepository["saveCmsTourThemesContent"]>[0]) {
    return (await repository()).saveCmsTourThemesContent(input);
}

export async function getAllCmsTours() {
    return (await repository()).getAllCmsTours();
}

export async function getCmsTourById(id: number) {
    return (await repository()).getCmsTourById(id);
}

export async function saveCmsTour(input: Parameters<SqliteRepository["saveCmsTour"]>[0]) {
    return (await repository()).saveCmsTour(input);
}

export async function deleteCmsTour(id: number) {
    return (await repository()).deleteCmsTour(id);
}

export async function createCrmInquiry(input: Parameters<SqliteRepository["createCrmInquiry"]>[0]) {
    return (await repository()).createCrmInquiry(input);
}

export async function getCrmInquiries() {
    return (await repository()).getCrmInquiries();
}

export async function updateCrmInquiryStatus(id: number, status: string) {
    return (await repository()).updateCrmInquiryStatus(id, status);
}

export async function getCrmPaymentOrder(orderId: string) {
    return (await repository()).getCrmPaymentOrder(orderId);
}

export async function getCrmPaymentOrders() {
    return (await repository()).getCrmPaymentOrders();
}

export async function getCrmPaymentOrderByBookingNo(bookingNo: string) {
    return (await repository()).getCrmPaymentOrderByBookingNo(bookingNo);
}

export async function markCrmPaymentOrderCancelledByBookingNo(bookingNo: string) {
    return (await repository()).markCrmPaymentOrderCancelledByBookingNo(bookingNo);
}

export async function createCrmPaymentOrder(input: Parameters<SqliteRepository["createCrmPaymentOrder"]>[0]) {
    return (await repository()).createCrmPaymentOrder(input);
}

export async function completeCrmPaymentOrder(input: Parameters<SqliteRepository["completeCrmPaymentOrder"]>[0]) {
    return (await repository()).completeCrmPaymentOrder(input);
}

export async function finalizeCrmPaymentOrderWithBooking(input: Parameters<SupabaseRepository["finalizeCrmPaymentOrderWithBooking"]>[0]) {
    return (await repository()).finalizeCrmPaymentOrderWithBooking(input);
}

export async function createCrmBooking(input: Parameters<SupabaseRepository["createCrmBooking"]>[0]) {
    return (await repository()).createCrmBooking(input);
}

export async function getCrmBookings() {
    return (await repository()).getCrmBookings();
}

export async function getCrmBookingsByEmail(email: string) {
    return (await repository()).getCrmBookingsByEmail(email);
}

export async function updateCrmBookingStatus(id: number, status: string) {
    return (await repository()).updateCrmBookingStatus(id, status);
}

export async function getCrmBookingById(id: number) {
    return (await repository()).getCrmBookingById(id);
}

export async function cancelCrmBookingById(input: Parameters<SqliteRepository["cancelCrmBookingById"]>[0]) {
    return (await repository()).cancelCrmBookingById(input);
}

export async function findCrmBookingByNoForEmail(bookingNo: string, email: string) {
    return (await repository()).findCrmBookingByNoForEmail(bookingNo, email);
}

export async function findCrmBooking(bookingNo: string, customerName: string) {
    return (await repository()).findCrmBooking(bookingNo, customerName);
}

export async function cancelCrmBooking(input: Parameters<SqliteRepository["cancelCrmBooking"]>[0]) {
    return (await repository()).cancelCrmBooking(input);
}

export async function getCrmOverview() {
    return (await repository()).getCrmOverview();
}
