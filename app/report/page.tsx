import { StructuredInfoPage } from "@/components/site/StructuredInfoPage";

export default function ReportPage() {
    return (
        <StructuredInfoPage
            activeKey="community"
            eyebrow="Community Safety"
            title="커뮤니티 신고와 검수"
            description="후기, 질문, 동행 모집글에서 부적절한 내용이 발견되면 운영팀이 검토할 수 있도록 접수하는 구조입니다."
            cards={[
                { title: "신고 접수", body: "스팸, 허위 정보, 비방, 개인정보 노출 게시글을 신고 대상으로 분류합니다." },
                { title: "운영팀 검토", body: "신고된 글과 댓글은 관리자 화면에서 숨김, 유지, 삭제 여부를 판단합니다.", href: "/crm" },
                { title: "작성자 안내", body: "삭제 또는 숨김 처리 시 작성자에게 사유를 안내하는 알림 구조와 연결됩니다.", href: "/notifications" },
                { title: "커뮤니티 기준", body: "여행자 간 신뢰를 해치는 게시글은 이용약관에 따라 제한될 수 있습니다.", href: "/policies/terms" },
            ]}
        />
    );
}
