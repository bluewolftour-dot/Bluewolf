import { CommunityBoardPage } from "@/components/community/CommunityBoardPage";
import { PageShell } from "@/components/layout/PageShell";
import { getCurrentKstIso } from "@/lib/kst-time";

export default function CommunityMatesPage() {
    const referenceNowKst = getCurrentKstIso();

    return (
        <PageShell activeKey="community">
            <CommunityBoardPage board="mate" referenceNowKst={referenceNowKst} />
        </PageShell>
    );
}
