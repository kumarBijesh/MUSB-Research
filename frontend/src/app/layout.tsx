import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/env"; // Validation for required environment variables
import InactivityTimer from "@/components/compliance/InactivityTimer";
import DeviceAdjuster from "@/components/DeviceAdjuster";

import { cookies } from "next/headers";
import CookieConsent from "@/components/compliance/CookieConsent";
import CosmicBackground from "@/components/CosmicBackground";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    metadataBase: new URL("https://musbresearch.com"),
    title: {
        default: "MusB™ Research | Virtual Clinical Trial Ecosystem",
        template: "%s | MusB™ Research",
    },
    description: "Connect with groundbreaking medical research from anywhere. MusB Research is the leading platform for decentralized virtual clinical trials, accelerating medical discovery through technology.",
    keywords: ["clinical trials", "virtual trials", "medical research", "decentralized trials", "patient recruitment", "health technology", "biotech"],
    authors: [{ name: "MusB Research Team" }],
    creator: "MusB Research",
    publisher: "MusB Research",
    openGraph: {
        title: "MusB™ Research | The Future of Clinical Trials",
        description: "Join the next generation of medical research. Participate in virtual clinical trials from the comfort of your home.",
        url: "https://musbresearch.com",
        siteName: "MusB Research",
        images: [
            {
                url: "/musb%20research.png",
                width: 1200,
                height: 630,
                alt: "MusB Research Platform",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    icons: {
        // use the existing logo PNG as the favicon (browsers accept PNG favicons)
        icon: ['/musb research.png', '/favicon.ico'],
        apple: '/musb research.png',
    },
};

import SiteLayout from "@/components/SiteLayout";
import { Providers } from "@/components/Providers";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // 🛡️ Global Server-Side Console suppression for production protection
    if (process.env.NODE_ENV === "production") {
        console.log = () => { };
        console.info = () => { };
        console.debug = () => { };
    }

    const cookieStore = await cookies();
    const perfMode = cookieStore.get("perf-mode")?.value || "high";
    const deviceType = cookieStore.get("device-type")?.value || "desktop";

    // Adjust body classes based on performance mode
    const performanceClasses = perfMode === "low" ? "reduce-motion no-animations" : "";
    const deviceClasses = `device-${deviceType}`;

    return (
        <html lang="en" className={`${performanceClasses} ${deviceClasses}`}>
            {process.env.NODE_ENV === "production" && (
                <head>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `console.log = function() {}; console.info = function() {}; console.debug = function() {};`
                        }}
                    />
                </head>
            )}
            <body className={`${inter.className} min-h-[100dvh] w-full overflow-x-hidden bg-[#0A1128] text-white selection:bg-cyan-500/30 antialiased`}>
                <CosmicBackground />
                <DeviceAdjuster />
                <CookieConsent />
                <Providers>
                    <InactivityTimer />
                    <SiteLayout>
                        {children}
                    </SiteLayout>
                </Providers>
            </body>
        </html>
    );
}
