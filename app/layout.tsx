import "./globals.css";
import localFont from "next/font/local";
import Script from "next/script";
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

function buildCmsBootstrapPayload(): CmsBootstrapPayload {
    return {
        homeContent: (() => {
            try {
                return getCmsHomeContent();
            } catch {
                return null;
            }
        })(),
        communityContent: (() => {
            try {
                return getCmsCommunityContent();
            } catch {
                return null;
            }
        })(),
        tours: (() => {
            try {
                return getAllCmsTours();
            } catch {
                return null;
            }
        })(),
        tourRegionCardsContent: (() => {
            try {
                return getCmsTourRegionCardsContent();
            } catch {
                return null;
            }
        })(),
        tourOptionsContent: (() => {
            try {
                return getCmsTourOptionsContent();
            } catch {
                return null;
            }
        })(),
        tourCustomizeContent: (() => {
            try {
                return getCmsTourCustomizeContent();
            } catch {
                return null;
            }
        })(),
        tourThemesContent: (() => {
            try {
                return getCmsTourThemesContent();
            } catch {
                return null;
            }
        })(),
    };
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cmsBootstrapPayload = buildCmsBootstrapPayload();

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
            </body>
        </html>
    );
}
