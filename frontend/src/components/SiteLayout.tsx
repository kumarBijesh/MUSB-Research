"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPortal = pathname?.startsWith("/portal");
    const isAdmin = pathname?.startsWith("/admin");
    const isSponsor = pathname?.startsWith("/sponsor");
    const isDashboard = pathname?.startsWith("/dashboard");
    const isAuth = pathname === "/signin" || pathname === "/signup";

    // Portal, Admin, Sponsor, and Participant dashboard have their own layouts
    if (isPortal || isAdmin || isSponsor || isDashboard) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            {!isAuth && <Footer />}
        </div>
    );
}
