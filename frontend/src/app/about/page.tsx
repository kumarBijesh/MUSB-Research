"use client";

import { ShieldCheck, Users, Zap, Award, Globe, Heart } from "lucide-react";
import Link from "next/link";

export default function About() {
    return (
        <div className="min-h-screen bg-[#020617] relative isolate overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay pointer-events-none" />
            <div className="absolute left-0 bottom-0 top-0 w-[500px] bg-indigo-900/10 blur-[150px] rounded-full -z-10 animate-float" />

            <div className="max-w-7xl mx-auto pt-40 pb-20 px-6">

                {/* Hero */}
                <div className="flex flex-col md:flex-row gap-20 mb-32 items-center">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-950/30 border border-cyan-500/20 rounded-full">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Our Mission</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tight leading-[1] max-w-2xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            Democratizing Access to <br /> Health Research.
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                            Traditional clinical trials exclude 90% of the population due to geography and logistics. MUSB Research bridges that gap with technology and empathy.
                        </p>
                    </div>
                    <div className="flex-1 w-full relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 -z-10" />
                        <div className="glass aspect-[4/3] rounded-[3rem] border border-white/5 overflow-hidden flex items-center justify-center bg-slate-900/50">
                            {/* Placeholder for About Image - could be a generated team image or abstract tech */}
                            <Users size={120} className="text-white/5" />
                            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl glass border border-white/10 backdrop-blur-xl">
                                <p className="text-white font-bold italic mb-1">Our Vision</p>
                                <p className="text-slate-400 text-sm">A world where every patient, everywhere, can access potentially life-saving treatments.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <div className="glass p-8 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                        <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={28} className="text-cyan-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 italic">Patient-First Privacy</h3>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            Your data is yours. We use advanced encryption and strictly adhere to HIPAA and GDPR standards.
                        </p>
                    </div>
                    <div className="glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap size={28} className="text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 italic">Rapid Innovation</h3>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            By streamlining enrollment and data collection, we help bring treatments to market faster.
                        </p>
                    </div>
                    <div className="glass p-8 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Heart size={28} className="text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 italic">Empathy Driven</h3>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            We design every interaction to be respectful, clear, and supportive of your journey.
                        </p>
                    </div>
                </div>

                {/* Team / Stats */}
                <div className="glass rounded-[3rem] border border-white/5 p-12 md:p-20 relative overflow-hidden text-center bg-slate-900/50">
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black text-white italic mb-12">Who We Are</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                            <div>
                                <p className="text-4xl md:text-6xl font-black text-white mb-2">12+</p>
                                <p className="text-slate-500 uppercase font-black tracking-widest text-xs">PhDs on Staff</p>
                            </div>
                            <div>
                                <p className="text-4xl md:text-6xl font-black text-cyan-400 mb-2">50+</p>
                                <p className="text-slate-500 uppercase font-black tracking-widest text-xs">Trials Completed</p>
                            </div>
                            <div>
                                <p className="text-4xl md:text-6xl font-black text-purple-400 mb-2">25k</p>
                                <p className="text-slate-500 uppercase font-black tracking-widest text-xs">Participants</p>
                            </div>
                            <div>
                                <p className="text-4xl md:text-6xl font-black text-white mb-2">4</p>
                                <p className="text-slate-500 uppercase font-black tracking-widest text-xs">Continents</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
