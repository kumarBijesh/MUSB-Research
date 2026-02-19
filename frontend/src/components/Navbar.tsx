"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const links = [
    { name: "Studies", href: "/studies" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Privacy / Data Use", href: "/privacy" },
    { name: "Help / FAQ", href: "/help" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-3"
            : "bg-transparent py-5"
            }`}>
            <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">

                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group">
                    <img
                        src="/musb research.png"
                        alt="MUSB Research Logo"
                        className="h-10 w-auto object-contain"
                        loading="lazy"
                    />
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-[11px] lg:text-[13px] font-bold uppercase tracking-widest transition-colors ${isScrolled
                                ? "text-slate-700 hover:text-cyan-600"
                                : "text-slate-300 hover:text-white"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Sign In Button */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/signin"
                        className={`px-4 lg:px-6 py-2.5 rounded-full text-[11px] lg:text-[12px] font-bold uppercase tracking-widest border transition-all ${isScrolled
                            ? "border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50"
                            : "border-white/20 text-white hover:bg-white/10 hover:border-white"
                            }`}
                    >
                        Sign In
                    </Link>
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
                    <div className="flex justify-end mb-8">
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-2">
                            <X size={32} />
                        </button>
                    </div>
                    <div className="flex flex-col gap-8 items-center justify-center flex-grow">
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
                        <Link
                            href="/signin"
                            className="text-white text-xl font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
