import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
                url: "/musb%20research.png", // Using logo as placeholder
                width: 1200,
                height: 630,
                alt: "MusB Research Platform",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "MusB™ Research",
        description: "Accelerating medical discovery through virtual clinical trials.",
        images: ["/musb%20research.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

import SiteLayout from "@/components/SiteLayout";

import { Providers } from "@/components/Providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30`}>
                <Providers>
                    <SiteLayout>
                        {children}
                    </SiteLayout>
                </Providers>
            </body>
        </html>
    );
}
