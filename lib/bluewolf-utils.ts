import { type Locale, type Tour } from "@/lib/bluewolf-data";

export function filterTours(
    items: Tour[],
    lang: Locale,
    keyword: string,
    duration: string,
    region: string,
    theme: string,
    sort: string
) {
    const q = keyword.trim().toLowerCase();

    const list = items.filter((tour) => {
        const matchKeyword =
            !q ||
            tour.title[lang].toLowerCase().includes(q) ||
            tour.desc[lang].toLowerCase().includes(q);

        return (
            matchKeyword &&
            (duration === "all" || tour.durationType === duration) &&
            (region === "all" || tour.region === region) &&
            (theme === "all" || tour.theme === theme)
        );
    });

    if (sort === "priceLow") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") return [...list].sort((a, b) => b.price - a.price);
    return list;
}

export function formatPrice(value: number) {
    return `₩${value.toLocaleString("ko-KR")}`;
}

export function maskEmail(email: string) {
    if (!email) return "";
    const [user, domain] = email.split("@");
    if (!domain) return email;
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user.slice(0, 2)}${"*".repeat(Math.min(user.length - 2, 8))}@${domain}`;
}

export function maskPhone(phone: string) {
    if (!phone) return "";
    const parts = phone.split("-");
    if (parts.length === 3) {
        return `${parts[0]}-****-${parts[2]}`;
    }
    if (phone.length <= 7) return phone;
    return phone.slice(0, 3) + "****" + phone.slice(-4);
}