export const faq = {
    ko: [
        ["항공권도 함께 예약해주나요?", "기본 상품은 항공권 별도이지만 요청 시 별도 상담이 가능합니다."],
        ["1명도 예약 가능한가요?", "일부 상품은 1인 출발이 가능하며 조건에 따라 요금이 달라질 수 있습니다."],
        ["결제 수단은 어떤 것이 있나요?", "카드, 계좌이체, 간편결제 확장 구조로 설계했습니다."],
    ],
    ja: [
        ["航空券も一緒に予約できますか？", "基本商品には航空券は含まれませんが、別途ご案内可能です。"],
        ["1名でも予約できますか？", "一部商品は1名参加可能で、条件により料金が変わります。"],
        ["決済手段は何がありますか？", "カード、銀行振込、簡単決済に拡張できる構造です。"],
    ],
    en: [
        ["Can you also help with flights?", "Flights are usually excluded, but we can assist separately on request."],
        ["Can solo travelers book?", "Some tours support solo departure, depending on route and pricing conditions."],
        ["What payment methods are available?", "The structure supports card, bank transfer, and quick-pay expansion."],
    ],
} as const;

export const publishingSteps = {
    ko: [
        { title: "1단계 · MVP 공개", desc: "정적 랜딩, 상품 탐색, 예약 접수 중심으로 빠르게 오픈" },
        { title: "2단계 · 운영 기능 연결", desc: "결제, 관리자, 문의 흐름을 연결해 실제 운영 전환" },
        { title: "3단계 · 실서비스 확장", desc: "커뮤니티, 후기, 다국어 SEO, 분석 고도화 적용" },
    ],
    ja: [
        { title: "第1段階 · MVP公開", desc: "静的ランディングと商品閲覧、予約受付中心で素早く公開" },
        { title: "第2段階 · 運用機能接続", desc: "決済、管理、問い合わせ導線をつなぎ実運用に移行" },
        { title: "第3段階 · 本番拡張", desc: "コミュニティ、レビュー、多言語SEO、分析を高度化" },
    ],
    en: [
        { title: "Phase 1 · MVP Launch", desc: "Launch quickly with landing, catalog, and booking request flow." },
        { title: "Phase 2 · Ops Integration", desc: "Connect payment, admin, and inquiry workflow for live operations." },
        { title: "Phase 3 · Scale Up", desc: "Expand community, reviews, multilingual SEO, and analytics." },
    ],
} as const;
