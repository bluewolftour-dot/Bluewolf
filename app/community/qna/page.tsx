import { CommunityBoardPage } from "@/components/community/CommunityBoardPage";
import { PageShell } from "@/components/layout/PageShell";
import { getCurrentKstIso } from "@/lib/kst-time";

export default function CommunityQnaPage() {
    const referenceNowKst = getCurrentKstIso();

    return (
        <PageShell activeKey="community">
            <CommunityBoardPage board="qna" referenceNowKst={referenceNowKst} />
        </PageShell>
    );
}
