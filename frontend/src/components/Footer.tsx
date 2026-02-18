import { MapPin, Phone, Mail, Facebook, Youtube, Linkedin, Instagram, Send, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
    const [newsletterType, setNewsletterType] = useState('individual');

    return (
        <footer className="relative overflow-hidden bg-slate-950 pt-20 pb-10">
            {/* Background Gradient & Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0B1121] to-[#0f172a] opacity-80" />
            <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 blur-[120px] rounded-full -z-10" />

            {/* Stars / Particles effect */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full blur-[2px] opacity-60 animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-500 rounded-full blur-[4px] opacity-40 animate-pulse delay-700" />
            <div className="absolute bottom-10 left-10 w-2 h-2 bg-cyan-300 rounded-full blur-[2px] opacity-50 animate-pulse delay-1000" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

                    {/* LEFT COLUMN: Logo & Contact */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href="/" className="flex items-center gap-3 group mb-6">
                            <img
                                src="/musb research.png"
                                alt="MUSB Research Logo"
                                className="h-12 w-auto object-contain"
                                loading="lazy"
                            />
                        </Link>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 group">
                                <div className="p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                                    <MapPin size={18} className="text-cyan-400" />
                                </div>
                                <div className="text-sm text-slate-400 leading-relaxed">
                                    <p>6331 State Road 54</p>
                                    <p>New Port Richey, FL 34653</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                                    <Phone size={18} className="text-cyan-400" />
                                </div>
                                <p className="text-sm text-slate-400">+1-813-419-0781</p>
                            </div>

                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                                    <Mail size={18} className="text-cyan-400" />
                                </div>
                                <p className="text-sm text-slate-400">info@musbresearch.com</p>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Links & Socials */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Solutions</h4>
                                <ul className="space-y-4">
                                    {['For Businesses', 'For Patients', 'Innovation', 'Join a Study!'].map((item) => (
                                        <li key={item}>
                                            <Link href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors font-medium">
                                                {item}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">MusB Group</h4>
                                <ul className="space-y-4">
                                    {['About Us', 'News & Events', 'Careers', 'Contact Us'].map((item) => (
                                        <li key={item}>
                                            <Link href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors font-medium">
                                                {item}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Join The Community</h4>
                            <div className="flex gap-3">
                                {[Youtube, Facebook, Instagram, Linkedin, MessageCircle].map((Icon, i) => (
                                    <Link key={i} href="#" className="p-2 rounded-lg bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-500 transition-all">
                                        <Icon size={18} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Newsletter Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">Get Our Newsletters</h3>
                            <p className="text-slate-400 text-xs mb-6 font-medium">Which Best Describes You?</p>

                            <div className="bg-slate-950 p-1 rounded-xl flex mb-6 border border-white/5">
                                {['Business', 'Individual'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setNewsletterType(type.toLowerCase())}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${newsletterType === type.toLowerCase()
                                            ? 'bg-cyan-900/50 text-cyan-400 shadow-lg'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                />
                                <button className="absolute right-2 top-2 p-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                        &copy; 2026 MusB Research. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
