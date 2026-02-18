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
    XCircle
} from "lucide-react";

interface Study {
    id: number;
    slug: string;
    title: string;
    summary: string;
    description: string;
    status: string;
    type: string;
    region: string;
    age: string;
    location: string;
    duration: string;
    compensation: string;
    tags: string[];
    timeline: Array<{ week: string; title: string; desc: string }>;
    eligibility: {
        includes: string[];
        excludes: string[];
    };
}

export default function StudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [study, setStudy] = useState<Study | null>(null);

    useEffect(() => {
        // Mock data for individual study if API fails
        const mockStudy: Study = {
            id: 1,
            slug: "nad-longevity",
            title: "NAD+ Longevity & Metabolic Vitality",
            summary: "Investigating the impact of NAD+ precursors on cellular energy and mitochondrial function.",
            description: "Join our landmark study on metabolic aging. This trial evaluates how specific oral supplements affect cellular NAD+ levels and overall energy markers in healthy adults over 45.",
            status: "Recruiting",
            type: "Parallel RCT",
            region: "Global",
            age: "45-75",
            location: "Remote / Virtual",
            duration: "90 Days",
            compensation: "$450",
            tags: ["Aging", "Metabolism", "Supplement"],
            timeline: [
                { week: "Week 0", title: "Baseline Screening", desc: "Initial virtual visit and blood spot collection." },
                { week: "Week 1-12", title: "Daily Supplementation", desc: "Log your daily intake and weekly symptoms." },
                { week: "Week 13", title: "Final Assessment", desc: "Closing virtual visit and exit survey." }
            ],
            eligibility: {
                includes: ["Over 45 years old", "Non-smoker", "Access to smartphone"],
                excludes: ["Pregnant or nursing", "Chronic kidney disease", "Current use of NAD+ supplements"]
            }
        };
        setStudy(mockStudy);
    }, [slug]);

    if (!study) return null;

    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <Link href="/studies" className="text-slate-500 hover:text-white mb-8 inline-block">← Back to Studies</Link>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight mb-6">{study.title}</h1>
                        <p className="text-lg text-slate-400 leading-relaxed mb-8">{study.description}</p>

                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="glass p-6 rounded-2xl">
                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Compensation</p>
                                <p className="text-xl font-bold text-white">{study.compensation}</p>
                            </div>
                            <div className="glass p-6 rounded-2xl">
                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Duration</p>
                                <p className="text-xl font-bold text-white">{study.duration}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Eligibility</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-4 uppercase tracking-widest"><CheckCircle2 size={16} /> Inclusion</h4>
                                    <ul className="space-y-2 text-sm text-slate-400">
                                        {study.eligibility.includes.map(i => <li key={i}>• {i}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 text-red-400 text-sm font-bold mb-4 uppercase tracking-widest"><XCircle size={16} /> Exclusion</h4>
                                    <ul className="space-y-2 text-sm text-slate-400">
                                        {study.eligibility.excludes.map(i => <li key={i}>• {i}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-32 h-fit">
                        <div className="glass p-8 rounded-3xl border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
                            <h3 className="text-2xl font-black text-white italic mb-4">Start Screening</h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Check your basic eligibility in under 3 minutes. No commitment required.</p>
                            <Link href={`/studies/${study.slug}/screener`} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 group">
                                Begin Screener <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
