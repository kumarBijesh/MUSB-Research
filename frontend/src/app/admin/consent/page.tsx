"use client";

import { useState } from "react";
import {
    FileSignature,
    Plus,
    History,
    Eye,
    Edit3,
    MoreVertical,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    FileText,
    Globe
} from "lucide-react";

export default function AdminConsentManagementPage() {
    const [templates, setTemplates] = useState([
        { id: 'C-001', name: 'Master Informed Consent v2.4', study: 'HeartWatch 2026', version: '2.4', updated: '2 days ago', status: 'ACTIVE' },
        { id: 'C-002', name: 'GDPR Data Privacy Notice', study: 'Global Studies', version: '1.2', updated: '1 week ago', status: 'ACTIVE' },
        { id: 'C-003', name: 'Pediatric Assent Form', study: 'Microbiome-Kids', version: '0.9', updated: 'New', status: 'DRAFT' },
    ]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight flex items-center gap-3">
                        <FileSignature className="text-indigo-500" size={32} /> Consent Management
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Author and version control digital consent forms and privacy notices.</p>
                </div>
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[13px] rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
                    <Plus size={16} /> New Template
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6 rounded-[2rem] border border-white/5 bg-slate-900/40">
                        <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic mb-4">Registry Overview</div>
                        <div className="space-y-6 mt-4">
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-[13px] font-bold text-slate-400">Active Forms</span>
                                <span className="text-2xl font-black text-white italic">12</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-[13px] font-bold text-slate-400">Total Signatures</span>
                                <span className="text-2xl font-black text-indigo-400 italic">1,482</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[13px] font-bold text-slate-400">Awaiting Versioning</span>
                                <span className="text-2xl font-black text-slate-600 italic">03</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-[2rem] border border-white/5 bg-indigo-500/[0.03]">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-4 flex items-center gap-2">
                            <Globe size={14} className="text-indigo-400" /> Localization
                        </h3>
                        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">Managing 8 language variants for international trial sites.</p>
                        <div className="flex -space-x-1">
                            {['US', 'FR', 'DE', 'ES', 'JP'].map(flag => (
                                <div key={flag} className="w-8 h-6 bg-slate-800 border border-white/10 rounded overflow-hidden flex items-center justify-center text-[13px] font-black text-slate-500">
                                    {flag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Templates List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                        <div className="p-6 bg-slate-900/50 border-b border-white/5 flex justify-between items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                <input
                                    type="text"
                                    placeholder="Find templates..."
                                    className="bg-transparent border-none text-[13px] text-white placeholder:text-slate-600 focus:ring-0 w-64"
                                />
                            </div>
                            <button className="text-[13px] font-black text-slate-500 uppercase tracking-widest hover:text-white flex items-center gap-2">
                                <Filter size={12} /> Filter
                            </button>
                        </div>

                        <div className="divide-y divide-white/5">
                            {templates.map((template) => (
                                <div key={template.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.01] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-white font-bold">{template.name}</h4>
                                                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[13px] font-black text-slate-400 border border-white/5 uppercase italic">v{template.version}</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-[13px] text-slate-500 font-bold italic">
                                                    <Globe size={10} /> {template.study}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[13px] text-slate-600 font-bold italic">
                                                    <Clock size={10} /> Updated {template.updated}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 rounded-full text-[13px] font-black italic tracking-widest ${template.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-white/5'
                                            }`}>
                                            {template.status}
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="p-2 text-slate-600 hover:text-white transition-all"><Eye size={16} /></button>
                                            <button className="p-2 text-slate-600 hover:text-cyan-400 transition-all"><Edit3 size={16} /></button>
                                            <button className="p-2 text-slate-600 hover:text-white transition-all"><History size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
