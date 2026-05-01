import { CommunityBoardPage } from "@/components/community/CommunityBoardPage";
import { PageShell } from "@/components/layout/PageShell";
import { getCurrentKstIso } from "@/lib/kst-time";

export default function CommunityReviewsPage() {
    const referenceNowKst = getCurrentKstIso();

    return (
        <PageShell activeKey="community">
            <CommunityBoardPage board="review" referenceNowKst={referenceNowKst} />
        </PageShell>
    );
}
