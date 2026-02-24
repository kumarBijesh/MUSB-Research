"use client";

import { useState } from "react";
import {
    Database,
    Download,
    FileText,
    Table as TableIcon,
    Zap,
    ShieldCheck,
    Clock,
    Search,
    Filter,
    ArrowRight,
    Lock
} from "lucide-react";

export default function AdminDataExportPage() {
    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = (type: string) => {
        setExporting(type);
        setTimeout(() => setExporting(null), 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight flex items-center gap-3">
                        <Database className="text-cyan-500" size={32} /> Data & Exports
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Extract protocol data for analysis and sponsor reporting.</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="text-cyan-400" size={18} />
                    <span className="text-[13px] font-black text-cyan-400 uppercase tracking-widest italic leading-none">CDISC SDTM Compliant</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Export Options */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-[2rem] border border-white/5 bg-slate-900/40">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-8">Available Datasets</h3>

                        <div className="space-y-4">
                            {[
                                { id: 'demographics', title: 'Subject Demographics (DM)', desc: 'Age, gender, location, and enrollment markers.', icon: TableIcon },
                                { id: 'epro', title: 'ePRO / Assessment Data (QS)', desc: 'Participant-reported outcomes and questionnaire scores.', icon: FileText },
                                { id: 'safety', title: 'Adverse Events (AE)', desc: 'Complete safety log including severity and causality.', icon: Lock },
                                { id: 'vitals', title: 'Vital Signs & Device Data (VS)', desc: 'Logged biometrics and physical measurements.', icon: Zap },
                            ].map((dataset) => (
                                <div key={dataset.id} className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl group hover:border-cyan-500/30 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-slate-900 rounded-xl text-slate-500 group-hover:text-cyan-400 transition-colors">
                                            <dataset.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{dataset.title}</h4>
                                            <p className="text-[13px] text-slate-500">{dataset.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleExport(dataset.id)}
                                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-[13px] rounded-xl flex items-center gap-2 transition-all min-w-[120px] justify-center"
                                        >
                                            {exporting === dataset.id ? "Preparing..." : <><Download size={14} /> CSV</>}
                                        </button>
                                        <button className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-600 hover:text-white transition-all">
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-cyan-500/[0.05] to-blue-500/[0.05]">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-4">On-Demand Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Total Records</div>
                                <div className="text-2xl font-black text-white italic">142,891</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Data Completeness</div>
                                <div className="text-2xl font-black text-cyan-400 italic">96.4%</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Last Sync</div>
                                <div className="text-2xl font-black text-slate-300 italic">04m ago</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Log / History */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[2rem] border border-white/5 bg-slate-900/40">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-8 flex items-center gap-2">
                            <Lock className="text-amber-500" size={14} /> HIPAA Access Log
                        </h3>

                        <div className="space-y-6">
                            {[
                                { user: 'Admin User', action: 'Exported DM CSV', time: '10:42 AM' },
                                { user: 'Coordinator A', action: 'Accessed Patient PI', time: '09:15 AM' },
                                { user: 'System', action: 'BOD Database Backup', time: '04:00 AM' },
                                { user: 'Admin User', action: 'Exported QS CSV', time: 'Yesterday' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 items-start relative group">
                                    {i < 3 && <div className="absolute top-8 left-1.5 w-[1px] h-8 bg-slate-800" />}
                                    <div className="w-3 h-3 rounded-full bg-slate-700 mt-1 transition-colors group-hover:bg-cyan-500" />
                                    <div>
                                        <div className="text-[13px] font-black text-slate-500 uppercase tracking-tighter mb-1">{log.time}</div>
                                        <p className="text-[13px] text-white font-bold">{log.user}</p>
                                        <p className="text-[13px] text-slate-500 italic mt-0.5">{log.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-3 bg-slate-950 border border-white/5 rounded-xl text-[13px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">View Full Audit Trail</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
