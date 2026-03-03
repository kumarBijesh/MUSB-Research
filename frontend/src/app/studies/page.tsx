"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, ShieldCheck, Clock, Star, Quote, Loader2, CheckCircle2 } from "lucide-react";

const testimonials = [
    {
        name: "Sarah M.",
        study: "Migraine Relief Wearable",
        text: "This study completely changed how I manage my migraines. The team was incredibly supportive, and the remote setup was effortless.",
        rating: 5
    },
    {
        name: "David L.",
        study: "Type 2 Diabetes Intervention",
        text: "I was hesitant at first, but the coaching app made it so easy. I feel healthier and more informed about my condition.",
        rating: 5
    },
    {
        name: "Elena G.",
        study: "VR Anxiety Therapy",
        text: "An amazing experience. Being able to practice social situations in VR from my own home gave me so much confidence.",
        rating: 5
    }
];

export default function StudiesDirectory() {
    const [studies, setStudies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [perfMode, setPerfMode] = useState("high");

    useEffect(() => {
        const mode = document.cookie.split('; ').find(row => row.startsWith('perf-mode='))?.split('=')[1];
        if (mode) setPerfMode(mode);
    }, []);

    useEffect(() => {
        fetch("/api/proxy/studies")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch studies");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setStudies(data);
                } else {
                    console.error("Expected array of studies, got:", data);
                    setStudies([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error", err);
                setLoading(false);
            });
    }, []);


    // without filters we just show whatever studies were fetched
    const filteredStudies = Array.isArray(studies) ? studies : []; // alias for clarity

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <span className="px-4 py-2 bg-cyan-500/10 text-cyan-400 text-[13px] font-black uppercase tracking-widest rounded-full mb-6 inline-block border border-cyan-500/20">
                        Active Research
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tight mb-6">
                        Ongoing Studies
                    </h1>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
                        Browse our directory of active clinical trials. Find a study that fits your lifestyle and health profile.
                    </p>

                    {/* Trust Blocks */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[13px] md:text-[13px] font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-8">
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-white/5"><ShieldCheck size={14} className="text-emerald-400" /> HIPAA & GDPR Compliant</span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-white/5"><Globe size={14} className="text-cyan-400" /> IRB Approved</span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-white/5"><ShieldCheck size={14} className="text-purple-400" /> Secure Data</span>
                    </div>
                </div>

                {/* Content Layout */}
                <div>
                    {/* Cards Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredStudies.map((study) => (
                                <div key={study.id} className="glass rounded-3xl p-1 relative group overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all">
                                    <div className="bg-slate-950/50 rounded-[22px] p-7 h-full flex flex-col relative z-10 transition-colors group-hover:bg-slate-900/60">

                                        <div className="flex justify-between items-start mb-6">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[13px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                                                {study.status}
                                            </span>
                                            <span className="text-slate-400 text-[13px] font-bold flex items-center gap-1">
                                                <Clock size={14} /> {study.duration}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors">
                                            {study.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="text-[13px] text-slate-500 font-bold px-2 py-1 bg-slate-900 rounded border border-white/5">{study.condition}</span>
                                            <span className="text-[13px] text-slate-500 font-bold px-2 py-1 bg-slate-900 rounded border border-white/5">{study.country}</span>
                                            <span className="text-[13px] text-slate-500 font-bold px-2 py-1 bg-slate-900 rounded border border-white/5">{study.location}</span>
                                        </div>

                                        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                            {study.description}
                                        </p>

                                        {study.eligibilityRules && study.eligibilityRules.length > 0 && (
                                            <div className="mb-6">
                                                <p className="text-[13px] text-slate-500 uppercase tracking-widest font-bold mb-2">Key Criteria</p>
                                                <ul className="space-y-1">
                                                    {study.eligibilityRules.slice(0, 2).map((rule: any, i: number) => (
                                                        <li key={i} className="text-[13px] text-slate-300 flex items-start gap-2">
                                                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                                                            <span className="line-clamp-1">{rule.question}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="border-t border-white/5 pt-5 mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] text-slate-500 uppercase tracking-widest font-bold">Compensation</span>
                                                    <span className="text-white font-bold">{study.compensation}</span>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/studies/${study.slug}/screener?study=${study.id}&name=${encodeURIComponent(study.title)}&duration=${encodeURIComponent(study.duration)}&compensation=${encodeURIComponent(study.compensation)}&location=${encodeURIComponent(study.location)}&commitment=${encodeURIComponent(study.timeCommitment)}&category=${encodeURIComponent(study.condition)}`}
                                                className="w-full py-3 rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-widest text-[13px] hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-cyan-900/20"
                                            >
                                                See if you qualify <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>

                {/* Testimonials Section - Hidden in Fast Loading Mode */}
                {perfMode === "high" && (
                    <div className="mt-32 pt-16 border-t border-white/5">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <span className="px-4 py-2 bg-purple-500/10 text-purple-400 text-[13px] font-black uppercase tracking-widest rounded-full mb-6 inline-block border border-purple-500/20">
                                Participant Experiences
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-white italic mb-4">Real Stories, Real Impact</h2>
                            <p className="text-slate-400 font-medium">Discover what it's like to be part of our clinical trials from those who have walked the path.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.map((t, idx) => (
                                <div key={idx} className="glass p-8 rounded-3xl border border-white/5 relative group hover:border-purple-500/30 transition-all">
                                    <Quote className="absolute top-6 right-6 text-white/5 w-16 h-16 rotate-180 group-hover:text-purple-500/10 transition-colors" />
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-300 leading-relaxed mb-8 italic relative z-10">"{t.text}"</p>
                                    <div className="flex flex-col pt-6 border-t border-white/5">
                                        <span className="text-white font-bold">{t.name}</span>
                                        <span className="text-cyan-400 text-[13px] font-black uppercase tracking-widest mt-1">{t.study}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
