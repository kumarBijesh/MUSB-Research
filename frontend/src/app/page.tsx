"use client";

import { ArrowRight, Activity, ShieldCheck, Zap, Globe, Users } from "lucide-react";
import Link from "next/link";
import Container from "@/components/Container";

export default function Home() {
    return (
        <div className="relative isolate overflow-hidden">
            {/* Hero Section */}
            <section className="pt-32 pb-20 relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">

                {/* Lab background image with dark overlay – matching main MusB Research website */}
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        backgroundImage: "url('/hero-lab-bg.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />
                {/* Dark gradient overlay so text stays readable */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a1128]/80 via-[#0a1128]/70 to-[#0a1128]/95" />

                <Container className="text-center relative z-10 w-full">
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 md:mb-6 text-white animate-fade-in-up px-2 leading-[1.1] md:leading-none">
                        Accelerating <br className="hidden sm:block" /> Medical Discovery
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl text-slate-200 max-w-prose md:max-w-2xl mx-auto mb-8 md:mb-10 animate-fade-in-up stagger-3 px-6 sm:px-0 opacity-90">
                        MUSB Research connects patients, researchers, and biotech leaders in a unified virtual ecosystem.
                        Experience the future of decentralized clinical trials.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4 w-full px-4 sm:px-0">
                        <Link href="/studies" className="w-full sm:w-auto px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-black uppercase tracking-widest rounded-full transition-all hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/40 shadow-cyan-500/25 text-center justify-center flex items-center gap-2 group transform-gpu duration-300">
                            Find a Clinical Study
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/about" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 hover:border-white/60 text-white hover:text-white rounded-full font-semibold transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10 backdrop-blur-sm text-center justify-center flex items-center transform-gpu duration-300">
                            Explore Innovation
                        </Link>
                    </div>
                </Container>

                {/* Decorative glow orbs – match main website */}
                <div className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
                <div className="hidden md:block absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

                {/* SCROLL indicator – matching main MusB Research website */}
                <button
                    onClick={() => {
                        const features = document.getElementById('features');
                        features?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 select-none cursor-pointer group/scroll hover:opacity-100 transition-opacity opacity-80"
                >
                    {/* Pill indicator with sliding dot inside */}
                    <div className="flex items-center gap-2">
                        {/* Scroll pill / mouse shape */}
                        <div className="w-8 h-4.5 rounded-full border border-cyan-400/40 group-hover:border-cyan-400/80 flex items-center justify-start px-1.5 overflow-hidden transition-colors">
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-[scroll-dot_1.8s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                        </div>
                        {/* static dot */}
                        <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
                    </div>
                    {/* Spaced SCROLL text */}
                    <span className="text-[10px] font-black tracking-[0.5em] text-white/40 group-hover:text-white/70 uppercase transition-colors">Scroll</span>
                    {/* Animated vertical line */}
                    <div className="relative w-[1.5px] h-12 bg-white/5 overflow-hidden rounded-full">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-[scroll-line_2s_ease-in-out_infinite]" />
                    </div>
                </button>
            </section>


            {/* Feature Cards */}
            <section id="features" className="py-20 md:py-24 bg-slate-900/20">
                <Container className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {[
                        {
                            icon: Globe,
                            title: "Global Reach",
                            desc: "Remote-first trials that reach patients anywhere, regardless of geography."
                        },
                        {
                            icon: ShieldCheck,
                            title: "HIPAA Compliant",
                            desc: "Highest standards of data security and privacy for every participant."
                        },
                        {
                            icon: Zap,
                            title: "Rapid Insights",
                            desc: "Real-time data collection means faster results and accelerated breakthroughs."
                        }
                    ].map((item, i) => (
                        <div key={i} className="glass p-6 md:p-8 rounded-3xl hover:border-cyan-500/50 transition-all group overflow-hidden">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shrink-0">
                                <item.icon className="text-cyan-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 md:mb-4 pr-4">{item.title}</h3>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-prose">{item.desc}</p>
                        </div>
                    ))}
                </Container>
            </section>

            {/* Compliance Section */}
            <section className="py-20 md:py-24 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] md:w-full md:h-full bg-cyan-500/[0.02] blur-[120px] pointer-events-none" />
                <Container className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-xl text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4 sm:mb-6 uppercase">Trusted by Global Institutions</h2>
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-6 sm:mb-8 mx-auto lg:mx-0 max-w-prose">
                            Our platform is built on the pillars of data integrity and patient safety. We adhere to the world's most stringent regulatory standards to ensure clinical data is secure, anonymous, and actionable.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4">
                            {['HIPAA', 'GDPR', 'SOC2', '21 CFR Part 11'].map(tag => (
                                <span key={tag} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 border border-white/10 rounded-xl text-[11px] sm:text-[13px] font-black text-slate-300 uppercase tracking-widest leading-none shrink-0 truncate max-w-full">
                                    {tag} Compliant
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap lg:flex-nowrap justify-center gap-3 sm:gap-4 w-full lg:w-auto">
                        {[
                            { label: 'Patient Privacy', icon: ShieldCheck, color: 'text-emerald-400' },
                            { label: 'Encrypted Data', icon: Zap, color: 'text-cyan-400' },
                            { label: 'Audit Ready', icon: Activity, color: 'text-indigo-400' }
                        ].map((badge, i) => (
                            <div key={i} className="glass p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-2 md:gap-3 w-[140px] md:w-32 shrink-0">
                                <badge.icon className={badge.color} size={32} />
                                <span className="text-[11px] md:text-[13px] font-black text-slate-500 uppercase tracking-tighter text-center leading-tight">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>
        </div>
    );
}
