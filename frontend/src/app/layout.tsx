import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InactivityTimer from "@/components/compliance/InactivityTimer";
import DeviceAdjuster from "@/components/DeviceAdjuster";
import InitialSplash from "@/components/InitialSplash";
import { cookies } from "next/headers";
import CookieConsent from "@/components/compliance/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

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
};

import SiteLayout from "@/components/SiteLayout";
import { Providers } from "@/components/Providers";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const perfMode = cookieStore.get("perf-mode")?.value || "high";
    const deviceType = cookieStore.get("device-type")?.value || "desktop";

    // Adjust body classes based on performance mode
    const performanceClasses = perfMode === "low" ? "reduce-motion no-animations" : "";
    const deviceClasses = `device-${deviceType}`;

    return (
        <html lang="en" className={`${performanceClasses} ${deviceClasses}`}>
            <body className={`${inter.className} min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30 antialiased`}>
                <InitialSplash />
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
