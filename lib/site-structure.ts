import type { Locale, Region } from "@/lib/bluewolf-data";

export type StructuredCopy = Record<Locale, string>;

export type SiteGuide = {
    slug: string;
    title: StructuredCopy;
    summary: StructuredCopy;
    sections: Array<{
        title: StructuredCopy;
        body: StructuredCopy;
    }>;
};

export type SitePolicy = {
    slug: string;
    title: StructuredCopy;
    summary: StructuredCopy;
    points: StructuredCopy[];
};

export const regionLandingContent: Record<Region, {
    label: StructuredCopy;
    title: StructuredCopy;
    summary: StructuredCopy;
    highlights: StructuredCopy[];
}> = {
    south: {
        label: { ko: "남부", ja: "南部", en: "South" },
        title: { ko: "사막과 별빛을 따라가는 남부 여행", ja: "砂漠と星空を巡る南部の旅", en: "Southern routes through desert and stars" },
        summary: {
            ko: "고비 사막, 홍고린 엘스, 욜링암처럼 몽골의 강렬한 자연을 만나는 지역입니다.",
            ja: "ゴビ砂漠、ホンゴリン・エルス、ヨリーン・アムなど、モンゴルらしい自然を体験できるエリアです。",
            en: "Explore Gobi Desert landscapes, dunes, canyons, and vast night skies.",
        },
        highlights: [
            { ko: "별보기와 사막 일몰", ja: "星空観賞と砂漠の夕日", en: "Stargazing and desert sunsets" },
            { ko: "낙타 체험과 게르 숙박", ja: "ラクダ体験とゲル宿泊", en: "Camel experiences and ger stays" },
            { ko: "장거리 이동을 고려한 일정 설계", ja: "長距離移動を考慮した日程", en: "Itineraries planned around long drives" },
        ],
    },
    north: {
        label: { ko: "북부", ja: "北部", en: "North" },
        title: { ko: "호수와 숲이 중심이 되는 북부 여행", ja: "湖と森が中心の北部旅", en: "Northern journeys around lakes and forests" },
        summary: {
            ko: "홉스골 호수와 타이가 숲을 중심으로 여유 있고 자연 친화적인 여행을 구성합니다.",
            ja: "フブスグル湖とタイガの森を中心に、ゆったりとした自然旅を楽しめます。",
            en: "A slower nature-first route built around Khuvsgul Lake and taiga forests.",
        },
        highlights: [
            { ko: "호수 휴식과 승마", ja: "湖畔での休息と乗馬", en: "Lake stays and horse riding" },
            { ko: "가족 여행에 적합한 동선", ja: "家族旅行に向いた動線", en: "Family-friendly routing" },
            { ko: "여름 시즌 인기 지역", ja: "夏に人気のエリア", en: "Popular summer destination" },
        ],
    },
    central: {
        label: { ko: "중부", ja: "中部", en: "Central" },
        title: { ko: "초원과 역사 유적을 함께 보는 중부 여행", ja: "草原と歴史を巡る中部旅", en: "Central routes across steppe and history" },
        summary: {
            ko: "테를지, 카라코룸, 엘승타사르해를 중심으로 입문자에게 좋은 균형형 코스입니다.",
            ja: "テレルジ、カラコルム、エルセンタサルハイを巡る、初めての方にもおすすめのエリアです。",
            en: "Balanced routes through Terelj, Karakorum, and Elsen Tasarkhai for first-time travelers.",
        },
        highlights: [
            { ko: "짧은 일정에도 적합", ja: "短い日程にも対応", en: "Works well for shorter trips" },
            { ko: "초원, 사원, 미니사막 조합", ja: "草原、寺院、ミニ砂漠の組み合わせ", en: "Steppe, temples, and mini desert" },
            { ko: "가성비 좋은 대표 코스", ja: "コスパの良い定番コース", en: "High-value classic itinerary" },
        ],
    },
    west: {
        label: { ko: "서부", ja: "西部", en: "West" },
        title: { ko: "알타이와 독수리 문화를 만나는 서부 여행", ja: "アルタイと鷲文化を巡る西部旅", en: "Western journeys into Altai and eagle culture" },
        summary: {
            ko: "알타이 산맥, 카자흐 문화, 독수리 축제가 중심이 되는 프리미엄 장거리 여행입니다.",
            ja: "アルタイ山脈、カザフ文化、鷲祭りを中心としたプレミアムな長距離旅です。",
            en: "Premium long-distance routes focused on Altai mountains, Kazakh culture, and eagle traditions.",
        },
        highlights: [
            { ko: "항공 이동 중심의 고급 일정", ja: "航空移動を含む上質な日程", en: "Flight-based premium routing" },
            { ko: "사진가와 모험가에게 적합", ja: "写真家や冒険好きにおすすめ", en: "Ideal for photographers and adventurers" },
            { ko: "계절성 축제 일정 확인 필요", ja: "季節イベントの日程確認が必要", en: "Seasonal festival timing matters" },
        ],
    },
};

export const siteGuides: SiteGuide[] = [
    {
        slug: "visa",
        title: { ko: "비자와 입국", ja: "ビザと入国", en: "Visa and Entry" },
        summary: { ko: "여권 유효기간, 무비자 체류, 입국 전 확인 사항을 정리했습니다.", ja: "パスポート有効期間、ビザなし滞在、入国前の確認事項をまとめました。", en: "Passport validity, visa-free stays, and pre-entry checks." },
        sections: [
            { title: { ko: "여권", ja: "パスポート", en: "Passport" }, body: { ko: "출국 전 여권 유효기간이 충분히 남아 있는지 확인해야 합니다.", ja: "出発前にパスポートの残存有効期間を確認してください。", en: "Check that your passport remains valid for the required period before departure." } },
            { title: { ko: "입국 조건", ja: "入国条件", en: "Entry Conditions" }, body: { ko: "국적별 체류 조건은 변경될 수 있으므로 출발 전 최신 안내를 확인해야 합니다.", ja: "国籍別の滞在条件は変更される場合があるため、出発前に最新情報をご確認ください。", en: "Entry rules can change by nationality, so verify the latest guidance before departure." } },
        ],
    },
    {
        slug: "packing",
        title: { ko: "준비물", ja: "持ち物", en: "Packing" },
        summary: { ko: "일교차, 장거리 이동, 게르 숙박을 고려한 준비물을 안내합니다.", ja: "寒暖差、長距離移動、ゲル宿泊を考慮した持ち物です。", en: "Packing guidance for temperature swings, long drives, and ger stays." },
        sections: [
            { title: { ko: "복장", ja: "服装", en: "Clothing" }, body: { ko: "얇은 옷을 여러 겹 준비하고 방풍 재킷을 챙기는 것이 좋습니다.", ja: "重ね着できる服と防風ジャケットを用意すると安心です。", en: "Pack layers and a windproof jacket." } },
            { title: { ko: "개인 장비", ja: "個人用品", en: "Personal Items" }, body: { ko: "선크림, 보조배터리, 개인 상비약, 물티슈가 유용합니다.", ja: "日焼け止め、モバイルバッテリー、常備薬、ウェットティッシュが便利です。", en: "Sunscreen, power banks, personal medicine, and wet wipes are useful." } },
        ],
    },
    {
        slug: "money",
        title: { ko: "환전과 결제", ja: "両替と決済", en: "Money and Payment" },
        summary: { ko: "현지 현금 사용, 카드 사용 가능성, 팁과 개인 경비를 안내합니다.", ja: "現地での現金利用、カード利用、チップや個人費用について案内します。", en: "Cash, cards, tips, and personal expenses in Mongolia." },
        sections: [
            { title: { ko: "현금", ja: "現金", en: "Cash" }, body: { ko: "도시 외 지역에서는 현금이 더 안정적입니다.", ja: "都市部以外では現金の方が安心です。", en: "Cash is more reliable outside major cities." } },
            { title: { ko: "카드", ja: "カード", en: "Cards" }, body: { ko: "울란바토르에서는 카드 사용이 가능하지만 지방에서는 제한될 수 있습니다.", ja: "ウランバートルではカード利用が可能ですが、地方では制限されることがあります。", en: "Cards work in Ulaanbaatar but may be limited in rural areas." } },
        ],
    },
];

export const sitePolicies: SitePolicy[] = [
    {
        slug: "safety",
        title: { ko: "안전 정책", ja: "安全ポリシー", en: "Safety Policy" },
        summary: { ko: "장거리 이동, 현지 기상, 응급 상황에 대비하는 운영 기준입니다.", ja: "長距離移動、現地天候、緊急時に備える運営基準です。", en: "Operating standards for long drives, weather, and emergencies." },
        points: [
            { ko: "현지 기사와 가이드가 일정 전반을 함께 확인합니다.", ja: "現地ドライバーとガイドが日程全体を確認します。", en: "Local drivers and guides review each itinerary." },
            { ko: "기상과 도로 상황에 따라 일정이 조정될 수 있습니다.", ja: "天候や道路状況により日程を調整する場合があります。", en: "Itineraries may change based on weather and road conditions." },
        ],
    },
    {
        slug: "refund",
        title: { ko: "취소와 환불", ja: "キャンセルと返金", en: "Cancellation and Refund" },
        summary: { ko: "예약금, 취소 요청, 환불 확인 흐름을 안내합니다.", ja: "予約金、キャンセル申請、返金確認の流れを案内します。", en: "Deposit, cancellation request, and refund review flow." },
        points: [
            { ko: "취소 신청은 예약 조회 페이지에서 접수할 수 있습니다.", ja: "キャンセル申請は予約照会ページから行えます。", en: "Cancellation requests can be submitted from the booking lookup page." },
            { ko: "담당자 확인 후 환불 가능 여부와 금액을 안내합니다.", ja: "担当者確認後、返金可否と金額をご案内します。", en: "A manager confirms eligibility and refund amount." },
        ],
    },
    {
        slug: "privacy",
        title: { ko: "개인정보처리방침", ja: "個人情報保護方針", en: "Privacy Policy" },
        summary: { ko: "예약, 상담, 커뮤니티 운영을 위한 개인정보 처리 기준입니다.", ja: "予約、相談、コミュニティ運営のための個人情報取り扱い基準です。", en: "How personal data is handled for bookings, inquiries, and community features." },
        points: [
            { ko: "예약 확인과 상담에 필요한 최소 정보만 수집합니다.", ja: "予約確認と相談に必要な最小限の情報のみ収集します。", en: "Only the minimum data needed for bookings and support is collected." },
            { ko: "운영 목적 외 사용은 제한합니다.", ja: "運営目的以外での利用を制限します。", en: "Use outside operational purposes is restricted." },
        ],
    },
    {
        slug: "terms",
        title: { ko: "이용약관", ja: "利用規約", en: "Terms of Service" },
        summary: { ko: "서비스 이용, 예약, 커뮤니티 활동의 기본 약관입니다.", ja: "サービス利用、予約、コミュニティ活動に関する基本規約です。", en: "Basic terms for service use, bookings, and community activity." },
        points: [
            { ko: "허위 예약, 스팸, 타인 비방 게시글은 제한될 수 있습니다.", ja: "虚偽予約、スパム、誹謗中傷投稿は制限される場合があります。", en: "Fake bookings, spam, and abusive posts may be restricted." },
            { ko: "여행 상품의 세부 조건은 상품 상세와 예약 안내를 따릅니다.", ja: "旅行商品の詳細条件は商品詳細と予約案内に従います。", en: "Tour conditions follow the product details and booking guidance." },
        ],
    },
];
