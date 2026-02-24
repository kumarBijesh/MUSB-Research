"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft, Settings, Users, DollarSign, FlaskConical,
    Target, Calendar, Shield, Save, AlertTriangle,
    CheckCircle2, Loader2, BarChart3, Clock, ArrowLeft,
    ClipboardList, Edit3, Pause, Zap, Trash2, LayoutDashboard,
    Globe, TrendingUp, HeartPulse, ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function StudyManager() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;

    const [activeTab, setActiveTab] = useState<"dashboard" | "protocol" | "recruitment" | "finance" | "settings">("dashboard");
    const [study, setStudy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!slug) return;

        async function loadStudy() {
            try {
                const res = await fetch(`/api/proxy/sponsor/studies/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setStudy(data);
                } else {
                    console.error("Failed to load study");
                    router.push("/sponsor/dashboard");
                }
            } catch (err) {
                console.error("Connection error:", err);
            } finally {
                setLoading(false);
            }
        }

        loadStudy();
    }, [slug, router]);

    const handleSync = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/proxy/sponsor/studies/${slug}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(study)
            });

            if (res.ok) {
                const updated = await res.json();
                setStudy(updated);
                alert("Protocol synchronized with central database.");
            } else {
                const err = await res.json();
                alert(err.detail || "Failed to save changes.");
            }
        } catch (err) {
            alert("Database synchronization failed. Check connection.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
                <p className="text-[13px] font-black uppercase tracking-[0.3em] text-slate-500">Initializing Protocol Environment...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* ── Top Bar ── */}
            <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/sponsor/dashboard" className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-black italic uppercase tracking-tight">{study.title}</h1>
                                <span className="px-2 py-0.5 rounded text-[13px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {study.status}
                                </span>
                            </div>
                            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Sponsor Management Portal · Protocol ID: {study.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={`/studies/${study.slug || study.id}`} target="_blank" className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-indigo-400 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2">
                            <ExternalLink size={14} /> View Public Page
                        </Link>
                        <button className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-amber-500/30 text-slate-300 text-[13px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2">
                            <Pause size={14} /> Pause Protocol
                        </button>
                        <button
                            onClick={handleSync}
                            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-[13px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? "Syncing..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

                {/* ── Left Sidebar Nav ── */}
                <aside className="w-64 shrink-0 space-y-2">
                    {[
                        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
                        { id: "protocol", label: "Edit Protocol", icon: Edit3 },
                        { id: "recruitment", label: "Recruitment", icon: Target },
                        { id: "finance", label: "Compensation", icon: DollarSign },
                        { id: "settings", label: "Confidentiality", icon: Shield },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? "bg-amber-600/10 text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                                : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-white/5">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all">
                            <Trash2 size={16} /> Archive Study
                        </button>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* ── Dashboard Tab ── */}
                    {activeTab === "dashboard" && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: "Completion Rate", value: "91%", icon: BarChart3, color: "text-emerald-400" },
                                    { label: "Active Sites", value: "3 Global", icon: Globe, color: "text-cyan-400" },
                                    { label: "Pending IRB", value: "0 Tasks", icon: Shield, color: "text-amber-400" },
                                ].map((stat, i) => (
                                    <div key={i} className="glass p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-2 rounded-xl bg-slate-950 ${stat.color}`}>
                                                <stat.icon size={18} />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</h3>
                                        <p className="text-[13px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="glass border border-white/5 rounded-3xl p-8 bg-slate-900/40">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic mb-6">Study Pulse</h3>
                                <div className="space-y-6">
                                    {[
                                        { time: "Today, 09:42", msg: "Recruitment target adjusted by Clinical Team", icon: Zap, color: "text-amber-400" },
                                        { time: "Yesterday, 15:10", msg: "Safety report v1.2 signed-off by PI", icon: CheckCircle2, color: "text-emerald-400" },
                                        { time: "Feb 20, 2025", msg: "Protocol amendment approved by central IRB", icon: Shield, color: "text-indigo-400" },
                                    ].map((pulse, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center ${pulse.color}`}>
                                                    <pulse.icon size={14} />
                                                </div>
                                                <div className="w-px flex-1 bg-white/5 my-1" />
                                            </div>
                                            <div className="pb-6">
                                                <p className="text-[14px] font-bold text-slate-300">{pulse.msg}</p>
                                                <p className="text-[13px] font-bold text-slate-600 uppercase tracking-widest mt-1">{pulse.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Protocol Tab (Editable) ── */}
                    {activeTab === "protocol" && (
                        <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic mb-6">Modify Protocol Metadata</h3>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Study Title</label>
                                        <input
                                            type="text"
                                            value={study.title || ""}
                                            onChange={(e) => setStudy({ ...study, title: e.target.value })}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors text-lg font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Current Condition</label>
                                        <select
                                            value={study.condition || ""}
                                            onChange={(e) => setStudy({ ...study, condition: e.target.value })}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white select-none appearance-none"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Oncology">Oncology</option>
                                            <option value="Sleep Medicine">Sleep Medicine</option>
                                            <option value="Metabolic Health">Metabolic Health</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Synopsis / Executive Summary</label>
                                    <textarea
                                        value={study.description || ""}
                                        onChange={(e) => setStudy({ ...study, description: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[160px] text-sm leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Therapeutic Focus Areas</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Oncology", "Early Detection", "Biomarkers", "Nonsquamous"].map(tag => (
                                        <div key={tag} className="px-4 py-2 bg-white/5 rounded-xl text-[13px] font-bold text-slate-400 border border-white/5">
                                            {tag}
                                        </div>
                                    ))}
                                    <button className="px-4 py-2 border border-dashed border-white/10 rounded-xl text-[13px] font-bold text-amber-500">+ Add Tag</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Recruitment Tab ── */}
                    {activeTab === "recruitment" && (
                        <div className="space-y-8">
                            <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic mb-8">Enrollment Velocity</h3>
                                <div className="flex items-end gap-2 h-48 mb-8 px-4">
                                    {[35, 65, 45, 85, 55, 95, 75, 80, 40].map((h, i) => (
                                        <div key={i} className="flex-1 space-y-2 group">
                                            <div className="h-full w-full bg-slate-900 rounded-lg relative overflow-hidden">
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-1000 group-hover:from-amber-500"
                                                    style={{ height: `${h}%` }}
                                                />
                                            </div>
                                            <p className="text-[13px] font-black text-slate-600 text-center">W-0{i + 1}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</p>
                                        <p className="text-xl font-black text-white italic">{study.target}</p>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-1">Enrolled</p>
                                        <p className="text-xl font-black text-emerald-400 italic">{study.enrolled}</p>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-1">Remaining</p>
                                        <p className="text-xl font-black text-amber-400 italic">{study.target - study.enrolled}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Country Distribution</h3>
                                    <button className="text-[13px] font-black uppercase text-amber-500">Edit Regions</button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { name: "United Kingdom", count: 42, color: "bg-indigo-500" },
                                        { name: "United States", count: 31, color: "bg-cyan-500" },
                                        { name: "Germany", count: 14, color: "bg-amber-500" },
                                    ].map(region => (
                                        <div key={region.name} className="flex items-center gap-4">
                                            <p className="text-[13px] font-bold text-slate-400 w-32 shrink-0">{region.name}</p>
                                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${region.color} rounded-full`} style={{ width: `${(region.count / 87) * 100}%` }} />
                                            </div>
                                            <p className="text-[13px] font-bold text-white w-8 text-right">{region.count}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Finance Tab ── */}
                    {activeTab === "finance" && (
                        <div className="glass p-12 rounded-3xl border border-white/5 bg-slate-900/40 text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                                <DollarSign size={32} className="text-amber-500" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase italic">Financial Management</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                                Review distribution logs, modify participant reimbursement rates, and adjust protocol budget allocations in real-time.
                            </p>
                            <div className="flex justify-center gap-4 pt-6">
                                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-300">View Invoices</button>
                                <button className="px-6 py-3 bg-amber-600 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white">Adjust Compensation</button>
                            </div>
                        </div>
                    )}

                    {/* ── Settings Tab ── */}
                    {activeTab === "settings" && (
                        <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic mb-6">Confidentiality & Access Control</h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">Advanced Encryption Standards</p>
                                            <p className="text-[13px] text-slate-500 mt-1">AES-256 state-level encryption for all participant records.</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[13px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Active</span>
                                </div>

                                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">Coordination Access</p>
                                            <p className="text-[13px] text-slate-500 mt-1">Allow MusB Certified Coordinators to manage site screening.</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}

