import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { getCmsCommunityContent } from "@/lib/cms-crm-db";
import { type CommunityItem, type Locale } from "@/lib/bluewolf-data";

const SESSION_COOKIE = "bluewolf_session";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const user = await getSessionUser(token);

    if (!user) {
        return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
    }

    const community = await getCmsCommunityContent();
    const locales: Locale[] = ["ko", "ja", "en"];
    
    // 모든 언어의 아이템에서 해당 사용자가 쓴 글을 추출
    const myItems: CommunityItem[] = [];
    
    locales.forEach(locale => {
        const items = community.items[locale] || [];
        const filtered = items.filter(item => item.author === user.id || item.author === user.name);
        myItems.push(...filtered);
    });

    // 날짜 역순 정렬
    myItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ items: myItems });
}
