"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Calendar,
    MapPin,
    Clock,
    DollarSign,
    ShieldCheck,
    Activity,
    CheckCircle2,
    XCircle,
    Package,
    AlertCircle
} from "lucide-react";
import { studies } from "@/lib/data";
import { notFound } from "next/navigation";

export default function StudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [study, setStudy] = useState<any | null>(null);

    useEffect(() => {
        const foundStudy = studies.find(s => s.slug === slug);
        if (foundStudy) {
            setStudy(foundStudy);
        }
    }, [slug]);

    if (!study) {
        // In a real app we might want to show a loading state or redirect to 404
        // For now, if we can't find it in the client-side list immediately, return null (or loading)
        // If we are sure it doesn't exist, we can triggering notFound() but that's server side usually.
        // Let's just show a loading or not found message.
        return <div className="min-h-screen bg-[#020617] pt-32 text-center text-white">Loading or Study Not Found...</div>;
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/studies" className="text-slate-500 hover:text-white mb-8 inline-flex items-center gap-2 transition-colors">
                    <ArrowRight className="rotate-180" size={16} /> Back to Studies
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Header */}
                        <div>
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-cyan-500/20">
                                    {study.status}
                                </span>
                                <span className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                                    {study.condition}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight mb-6 leading-tight">
                                {study.title}
                            </h1>
                            <p className="text-xl text-slate-400 leading-relaxed font-medium">
                                {study.description}
                            </p>
                        </div>

                        {/* Overview */}
                        <div className="glass p-8 rounded-3xl border border-white/5">
                            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                <Activity className="text-cyan-400" /> Overview
                            </h3>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                {study.overview}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                                    <p className="text-white font-bold">{study.duration}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Commitment</p>
                                    <p className="text-white font-bold">{study.timeCommitment}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Location</p>
                                    <p className="text-white font-bold">{study.location}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Age</p>
                                    <p className="text-white font-bold">{study.age}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <Calendar className="text-purple-400" /> What to Expect
                            </h3>
                            <div className="space-y-6">
                                {study.timeline.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-6 relative group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:border-cyan-500 group-hover:text-cyan-400 transition-colors z-10">
                                                {index + 1}
                                            </div>
                                            {index !== study.timeline.length - 1 && (
                                                <div className="w-0.5 h-full bg-slate-800 -my-2" />
                                            )}
                                        </div>
                                        <div className="pb-8">
                                            <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-1 block">{item.week}</span>
                                            <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Kits & Safety Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass p-8 rounded-3xl border border-white/5">
                                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                    <Package className="text-emerald-400" size={20} /> Equipment & Kits
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {study.kits || "No special equipment required for this study."}
                                </p>
                            </div>
                            <div className="glass p-8 rounded-3xl border border-white/5">
                                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                    <ShieldCheck className="text-blue-400" size={20} /> Safety & Privacy
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {study.safety}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar / CTA */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">

                            {/* CTA Card */}
                            <div className="glass p-8 rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/5 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

                                <h3 className="text-2xl font-black text-white italic mb-2 relative z-10">Interested?</h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
                                    See if you qualify for this study. It only takes a few minutes.
                                </p>

                                <div className="mb-8 relative z-10">
                                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Compensation</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white">{study.compensation}</span>
                                        <span className="text-slate-500 text-xs font-bold uppercase">Total</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/studies/${study.slug}/screener`}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 group-hover:gap-4 relative z-10"
                                >
                                    Start Eligibility Check <ArrowRight size={18} />
                                </Link>

                                <p className="text-center text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest relative z-10">
                                    No commitment required
                                </p>
                            </div>

                            {/* Eligibility List Summary */}
                            <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/30">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} className="text-slate-400" /> Key Requirements
                                </h4>
                                <ul className="space-y-3">
                                    {study.eligibility.includes.slice(0, 3).map((req: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-xs text-slate-400">
                                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
