import { MetadataRoute } from "next";
import { tours } from "@/lib/bluewolf-data";
import { siteGuides, sitePolicies } from "@/lib/site-structure";

const baseUrl = "https://bluewolf-tour.com";
const staticRoutes = [
    "",
    "/about",
    "/about/en",
    "/about/ja",
    "/tours",
    "/tours/customize",
    "/booking",
    "/community",
    "/community/reviews",
    "/community/mates",
    "/community/qna",
    "/community/notices",
    "/faq",
    "/guides",
    "/policies",
    "/search",
];
const regionRoutes = ["/regions/south", "/regions/north", "/regions/central", "/regions/west"];

export default function sitemap(): MetadataRoute.Sitemap {
    const tourRoutes = tours.map((tour) => `/tours/${tour.id}`);
    const guideRoutes = siteGuides.map((guide) => `/guides/${guide.slug}`);
    const policyRoutes = sitePolicies.map((policy) => `/policies/${policy.slug}`);

    return [...staticRoutes, ...regionRoutes, ...tourRoutes, ...guideRoutes, ...policyRoutes].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));
}
