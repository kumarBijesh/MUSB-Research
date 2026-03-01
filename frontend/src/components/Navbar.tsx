"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, LayoutDashboard, User, ArrowRight } from "lucide-react";
import { ParticipantAuth, AdminAuth } from "@/lib/portal-auth";

const links = [
    { name: "Studies", href: "/studies" },
    { name: "How It Works", href: "/how-it-works" },
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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        handleScroll(); // initial state
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
        <nav className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-2 md:py-3"
            : "bg-transparent py-3 md:py-5"
            }`}>
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">

                {/* Logo Section */}
                <Link href="/" className={`flex items-center gap-3 group relative transition-all ${!isScrolled ? "bg-white px-3 py-1.5 rounded-xl shadow-lg border border-white/10" : ""
                    }`}>
                    <Image
                        src="/musb research.png"
                        alt="MUSB Research Logo"
                        width={180}
                        height={45}
                        className="h-8 md:h-12 w-auto object-contain"
                        priority
                    />
                    {/* Hover Tooltip Pointer */}
                    {pathname !== "/" && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 border border-cyan-500/50 text-cyan-400 text-[13px] uppercase font-black tracking-widest rounded-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl shadow-cyan-500/20 flex items-center gap-2 transform-gpu group-hover:scale-105 z-50">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Click to go Home
                            <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45 border-b border-l border-cyan-500/50 shadow-[-4px_4px_10px_rgba(6,182,212,0.1)]" />
                        </div>
                    )}
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-[13px] lg:text-[13px] font-bold uppercase tracking-widest transition-colors ${isScrolled
                                ? "text-slate-700 hover:text-cyan-600"
                                : "text-slate-300 hover:text-white"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Sign In / Portal Button */}
                <div className="hidden md:flex items-center gap-4">
                    {status === "authenticated" ? (
                        <div className="flex items-center gap-4">
                            {/* User Profile Info */}
                            <div className="flex items-center gap-3 pr-4 border-r border-slate-200/20">
                                <div className={`flex flex-col items-end ${isScrolled ? "text-slate-900" : "text-white"}`}>
                                    <span className="text-[13px] uppercase tracking-tighter font-black opacity-50 leading-none mb-1">Authenticated</span>
                                    <span className="text-[13px] font-bold tracking-tight leading-none">{user?.name || "User"}</span>
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
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-widest bg-cyan-600 text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20 group"
                            >
                                <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
                                My Portal
                            </Link>

                            <button
                                onClick={() => {
                                    ParticipantAuth.clear();
                                    AdminAuth.clear();
                                    signOut({ callbackUrl: "/" });
                                }}
                                className={`p-2.5 rounded-full transition-all border ${isScrolled
                                    ? "border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50"
                                    : "border-white/10 text-white/70 hover:text-red-400 hover:border-red-400 hover:bg-red-500/10"
                                    }`}
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/signin"
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold uppercase tracking-widest border transition-all ${isScrolled
                                ? "border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50"
                                : "border-white/20 text-white hover:bg-white/10 hover:border-white"
                                }`}
                        >
                            <User size={14} />
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`md:hidden p-2 -mr-2 transition-colors ${isScrolled ? "text-slate-900" : "text-white"}`}
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[10000] bg-[#0A1128] flex flex-col p-8 overflow-hidden h-screen">
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
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-white text-3xl font-black italic tracking-tight hover:text-cyan-400 transition-all flex items-center justify-between w-full group"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                                <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-cyan-500" size={24} />
                            </Link>
                        ))}
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
                                            signOut({ callbackUrl: "/" });
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
                                <User size={20} />
                                Sign In
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
        </nav>
    );
}
