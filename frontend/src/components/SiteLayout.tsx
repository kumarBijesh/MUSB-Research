"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPortal = pathname?.startsWith("/portal");
    const isAdmin = pathname?.startsWith("/admin");
    const isAuth = pathname === "/signin" || pathname === "/signup";

    // Admin and Portal have their own layouts
    if (isPortal || isAdmin) {
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
