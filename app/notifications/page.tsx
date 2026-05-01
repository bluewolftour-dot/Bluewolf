import { StructuredInfoPage } from "@/components/site/StructuredInfoPage";

export default function NotificationsPage() {
    return (
        <StructuredInfoPage
            activeKey="booking"
            eyebrow="Notification Center"
            title="알림 센터"
            description="예약 확정, 취소 접수, 동행 신청, 댓글 답변처럼 사용자가 놓치면 안 되는 이벤트를 모아보는 공간입니다."
            cards={[
                { title: "예약 확정", body: "결제가 완료되거나 담당자가 예약을 확정하면 알림으로 기록됩니다.", href: "/booking" },
                { title: "취소 접수", body: "취소 신청이 접수되면 처리 상태와 담당자 확인 여부를 확인할 수 있습니다.", href: "/booking" },
                { title: "동행 신청", body: "참가 신청한 동행 모집글의 모집 상태와 댓글 변화를 확인합니다.", href: "/community/mates" },
                { title: "댓글 답변", body: "내 게시글에 댓글이 달리거나 질문 답변이 등록되면 이곳에서 확인합니다.", href: "/community" },
            ]}
        />
    );
}
