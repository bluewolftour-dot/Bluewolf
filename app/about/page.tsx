import { AboutPageTemplate, type AboutCopy } from "@/components/about/AboutPageTemplate";

const aboutCopy = {
    brand: "BlueWolf",
    login: "로그인",
    badge: "회사소개",
    title: "BlueWolf는 몽골 여행을 더 믿을 수 있고 더 편하게 만드는 팀입니다.",
    desc: "여행 상품 탐색부터 플랜 신청, 결제, 현지 운영, 후기와 커뮤니티까지 하나의 플랫폼 안에서 연결하는 것을 목표로 합니다.",
    missionTitle: "우리가 하는 일",
    missionDesc:
        "몽골 현지 경험과 디지털 플랜 신청 경험을 결합해, 고객이 더 쉽게 여행을 이해하고 더 빠르게 신청할 수 있도록 설계합니다.",
    valuesTitle: "핵심 가치",
    values: [
        {
            title: "신뢰",
            desc: "여행 전 정보와 실제 현지 경험의 간극을 줄입니다.",
        },
        {
            title: "간결함",
            desc: "복잡한 예약 과정을 직관적인 흐름으로 단순화합니다.",
        },
        {
            title: "현지성",
            desc: "몽골 현지 일정, 이동, 숙박, 체험의 실제 운영을 반영합니다.",
        },
    ],
    processTitle: "운영 방식",
    process: [
        "상품 기획 및 현지 동선 검증",
        "플랜 신청 접수 및 상담",
        "결제 및 출발 전 안내",
        "현지 운영 및 고객 응대",
        "후기와 커뮤니티 기반 개선",
    ],
    ctaTitle: "BlueWolf와 함께 몽골 여행을 시작해보세요",
    ctaDesc: "투어를 비교하고 원하는 일정으로 바로 플랜 상담을 시작할 수 있습니다.",
    ctaPrimary: "투어 보러가기",
    ctaSecondary: "메인으로 돌아가기",
    footerDesc: "몽골 전문 여행 플랫폼 · 한국어 / 일본어 / 영어 지원",
    footerCopyright: "© 2026 BlueWolf. All rights reserved.",
} satisfies AboutCopy;

export default function AboutPage() {
    return <AboutPageTemplate t={aboutCopy} locale="ko" />;
}
