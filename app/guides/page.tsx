import { StructuredInfoPage } from "@/components/site/StructuredInfoPage";
import { siteGuides } from "@/lib/site-structure";

export default function GuidesPage() {
    return (
        <StructuredInfoPage
            activeKey="faq"
            eyebrow="Travel Guide"
            title="여행 준비 가이드"
            description="비자, 준비물, 환전처럼 예약 전후에 반드시 확인해야 하는 정보를 모았습니다."
            cards={siteGuides.map((guide) => ({
                title: guide.title.ko,
                body: guide.summary.ko,
                href: `/guides/${guide.slug}`,
            }))}
        />
    );
}
