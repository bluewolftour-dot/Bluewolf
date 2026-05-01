import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { createCrmInquiry, findCrmBookingByNoForEmail } from "@/lib/cms-crm-db";

const SESSION_COOKIE = "bluewolf_session";

type ReceiptRequestBody = {
    bookingNo?: string;
    requestType?: "receipt" | "tax_invoice";
    businessInfo?: string;
};

function getRequestLabel(type: ReceiptRequestBody["requestType"]) {
    return type === "tax_invoice" ? "세금계산서" : "영수증";
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user?.email) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await request.json()) as ReceiptRequestBody;
    const bookingNo = body.bookingNo?.trim() ?? "";
    const requestType = body.requestType === "tax_invoice" ? "tax_invoice" : "receipt";
    const businessInfo = body.businessInfo?.trim() ?? "";

    if (!bookingNo) {
        return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const booking = findCrmBookingByNoForEmail(bookingNo, user.email);
    if (!booking) {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const label = getRequestLabel(requestType);
    const tourTitle = booking.customTitle || booking.tour?.title.ko || "맞춤 여행 플랜";
    const message = [
        `${label} 발급 요청`,
        `예약번호: ${booking.bookingNo}`,
        `상품명: ${tourTitle}`,
        `예약자: ${booking.customerName}`,
        `이메일: ${booking.email}`,
        `전화번호: ${booking.phone}`,
        businessInfo ? `사업자/발급 정보: ${businessInfo}` : "",
    ]
        .filter(Boolean)
        .join("\n");

    const inquiryId = createCrmInquiry({
        name: booking.customerName,
        email: booking.email,
        phone: booking.phone,
        subject: `${label} 발급 요청 · ${booking.bookingNo}`,
        message,
        locale: booking.locale,
    });

    return NextResponse.json({ ok: true, inquiryId });
}
