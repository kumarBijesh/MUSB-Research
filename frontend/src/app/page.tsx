"use client";

import { ArrowRight, Activity, ShieldCheck, Zap, Globe, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="relative isolate">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400 animate-fade-in-up">
                        Accelerating <br /> Medical Discovery
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-3">
                        MUSB Research connects patients, researchers, and biotech leaders in a unified virtual ecosystem.
                        Experience the future of decentralized clinical trials.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4">
                        <Link href="/studies" className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-1">
                            Start Your Journey
                        </Link>
                        <Link href="/about" className="px-8 py-4 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-full font-semibold transition-all backdrop-blur-sm">
                            Explore Innovation
                        </Link>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10" />
            </section>

            {/* Feature Cards */}
            <section className="py-24 px-6 bg-slate-900/20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        <div key={i} className="glass p-8 rounded-3xl hover:border-cyan-500/50 transition-all group">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <item.icon className="text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
