import { type Locale, type Region } from "@/lib/bluewolf-data";
import { normalizeCmsImageList, normalizeCmsImagePath } from "@/lib/cms-image";

export type OptionKey = string;

function normalizeDestinationGroups(source: Record<Locale, Record<Region, DestinationInfo[]>>) {
    return Object.fromEntries(
        Object.entries(source).map(([locale, regions]) => [
            locale,
            Object.fromEntries(
                Object.entries(regions).map(([region, items]) => [
                    region,
                    items.map((item) => ({
                        ...item,
                        image: normalizeCmsImagePath(item.image),
                    })),
                ])
            ),
        ])
    ) as Record<Locale, Record<Region, DestinationInfo[]>>;
}

function normalizeRegionInfoGroups(source: Record<Locale, Record<Region, RegionInfo>>) {
    return Object.fromEntries(
        Object.entries(source).map(([locale, regions]) => [
            locale,
            Object.fromEntries(
                Object.entries(regions).map(([region, item]) => [
                    region,
                    {
                        ...item,
                        image: normalizeCmsImagePath(item.image),
                    },
                ])
            ),
        ])
    ) as Record<Locale, Record<Region, RegionInfo>>;
}

function normalizeCopyBlocks(source: Record<Locale, CopyBlock>) {
    return Object.fromEntries(
        Object.entries(source).map(([locale, block]) => [
            locale,
            {
                ...block,
                options: block.options.map((option) => ({
                    ...option,
                    photos: normalizeCmsImageList(option.photos, option.photos.length || 1),
                })),
            },
        ])
    ) as Record<Locale, CopyBlock>;
}

export type RegionInfo = {
    image: string;
    title: string;
    label: string;
    desc: string;
};

export type DestinationInfo = {
    title: string;
    desc: string;
    image: string;
};

export const regionDestinations: Record<Locale, Record<Region, DestinationInfo[]>> = normalizeDestinationGroups({
    ko: {
        south: [
            { title: "고비 사막", desc: "끝없이 펼쳐지는 사막과 별빛이 인상적인 대표 코스예요.", image: "/images/hero-gobi.jpg" },
            { title: "욜링암 협곡", desc: "깊은 협곡과 시원한 바람을 느낄 수 있는 명소예요.", image: "/images/tour-gobi-5n6d.jpg" },
            { title: "바양작", desc: "붉은 절벽과 공룡 화석 이야기로 유명한 지역이에요.", image: "/images/tour-gobi-6n7d.jpg" },
            { title: "홍고린 엘스", desc: "웅장한 모래언덕과 낙타 체험으로 인기 있는 장소예요.", image: "/images/tour-gobi-7n8d.jpg" },
        ],
        north: [
            { title: "홉스골 호수", desc: "맑고 깊은 호수 풍경을 즐길 수 있는 북부 대표 여행지예요.", image: "/images/hero-khuvsgul.jpg" },
            { title: "하트갈", desc: "호숫가 마을의 여유로운 분위기를 느낄 수 있어요.", image: "/images/tour-lake-5n6d.jpg" },
            { title: "차탕 마을", desc: "순록 문화와 북부 소수민족의 삶을 가까이서 만날 수 있어요.", image: "/images/tour-lake-reindeer.jpg" },
            { title: "우란 타이가", desc: "숲과 초원이 어우러진 북부의 깊은 자연을 만나는 코스예요.", image: "/images/tour-lake-forest.jpg" },
        ],
        central: [
            { title: "테를지 국립공원", desc: "초원과 바위산 풍경이 조화로운 가장 인기 많은 중부 코스예요.", image: "/images/hero-terelj.jpg" },
            { title: "칭기즈칸 동상", desc: "광활한 초원 위 거대한 기마상으로 유명한 랜드마크예요.", image: "/images/tour-steppe-statue.jpg" },
            { title: "엘승타사르해", desc: "사막과 초원이 함께 펼쳐지는 독특한 풍경의 지역이에요.", image: "/images/tour-steppe-3n4d.jpg" },
            { title: "허스테이 국립공원", desc: "야생말 타키와 넓은 초원을 만날 수 있는 자연 보호구역이에요.", image: "/images/tour-steppe-4n5d.jpg" },
        ],
        west: [
            { title: "알타이 산맥", desc: "험준한 산세와 대자연의 스케일이 압도적인 서부 대표 코스예요.", image: "/images/hero-altai.jpg" },
            { title: "올기", desc: "카자흐 문화와 독특한 서부 분위기를 느낄 수 있는 도시예요.", image: "/images/tour-altai-air.jpg" },
            { title: "차강노르", desc: "광활한 평원과 호수 풍경이 조용하게 펼쳐지는 지역이에요.", image: "/images/tour-altai-zavkhan.jpg" },
            { title: "톨보 호수", desc: "산과 호수가 함께 어우러진 서부의 장대한 절경이에요.", image: "/images/tour-altai-12n13d.jpg" },
        ],
    },
    ja: {
        south: [
            { title: "ゴビ砂漠", desc: "広大な砂漠と星空が印象的な南部の定番ルートです。", image: "/images/hero-gobi.jpg" },
            { title: "ヨリーンアム渓谷", desc: "深い渓谷と涼しい空気を楽しめる名所です。", image: "/images/tour-gobi-5n6d.jpg" },
            { title: "バヤンザグ", desc: "赤い断崖と恐竜化石で知られる人気スポットです。", image: "/images/tour-gobi-6n7d.jpg" },
            { title: "ホンゴル砂丘", desc: "壮大な砂丘とラクダ体験で人気のエリアです。", image: "/images/tour-gobi-7n8d.jpg" },
        ],
        north: [
            { title: "フブスグル湖", desc: "澄んだ湖の風景を楽しめる北部の代表的な旅先です。", image: "/images/hero-khuvsgul.jpg" },
            { title: "ハトガル", desc: "湖畔の落ち着いた雰囲気が魅力の町です。", image: "/images/tour-lake-5n6d.jpg" },
            { title: "ツァータン村", desc: "トナカイ文化にふれられる特別な地域です。", image: "/images/tour-lake-reindeer.jpg" },
            { title: "ウランタイガ", desc: "森と草原が広がる北部の大自然を感じられます。", image: "/images/tour-lake-forest.jpg" },
        ],
        central: [
            { title: "テレルジ国立公園", desc: "草原と奇岩の景観が美しい中部の人気コースです。", image: "/images/hero-terelj.jpg" },
            { title: "チンギスハーン騎馬像", desc: "大草原に立つ巨大な騎馬像で有名なランドマークです。", image: "/images/tour-steppe-statue.jpg" },
            { title: "エルセンタサルハイ", desc: "砂丘と草原が同時に楽しめる独特な景観です。", image: "/images/tour-steppe-3n4d.jpg" },
            { title: "ホスタイ国立公園", desc: "野生馬タヒと広大な草原に出会える保護区です。", image: "/images/tour-steppe-4n5d.jpg" },
        ],
        west: [
            { title: "アルタイ山脈", desc: "雄大な山並みが広がる西部の代表的なルートです。", image: "/images/hero-altai.jpg" },
            { title: "ウルギー", desc: "カザフ文化が色濃く残る西部の中心都市です。", image: "/images/tour-altai-air.jpg" },
            { title: "ツァガーンノール", desc: "静かな湖と平原の景色が魅力の地域です。", image: "/images/tour-altai-zavkhan.jpg" },
            { title: "トルボ湖", desc: "山と湖が織りなす壮大な景観を楽しめます。", image: "/images/tour-altai-12n13d.jpg" },
        ],
    },
    en: {
        south: [
            { title: "Gobi Desert", desc: "A signature southern route with wide desert views and striking night skies.", image: "/images/hero-gobi.jpg" },
            { title: "Yolyn Am Canyon", desc: "A dramatic canyon known for its cool air and layered cliffs.", image: "/images/tour-gobi-5n6d.jpg" },
            { title: "Bayanzag", desc: "A famous red-cliff area known for dinosaur fossil discoveries.", image: "/images/tour-gobi-6n7d.jpg" },
            { title: "Khongor Sand Dunes", desc: "Massive dunes and camel rides make this one of the most iconic stops.", image: "/images/tour-gobi-7n8d.jpg" },
        ],
        north: [
            { title: "Khuvsgul Lake", desc: "A northern classic with clear lake views and fresh forest air.", image: "/images/hero-khuvsgul.jpg" },
            { title: "Khatgal", desc: "A peaceful lakeside town with a relaxed northern atmosphere.", image: "/images/tour-lake-5n6d.jpg" },
            { title: "Tsaatan Village", desc: "A rare chance to experience reindeer culture in the north.", image: "/images/tour-lake-reindeer.jpg" },
            { title: "Ulaan Taiga", desc: "A deep-nature area of forests and open taiga landscapes.", image: "/images/tour-lake-forest.jpg" },
        ],
        central: [
            { title: "Terelj National Park", desc: "A favorite central route with steppe scenery and unique rock formations.", image: "/images/hero-terelj.jpg" },
            { title: "Chinggis Khaan Statue", desc: "A major landmark featuring the giant horse statue on the steppe.", image: "/images/tour-steppe-statue.jpg" },
            { title: "Elsen Tasarkhai", desc: "A unique area where sand dunes and grasslands meet.", image: "/images/tour-steppe-3n4d.jpg" },
            { title: "Hustai National Park", desc: "A protected grassland area known for wild horses and open landscapes.", image: "/images/tour-steppe-4n5d.jpg" },
        ],
        west: [
            { title: "Altai Mountains", desc: "A grand western route with rugged mountains and huge natural scale.", image: "/images/hero-altai.jpg" },
            { title: "Olgii", desc: "A western city known for strong Kazakh culture and mountain access.", image: "/images/tour-altai-air.jpg" },
            { title: "Tsagaan Nuur", desc: "A calm region of lakes and wide plains in western Mongolia.", image: "/images/tour-altai-zavkhan.jpg" },
            { title: "Tolbo Lake", desc: "A dramatic lake-and-mountain landscape that defines the west.", image: "/images/tour-altai-12n13d.jpg" },
        ],
    },
});

export type OptionInfo = {
    key: OptionKey;
    title: string;
    desc: string;
    photos: string[];
    details: string[];
};

export type CopyBlock = {
    title: string;
    desc: string;
    nightsTitle: string;
    nightsDesc: string;
    dateLabel: string;
    datePlaceholder: string;
    optionsTitle: string;
    optionsDesc: string;
    detailsLabel: string;
    closeLabel: string;
    addLabel: string;
    removeLabel: string;
    selectedLabel: string;
    continueLabel: string;
    backLabel: string;
    estimateLabel: string;
    basePriceLabel: string;
    optionPriceLabel: string;
    summaryTitle: string;
    summaryRegion: string;
    summaryNights: string;
    summaryDate: string;
    summaryOptions: string;
    emptyOptions: string;
    shortTitle: string;
    shortDesc: string;
    longTitle: string;
    longDesc: string;
    weekdays: readonly string[];
    deleteLabel: string;
    todayLabel: string;
    options: OptionInfo[];
};

export const OPTION_PRICE = 50000;

export const regionMeta: Record<Locale, Record<Region, RegionInfo>> = normalizeRegionInfoGroups({
    ko: {
        south: { image: "/images/hero-gobi.jpg", title: "고비 사막", label: "남부", desc: "사막과 협곡, 별 관측 중심의 일정입니다." },
        north: { image: "/images/hero-khuvsgul.jpg", title: "홉스골 호수", label: "북부", desc: "호수와 숲, 승마 체험 중심의 일정입니다." },
        central: { image: "/images/hero-terelj.jpg", title: "테를지 초원", label: "중부", desc: "초원과 온천, 가족 여행에 맞는 일정입니다." },
        west: { image: "/images/hero-altai.jpg", title: "알타이 산맥", label: "서부", desc: "대자연과 어드벤처 중심의 긴 일정입니다." },
    },
    ja: {
        south: { image: "/images/hero-gobi.jpg", title: "ゴビ砂漠", label: "南部", desc: "砂漠と渓谷、星空観察を楽しむルートです。" },
        north: { image: "/images/hero-khuvsgul.jpg", title: "フブスグル湖", label: "北部", desc: "湖と森、乗馬体験を楽しむルートです。" },
        central: { image: "/images/hero-terelj.jpg", title: "テレルジ草原", label: "中部", desc: "草原と温泉、家族旅行に合うルートです。" },
        west: { image: "/images/hero-altai.jpg", title: "アルタイ山脈", label: "西部", desc: "大自然とアドベンチャーを楽しむ長めのルートです。" },
    },
    en: {
        south: { image: "/images/hero-gobi.jpg", title: "Gobi Desert", label: "South", desc: "A route focused on desert, canyon, and stargazing." },
        north: { image: "/images/hero-khuvsgul.jpg", title: "Khuvsgul Lake", label: "North", desc: "A route focused on lakes, forests, and horse riding." },
        central: { image: "/images/hero-terelj.jpg", title: "Terelj Steppe", label: "Central", desc: "A family-friendly route across the steppe and hot springs." },
        west: { image: "/images/hero-altai.jpg", title: "Altai Mountains", label: "West", desc: "A longer adventure route across Mongolia's western mountains." },
    },
});

export const pageCopy: Record<Locale, CopyBlock> = normalizeCopyBlocks({
    ko: {
        title: "여행 스타일을 먼저 골라볼까요?",
        desc: "자신만의 계획으로 자유여행을 떠나보세요.",
        nightsTitle: "여행기간을 선택해 주세요",
        nightsDesc: "출발일과 도착일을 고르면 자동으로 몇 박 몇 일인지 계산해드려요.",
        dateLabel: "여행 날짜",
        datePlaceholder: "날짜를 선택해 주세요",
        optionsTitle: "추가하고 싶은 옵션",
        optionsDesc: "모든 추가 옵션은 1인당 가격이며, 선택하면 예상 금액에 함께 반영돼요.",
        detailsLabel: "상세보기",
        closeLabel: "닫기",
        addLabel: "옵션 추가",
        removeLabel: "옵션 빼기",
        selectedLabel: "선택됨",
        continueLabel: "이 플랜으로 여행가기",
        backLabel: "다른 여행지 고르기",
        estimateLabel: "예상 시작 금액",
        basePriceLabel: "기본 시작가",
        optionPriceLabel: "옵션 추가 금액",
        summaryTitle: "선택 요약",
        summaryRegion: "여행지",
        summaryNights: "여행기간",
        summaryDate: "여행 날짜",
        summaryOptions: "옵션",
        emptyOptions: "기본 구성으로 보기",
        shortTitle: "짧게",
        shortDesc: "3박 4일 또는 4박 5일 중심",
        longTitle: "여유 있게",
        longDesc: "5박 이상 일정 중심",
        weekdays: ["일", "월", "화", "수", "목", "금", "토"],
        deleteLabel: "삭제",
        todayLabel: "오늘",
        options: [
            { key: "customOption1", title: "고급 게르 추가", desc: "숙소를 한 단계 업그레이드해서 더 편안하게 머물 수 있어요.", photos: ["/images/hero-terelj.jpg", "/images/tour-steppe-4n5d.jpg", "/images/tour-steppe-3n4d.jpg"], details: ["기본 게르보다 넓고 아늑한 실내", "침구와 휴식 환경 업그레이드", "프리미엄 일정과 잘 어울리는 숙소 구성"] },
            { key: "customOption2", title: "공항 픽업 포함", desc: "도착과 출발 이동을 더 편하게 만들어드려요.", photos: ["/images/tour-steppe-1n2d.jpg", "/images/tour-steppe-2n3d.jpg", "/images/tour-steppe-4n5d.jpg"], details: ["비행 시간에 맞춘 공항 미팅", "숙소 또는 미팅 포인트까지 바로 이동", "야간이나 이른 도착 일정에도 편리한 옵션"] },
            { key: "customOption3", title: "프라이빗 가이드", desc: "우리 일행 속도에 맞춘 더 세심한 진행을 도와드려요.", photos: ["/images/tour-steppe-4n5d.jpg", "/images/tour-lake-5n6d.jpg", "/images/tour-gobi-5n6d.jpg"], details: ["소규모 인원에 맞춘 일정 조율", "현장 설명과 여행 동선 안내 강화", "사진, 휴식, 이동 페이스를 유연하게 조정"] },
            { key: "customOption4", title: "캠프파이어", desc: "저녁 시간에 모닥불과 함께 분위기 있는 시간을 즐길 수 있어요.", photos: ["/images/hero-gobi.jpg", "/images/tour-gobi-6n7d.jpg", "/images/tour-gobi-7n8d.jpg"], details: ["전용 캠프파이어 세팅 진행", "간단한 스낵 또는 티타임과 함께 이용", "별 보기와 야간 감성을 더해주는 인기 옵션"] },
            { key: "customOption5", title: "고급 차량", desc: "이동 구간을 더 쾌적하고 여유롭게 만들어주는 업그레이드예요.", photos: ["/images/tour-altai-air.jpg", "/images/tour-altai-12n13d.jpg", "/images/tour-altai-zavkhan.jpg"], details: ["더 넓고 편안한 좌석 구성", "장거리 이동 시 피로도를 줄여주는 차량", "가족 또는 프리미엄 여행에 잘 어울리는 선택"] },
        ],
    },
    ja: {
        title: "旅のスタイルを先に選びましょう",
        desc: "旅行期間と日付、追加オプションを選ぶと、条件に合うツアーをすぐに見つけられます。",
        nightsTitle: "旅行期間を選んでください",
        nightsDesc: "出発日と到着日を選ぶと、何泊何日かを自動で計算します。",
        dateLabel: "旅行日程",
        datePlaceholder: "日付を選択してください",
        optionsTitle: "追加したいオプション",
        optionsDesc: "追加オプションはすべて1名あたり料金で、選ぶと見積もり金額にすぐ反映されます。",
        detailsLabel: "詳細を見る",
        closeLabel: "閉じる",
        addLabel: "オプション追加",
        removeLabel: "オプション解除",
        selectedLabel: "選択済み",
        continueLabel: "この条件でツアーを見る",
        backLabel: "別の旅行先を選ぶ",
        estimateLabel: "予想スタート価格",
        basePriceLabel: "基本スタート価格",
        optionPriceLabel: "オプション追加料金",
        summaryTitle: "選択内容",
        summaryRegion: "旅行先",
        summaryNights: "旅行期間",
        summaryDate: "旅行日程",
        summaryOptions: "オプション",
        emptyOptions: "基本プランのみ",
        shortTitle: "短め",
        shortDesc: "主に3泊4日から4泊5日",
        longTitle: "ゆったり",
        longDesc: "主に5泊以上",
        weekdays: ["日", "月", "火", "水", "木", "金", "土"],
        deleteLabel: "削除",
        todayLabel: "今日",
        options: [
            { key: "customOption1", title: "プレミアムゲル", desc: "宿泊をワンランク上の快適さにアップグレードします。", photos: ["/images/hero-terelj.jpg", "/images/tour-steppe-4n5d.jpg", "/images/tour-steppe-3n4d.jpg"], details: ["より広く落ち着いた室内空間", "寝具や室内快適性をアップグレード", "プレミアム旅程に合う宿泊構成"] },
            { key: "customOption2", title: "空港ピックアップ", desc: "到着と出発の移動をもっとスムーズにします。", photos: ["/images/tour-steppe-1n2d.jpg", "/images/tour-steppe-2n3d.jpg", "/images/tour-steppe-4n5d.jpg"], details: ["フライト時間に合わせた空港ミーティング", "宿泊先または集合場所まで直接移動", "深夜や早朝の到着にも便利"] },
            { key: "customOption3", title: "プライベートガイド", desc: "グループに合わせた、よりきめ細かな進行をサポートします。", photos: ["/images/tour-steppe-4n5d.jpg", "/images/tour-lake-5n6d.jpg", "/images/tour-gobi-5n6d.jpg"], details: ["少人数向けの柔軟な行程調整", "現地での案内や説明をより丁寧に対応", "写真や休憩、移動ペースも柔軟に調整可能"] },
            { key: "customOption4", title: "キャンプファイヤー", desc: "夜にたき火を囲みながら、特別な雰囲気を楽しめるオプションです。", photos: ["/images/hero-gobi.jpg", "/images/tour-gobi-6n7d.jpg", "/images/tour-gobi-7n8d.jpg"], details: ["専用のキャンプファイヤーセットを用意", "軽いスナックやティータイムと相性が良い構成", "星空鑑賞や夜の思い出づくりにぴったり"] },
            { key: "customOption5", title: "高級車両", desc: "移動時間をより快適でゆったりしたものにするアップグレードです。", photos: ["/images/tour-altai-air.jpg", "/images/tour-altai-12n13d.jpg", "/images/tour-altai-zavkhan.jpg"], details: ["より広く快適な座席構成", "長距離移動でも疲れにくい車両", "家族旅行やプレミアム旅程に似合う選択"] },
        ],
    },
    en: {
        title: "Choose your trip style first",
        desc: "Pick your travel period, dates, and optional upgrades, then jump straight into matching tours.",
        nightsTitle: "Choose your travel period",
        nightsDesc: "Select your start and end dates and we will calculate the trip length for you.",
        dateLabel: "Travel dates",
        datePlaceholder: "Select a date",
        optionsTitle: "Optional upgrades",
        optionsDesc: "All optional upgrades are priced per person and update the estimate right away.",
        detailsLabel: "View details",
        closeLabel: "Close",
        addLabel: "Add option",
        removeLabel: "Remove option",
        selectedLabel: "Selected",
        continueLabel: "View tours with these filters",
        backLabel: "Pick another destination",
        estimateLabel: "Estimated starting price",
        basePriceLabel: "Base starting price",
        optionPriceLabel: "Added option cost",
        summaryTitle: "Selection summary",
        summaryRegion: "Destination",
        summaryNights: "Trip length",
        summaryDate: "Travel dates",
        summaryOptions: "Options",
        emptyOptions: "Base plan only",
        shortTitle: "Short trip",
        shortDesc: "Mostly 3 to 4 nights",
        longTitle: "Longer stay",
        longDesc: "Mostly 5+ nights",
        weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        deleteLabel: "Clear",
        todayLabel: "Today",
        options: [
            { key: "customOption1", title: "Premium ger upgrade", desc: "A more comfortable accommodation setup for the trip.", photos: ["/images/hero-terelj.jpg", "/images/tour-steppe-4n5d.jpg", "/images/tour-steppe-3n4d.jpg"], details: ["More spacious and refined ger interior", "Upgraded bedding and in-room comfort", "A better fit for premium-style itineraries"] },
            { key: "customOption2", title: "Airport pickup", desc: "A smoother arrival and departure experience.", photos: ["/images/tour-steppe-1n2d.jpg", "/images/tour-steppe-2n3d.jpg", "/images/tour-steppe-4n5d.jpg"], details: ["Airport meet-up based on your flight time", "Direct transfer to your stay or meeting point", "Especially useful for late-night or early arrivals"] },
            { key: "customOption3", title: "Private guide", desc: "A more tailored pace and experience for your group.", photos: ["/images/tour-steppe-4n5d.jpg", "/images/tour-lake-5n6d.jpg", "/images/tour-gobi-5n6d.jpg"], details: ["Flexible pacing for smaller groups", "More personal support before and during the trip", "Easier adjustments for photos, breaks, and timing"] },
            { key: "customOption4", title: "Campfire experience", desc: "Add a cozy evening campfire to make the trip feel more memorable.", photos: ["/images/hero-gobi.jpg", "/images/tour-gobi-6n7d.jpg", "/images/tour-gobi-7n8d.jpg"], details: ["A dedicated campfire setup in the evening", "Pairs well with light snacks or tea time", "Great for stargazing and relaxed night moments"] },
            { key: "customOption5", title: "Premium vehicle", desc: "Upgrade your transfers for a smoother and more comfortable ride.", photos: ["/images/tour-altai-air.jpg", "/images/tour-altai-12n13d.jpg", "/images/tour-altai-zavkhan.jpg"], details: ["More spacious and comfortable seating", "Better fit for longer driving segments", "A strong choice for families or premium-style trips"] },
        ],
    },
});

export function isRegion(value: string | null): value is Region {
    return value === "south" || value === "north" || value === "central" || value === "west";
}
