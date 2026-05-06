"use client";

import { useParams } from "next/navigation";
import { StructuredInfoPage } from "@/components/site/StructuredInfoPage";

export default function CustomPlanDetailPage() {
    const params = useParams<{ id: string }>();
    const planId = params.id ?? "";

    return (
        <StructuredInfoPage
            activeKey="tours"
            eyebrow="Custom Plan"
            title="맞춤 여행 플랜 상세"
            description={`플랜 ID ${planId} 기준으로 선택 요약, 문의 사항, 플랜 패키지 이용료 결제 상태를 확인하는 공간입니다.`}
            cards={[
                { title: "선택 요약", body: "여행 지역, 출발일, 도착일, 인원수, 추가 옵션을 예약 전후에 다시 확인합니다." },
                { title: "문의 사항", body: "고객이 입력한 추가 요청 사항과 담당자 확인 메모를 함께 관리합니다." },
                { title: "플랜 패키지 결제", body: "토스 결제 또는 계좌이체 상태를 기준으로 플랜 진행 단계를 표시합니다.", href: "/payment" },
                { title: "진행 상태 조회", body: "신청 번호가 발급된 후에는 진행 상태 조회 페이지에서 상세 확인을 진행합니다.", href: "/booking" },
            ]}
        />
    );
}
