import { StructuredInfoPage } from "@/components/site/StructuredInfoPage";
import { sitePolicies } from "@/lib/site-structure";

export default function PoliciesPage() {
    return (
        <StructuredInfoPage
            activeKey="about"
            eyebrow="Trust Center"
            title="신뢰와 운영 정책"
            description="안전, 취소와 환불, 개인정보, 이용약관을 한곳에서 확인할 수 있습니다."
            cards={sitePolicies.map((policy) => ({
                title: policy.title.ko,
                body: policy.summary.ko,
                href: `/policies/${policy.slug}`,
            }))}
        />
    );
}
