"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, LayoutDashboard, LogIn, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticipantAuth, AdminAuth } from "@/lib/portal-auth";

const links = [
    { name: "Privacy / Data Use", href: "/privacy" },
    { name: "Help / FAQ", href: "/help" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [portalUser, setPortalUser] = useState<any>(null);
    const [portalLink, setPortalLink] = useState("/dashboard/participant");

    useEffect(() => {
        // Hydrate from strictly isolated sessionStorage first
        const pAuth = ParticipantAuth.get();
        const aAuth = AdminAuth.get();

        if (pAuth) {
            setPortalUser(pAuth.user);
            setPortalLink("/dashboard/participant");
        } else if (aAuth) {
            setPortalUser(aAuth.user);
            setPortalLink(aAuth.user.role === "SPONSOR" ? "/sponsor/dashboard" : "/admin");
        } else if (session?.user) {
            // Fallback to generic NextAuth
            setPortalUser(session.user);
            setPortalLink((session.user as any).redirectTo || "/dashboard/participant");
        }
    }, [session]);

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Set scrolled background state
            setIsScrolled(currentScrollY > 20);

            // Hide/Show logic
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMobileMenuOpen]);

    const user = portalUser || session?.user;
    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <>
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 py-4 md:py-5 ${isScrolled
                    ? "bg-white/98 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
                    : "bg-white/95 border-b border-slate-200/60"
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group relative transition-all transform-gpu origin-left">
                        <div className="
                            flex items-center justify-center
                            bg-white border border-slate-200
                            rounded-xl px-4 py-2
                            shadow-sm
                            transition-all duration-300 ease-out
                            group-hover:scale-105 group-hover:shadow-md group-hover:border-slate-300
                            transform-gpu
                        ">
                            <Image
                                src="/musb research.png"
                                alt="MUSB Research Logo"
                                width={200}
                                height={52}
                                className="h-8 md:h-11 w-auto object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-5 lg:gap-8">
                        {links.map((link) => {
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-[12px] lg:text-[13px] font-black uppercase tracking-widest transition-all text-slate-900 hover:text-cyan-500 border-b-2 border-transparent hover:border-cyan-500 pb-0.5"
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Sign In / Portal Button */}
                    <div className="hidden md:flex items-center gap-3">
                        {status === "authenticated" ? (
                            <div className="flex items-center gap-3">
                                {/* User Profile Info */}
                                <div className="flex items-center gap-2.5 pr-3 border-r border-slate-200">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 leading-none mb-0.5">Authenticated</span>
                                        <span className="text-[13px] font-bold tracking-tight leading-none text-slate-800">{user?.name || "User"}</span>
                                    </div>
                                    {user?.image ? (
                                        <img src={user.image} alt="" className="w-8 h-8 rounded-full border-2 border-cyan-500/30 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-[13px] shadow-lg shadow-cyan-500/20">
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={portalLink}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest bg-cyan-500 text-white hover:bg-cyan-400 transition-all shadow-md group"
                                >
                                    <LayoutDashboard size={13} className="group-hover:rotate-12 transition-transform" />
                                    My Portal
                                </Link>

                                <button
                                    onClick={() => {
                                        ParticipantAuth.clear();
                                        AdminAuth.clear();
                                        signOut({ redirect: false }).then(() => {
                                            window.location.href = "https://musbresearchwebsite-1.vercel.app/";
                                        });
                                    }}
                                    className="p-2.5 rounded-full transition-all border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50"
                                    title="Sign Out"
                                >
                                    <LogOut size={15} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/signin"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest bg-[#0f172a] text-white hover:bg-cyan-400 hover:text-slate-900 active:bg-cyan-500 active:text-slate-900 transition-all shadow-md hover:-translate-y-1 hover:shadow-cyan-500/25 transform-gpu duration-300"
                            >
                                <LogIn size={15} />
                                SIGN IN
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 -mr-2 transition-colors text-slate-600 hover:text-slate-900"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </motion.nav>

            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[10000] bg-[#0A1128] flex flex-col p-8 overflow-hidden h-[100dvh]">
                    {/* Header inside menu */}
                    <div className="flex justify-between items-center mb-10 shrink-0">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="inline-flex items-center bg-white px-6 py-3 rounded-xl shadow-lg border border-white/10 transition-transform active:scale-95">
                            <Image
                                src="/musb research.png"
                                alt="MUSB Research"
                                width={180}
                                height={45}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 -mr-2 text-white/50 hover:text-white transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={32} />
                        </button>
                    </div>

                    <div className="h-px w-full bg-white/5 mb-10" />

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-6 items-start flex-grow overflow-y-auto pt-2 custom-scrollbar">
                        {links.map((link) => {
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-white text-3xl font-black italic tracking-tight hover:text-cyan-400 transition-all flex items-center justify-between w-full group"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                    <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-cyan-500" size={24} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom Section: Auth / Portal */}
                    <div className="mt-auto border-t border-white/10 pt-10 space-y-6">
                        {status === "authenticated" ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    {user?.image ? (
                                        <img src={user.image} alt="" className="w-14 h-14 rounded-2xl border-2 border-cyan-500/50" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-cyan-500/20">
                                            {initials}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-white font-black text-xl leading-none truncate">{user?.name}</p>
                                        <p className="text-cyan-400 font-black text-[11px] uppercase tracking-widest mt-2">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <Link
                                        href={portalLink}
                                        className="w-full py-4 bg-cyan-600 text-white text-center font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-cyan-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <LayoutDashboard size={20} />
                                        Access Portal
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            ParticipantAuth.clear();
                                            AdminAuth.clear();
                                            signOut({ redirect: false }).then(() => {
                                                window.location.href = "https://musbresearchwebsite-1.vercel.app/";
                                            });
                                        }}
                                        className="w-full py-4 bg-slate-900 border border-white/5 text-red-400 font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        <LogOut size={20} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/signin"
                                className="w-full py-5 bg-white text-slate-950 text-center font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-4"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <LogIn size={20} />
                                SIGN IN
                            </Link>
                        )}

                        <div className="text-center">
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.4em]">
                                © 2026 MUSB Research
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
