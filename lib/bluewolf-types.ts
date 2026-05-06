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
    authorId?: string;
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
