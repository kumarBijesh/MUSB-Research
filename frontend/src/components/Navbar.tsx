"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const links = [
    { name: "Clinical Trials", href: "/studies" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About Us", href: "/about" },
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

    const links = [
        { name: "For Businesses", href: "#" },
        { name: "For Patients", href: "/studies" },
        { name: "About Us", href: "/about" },
        { name: "Innovation", href: "#" },
        { name: "News & Events", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact Us", href: "/contact" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-3"
            : "bg-transparent py-5"
            }`}>
            <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">

                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group">
                    {/* Simulated Swirl Logo */}
                    <div className="relative w-10 h-10 flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full border-2 border-t-transparent ${isScrolled ? "border-cyan-600" : "border-cyan-400"} animate-[spin_3s_linear_infinite]`} />
                        <div className={`absolute inset-2 rounded-full border-2 border-b-transparent ${isScrolled ? "border-blue-700" : "border-white"} animate-[spin_4s_linear_infinite_reverse]`} />
                        <div className={`w-2 h-2 rounded-full ${isScrolled ? "bg-cyan-600" : "bg-cyan-400"}`} />
                    </div>

                    <div className="flex flex-col">
                        <span className={`font-black text-xl tracking-tighter leading-none ${isScrolled ? "text-slate-900" : "text-white"}`}>
                            MUSB
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] leading-none ${isScrolled ? "text-cyan-600" : "text-cyan-400"}`}>
                            Research
                        </span>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden xl:flex items-center gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isScrolled
                                ? "text-slate-700 hover:text-cyan-600"
                                : "text-slate-300 hover:text-white"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/studies"
                        className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${isScrolled
                            ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-md shadow-cyan-600/20"
                            : "bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                            }`}
                    >
                        Join A Study <ArrowRight size={14} className="inline ml-1" />
                    </Link>
                    <Link
                        href="/signin"
                        className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-all ${isScrolled
                            ? "border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900"
                            : "border-white/20 text-white hover:bg-white/10"
                            }`}
                    >
                        Sign In
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`xl:hidden ${isScrolled ? "text-slate-900" : "text-white"}`}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="xl:hidden absolute top-full left-0 right-0 bg-slate-950 border-b border-white/5 p-6 animate-fade-in-up h-screen overflow-y-auto">
                    <div className="flex flex-col gap-6">
                        {links.map((link) => (
                            <Link key={link.name} href={link.href} className="text-slate-400 hover:text-white text-xl font-bold" onClick={() => setIsMobileMenuOpen(false)}>
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-slate-800 my-2" />
                        <Link href="/studies" className="px-6 py-4 bg-cyan-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                            Join A Study <ArrowRight size={18} />
                        </Link>
                        <Link href="/contact" className="px-6 py-4 border border-slate-700 text-white rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                            Contact Sales
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
