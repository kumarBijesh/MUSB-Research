import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MusB™ Research",
    description: "Virtual Clinical Trial Ecosystem",
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
