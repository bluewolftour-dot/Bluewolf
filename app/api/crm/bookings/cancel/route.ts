import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        {
            error: "LOGIN_REQUIRED",
            message: "예약 취소는 로그인한 회원 본인 예약에서만 요청할 수 있습니다.",
        },
        { status: 401 }
    );
}
