import { normalizeCmsImageList } from "@/lib/cms-image";
import { type CommunityItem, type CommunityNotice, type Locale } from "@/lib/bluewolf-types";

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
            title: "기본 문의는 고객센터에서 먼저 확인하실 수 있어요",
            summary: "비자, 결제, 준비물, 환불 규정 같은 기본 안내는 고객센터에 정리되어 있어 빠르게 확인하실 수 있습니다.",
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
            title: "상담 문의는 커뮤니티보다 고객센터가 더 빨라요",
            summary: "견적, 단체 문의, 맞춤 일정 상담은 고객센터를 이용하시면 운영팀이 더 빠르게 확인해드립니다.",
            date: "2026-03-20",
            href: "/faq#contact-support",
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
            title: "基本的な案内はサポートで先に確認できます",
            summary: "ビザ、決済、持ち物、返金規定などの案内はサポートで素早く確認できます。",
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
            href: "/faq#contact-support",
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
            title: "You can check common questions in Support first",
            summary: "Core topics like visas, payment, packing, and refund policy are already organized in Support.",
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
            title: "For custom planning, Support is the fastest route",
            summary: "For quotes, group trips, and custom itinerary requests, please use Support so our team can respond more quickly.",
            date: "2026-03-20",
            href: "/faq#contact-support",
        },
    ],
};
