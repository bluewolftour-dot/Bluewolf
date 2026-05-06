import type { Tour } from "@/lib/bluewolf-data";
import type { CmsHomeContent } from "@/lib/cms-home";
import type { CmsCommunityContent } from "@/lib/cms-community";
import type { CmsTourOptionsContent } from "@/lib/cms-tour-options";
import type { CmsTourRegionCardsContent } from "@/lib/cms-tour-region-cards";
import type { CmsTourCustomizeContent } from "@/lib/cms-tour-customize";
import type { CmsTourThemesContent } from "@/lib/cms-tour-themes";

export type CmsTourRecord = Tour;
export type CmsHomeRecord = CmsHomeContent;
export type CmsCommunityRecord = CmsCommunityContent;
export type CmsTourOptionsRecord = CmsTourOptionsContent;
export type CmsTourRegionCardsRecord = CmsTourRegionCardsContent;
export type CmsTourCustomizeRecord = CmsTourCustomizeContent;
export type CmsTourThemesRecord = CmsTourThemesContent;

export type CrmInquiryRecord = {
    id: number;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    locale: string;
    status: string;
    createdAt: string;
};

export type CrmBookingRecord = {
    id: number;
    bookingNo: string;
    tourId: number;
    customTitle: string;
    customSummary: string;
    totalAmount: number;
    depositAmount: number;
    customerName: string;
    email: string;
    phone: string;
    departDate: string;
    guests: number;
    locale: string;
    status: string;
    cancelReason: string | null;
    cancelMemo: string | null;
    createdAt: string;
    tour: CmsTourRecord | null;
};

export type CrmPaymentOrderRecord = {
    id: number;
    orderId: string;
    tourId: number;
    customTitle: string;
    customSummary: string;
    totalAmount: number;
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
    status: string;
    paymentKey: string | null;
    bookingNo: string | null;
    createdAt: string;
    approvedAt: string | null;
    tour: CmsTourRecord | null;
};
