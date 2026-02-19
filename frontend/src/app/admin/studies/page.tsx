"use client";

import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Settings2,
    BarChart3,
    FileEdit,
    Globe,
    Lock
} from "lucide-react";
import Link from "next/link";

const studies = [
    {
        id: "S001",
        name: "NAD+ Longevity & Vitality",
        status: "Live",
        type: "Parallel RCT",
        participants: "248 / 300",
        indication: "Aging",
        progress: 82,
        lastModified: "Today, 10:42 AM"
    },
    {
        id: "S002",
        name: "GI Microbiome Phase II",
        status: "Recruiting",
        type: "Crossover",
        participants: "42 / 100",
        indication: "Irritable Bowel",
        progress: 42,
        lastModified: "Yesterday"
    },
    {
        id: "S003",
        name: "Insomnia & Melatonin Tech",
        status: "Paused",
        type: "Open Label",
        participants: "120 / 120",
        indication: "Sleep Disorders",
        progress: 100,
        lastModified: "3 days ago"
    },
    {
        id: "S004",
        name: "Post-Workout Recovery Formula",
        status: "Draft",
        type: "Parallel RCT",
        participants: "0 / 150",
        indication: "Muscle Recovery",
        progress: 0,
        lastModified: "1 week ago"
    },
];

export default function AdminStudiesPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Clinical Studies</h1>
                    <p className="text-slate-500 mt-2 font-medium">Design, launch, and monitor your decentralized trials.</p>
                </div>
                <Link href="/admin/studies/new" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all flex items-center gap-2">
                    <Plus size={18} /> New Study
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {studies.map((study) => (
                    <div key={study.id} className="glass rounded-[2rem] border border-white/5 p-8 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-black px-2 py-1 rounded-lg border italic tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                {study.status}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors mb-2 italic tracking-tight">{study.name}</h3>
                        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden mt-6">
                            <div className="h-full bg-cyan-500" style={{ width: `${study.progress}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
