"use client";

import { PageShell } from "@/components/layout/PageShell";
import { ToursCustomizeContent } from "@/components/tours/ToursCustomizeContent";

export default function ToursCustomizePage() {
    return (
        <PageShell activeKey="tours">
            <ToursCustomizeContent />
        </PageShell>
    );
}
