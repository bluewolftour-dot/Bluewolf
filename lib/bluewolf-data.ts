import { normalizeCmsImageList, normalizeCmsImagePath, normalizeCmsTourImages } from "@/lib/cms-image";

export type Locale = "ko" | "ja" | "en";
export type CommunityTab = "all" | "review" | "mate" | "qna";
export type Region = "south" | "central" | "north" | "west";
export type Theme = string;
export type DurationType = "short" | "long";
export type TourTagColorKey =
    | "rose"
    | "slate"
    | "blue"
    | "sky"
    | "emerald"
    | "amber"
    | "violet"
    | "cyan";

export type Tour = {
    id: number;
    region: Region;
    theme: Theme;
    durationType: DurationType;
    price: number;
    deposit: number;
    gradient: string;
    heroImage: string;
    images: string[];
    detailImages: string[];
    title: Record<Locale, string>;
    desc: Record<Locale, string>;
    tags: Record<Locale, string[]>;
    tagColors?: Record<Locale, Record<string, TourTagColorKey>>;
    duration: Record<Locale, string>;
    highlights: Record<Locale, string[]>;
};

export type CommunityComment = {
    author: string;
    text: string;
    date: string;
};

export type CommunityNotice = {
    id: number;
    title: string;
    summary: string;
    date: string;
    href?: string;
    important?: boolean;
};

export type CommunityItem = {
    id: number;
    type: Exclude<CommunityTab, "all">;
    author: string;
    date: string;
    text: string;
    likes: number;
    // 후기 전용
    rating?: number;
    tourTitle?: string;
    // 동행 전용
    travelDate?: string;
    maxPeople?: number;
    currentPeople?: number;
    travelRegion?: string;
    // 질문 전용
    answered?: boolean;
    // 첨부 사진
    photos?: string[];
    // 댓글
    comments?: CommunityComment[];
};

export type HeroSlide = {
    eyebrow: string;
    title: string;
    desc: string;
    image: string;
    href?: string;
};

function normalizeSlidesByLocale(source: Record<Locale, HeroSlide[]>) {
    return Object.fromEntries(
        Object.entries(source).map(([locale, items]) => [
            locale,
            items.map((item) => ({
                ...item,
                image: normalizeCmsImagePath(item.image),
            })),
        ])
    ) as Record<Locale, HeroSlide[]>;
}

function normalizeCommunityByLocale(source: Record<Locale, CommunityItem[]>) {
    return Object.fromEntries(
        Object.entries(source).map(([locale, items]) => [
            locale,
            items.map((item) => ({
                ...item,
                photos: item.photos
                    ? normalizeCmsImageList(item.photos, item.photos.length || 1)
                    : undefined,
            })),
        ])
    ) as Record<Locale, CommunityItem[]>;
}

export const copy = {
    ko: {
        brand: "BlueWolf",
        navTours: "투어상품",
        navBooking: "예약",
        navCommunity: "커뮤니티",
        navFaq: "FAQ",
        login: "로그인",
        heroBadge: "몽골 여행, 더 쉽고 더 세련되게",
        heroTitle: "BlueWolf와 함께\n몽골 여행을 가장 편하게 예약하세요",
        heroDesc:
            "실제 운영을 고려한 몽골 여행 플랫폼. 상품 탐색, 예약, 결제, 후기, 동행 구하기까지 한 번에 연결되는 구조입니다.",
        heroPrimary: "여행 상품 보기",
        heroSecondary: "예약 상담 시작",
        searchPlaceholder: "상품명 또는 키워드 검색",
        allDuration: "전체 일정",
        shortDuration: "3~4일",
        longDuration: "5일 이상",
        allDurationShort: "4박 이하",
        allDurationLong: "5박 이상",
        allRegion: "전체 지역",
        gobi: "고비",
        south: "남부",
        central: "중부",
        north: "북부",
        west: "서부",
        allTheme: "전체 테마",
        desert: "사막",
        family: "가족",
        premium: "프리미엄",
        adventure: "어드벤처",
        popularSort: "인기순",
        lowSort: "낮은 가격순",
        highSort: "높은 가격순",
        featured: "추천 여행 상품",
        featuredDesc: "실제 판매용을 염두에 둔 검색/필터/상세 흐름입니다.",
        reset: "필터 초기화",
        details: "상세보기",
        reserve: "예약하기",
        bookingTitle: "예약 상담/신청",
        bookingDesc: "출발 희망일과 인원 정보를 입력하면 예상 금액이 자동 계산됩니다.",
        selectTour: "상품 선택",
        departDate: "출발 희망일",
        guests: "인원 수",
        name: "예약자 이름",
        phone: "연락처",
        memo: "요청사항",
        payDeposit: "예약금 결제 진행",
        getQuote: "견적서 받기",
        communityTitle: "동행 · 후기 커뮤니티",
        faqTitle: "자주 묻는 질문",
        footer: "몽골 전문 여행 플랫폼 · 한국어 / 일본어 / 영어 지원",
        dashboard1: "이번 달 방문자",
        dashboard2: "예약 전환율",
        dashboard3: "평균 객단가",
        dashboard4: "리뷰 평점",
        priceLabel: "1인 기준",
        selectedTour: "선택 상품",
        totalPrice: "예상 총액",
        deposit: "예약금",
        guestsLabel: "인원 수",
        noResults: "검색 결과가 없습니다.",
        noResultsDesc: "다른 조건으로 다시 검색해보세요.",
        tabAll: "전체",
        tabReview: "후기",
        tabMate: "동행",
        tabQna: "질문",
        payReady: "아직 결제가 진행되지 않았습니다.",
        payDone: "예약금 결제가 완료되었습니다. 운영자 확인 후 안내가 발송됩니다.",
        featuredLabel: "이벤트",
        pausedLabel: "일시정지",
        delete: "삭제",
        today: "오늘",
        weekdays: ["일", "월", "화", "수", "목", "금", "토"] as const,
        datePlaceholder: "연도-월-일",
        publishPhase1: "1단계 · MVP 공개",
        publishPhase2: "2단계 · 운영 기능 연결",
        publishPhase3: "3단계 · 실서비스 확장",
        publishDesc1: "정적 랜딩, 상품 탐색, 예약 접수 중심으로 빠르게 오픈",
        publishDesc2: "결제, 관리자, 문의 흐름을 연결해 실제 운영 전환",
        publishDesc3: "커뮤니티, 후기, 다국어 SEO, 분석 고도화 적용",
    },
    ja: {
        brand: "BlueWolf",
        navTours: "ツアー商品",
        navBooking: "予約",
        navCommunity: "コミュニティ",
        navFaq: "FAQ",
        login: "ログイン",
        heroBadge: "モンゴル旅行をもっと簡単に、もっと洗練して",
        heroTitle: "BlueWolfでモンゴル旅行をもっと手軽に予約",
        heroDesc:
            "実運用を意識したモンゴル旅行プラットフォーム。商品検索、予約、決済、レビュー、同行募集まで一つの流れでつながります。",
        heroPrimary: "商品を見る",
        heroSecondary: "予約相談を始める",
        searchPlaceholder: "商品名またはキーワード検索",
        allDuration: "全日程",
        shortDuration: "3〜4日",
        longDuration: "5日以上",
        allDurationShort: "4泊以下",
        allDurationLong: "5泊以上",
        allRegion: "全地域",
        gobi: "ゴビ",
        south: "南部",
        central: "中央",
        north: "北部",
        west: "西部",
        allTheme: "全テーマ",
        desert: "砂漠",
        family: "家族",
        premium: "プレミアム",
        adventure: "アドベンチャー",
        popularSort: "人気順",
        lowSort: "低価格順",
        highSort: "高価格順",
        featured: "おすすめツアー",
        featuredDesc: "実販売を想定した検索/フィルター/詳細導線です。",
        reset: "フィルター初期化",
        details: "詳細を見る",
        reserve: "予約する",
        bookingTitle: "予約相談/申込",
        bookingDesc: "出発希望日と人数を入力すると概算金額が自動計算されます。",
        selectTour: "商品選択",
        departDate: "出発希望日",
        guests: "人数",
        name: "予約者名",
        phone: "連絡先",
        memo: "リクエスト",
        payDeposit: "予約金を支払う",
        getQuote: "見積書を受け取る",
        communityTitle: "同行・レビューコミュニティ",
        faqTitle: "よくある質問",
        footer: "モンゴル専門旅行プラットフォーム · 韓国語 / 日本語 / 英語対応",
        dashboard1: "今月の訪問者",
        dashboard2: "予約転換率",
        dashboard3: "平均客単価",
        dashboard4: "レビュー評価",
        priceLabel: "1名料金",
        selectedTour: "選択商品",
        totalPrice: "概算総額",
        deposit: "予約金",
        guestsLabel: "人数",
        noResults: "検索結果がありません。",
        noResultsDesc: "条件を変えて再検索してください。",
        tabAll: "すべて",
        tabReview: "レビュー",
        tabMate: "同行",
        tabQna: "質問",
        payReady: "まだ決済は開始されていません。",
        payDone: "予約金の支払いが完了しました。確認後に案内が送信されます。",
        featuredLabel: "イベント",
        pausedLabel: "一時停止",
        delete: "削除",
        today: "今日",
        weekdays: ["日", "月", "火", "水", "木", "金", "土"] as const,
        datePlaceholder: "年-月-日",
        publishPhase1: "第1段階 · MVP公開",
        publishPhase2: "第2段階 · 運用機能接続",
        publishPhase3: "第3段階 · 本番拡張",
        publishDesc1: "静的ランディングと商品閲覧、予約受付中心で素早く公開",
        publishDesc2: "決済、管理、問い合わせ導線をつなぎ実運用に移行",
        publishDesc3: "コミュニティ、レビュー、多言語SEO、分析を高度化",
    },
    en: {
        brand: "BlueWolf",
        navTours: "Tours",
        navBooking: "Booking",
        navCommunity: "Community",
        navFaq: "FAQ",
        login: "Log in",
        heroBadge: "Mongolia travel, simpler and smarter",
        heroTitle: "Book your Mongolia trip with BlueWolf the easy way",
        heroDesc:
            "An operations-ready Mongolia travel platform connecting product discovery, booking, payment, reviews, and traveler community in one flow.",
        heroPrimary: "View tours",
        heroSecondary: "Start booking",
        searchPlaceholder: "Search by tour name or keyword",
        allDuration: "All durations",
        shortDuration: "3–4 days",
        longDuration: "5+ days",
        allDurationShort: "Up to 4 nights",
        allDurationLong: "5+ nights",
        allRegion: "All regions",
        gobi: "Gobi",
        south: "South",
        central: "Central",
        north: "North",
        west: "West",
        allTheme: "All themes",
        desert: "Desert",
        family: "Family",
        premium: "Premium",
        adventure: "Adventure",
        popularSort: "Most popular",
        lowSort: "Price: low to high",
        highSort: "Price: high to low",
        featured: "Featured tours",
        featuredDesc: "Search, filter, and detail flows designed for real conversion.",
        reset: "Reset filters",
        details: "View details",
        reserve: "Book now",
        bookingTitle: "Booking inquiry / application",
        bookingDesc: "Enter your preferred departure date and guest count to calculate the estimate automatically.",
        selectTour: "Select tour",
        departDate: "Preferred date",
        guests: "Guests",
        name: "Lead traveler",
        phone: "Phone number",
        memo: "Request details",
        payDeposit: "Pay deposit",
        getQuote: "Get quote",
        communityTitle: "Traveler community",
        faqTitle: "Frequently asked questions",
        footer: "Mongolia travel platform · Korean / Japanese / English",
        dashboard1: "Monthly visitors",
        dashboard2: "Booking conversion",
        dashboard3: "Average order value",
        dashboard4: "Review score",
        priceLabel: "Per person",
        selectedTour: "Selected tour",
        totalPrice: "Estimated total",
        deposit: "Deposit",
        guestsLabel: "Guests",
        noResults: "No tours matched your filters.",
        noResultsDesc: "Try adjusting your search or filters.",
        tabAll: "All",
        tabReview: "Reviews",
        tabMate: "Companions",
        tabQna: "Questions",
        payReady: "No payment has started yet.",
        payDone: "Deposit payment completed. A confirmation notice will be sent after review.",
        featuredLabel: "Event",
        pausedLabel: "Paused",
        delete: "Clear",
        today: "Today",
        weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const,
        datePlaceholder: "YYYY-MM-DD",
        publishPhase1: "Phase 1 · MVP Launch",
        publishPhase2: "Phase 2 · Ops Integration",
        publishPhase3: "Phase 3 · Scale Up",
        publishDesc1: "Launch quickly with landing, catalog, and booking request flow.",
        publishDesc2: "Connect payment, admin, and inquiry workflow for live operations.",
        publishDesc3: "Expand community, reviews, multilingual SEO, and analytics.",
    },
} as const;

export const tours: Tour[] = ([
    {
        id: 1,
        region: "south",
        theme: "desert",
        durationType: "long",
        price: 1690000,
        deposit: 50000,
        gradient: "from-blue-600 to-blue-400",
        heroImage: "/images/tour-gobi-5n6d.jpg",
        images: ["/images/hero-gobi.jpg", "/images/tour-gobi-4n5d.jpg", "/images/tour-gobi-6n7d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "고비 사막 5박 6일", ja: "ゴビ砂漠 5泊6日", en: "Gobi Desert 5N6D" },
        desc: {
            ko: "가장 인기 있는 대표 코스. 사막, 협곡, 별보기, 게르 숙박까지 한 번에 즐깁니다.",
            ja: "砂漠・峡谷・星空観察・ゲル宿泊まで楽しめる人気コースです。",
            en: "Our signature route covering desert, canyon, stargazing, and ger stay.",
        },
        tags: {
            ko: ["베스트", "별보기", "한국어 가이드"],
            ja: ["人気", "星空", "韓国語ガイド"],
            en: ["Best", "Stargazing", "Korean Guide"],
        },
        duration: { ko: "5박 6일", ja: "5泊6日", en: "5 nights 6 days" },
        highlights: {
            ko: ["고비 사막", "별보기", "게르 숙박", "협곡 투어"],
            ja: ["ゴビ砂漠", "星空観察", "ゲル宿泊", "渓谷ツアー"],
            en: ["Gobi Desert", "Stargazing", "Ger Stay", "Canyon Tour"],
        },
    },
    {
        id: 2,
        region: "central",
        theme: "family",
        durationType: "short",
        price: 990000,
        deposit: 50000,
        gradient: "from-sky-900 to-blue-500",
        heroImage: "/images/tour-steppe-3n4d.jpg",
        images: ["/images/hero-terelj.jpg", "/images/tour-steppe-2n3d.jpg", "/images/tour-steppe-4n5d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "테를지 · 미니사막 3박 4일", ja: "テレルジ・ミニ砂漠 3泊4日", en: "Terelj & Mini Desert 3N4D" },
        desc: {
            ko: "짧은 일정으로 몽골의 자연을 압축 체험할 수 있는 입문형 상품입니다.",
            ja: "短い日程でモンゴルの自然を楽しめる入門向け商品です。",
            en: "A short route ideal for first-time travelers wanting a compact Mongolia experience.",
        },
        tags: {
            ko: ["입문형", "가성비", "가족 추천"],
            ja: ["入門", "コスパ", "家族向け"],
            en: ["Starter", "Value", "Family"],
        },
        duration: { ko: "3박 4일", ja: "3泊4日", en: "3 nights 4 days" },
        highlights: {
            ko: ["테를지 국립공원", "초원 드라이브", "미니사막", "가벼운 일정"],
            ja: ["テレルジ国立公園", "草原ドライブ", "ミニ砂漠", "短期日程"],
            en: ["Terelj Park", "Steppe Drive", "Mini Desert", "Short Route"],
        },
    },
    {
        id: 3,
        region: "north",
        theme: "premium",
        durationType: "long",
        price: 2090000,
        deposit: 50000,
        gradient: "from-violet-700 to-indigo-400",
        heroImage: "/images/tour-lake-6n7d.jpg",
        images: ["/images/hero-khuvsgul.jpg", "/images/tour-lake-5n6d.jpg", "/images/tour-lake-7n8d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "홉스골 호수 6박 7일", ja: "フブスグル湖 6泊7日", en: "Khuvsgul Lake 6N7D" },
        desc: {
            ko: "북부 몽골의 고요한 호수와 숲 풍경을 중심으로 한 프리미엄 일정입니다.",
            ja: "北モンゴルの静かな湖と森を楽しむプレミアム日程です。",
            en: "A premium itinerary focused on northern Mongolia's lakes and forest landscapes.",
        },
        tags: {
            ko: ["프리미엄", "호수", "자연휴식"],
            ja: ["プレミアム", "湖", "自然"],
            en: ["Premium", "Lake", "Nature"],
        },
        duration: { ko: "6박 7일", ja: "6泊7日", en: "6 nights 7 days" },
        highlights: {
            ko: ["홉스골 호수", "북부 숲", "프리미엄 동선", "자연 휴식"],
            ja: ["フブスグル湖", "北部の森", "プレミアムルート", "自然休息"],
            en: ["Khuvsgul Lake", "Northern Forest", "Premium Route", "Nature Retreat"],
        },
    },
    // 남부 고비 사막 추가 투어
    {
        id: 4,
        region: "south",
        theme: "desert",
        durationType: "short",
        price: 1390000,
        deposit: 50000,
        gradient: "from-blue-600 to-blue-400",
        heroImage: "/images/tour-gobi-4n5d.jpg",
        images: ["/images/hero-gobi.jpg", "/images/tour-gobi-5n6d.jpg", "/images/tour-gobi-6n7d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "고비 사막 4박 5일", ja: "ゴビ砂漠 4泊5日", en: "Gobi Desert 4N5D" },
        desc: {
            ko: "사막과 협곡, 게르 숙박까지 고비의 핵심을 짧은 일정으로 압축한 상품입니다.",
            ja: "砂漠と渓谷、ゲル宿泊まで短い日程でゴビの魅力を凝縮したコースです。",
            en: "A condensed Gobi experience covering desert, canyon, and ger stay in a shorter schedule.",
        },
        tags: {
            ko: ["사막", "게르 숙박", "별보기"],
            ja: ["砂漠", "ゲル宿泊", "星空"],
            en: ["Desert", "Ger Stay", "Stargazing"],
        },
        duration: { ko: "4박 5일", ja: "4泊5日", en: "4 nights 5 days" },
        highlights: {
            ko: ["고비 사막", "게르 숙박", "별보기", "협곡 산책"],
            ja: ["ゴビ砂漠", "ゲル宿泊", "星空観察", "渓谷散策"],
            en: ["Gobi Desert", "Ger Stay", "Stargazing", "Canyon Walk"],
        },
    },
    {
        id: 5,
        region: "south",
        theme: "desert",
        durationType: "long",
        price: 1990000,
        deposit: 50000,
        gradient: "from-blue-600 to-blue-400",
        heroImage: "/images/tour-gobi-6n7d.jpg",
        images: ["/images/hero-gobi.jpg", "/images/tour-gobi-4n5d.jpg", "/images/tour-gobi-7n8d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "고비 사막 6박 7일", ja: "ゴビ砂漠 6泊7日", en: "Gobi Desert 6N7D" },
        desc: {
            ko: "사막의 다양한 지형을 여유 있게 탐험하는 심화 고비 코스입니다.",
            ja: "ゴビ砂漠の多様な地形をゆったり探検する上級コースです。",
            en: "An in-depth Gobi route exploring the desert's diverse terrain at a relaxed pace.",
        },
        tags: {
            ko: ["심화 코스", "낙타 투어", "게르"],
            ja: ["上級コース", "ラクダツアー", "ゲル"],
            en: ["In-depth", "Camel Tour", "Ger"],
        },
        duration: { ko: "6박 7일", ja: "6泊7日", en: "6 nights 7 days" },
        highlights: {
            ko: ["고비 사막", "낙타 투어", "모래언덕", "화석 지대"],
            ja: ["ゴビ砂漠", "ラクダツアー", "砂丘", "化石地帯"],
            en: ["Gobi Desert", "Camel Tour", "Sand Dunes", "Fossil Site"],
        },
    },
    {
        id: 6,
        region: "south",
        theme: "desert",
        durationType: "long",
        price: 2290000,
        deposit: 50000,
        gradient: "from-blue-600 to-blue-400",
        heroImage: "/images/tour-gobi-7n8d.jpg",
        images: ["/images/hero-gobi.jpg", "/images/tour-gobi-5n6d.jpg", "/images/tour-gobi-6n7d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "고비 사막 7박 8일", ja: "ゴビ砂漠 7泊8日", en: "Gobi Desert 7N8D" },
        desc: {
            ko: "고비의 끝에서 끝까지, 가장 완전한 고비 사막 탐험 코스입니다.",
            ja: "ゴビの端から端まで、最も完全なゴビ砂漠探検コースです。",
            en: "The most complete Gobi Desert expedition from end to end.",
        },
        tags: {
            ko: ["완전 탐험", "낙타", "화석"],
            ja: ["完全探検", "ラクダ", "化石"],
            en: ["Full Expedition", "Camel", "Fossils"],
        },
        duration: { ko: "7박 8일", ja: "7泊8日", en: "7 nights 8 days" },
        highlights: {
            ko: ["홍고린 모래언덕", "화석 지대", "낙타 트레킹", "고비 전 지형"],
            ja: ["ホンゴルイン砂丘", "化石地帯", "ラクダトレッキング", "ゴビ全地形"],
            en: ["Khongoryn Sand Dunes", "Fossil Sites", "Camel Trekking", "Full Gobi Terrain"],
        },
    },
    // 북부 호수 추가 투어
    {
        id: 7,
        region: "north",
        theme: "premium",
        durationType: "short",
        price: 1890000,
        deposit: 50000,
        gradient: "from-violet-700 to-indigo-400",
        heroImage: "/images/tour-lake-4n5d.jpg",
        images: ["/images/hero-khuvsgul.jpg", "/images/tour-lake-5n6d.jpg", "/images/tour-lake-6n7d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "북부 호수 4박 5일 항공", ja: "北部湖 4泊5日 航空", en: "North Lake 4N5D (Air)" },
        desc: {
            ko: "항공 이동으로 빠르게 북부 홉스골 호수를 경험하는 프리미엄 단기 코스입니다.",
            ja: "航空移動で素早く北部フブスグル湖を体験するプレミアム短期コースです。",
            en: "A premium short course reaching the northern Khuvsgul Lake quickly by air.",
        },
        tags: {
            ko: ["항공", "호수", "프리미엄"],
            ja: ["航空", "湖", "プレミアム"],
            en: ["Air", "Lake", "Premium"],
        },
        duration: { ko: "4박 5일", ja: "4泊5日", en: "4 nights 5 days" },
        highlights: {
            ko: ["홉스골 호수", "항공 이동", "숲 트레킹", "보트 투어"],
            ja: ["フブスグル湖", "航空移動", "森トレッキング", "ボートツアー"],
            en: ["Khuvsgul Lake", "Flight Transfer", "Forest Trek", "Boat Tour"],
        },
    },
    {
        id: 8,
        region: "north",
        theme: "premium",
        durationType: "long",
        price: 1790000,
        deposit: 50000,
        gradient: "from-violet-700 to-indigo-400",
        heroImage: "/images/tour-lake-5n6d.jpg",
        images: ["/images/hero-khuvsgul.jpg", "/images/tour-lake-4n5d.jpg", "/images/tour-lake-7n8d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "북부 호수 5박 6일", ja: "北部湖 5泊6日", en: "North Lake 5N6D" },
        desc: {
            ko: "홉스골 호수와 주변 숲을 여유롭게 즐기는 북부 기본 코스입니다.",
            ja: "フブスグル湖と周辺の森をゆっくり楽しむ北部基本コースです。",
            en: "The standard northern route enjoying Khuvsgul Lake and the surrounding forest.",
        },
        tags: {
            ko: ["호수", "자연", "승마"],
            ja: ["湖", "自然", "乗馬"],
            en: ["Lake", "Nature", "Horse Riding"],
        },
        duration: { ko: "5박 6일", ja: "5泊6日", en: "5 nights 6 days" },
        highlights: {
            ko: ["홉스골 호수", "숲 트레킹", "승마", "일몰 감상"],
            ja: ["フブスグル湖", "森トレッキング", "乗馬", "夕日観賞"],
            en: ["Khuvsgul Lake", "Forest Trek", "Horse Riding", "Sunset View"],
        },
    },
    {
        id: 9,
        region: "north",
        theme: "premium",
        durationType: "long",
        price: 2390000,
        deposit: 50000,
        gradient: "from-violet-700 to-indigo-400",
        heroImage: "/images/tour-lake-7n8d.jpg",
        images: ["/images/hero-khuvsgul.jpg", "/images/tour-lake-4n5d.jpg", "/images/tour-lake-5n6d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "북부 호수 7박 8일 기차 여행", ja: "北部湖 7泊8日 列車旅", en: "North Lake 7N8D (Train)" },
        desc: {
            ko: "울란바토르에서 기차로 출발해 북부 대자연을 여유롭게 탐험하는 특별한 여정입니다.",
            ja: "ウランバートルから列車で出発し、北部の大自然をゆっくり探検する特別な旅です。",
            en: "A special journey departing by train from Ulaanbaatar to explore northern Mongolia's vast nature.",
        },
        tags: {
            ko: ["기차 여행", "호수", "특별 코스"],
            ja: ["列車旅", "湖", "特別コース"],
            en: ["Train Journey", "Lake", "Special Route"],
        },
        duration: { ko: "7박 8일", ja: "7泊8日", en: "7 nights 8 days" },
        highlights: {
            ko: ["기차 탑승", "홉스골 호수", "북부 숲", "유목민 체험"],
            ja: ["列車乗車", "フブスグル湖", "北部の森", "遊牧民体験"],
            en: ["Train Ride", "Khuvsgul Lake", "Northern Forest", "Nomad Experience"],
        },
    },
    // 중부 초원 추가 투어
    {
        id: 10,
        region: "central",
        theme: "family",
        durationType: "short",
        price: 390000,
        deposit: 50000,
        gradient: "from-sky-900 to-blue-500",
        heroImage: "/images/tour-steppe-1n2d.jpg",
        images: ["/images/hero-terelj.jpg", "/images/tour-steppe-2n3d.jpg", "/images/tour-steppe-3n4d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "테를지 1박 2일", ja: "テレルジ 1泊2日", en: "Terelj 1N2D" },
        desc: {
            ko: "주말을 이용해 울란바토르 근교 테를지 국립공원을 가볍게 체험하는 입문 코스입니다.",
            ja: "週末を使ってウランバートル近郊のテレルジ国立公園を気軽に体験する入門コースです。",
            en: "A quick weekend getaway to Terelj National Park, just outside Ulaanbaatar.",
        },
        tags: {
            ko: ["입문", "당일 가능", "가성비"],
            ja: ["入門", "日帰り可", "コスパ"],
            en: ["Intro", "Day Trip", "Value"],
        },
        duration: { ko: "1박 2일", ja: "1泊2日", en: "1 night 2 days" },
        highlights: {
            ko: ["테를지 국립공원", "게르 숙박", "승마 체험", "초원 산책"],
            ja: ["テレルジ国立公園", "ゲル宿泊", "乗馬体験", "草原散策"],
            en: ["Terelj Park", "Ger Stay", "Horse Riding", "Steppe Walk"],
        },
    },
    {
        id: 11,
        region: "central",
        theme: "family",
        durationType: "short",
        price: 590000,
        deposit: 50000,
        gradient: "from-sky-900 to-blue-500",
        heroImage: "/images/tour-steppe-2n3d.jpg",
        images: ["/images/hero-terelj.jpg", "/images/tour-steppe-1n2d.jpg", "/images/tour-steppe-3n4d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "테를지 2박 3일", ja: "テレルジ 2泊3日", en: "Terelj 2N3D" },
        desc: {
            ko: "테를지 초원에서 2박을 머물며 몽골 자연과 유목 문화를 여유 있게 경험합니다.",
            ja: "テレルジ草原で2泊し、モンゴルの自然と遊牧文化をゆっくり体験します。",
            en: "Two nights in the Terelj steppe to enjoy Mongolia's nature and nomadic culture at a relaxed pace.",
        },
        tags: {
            ko: ["초원", "유목 문화", "가족"],
            ja: ["草原", "遊牧文化", "家族"],
            en: ["Steppe", "Nomad Culture", "Family"],
        },
        duration: { ko: "2박 3일", ja: "2泊3日", en: "2 nights 3 days" },
        highlights: {
            ko: ["테를지 초원", "게르 숙박", "유목 체험", "자연 산책"],
            ja: ["テレルジ草원", "ゲル宿泊", "遊牧体験", "自然散策"],
            en: ["Terelj Steppe", "Ger Stay", "Nomad Experience", "Nature Walk"],
        },
    },
    {
        id: 12,
        region: "central",
        theme: "family",
        durationType: "short",
        price: 1190000,
        deposit: 50000,
        gradient: "from-sky-900 to-blue-500",
        heroImage: "/images/tour-steppe-4n5d.jpg",
        images: ["/images/hero-terelj.jpg", "/images/tour-steppe-3n4d.jpg", "/images/tour-steppe-5n6d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "테를지 · 온천 · 미니사막 4박 5일", ja: "テレルジ・温泉・ミニ砂漠 4泊5日", en: "Terelj · Hot Spring · Mini Desert 4N5D" },
        desc: {
            ko: "테를지 초원, 천연 온천, 미니사막까지 중부 몽골의 다양한 자연을 담은 코스입니다.",
            ja: "テレルジ草原、天然温泉、ミニ砂漠まで中部モンゴルの多様な自然を詰め込んだコースです。",
            en: "A diverse route covering Terelj steppe, natural hot springs, and the mini desert of central Mongolia.",
        },
        tags: {
            ko: ["온천", "미니사막", "가족"],
            ja: ["温泉", "ミニ砂漠", "家族"],
            en: ["Hot Spring", "Mini Desert", "Family"],
        },
        duration: { ko: "4박 5일", ja: "4泊5日", en: "4 nights 5 days" },
        highlights: {
            ko: ["테를지 국립공원", "천연 온천", "미니사막", "초원 승마"],
            ja: ["テレルジ国立公園", "天然温泉", "ミニ砂漠", "草原乗馬"],
            en: ["Terelj Park", "Natural Hot Spring", "Mini Desert", "Steppe Riding"],
        },
    },
    {
        id: 13,
        region: "central",
        theme: "family",
        durationType: "long",
        price: 1490000,
        deposit: 50000,
        gradient: "from-sky-900 to-blue-500",
        heroImage: "/images/tour-steppe-5n6d.jpg",
        images: ["/images/hero-terelj.jpg", "/images/tour-steppe-3n4d.jpg", "/images/tour-steppe-4n5d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "어기 호수 · 테를지 5박 6일", ja: "オギ湖・テレルジ 5泊6日", en: "Ogii Lake · Terelj 5N6D" },
        desc: {
            ko: "어기 호수 철새와 테를지 초원, 온천, 미니사막, 폭포까지 중부 대표 코스입니다.",
            ja: "オギ湖の渡り鳥、テレルジ草原、温泉、ミニ砂漠、滝まで中部代表コースです。",
            en: "The signature central Mongolia route covering Ogii Lake birds, Terelj steppe, hot springs, mini desert, and waterfall.",
        },
        tags: {
            ko: ["어기 호수", "철새", "폭포"],
            ja: ["オギ湖", "渡り鳥", "滝"],
            en: ["Ogii Lake", "Migratory Birds", "Waterfall"],
        },
        duration: { ko: "5박 6일", ja: "5泊6日", en: "5 nights 6 days" },
        highlights: {
            ko: ["어기 호수", "테를지", "천연 온천", "미니사막", "폭포"],
            ja: ["オギ湖", "テレルジ", "天然温泉", "ミニ砂漠", "滝"],
            en: ["Ogii Lake", "Terelj", "Hot Spring", "Mini Desert", "Waterfall"],
        },
    },
    // 서부 알타이 투어
    {
        id: 14,
        region: "west",
        theme: "adventure",
        durationType: "long",
        price: 2490000,
        deposit: 50000,
        gradient: "from-amber-700 to-orange-500",
        heroImage: "/images/tour-altai-zavkhan.jpg",
        images: ["/images/hero-altai.jpg", "/images/tour-altai-air.jpg", "/images/tour-altai-12n13d.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "자브항 7박 8일", ja: "ザブハン 7泊8日", en: "Zavkhan 7N8D" },
        desc: {
            ko: "서부 몽골 자브항 지역의 대자연과 유목 문화를 탐험하는 어드벤처 코스입니다.",
            ja: "西モンゴルのザブハン地域の大自然と遊牧文化を探検するアドベンチャーコースです。",
            en: "An adventure route exploring the vast nature and nomadic culture of the Zavkhan region in western Mongolia.",
        },
        tags: {
            ko: ["어드벤처", "자브항", "유목"],
            ja: ["アドベンチャー", "ザブハン", "遊牧"],
            en: ["Adventure", "Zavkhan", "Nomad"],
        },
        duration: { ko: "7박 8일", ja: "7泊8日", en: "7 nights 8 days" },
        highlights: {
            ko: ["자브항 강", "유목 캠프", "승마 트레킹", "서부 초원"],
            ja: ["ザブハン川", "遊牧キャンプ", "乗馬トレッキング", "西部草原"],
            en: ["Zavkhan River", "Nomad Camp", "Horse Trekking", "Western Steppe"],
        },
    },
    {
        id: 15,
        region: "west",
        theme: "adventure",
        durationType: "long",
        price: 3990000,
        deposit: 50000,
        gradient: "from-amber-700 to-orange-500",
        heroImage: "/images/tour-altai-12n13d.jpg",
        images: ["/images/hero-altai.jpg", "/images/tour-altai-zavkhan.jpg", "/images/tour-altai-air.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "알타이 산맥 12박 13일", ja: "アルタイ山脈 12泊13日", en: "Altai Mountains 12N13D" },
        desc: {
            ko: "몽골 서부 알타이 산맥을 완전히 탐험하는 최장기 프리미엄 어드벤처 코스입니다.",
            ja: "モンゴル西部アルタイ山脈を完全に探検する最長期プレミアムアドベンチャーコースです。",
            en: "The longest premium adventure route fully exploring the Altai Mountains of western Mongolia.",
        },
        tags: {
            ko: ["최장기", "알타이", "독수리 사냥"],
            ja: ["最長期", "アルタイ", "鷹狩り"],
            en: ["Longest", "Altai", "Eagle Hunting"],
        },
        duration: { ko: "12박 13일", ja: "12泊13日", en: "12 nights 13 days" },
        highlights: {
            ko: ["알타이 산맥", "독수리 사냥 문화", "카자흐 유목민", "산악 트레킹"],
            ja: ["アルタイ山脈", "鷹狩り文化", "カザフ遊牧民", "山岳トレッキング"],
            en: ["Altai Mountains", "Eagle Hunting Culture", "Kazakh Nomads", "Mountain Trekking"],
        },
    },
    {
        id: 16,
        region: "west",
        theme: "adventure",
        durationType: "long",
        price: 2890000,
        deposit: 50000,
        gradient: "from-amber-700 to-orange-500",
        heroImage: "/images/tour-altai-air.jpg",
        images: ["/images/hero-altai.jpg", "/images/tour-altai-12n13d.jpg", "/images/tour-altai-zavkhan.jpg"],
        detailImages: ["/images/detail-sample.jpg"],
        title: { ko: "알타이 산맥 항공 7박 8일", ja: "アルタイ山脈 航空 7泊8日", en: "Altai Mountains 7N8D (Air)" },
        desc: {
            ko: "항공으로 빠르게 이동해 알타이 산맥의 핵심을 압축 탐험하는 코스입니다.",
            ja: "航空で素早く移動してアルタイ山脈の核心を凝縮探検するコースです。",
            en: "A condensed Altai Mountains expedition with fast air transfers to the key highlights.",
        },
        tags: {
            ko: ["항공", "알타이", "압축 탐험"],
            ja: ["航空", "アルタイ", "凝縮探検"],
            en: ["Air", "Altai", "Condensed"],
        },
        duration: { ko: "7박 8일", ja: "7泊8日", en: "7 nights 8 days" },
        highlights: {
            ko: ["알타이 산맥", "항공 이동", "독수리 문화", "카자흐 유목"],
            ja: ["アルタイ山脈", "航空移動", "鷹狩り文化", "カザフ遊牧"],
            en: ["Altai Mountains", "Air Transfer", "Eagle Culture", "Kazakh Nomads"],
        },
    },
] as Tour[]).map(normalizeCmsTourImages);

export const slides: Record<Locale, HeroSlide[]> = normalizeSlidesByLocale({
    ko: [
        {
            eyebrow: "고비 사막 시그니처",
            title: "별빛 아래에서 만나는\n몽골의 가장 깊은 밤",
            desc: "사막, 협곡, 게르 숙박, 별보기까지 BlueWolf 대표 코스를 감각적인 배너로 소개합니다.",
            image: "/images/hero-gobi.jpg",
        },
        {
            eyebrow: "테를지 & 초원",
            title: "주말처럼 가볍게 떠나는\n몽골 입문 여행",
            desc: "짧은 일정으로도 충분히 만족할 수 있는 자연 중심 코스를 빠르게 탐색해보세요.",
            image: "/images/hero-terelj.jpg",
        },
        {
            eyebrow: "홉스골 프리미엄",
            title: "호수와 숲이 있는 북부 몽골을\n더 여유롭게 경험하세요",
            desc: "밝고 깨끗한 분위기의 카드형 배너로 프리미엄 일정도 자연스럽게 노출할 수 있습니다.",
            image: "/images/hero-khuvsgul.jpg",
        },
    ],
    ja: [
        {
            eyebrow: "ゴビ砂漠シグネチャー",
            title: "星空の下で出会う\nモンゴルの深い夜",
            desc: "砂漠、渓谷、ゲル宿泊、星空観察まで代表コースを明るいバナーで紹介します。",
            image: "/images/hero-gobi.jpg",
        },
        {
            eyebrow: "テレルジ＆草原",
            title: "週末のように軽やかに出発する\nモンゴル入門旅",
            desc: "短い日程でも満足感の高い自然中心コースをすばやく見つけられます。",
            image: "/images/hero-terelj.jpg",
        },
        {
            eyebrow: "フブスグル プレミアム",
            title: "湖と森がある北モンゴルを\nもっとゆったり体験",
            desc: "明るくクリーンなカード型バナーでプレミアム商品も自然に見せられます。",
            image: "/images/hero-khuvsgul.jpg",
        },
    ],
    en: [
        {
            eyebrow: "Gobi Signature",
            title: "Meet Mongolia's deepest night\nunder a sky full of stars",
            desc: "Introduce BlueWolf's core route with a bright, polished banner featuring desert, canyon, ger stay, and stargazing.",
            image: "/images/hero-gobi.jpg",
        },
        {
            eyebrow: "Terelj & Steppe",
            title: "An easy first Mongolia trip\nthat feels light and flexible",
            desc: "Highlight short and approachable itineraries in a cleaner slide layout for quick browsing.",
            image: "/images/hero-terelj.jpg",
        },
        {
            eyebrow: "Khuvsgul Premium",
            title: "Experience northern Mongolia\nwith more space and calm",
            desc: "Use a bright card-style slide to naturally feature premium lake and forest journeys.",
            image: "/images/hero-khuvsgul.jpg",
        },
    ],
});

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

export const community: Record<Locale, CommunityItem[]> = normalizeCommunityByLocale({
    ko: [
        {
            id: 1, type: "review", author: "김지수", date: "2025-07-12", likes: 24,
            rating: 5, tourTitle: "고비 사막 5박 6일",
            text: "정말 인생 여행이었습니다! 밤하늘 별이 너무 아름다웠고 가이드 선생님도 친절하셨어요. 게르에서 자는 것도 색다른 경험이었습니다. 꼭 다시 오고 싶어요!",
            photos: ["/images/tour-gobi-4n5d.jpg", "/images/tour-gobi-6n7d.jpg", "/images/tour-gobi-7n8d.jpg"],
            comments: [
                { author: "이민아", text: "저도 같은 투어 다녀왔는데 정말 최고였어요!", date: "2025-07-13" },
                { author: "박준영", text: "별보기 포인트가 어디였나요? 저도 가보고 싶어요", date: "2025-07-14" },
            ],
        },
        {
            id: 2, type: "review", author: "Yuki", date: "2025-06-28", likes: 18,
            rating: 5, tourTitle: "홉스골 호수 6박 7일",
            text: "홉스골 호수의 풍경은 정말 숨막히게 아름다웠습니다. 가족과 함께 갔는데 모두 만족했어요. 블루울프 가이드의 세심한 배려 덕분에 불편함 없이 여행할 수 있었습니다.",
            comments: [
                { author: "최현준", text: "아이들도 좋아했나요? 저도 가족여행 계획 중이에요", date: "2025-06-29" },
            ],
        },
        {
            id: 3, type: "review", author: "박지혜", date: "2025-06-15", likes: 32,
            rating: 4, tourTitle: "알타이 황금 독수리 12박 13일",
            text: "독수리 축제 기간에 맞춰 갔는데 정말 잊을 수 없는 경험이었어요. 다만 이동 시간이 길어서 체력적으로 좀 힘들었습니다. 그래도 충분히 가치 있었어요.",
            photos: ["/images/hero-altai.jpg", "/images/tour-altai-12n13d.jpg", "/images/tour-altai-air.jpg", "/images/tour-altai-zavkhan.jpg"],
            comments: [],
        },
        {
            id: 4, type: "review", author: "이준호", date: "2025-05-20", likes: 15,
            rating: 5, tourTitle: "테를지 · 미니사막 3박 4일",
            text: "처음 몽골 여행을 블루울프와 함께했는데 정말 잘한 선택이었습니다. 짧은 일정이지만 몽골의 매력을 충분히 느낄 수 있었어요.",
            comments: [
                { author: "신미래", text: "입문자에게 적합한 코스인가요?", date: "2025-05-21" },
                { author: "이준호", text: "네! 처음 가시는 분들께 강추드려요.", date: "2025-05-21" },
            ],
        },
        {
            id: 5, type: "review", author: "홍서연", date: "2025-04-10", likes: 41,
            rating: 5, tourTitle: "차강소브라가 · 욜링암 4박 5일",
            text: "욜링암 협곡의 절경은 사진으로는 다 담을 수 없어요. 실제로 보면 훨씬 더 웅장합니다. 차강소브라가 백사막도 정말 신비로웠고요. 사진 좋아하시는 분들께 강추!",
            photos: ["/images/hero-gobi.jpg", "/images/tour-gobi-5n6d.jpg", "/images/tour-gobi-6n7d.jpg"],
            comments: [],
        },
        {
            id: 6, type: "mate", author: "강민준", date: "2025-07-20", likes: 8,
            tourTitle: "고비 사막 5박 6일", travelDate: "2025-08-15",
            maxPeople: 4, currentPeople: 2, travelRegion: "남부",
            text: "8월 15일 고비 사막 5박 6일 같이 가실 분 찾습니다! 현재 2명 확정이고 2명 더 모집 중이에요. 20~30대 환영합니다. 오픈채팅방 참여 원하시면 댓글 달아주세요.",
            comments: [
                { author: "정예린", text: "저 참여하고 싶어요! 연락처 공유해주실 수 있나요?", date: "2025-07-21" },
            ],
        },
        {
            id: 7, type: "mate", author: "오수빈", date: "2025-07-18", likes: 5,
            tourTitle: "홉스골 호수 6박 7일", travelDate: "2025-08-20",
            maxPeople: 3, currentPeople: 1, travelRegion: "북부",
            text: "홉스골 6박 7일 같이 가실 분! 저 혼자 신청했는데 같이 가면 더 재미있을 것 같아서요. 자연 좋아하고 사진 찍는 거 좋아하시는 분이면 환영해요.",
            comments: [],
        },
        {
            id: 8, type: "mate", author: "임태양", date: "2025-07-10", likes: 12,
            tourTitle: "알타이 황금 독수리 12박 13일", travelDate: "2025-09-05",
            maxPeople: 6, currentPeople: 4, travelRegion: "서부",
            text: "9월 5일 알타이 장기 투어 함께하실 분 2명 더 모집합니다. 독수리 축제와 카자흐족 문화를 경험하고 싶으신 분들께 추천드려요. 현재 4명 확정, 6명 정원.",
            comments: [
                { author: "최유나", text: "정원이 차면 추가 모집 안 하시나요?", date: "2025-07-11" },
                { author: "임태양", text: "인원이 차면 모집 마감할게요! 서두르세요~", date: "2025-07-11" },
            ],
        },
        {
            id: 9, type: "mate", author: "윤채원", date: "2025-07-05", likes: 7,
            tourTitle: "차강소브라가 · 욜링암 4박 5일", travelDate: "2025-08-01",
            maxPeople: 4, currentPeople: 3, travelRegion: "남부",
            text: "8월 1일 출발 욜링암 투어 1명 더 모집합니다! 3명이 같이 가는데 한 분 더 함께하면 좋겠어요. 여성 여행자 우대(혼자 오시는 분도 환영).",
            comments: [],
        },
        {
            id: 10, type: "mate", author: "배현우", date: "2025-06-30", likes: 3,
            tourTitle: "초원 · 테를지 1박 2일", travelDate: "2025-07-28",
            maxPeople: 4, currentPeople: 2, travelRegion: "중부",
            text: "짧게 다녀오실 분들! 7월 28~29일 1박 2일 테를지 투어 같이 가실 분 모집합니다. 주말 여행으로 딱 좋아요.",
            comments: [],
        },
        {
            id: 11, type: "qna", author: "김여행", date: "2025-07-19", likes: 6,
            answered: true,
            text: "몽골 여행 시 비자가 필요한가요? 한국 여권으로 무비자 입국이 가능한지 궁금합니다.",
            comments: [
                { author: "BlueWolf", text: "안녕하세요! 한국 여권 소지자는 몽골 입국 시 30일 무비자 체류가 가능합니다. 여권 유효기간이 6개월 이상 남아있어야 하니 확인해 주세요.", date: "2025-07-19" },
            ],
        },
        {
            id: 12, type: "qna", author: "여행준비중", date: "2025-07-17", likes: 9,
            answered: true,
            text: "8월에 고비 사막 투어 예정인데 준비물로 꼭 챙겨야 할 것들이 있을까요?",
            comments: [
                { author: "BlueWolf", text: "8월은 낮에 덥고 밤에 추울 수 있어요. 얇은 패딩, 선크림(SPF50+ 추천), 모자, 선글라스, 보조배터리, 상비약을 꼭 챙기세요. 모래바람 대비 마스크도 유용합니다!", date: "2025-07-17" },
                { author: "박지민", text: "저도 8월에 가는데 도움이 됐어요 감사합니다!", date: "2025-07-18" },
            ],
        },
        {
            id: 13, type: "qna", author: "초보여행자", date: "2025-07-14", likes: 4,
            answered: true,
            text: "혼자 여행해도 괜찮을까요? 현지에서 안전한 편인가요?",
            comments: [
                { author: "BlueWolf", text: "몽골은 비교적 안전한 여행지입니다. 블루울프 투어는 전 일정 가이드가 동행하기 때문에 혼자 오시는 분들도 많이 이용하세요. 안심하고 오세요!", date: "2025-07-14" },
            ],
        },
        {
            id: 14, type: "qna", author: "가족여행계획", date: "2025-07-08", likes: 11,
            answered: false,
            text: "초등학생 아이 2명과 함께 가려고 하는데 어떤 코스가 가장 적합할까요? 이동 거리나 난이도가 걱정됩니다.",
            comments: [],
        },
        {
            id: 15, type: "qna", author: "환율궁금", date: "2025-07-02", likes: 7,
            answered: true,
            text: "현지에서 현금이 필요한가요? 신용카드 사용이 가능한지, 환전은 어떻게 해야 하는지 알고 싶어요.",
            comments: [
                { author: "BlueWolf", text: "울란바토르 시내 마트와 일부 식당은 카드 사용이 가능하지만, 지방 여행 시에는 현금(투그릭)이 필수입니다. 공항이나 시내 환전소에서 달러→투그릭으로 환전하시거나, 한국에서 달러를 미리 준비해 오시는 것을 권장합니다.", date: "2025-07-02" },
            ],
        },
    ],
    ja: [
        {
            id: 1, type: "review", author: "田中さゆり", date: "2025-07-12", likes: 24,
            rating: 5, tourTitle: "ゴビ砂漠 5泊6日",
            text: "本当に人生旅行でした！夜空の星がとても美しく、ガイドさんもとても親切でした。ゲルに泊まる体験も新鮮でした。また絶対来たいです！",
            photos: ["/images/tour-gobi-4n5d.jpg", "/images/tour-gobi-6n7d.jpg", "/images/tour-gobi-7n8d.jpg"],
            comments: [
                { author: "鈴木みなこ", text: "私も同じツアーに行きましたが本当に最高でした！", date: "2025-07-13" },
            ],
        },
        {
            id: 2, type: "review", author: "Yuki", date: "2025-06-28", likes: 18,
            rating: 5, tourTitle: "フブスグル湖 6泊7日",
            text: "フブスグル湖の景色は息をのむほど美しかったです。家族みんな大満足でした。BlueWolfガイドの細やかな配慮のおかげで快適に旅できました。",
            comments: [],
        },
        {
            id: 3, type: "review", author: "山田花子", date: "2025-06-15", likes: 32,
            rating: 4, tourTitle: "アルタイ・鷹匠ツアー 12泊13日",
            text: "鷹祭りの時期に合わせて行きましたが忘れられない経験でした。移動時間が長く体力的に少しきつかったですが、十分価値がありました。",
            photos: ["/images/hero-altai.jpg", "/images/tour-altai-12n13d.jpg", "/images/tour-altai-air.jpg", "/images/tour-altai-zavkhan.jpg"],
            comments: [],
        },
        {
            id: 4, type: "review", author: "佐藤ゆうき", date: "2025-05-20", likes: 15,
            rating: 5, tourTitle: "テレルジ・ミニ砂漠 3泊4日",
            text: "初めてのモンゴル旅行をBlueWolfと一緒に楽しみました。短い日程でもモンゴルの魅力を十分に感じることができました。",
            comments: [],
        },
        {
            id: 5, type: "review", author: "中村あかり", date: "2025-04-10", likes: 41,
            rating: 5, tourTitle: "ヨーリン・アム渓谷 4泊5日",
            text: "ヨーリン・アムの絶景は写真では収まりきりません。実際に見るともっと雄大です。白砂漠もとても神秘的でした。写真好きの方に強くおすすめ！",
            photos: ["/images/hero-gobi.jpg", "/images/tour-gobi-5n6d.jpg", "/images/tour-gobi-6n7d.jpg"],
            comments: [],
        },
        {
            id: 6, type: "mate", author: "カン・ミンジュン", date: "2025-07-20", likes: 8,
            tourTitle: "ゴビ砂漠 5泊6日", travelDate: "2025-08-15",
            maxPeople: 4, currentPeople: 2, travelRegion: "南部",
            text: "8月15日ゴビ砂漠ツアー同行者募集！現在2名確定、あと2名募集中。20〜30代歓迎。一緒に行きたい方はコメントください。",
            comments: [],
        },
        {
            id: 7, type: "mate", author: "オ・スビン", date: "2025-07-18", likes: 5,
            tourTitle: "フブスグル湖 6泊7日", travelDate: "2025-08-20",
            maxPeople: 3, currentPeople: 1, travelRegion: "北部",
            text: "フブスグル6泊7日一緒に行く方募集！一人で申し込みましたが一緒に行けたらもっと楽しそう。自然が好きで写真好きな方大歓迎。",
            comments: [],
        },
        {
            id: 8, type: "mate", author: "イム・テヤン", date: "2025-07-10", likes: 12,
            tourTitle: "アルタイ・鷹匠ツアー 12泊13日", travelDate: "2025-09-05",
            maxPeople: 6, currentPeople: 4, travelRegion: "西部",
            text: "9月5日アルタイ長期ツアーの同行者をあと2名募集！鷹祭りとカザフ文化を体験したい方におすすめです。",
            comments: [],
        },
        {
            id: 9, type: "mate", author: "ユン・チェウォン", date: "2025-07-05", likes: 7,
            tourTitle: "ヨーリン・アム渓谷 4泊5日", travelDate: "2025-08-01",
            maxPeople: 4, currentPeople: 3, travelRegion: "南部",
            text: "8月1日出発ヨーリン・アムツアーあと1名募集！3名で行きますがもう1名一緒に行けたら嬉しいです。",
            comments: [],
        },
        {
            id: 10, type: "mate", author: "ペ・ヒョヌ", date: "2025-06-30", likes: 3,
            tourTitle: "テレルジ1泊2日", travelDate: "2025-07-28",
            maxPeople: 4, currentPeople: 2, travelRegion: "中央",
            text: "週末旅行！7月28〜29日テレルジ1泊2日一緒に行く方募集。気軽に参加できます！",
            comments: [],
        },
        {
            id: 11, type: "qna", author: "旅行準備中", date: "2025-07-19", likes: 6,
            answered: true,
            text: "モンゴル旅行にビザは必要ですか？日本のパスポートでビザなしで入国できますか？",
            comments: [
                { author: "BlueWolf", text: "日本のパスポートでモンゴルへは30日間ビザなしで入国できます。パスポートの残存有効期間が6か月以上あることをご確認ください。", date: "2025-07-19" },
            ],
        },
        {
            id: 12, type: "qna", author: "山本けんじ", date: "2025-07-17", likes: 9,
            answered: true,
            text: "8月にゴビ砂漠ツアーを予定していますが、必ず持っていくべきものはありますか？",
            comments: [
                { author: "BlueWolf", text: "8月は昼間暑く夜寒くなります。薄手のダウン、日焼け止め(SPF50+推奨)、帽子、サングラス、モバイルバッテリー、常備薬は必須です。砂嵐対策のマスクも便利ですよ！", date: "2025-07-17" },
            ],
        },
        {
            id: 13, type: "qna", author: "初心者旅行者", date: "2025-07-14", likes: 4,
            answered: true,
            text: "一人旅でも大丈夫でしょうか？現地は安全ですか？",
            comments: [
                { author: "BlueWolf", text: "モンゴルは比較的安全な旅行地です。BlueWolfのツアーは全日程ガイドが同行するので、一人旅のお客様も多くご利用いただいています。安心してお越しください！", date: "2025-07-14" },
            ],
        },
        {
            id: 14, type: "qna", author: "ファミリー計画", date: "2025-07-08", likes: 11,
            answered: false,
            text: "小学生の子供2人と一緒に行きたいのですが、どのコースが一番適していますか？移動距離や難易度が心配です。",
            comments: [],
        },
        {
            id: 15, type: "qna", author: "為替気になる", date: "2025-07-02", likes: 7,
            answered: true,
            text: "現地では現金が必要ですか？クレジットカードは使えますか？両替はどうすればいいですか？",
            comments: [
                { author: "BlueWolf", text: "ウランバートル市内のスーパーや一部レストランではカードが使えますが、地方ではトゥグルグの現金が必須です。空港や市内両替所でドル→トゥグルグへの両替をお勧めします。", date: "2025-07-02" },
            ],
        },
    ],
    en: [
        {
            id: 1, type: "review", author: "Kim Jisu", date: "2025-07-12", likes: 24,
            rating: 5, tourTitle: "Gobi Desert 5N6D",
            text: "Truly a trip of a lifetime! The night sky was breathtaking and our guide was incredibly kind. Sleeping in a ger was such a unique experience. I absolutely want to come back!",
            photos: ["/images/tour-gobi-4n5d.jpg", "/images/tour-gobi-6n7d.jpg", "/images/tour-gobi-7n8d.jpg"],
            comments: [
                { author: "Lee Mina", text: "I was on the same tour and it was absolutely amazing!", date: "2025-07-13" },
                { author: "Park Junyoung", text: "Where was the stargazing spot? I'd love to visit!", date: "2025-07-14" },
            ],
        },
        {
            id: 2, type: "review", author: "Yuki", date: "2025-06-28", likes: 18,
            rating: 5, tourTitle: "Khuvsgul Lake 6N7D",
            text: "The views at Khuvsgul Lake were breathtaking. My whole family loved it. Thanks to BlueWolf's attentive guides, we traveled without any inconvenience.",
            comments: [],
        },
        {
            id: 3, type: "review", author: "Sarah", date: "2025-06-15", likes: 32,
            rating: 4, tourTitle: "Altai Eagle Hunter 12N13D",
            text: "We went during the eagle festival season — an unforgettable experience! The long travel times were a bit tiring but absolutely worth it.",
            photos: ["/images/hero-altai.jpg", "/images/tour-altai-12n13d.jpg", "/images/tour-altai-air.jpg", "/images/tour-altai-zavkhan.jpg"],
            comments: [],
        },
        {
            id: 4, type: "review", author: "James", date: "2025-05-20", likes: 15,
            rating: 5, tourTitle: "Terelj & Mini Desert 3N4D",
            text: "My first Mongolia trip with BlueWolf was a great choice. Even the short itinerary let me fully experience Mongolia's charm.",
            comments: [],
        },
        {
            id: 5, type: "review", author: "Emily", date: "2025-04-10", likes: 41,
            rating: 5, tourTitle: "Yol Am Canyon 4N5D",
            text: "The scenery at Yol Am Canyon can't be captured in photos — it's so much grander in person. The white desert was absolutely magical. Highly recommended for photographers!",
            photos: ["/images/hero-gobi.jpg", "/images/tour-gobi-5n6d.jpg", "/images/tour-gobi-6n7d.jpg"],
            comments: [],
        },
        {
            id: 6, type: "mate", author: "Kevin", date: "2025-07-20", likes: 8,
            tourTitle: "Gobi Desert 5N6D", travelDate: "2025-08-15",
            maxPeople: 4, currentPeople: 2, travelRegion: "South",
            text: "Looking for 2 more people for the Aug 15 Gobi Desert tour! Currently 2 confirmed, looking for 2 more. 20s-30s welcome. Drop a comment if you're interested.",
            comments: [
                { author: "Rachel", text: "I'd love to join! Can you share contact details?", date: "2025-07-21" },
            ],
        },
        {
            id: 7, type: "mate", author: "Amy", date: "2025-07-18", likes: 5,
            tourTitle: "Khuvsgul Lake 6N7D", travelDate: "2025-08-20",
            maxPeople: 3, currentPeople: 1, travelRegion: "North",
            text: "Looking for travel companions for the Khuvsgul Lake 6N7D tour! I booked solo but would love to go with others. Nature lovers and photo enthusiasts welcome!",
            comments: [],
        },
        {
            id: 8, type: "mate", author: "Chris", date: "2025-07-10", likes: 12,
            tourTitle: "Altai Eagle Hunter 12N13D", travelDate: "2025-09-05",
            maxPeople: 6, currentPeople: 4, travelRegion: "West",
            text: "Looking for 2 more people for the Sep 5 Altai long tour. Great for those wanting to experience the eagle festival and Kazakh culture. Currently 4/6 spots filled.",
            comments: [],
        },
        {
            id: 9, type: "mate", author: "Linda", date: "2025-07-05", likes: 7,
            tourTitle: "Yol Am Canyon 4N5D", travelDate: "2025-08-01",
            maxPeople: 4, currentPeople: 3, travelRegion: "South",
            text: "Looking for 1 more person for our Aug 1 departure! We're a group of 3 and would love one more companion. Solo female travelers welcome!",
            comments: [],
        },
        {
            id: 10, type: "mate", author: "Tom", date: "2025-06-30", likes: 3,
            tourTitle: "Terelj 1N2D", travelDate: "2025-07-28",
            maxPeople: 4, currentPeople: 2, travelRegion: "Central",
            text: "Weekend getaway! Looking for 2 more for a Terelj 1N2D trip on July 28-29. Perfect for a casual weekend trip!",
            comments: [],
        },
        {
            id: 11, type: "qna", author: "TravelNewbie", date: "2025-07-19", likes: 6,
            answered: true,
            text: "Do I need a visa to travel to Mongolia? Can South Korean passport holders enter visa-free?",
            comments: [
                { author: "BlueWolf", text: "Korean passport holders can stay in Mongolia for up to 30 days without a visa. Please make sure your passport has at least 6 months of validity remaining.", date: "2025-07-19" },
            ],
        },
        {
            id: 12, type: "qna", author: "August Traveler", date: "2025-07-17", likes: 9,
            answered: true,
            text: "I'm planning the Gobi Desert tour in August. What are the must-have items to pack?",
            comments: [
                { author: "BlueWolf", text: "August days are hot but nights can be cold. Must-haves: light padded jacket, SPF50+ sunscreen, hat, sunglasses, power bank, and basic medicine. A dust mask is also useful for sandstorms!", date: "2025-07-17" },
            ],
        },
        {
            id: 13, type: "qna", author: "SoloExplorer", date: "2025-07-14", likes: 4,
            answered: true,
            text: "Is it okay to travel solo? Is Mongolia safe?",
            comments: [
                { author: "BlueWolf", text: "Mongolia is a relatively safe destination. BlueWolf tours have guides accompanying every day, so many solo travelers use our service. Feel free to come alone!", date: "2025-07-14" },
            ],
        },
        {
            id: 14, type: "qna", author: "FamilyPlanner", date: "2025-07-08", likes: 11,
            answered: false,
            text: "I want to go with 2 elementary school kids. Which route is best suited for families? I'm worried about travel distance and difficulty.",
            comments: [],
        },
        {
            id: 15, type: "qna", author: "CurrencyQ", date: "2025-07-02", likes: 7,
            answered: true,
            text: "Do I need cash in Mongolia? Can I use a credit card? How should I handle currency exchange?",
            comments: [
                { author: "BlueWolf", text: "Supermarkets and some restaurants in Ulaanbaatar accept cards, but cash (Tugrik) is essential for rural travel. We recommend exchanging USD→Tugrik at the airport or city exchange offices.", date: "2025-07-02" },
            ],
        },
    ],
});

export const communityNotices: Record<Locale, CommunityNotice[]> = {
    ko: [
        {
            id: 1,
            title: "동행 모집 글 작성 전 일정과 출발일을 꼭 확인해주세요",
            summary: "동행 모집 게시글에는 투어명, 출발일, 모집 인원, 연락 가능한 방법을 함께 적어주시면 매칭이 훨씬 빨라집니다.",
            date: "2026-03-30",
            important: true,
        },
        {
            id: 2,
            title: "자주 묻는 질문은 FAQ에서 먼저 확인하실 수 있어요",
            summary: "비자, 결제, 준비물, 환불 규정 같은 기본 문의는 FAQ에 정리되어 있어 빠르게 확인하실 수 있습니다.",
            date: "2026-03-28",
            href: "/faq",
        },
        {
            id: 3,
            title: "성수기 출발 일정은 조기 마감될 수 있어요",
            summary: "여름 시즌 인기 상품은 빠르게 마감될 수 있으니 여행 기간이 정해졌다면 미리 예약 가능 여부를 확인해주세요.",
            date: "2026-03-24",
            href: "/tours",
        },
        {
            id: 4,
            title: "상담 문의는 커뮤니티보다 문의 페이지가 더 빨라요",
            summary: "견적, 단체 문의, 맞춤 일정 상담은 문의 페이지를 이용하시면 운영팀이 더 빠르게 확인해드립니다.",
            date: "2026-03-20",
            href: "/contact",
        },
    ],
    ja: [
        {
            id: 1,
            title: "同行募集の投稿前に日程と出発日をご確認ください",
            summary: "ツアー名、出発日、募集人数、連絡方法を一緒に書いていただくとマッチングがよりスムーズになります。",
            date: "2026-03-30",
            important: true,
        },
        {
            id: 2,
            title: "よくある質問はFAQで先に確認できます",
            summary: "ビザ、決済、持ち物、返金規定などの基本的な案内はFAQで素早く確認できます。",
            date: "2026-03-28",
            href: "/faq",
        },
        {
            id: 3,
            title: "繁忙期の出発日は早めに締め切られる場合があります",
            summary: "夏の人気ツアーは早く満席になることがあるため、旅行期間が決まっている場合は早めの確認をおすすめします。",
            date: "2026-03-24",
            href: "/tours",
        },
        {
            id: 4,
            title: "個別相談はお問い合わせページの方が早くご案内できます",
            summary: "見積もり、団体旅行、オーダーメイド相談はお問い合わせページから送っていただくと運営チームがより早く確認できます。",
            date: "2026-03-20",
            href: "/contact",
        },
    ],
    en: [
        {
            id: 1,
            title: "Please confirm your itinerary and departure date before posting",
            summary: "For companion posts, include the tour name, departure date, group size, and a contact method to improve matching.",
            date: "2026-03-30",
            important: true,
        },
        {
            id: 2,
            title: "You can check common questions in the FAQ first",
            summary: "Core topics like visas, payment, packing, and refund policy are already organized in the FAQ.",
            date: "2026-03-28",
            href: "/faq",
        },
        {
            id: 3,
            title: "Peak season departures may close earlier than expected",
            summary: "Popular summer routes can sell out quickly, so please check availability early if your travel dates are already fixed.",
            date: "2026-03-24",
            href: "/tours",
        },
        {
            id: 4,
            title: "For custom planning, the contact page is the fastest route",
            summary: "For quotes, group trips, and custom itinerary requests, please use the contact page so our team can respond more quickly.",
            date: "2026-03-20",
            href: "/contact",
        },
    ],
};

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
