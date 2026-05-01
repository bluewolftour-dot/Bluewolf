"use client";

import { useParams } from "next/navigation";
import { StructuredInfoPage } from "@/components/site/StructuredInfoPage";
import { siteGuides } from "@/lib/site-structure";

export default function GuideDetailPage() {
    const params = useParams<{ slug: string }>();
    const guide = siteGuides.find((item) => item.slug === params.slug) ?? siteGuides[0];

    return (
        <StructuredInfoPage
            activeKey="faq"
            eyebrow="Travel Guide"
            title={guide.title.ko}
            description={guide.summary.ko}
            cards={guide.sections.map((section) => ({
                title: section.title.ko,
                body: section.body.ko,
            }))}
            actions={[{ href: "/guides", label: "가이드 목록" }]}
        />
    );
}
