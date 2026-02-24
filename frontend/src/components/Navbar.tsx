"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
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

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const user = portalUser || session?.user;
    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-3"
            : "bg-transparent py-5"
            }`}>
            <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">

                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group relative">
                    <Image
                        src="/musb research.png"
                        alt="MUSB Research Logo"
                        width={200}
                        height={50}
                        className="h-14 w-auto object-contain"
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
                    className={`md:hidden ${isScrolled ? "text-slate-900" : "text-white"}`}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[101] bg-slate-950/95 backdrop-blur-xl flex flex-col p-6 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-8">
                        {status === "authenticated" && (
                            <div className="flex items-center gap-3">
                                {user?.image ? (
                                    <img src={user.image} alt="" className="w-10 h-10 rounded-full border-2 border-cyan-500" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                                        {initials}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-bold">{user?.name}</p>
                                    <p className="text-slate-500 text-[13px]">Authenticated</p>
                                </div>
                            </div>
                        )}
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2 ml-auto">
                            <X size={32} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-6 items-center justify-center flex-grow">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-slate-300 hover:text-white text-2xl font-bold tracking-tight transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="h-px w-20 bg-slate-800 my-4" />

                        {status === "authenticated" ? (
                            <>
                                <Link
                                    href={portalLink}
                                    className="text-cyan-400 text-xl font-bold uppercase tracking-widest flex items-center gap-3"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard size={20} />
                                    My Portal
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        ParticipantAuth.clear();
                                        AdminAuth.clear();
                                        signOut({ callbackUrl: "/" });
                                    }}
                                    className="text-red-400 text-xl font-bold uppercase tracking-widest flex items-center gap-3 mt-4"
                                >
                                    <LogOut size={20} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/signin"
                                className="text-white text-xl font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors flex items-center gap-3"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <User size={20} />
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
