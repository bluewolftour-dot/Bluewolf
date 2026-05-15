import "./globals.css";
import localFont from "next/font/local";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CmsBootstrapProvider, type CmsBootstrapPayload } from "@/components/cms/CmsBootstrapProvider";
import { ScrollRestorer } from "@/components/layout/ScrollRestorer";
import {
    getAllCmsTours,
    getCmsCommunityContent,
    getCmsHomeContent,
    getCmsTourCustomizeContent,
    getCmsTourOptionsContent,
    getCmsTourRegionCardsContent,
    getCmsTourThemesContent,
} from "@/lib/cms-crm-db";

const notoSansCJK = localFont({
    src: [
        { path: "../public/fonts/NotoSansCJKkr-Regular.otf", weight: "400", style: "normal" },
        { path: "../public/fonts/NotoSansCJKkr-Medium.otf", weight: "500", style: "normal" },
        { path: "../public/fonts/NotoSansCJKkr-Bold.otf", weight: "700", style: "normal" },
        { path: "../public/fonts/NotoSansCJKkr-Black.otf", weight: "900", style: "normal" },
    ],
    variable: "--font-noto-sans-cjk",
    display: "swap",
});

export const metadata = {
    title: "BlueWolf",
    description: "몽골 여행 플랫폼",
};

const themeInitScript = `
(function () {
    try {
        var storageKey = "bluewolf-theme";
        var savedTheme = localStorage.getItem(storageKey);
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;
        document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch (error) {}
})();
`;

async function safeCmsValue<T>(loader: () => Promise<T>) {
    try {
        return await loader();
    } catch {
        return null;
    }
}

async function buildCmsBootstrapPayload(): Promise<CmsBootstrapPayload> {
    const [
        homeContent,
        communityContent,
        tours,
        tourRegionCardsContent,
        tourOptionsContent,
        tourCustomizeContent,
        tourThemesContent,
    ] = await Promise.all([
        safeCmsValue(getCmsHomeContent),
        safeCmsValue(getCmsCommunityContent),
        safeCmsValue(getAllCmsTours),
        safeCmsValue(getCmsTourRegionCardsContent),
        safeCmsValue(getCmsTourOptionsContent),
        safeCmsValue(getCmsTourCustomizeContent),
        safeCmsValue(getCmsTourThemesContent),
    ]);

    return {
        homeContent,
        communityContent,
        tours,
        tourRegionCardsContent,
        tourOptionsContent,
        tourCustomizeContent,
        tourThemesContent,
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cmsBootstrapPayload = await buildCmsBootstrapPayload();

    return (
        <html lang="ko" suppressHydrationWarning>
            <body className={notoSansCJK.variable}>
                <Script id="theme-init" strategy="beforeInteractive">
                    {themeInitScript}
                </Script>
                <AuthProvider>
                    <CmsBootstrapProvider initialData={cmsBootstrapPayload}>
                        <ScrollRestorer />
                        {children}
                    </CmsBootstrapProvider>
                </AuthProvider>
                <SpeedInsights />
            </body>
        </html>
    );
}
