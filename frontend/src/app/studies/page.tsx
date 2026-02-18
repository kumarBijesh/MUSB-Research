"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, ShieldCheck, MapPin, Clock } from "lucide-react";

export default function StudiesDirectory() {
    const [studies, setStudies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/studies/');
                if (!response.ok) throw new Error('Failed to fetch studies');
                const data = await response.json();
                setStudies(data);
            } catch (err) {
                console.error(err);
                setError('Unable to load studies at this time.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudies();
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <span className="px-4 py-2 bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest rounded-full mb-6 inline-block border border-cyan-500/20">
                        Active Research
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                        Shape the Future of Medicine.
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10">
                        Clinical trials are research studies that test new medical approaches. By joining, you gain access to cutting-edge treatments and help advance science for everyone.
                    </p>
                    <div className="flex justify-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-8">
                        <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-400" /> Safe & Monitored</span>
                        <span className="flex items-center gap-2"><Globe size={18} className="text-cyan-400" /> 100% Remote</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-cyan-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 py-10 font-bold">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {studies.map((study) => (
                            <Link key={study.id} href={`/studies/${study.id}`} className="glass p-8 rounded-3xl group border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all shadow-2xl shadow-cyan-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-cyan-500/20">
                                        {study.status}
                                    </span>
                                    <div className="p-2 rounded-full bg-slate-800 text-slate-400 group-hover:text-white transition-colors">
                                        <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors relative z-10">{study.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 relative z-10">{study.description}</p>

                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 relative z-10">
                                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-400" /> {study.duration}</div>
                                    <div className="flex items-center gap-1.5"><MapPin size={14} className="text-purple-400" /> {study.location}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
