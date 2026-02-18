"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, ShieldCheck, MapPin, Clock, Filter, X } from "lucide-react";
import { studies, filters } from "@/lib/data";

export default function StudiesDirectory() {
    const [activeFilters, setActiveFilters] = useState({
        condition: "",
        location: "",
        timeCommitment: "",
        age: ""
    });
    const [showFilters, setShowFilters] = useState(false);

    const filteredStudies = studies.filter(study => {
        if (activeFilters.condition && study.condition !== activeFilters.condition) return false;
        if (activeFilters.location && !study.location.includes(activeFilters.location)) return false;
        if (activeFilters.timeCommitment && study.timeCommitment !== activeFilters.timeCommitment) return false;
        if (activeFilters.age && study.age !== activeFilters.age) return false; // Simple exact match for now
        return true;
    });

    const clearFilters = () => setActiveFilters({ condition: "", location: "", timeCommitment: "", age: "" });

    return (
        <div className="min-h-screen bg-[#020617] pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <span className="px-4 py-2 bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest rounded-full mb-6 inline-block border border-cyan-500/20">
                        Active Research
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tight mb-6">
                        Ongoing Studies
                    </h1>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8">
                        Browse our directory of active clinical trials. Find a study that fits your lifestyle and health profile.
                    </p>

                    {/* Trust Blocks */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-white/5 pt-8">
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-white/5"><ShieldCheck size={14} className="text-emerald-400" /> HIPAA & GDPR Compliant</span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-white/5"><Globe size={14} className="text-cyan-400" /> IRB Approved</span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-white/5"><ShieldCheck size={14} className="text-purple-400" /> Secure Data</span>
                    </div>
                </div>

                {/* Filters & Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filter Sidebar */}
                    <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="glass p-6 rounded-2xl sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Filters</h3>
                                <button onClick={clearFilters} className="text-xs text-cyan-400 hover:text-white transition-colors">Reset</button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-slate-500 text-xs font-bold uppercase mb-3">Condition</h4>
                                    <div className="space-y-2">
                                        {filters.conditions.map(c => (
                                            <label key={c} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeFilters.condition === c ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700 group-hover:border-slate-500'}`}>
                                                    {activeFilters.condition === c && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={activeFilters.condition === c}
                                                    onChange={() => setActiveFilters(prev => ({ ...prev, condition: prev.condition === c ? "" : c }))}
                                                />
                                                <span className={`text-sm ${activeFilters.condition === c ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{c}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-slate-500 text-xs font-bold uppercase mb-3">Time Commitment</h4>
                                    <div className="space-y-2">
                                        {filters.timeCommitment.map(t => (
                                            <label key={t} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeFilters.timeCommitment === t ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700 group-hover:border-slate-500'}`}>
                                                    {activeFilters.timeCommitment === t && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={activeFilters.timeCommitment === t}
                                                    onChange={() => setActiveFilters(prev => ({ ...prev, timeCommitment: prev.timeCommitment === t ? "" : t }))}
                                                />
                                                <span className={`text-sm ${activeFilters.timeCommitment === t ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-slate-500 text-xs font-bold uppercase mb-3">Location</h4>
                                    <div className="space-y-2">
                                        {filters.locations.map(l => (
                                            <label key={l} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeFilters.location === l ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700 group-hover:border-slate-500'}`}>
                                                    {activeFilters.location === l && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={activeFilters.location === l}
                                                    onChange={() => setActiveFilters(prev => ({ ...prev, location: prev.location === l ? "" : l }))}
                                                />
                                                <span className={`text-sm ${activeFilters.location === l ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{l}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-slate-500 text-xs font-bold uppercase mb-3">Age Group</h4>
                                    <div className="space-y-2">
                                        {filters.ageRanges.map(a => (
                                            <label key={a} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeFilters.age === a ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700 group-hover:border-slate-500'}`}>
                                                    {activeFilters.age === a && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={activeFilters.age === a}
                                                    onChange={() => setActiveFilters(prev => ({ ...prev, age: prev.age === a ? "" : a }))}
                                                />
                                                <span className={`text-sm ${activeFilters.age === a ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{a}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full py-3 bg-slate-900 border border-white/10 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                        >
                            <Filter size={16} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {/* Cards Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredStudies.map((study) => (
                                <div key={study.id} className="glass rounded-3xl p-1 relative group overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all">
                                    <div className="bg-slate-950/50 rounded-[22px] p-7 h-full flex flex-col relative z-10 transition-colors group-hover:bg-slate-900/60">

                                        <div className="flex justify-between items-start mb-6">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                                                {study.status}
                                            </span>
                                            <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                                <Clock size={14} /> {study.duration}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors">
                                            {study.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="text-[10px] text-slate-500 font-bold px-2 py-1 bg-slate-900 rounded border border-white/5">{study.condition}</span>
                                            <span className="text-[10px] text-slate-500 font-bold px-2 py-1 bg-slate-900 rounded border border-white/5">{study.location}</span>
                                        </div>

                                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                                            {study.description}
                                        </p>

                                        <div className="border-t border-white/5 pt-5 mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Compensation</span>
                                                    <span className="text-white font-bold">{study.compensation}</span>
                                                </div>
                                            </div>

                                            <Link href={`/studies/${study.slug}`} className="w-full py-3 rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-widest text-xs hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-cyan-900/20">
                                                See if you qualify <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredStudies.length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                                <p className="text-lg">No studies found matching your criteria.</p>
                                <button onClick={clearFilters} className="text-cyan-400 font-bold mt-4 hover:underline">Clear all filters</button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
