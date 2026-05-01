"use client";

import { useParams } from "next/navigation";
import { StructuredInfoPage } from "@/components/site/StructuredInfoPage";
import { sitePolicies } from "@/lib/site-structure";

export default function PolicyDetailPage() {
    const params = useParams<{ slug: string }>();
    const policy = sitePolicies.find((item) => item.slug === params.slug) ?? sitePolicies[0];

    return (
        <StructuredInfoPage
            activeKey="about"
            eyebrow="Trust Center"
            title={policy.title.ko}
            description={policy.summary.ko}
            cards={policy.points.map((point, index) => ({
                title: `${index + 1}`,
                body: point.ko,
            }))}
            actions={[{ href: "/policies", label: "정책 목록" }]}
        />
    );
}
