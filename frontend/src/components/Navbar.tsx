"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, LayoutDashboard, LogIn, ArrowRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParticipantAuth, AdminAuth } from "@/lib/portal-auth";

const links = [
    { name: "FOR BUSINESSES", href: "/business" },
    { name: "FOR PATIENTS", href: "/patients" },
    {
        name: "ABOUT US",
        href: "/about",
        hasDropdown: true,
        submenu: [
            { name: "Why Choose MusB Research", href: "/about#why-us" },
            { name: "Capabilities", href: "/about#capabilities" },
            { name: "Facilities", href: "/about#facilities" },
            { name: "Our Team", href: "/about/team" },
            { name: "Find A Study", href: "/studies" },
        ]
    },
    { name: "INNOVATION", href: "/innovation" },
    { name: "NEWS & EVENTS", href: "/news" },
    { name: "CAREERS", href: "/careers" },
    { name: "CONTACT US", href: "/contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [portalUser, setPortalUser] = useState<any>(null);
    const [portalLink, setPortalLink] = useState("/dashboard/participant");
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const pAuth = ParticipantAuth.get();
        const aAuth = AdminAuth.get();

        if (pAuth) {
            setPortalUser(pAuth.user);
            setPortalLink("/dashboard/participant");
        } else if (aAuth) {
            setPortalUser(aAuth.user);
            setPortalLink(aAuth.user.role === "SPONSOR" ? "/sponsor/dashboard" : "/admin");
        } else if (session?.user) {
            setPortalUser(session.user);
            setPortalLink((session.user as any).redirectTo || "/dashboard/participant");
        }
    }, [session]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const user = portalUser || session?.user;
    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <nav className="fixed top-0 left-0 right-0 z-[9999] bg-[#F5F5F5] font-sans antialiased h-[88px] flex items-center shadow-sm">
            {/* Main Container matching screenshot spacing */}
            <div className="w-full max-w-[1550px] mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-between gap-4">

                <div className="shrink-0 flex items-center">
                    <Link href="/" className="group bg-white px-8 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center transition-all duration-300 ease-in-out hover:scale-105 active:scale-95">
                        <Image
                            src="/musb research.png"
                            alt="MUSB Research"
                            width={160}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Deskrop Nav Links - Center part */}
                <div className="hidden xl:flex items-center gap-6 2xl:gap-11">
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.hasDropdown && pathname.startsWith(link.href));
                        return (
                            <div key={link.name} className="relative group/nav h-full flex items-center shrink-0">
                                <Link
                                    href={link.href}
                                    className={`text-[11px] font-black leading-tight tracking-[0.12em] whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 py-8 ${isActive ? "text-cyan-600" : "text-slate-900 hover:text-cyan-600"
                                        }`}
                                >
                                    {link.name}
                                    {link.hasDropdown && (
                                        <ChevronDown size={12} className={`transition-transform duration-300 ${isActive ? "text-cyan-600" : "text-slate-400"} group-hover/nav:rotate-180`} />
                                    )}
                                    {/* Active Indicator Bar */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute bottom-4 left-0 right-0 h-[3px] bg-cyan-600 rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>

                                {/* Dropdown Logic */}
                                {link.hasDropdown && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-300 transform scale-95 group-hover/nav:scale-100">
                                        <div className="bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 min-w-[220px]">
                                            {link.submenu?.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    className="block py-2 px-3 text-[11px] font-bold text-slate-600 hover:text-cyan-600 hover:bg-slate-50 rounded-lg transition-all"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right Actions - Buttons matching screenshot exactly */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/studies"
                        className="bg-cyan-500 text-slate-900 px-8 py-3 rounded-xl text-[12px] font-black tracking-[0.1em] flex items-center gap-2 shadow-[0_4px_15px_rgba(6,182,212,0.15)] hover:bg-white border border-transparent hover:border-slate-100 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                    >
                        JOIN A STUDY
                        <ArrowRight size={18} className="stroke-[3px]" />
                    </Link>

                    {status === "authenticated" ? (
                        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
                            <Link href={portalLink} className="flex items-center gap-3 group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] uppercase font-black text-slate-400 leading-none mb-1">DASHBOARD</p>
                                    <p className="text-[12px] font-bold text-slate-800 leading-none">{user?.name?.split(' ')[0]}</p>
                                </div>
                                {user?.image ? (
                                    <img src={user.image} alt="" className="w-9 h-9 rounded-full border border-slate-200 shadow-inner" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-[12px] font-black">
                                        {initials}
                                    </div>
                                )}
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/signin"
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[12px] font-black tracking-[0.1em] flex items-center gap-2 hover:bg-cyan-500 hover:text-slate-900 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                        >
                            <LogIn size={18} className="stroke-[3px]" />
                            SIGN IN
                        </Link>
                    )}

                    {/* Mobile Toggle Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="xl:hidden p-2 text-slate-900 border border-slate-200 rounded-lg shadow-sm bg-white"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar - Consistent with reference image styling */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[10000] xl:hidden"
                        />
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] bg-white z-[10001] shadow-2xl xl:hidden flex flex-col p-6"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Navigation</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                {links.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-slate-800 text-lg font-black uppercase tracking-widest hover:text-cyan-500 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-auto space-y-4 pt-8 border-t border-slate-100">
                                {status === "unauthenticated" ? (
                                    <>
                                        <Link
                                            href="/studies"
                                            className="w-full bg-[#00BCD4] text-white py-4 rounded-xl text-center font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Join A Study
                                            <ArrowRight size={18} />
                                        </Link>
                                        <Link
                                            href="/signin"
                                            className="w-full bg-[#0F172A] text-white py-4 rounded-xl text-center font-black uppercase tracking-widest active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <LogIn size={18} />
                                            Sign In
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href={portalLink}
                                        className="w-full bg-cyan-600 text-white py-4 rounded-xl text-center font-black uppercase tracking-widest"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Dashboard
                                    </Link>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
