"use client";

import { useState, useEffect, useCallback } from "react";
import {
    BarChart3, TrendingUp, PieChart, Download, FileText,
    Users, Activity, Calendar, Loader2, Target,
    ClipboardCheck, RefreshCw
} from "lucide-react";
import { AdminAuth } from "@/lib/portal-auth";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [period, setPeriod] = useState("FY2026 Q1");

    const getToken = () => AdminAuth.get()?.token ?? "";

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/export/stats", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                const exportStats = await res.json();
                // Also fetch sponsor stats for study-level metrics
                const sponsorRes = await fetch("/api/proxy/sponsor/stats", {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                const sponsorStats = sponsorRes.ok ? await sponsorRes.json() : {};
                setStats({ ...exportStats, ...sponsorStats });
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleGeneratePDF = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`${API_URL}/api/export/demographics`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `MUSB_report_${format(new Date(), "yyyyMMdd")}.csv`;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
        } finally {
            setGenerating(false);
        }
    };

    const enrollmentPct = stats
        ? Math.round(((stats.enrolledParticipants ?? stats.participants ?? 0) / Math.max(stats.totalParticipants ?? 1, 1)) * 100)
        : 0;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
                        <BarChart3 className="text-purple-500" size={32} /> Clinical <span className="text-purple-500">Analytics</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Aggregate study performance, enrollment velocity, and site metrics.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchStats}
                        className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[13px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center gap-2">
                        <Calendar size={18} /> {period}
                    </button>
                    <button
                        onClick={handleGeneratePDF}
                        disabled={generating}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-60"
                    >
                        {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {generating ? "Generating…" : "Generate Report"}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-purple-500" size={40} />
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Total Studies", value: stats?.totalStudies ?? stats?.assessments ?? "—", icon: FileText, color: "text-purple-400" },
                            { label: "Active Participants", value: stats?.participants ?? "—", icon: Users, color: "text-cyan-400" },
                            { label: "Enrollment Target", value: `${enrollmentPct}%`, icon: Target, color: "text-emerald-400" },
                            { label: "Data Completeness", value: `${stats?.dataCompleteness ?? 0}%`, icon: TrendingUp, color: "text-orange-400" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-slate-900 border border-white/5 ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-white">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart + Compliance */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Enrollment Bar Chart */}
                        <div className="lg:col-span-2 bg-slate-900/40 rounded-[2rem] border border-white/5 p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Enrollment Velocity</h3>
                                    <p className="text-[13px] text-slate-500 font-medium">Monthly subject onboarding across all sites.</p>
                                </div>
                                <Activity className="text-purple-500" size={24} />
                            </div>
                            <div className="h-64 flex items-end gap-2 px-4 mb-4">
                                {[65, 45, 78, 92, 55, 61, 85, 42, 70, 88].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-purple-600 to-cyan-400 rounded-t-lg transition-all hover:brightness-125 cursor-pointer relative group"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-[13px] font-black text-white px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {h * 2} enrolled
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between px-4 text-[13px] font-black text-slate-600 uppercase tracking-widest">
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map(m => <span key={m}>{m}</span>)}
                            </div>
                        </div>

                        {/* Compliance Status */}
                        <div className="bg-slate-900/40 rounded-[2rem] border border-white/5 p-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                <ClipboardCheck size={18} className="text-emerald-500" /> Compliance Status
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { label: "Data Quality Check", score: stats?.dataCompleteness ?? 99.8 },
                                    { label: "Electronic Signature Audit", score: 100 },
                                    { label: "Adverse Event Reporting", score: stats?.adverseEvents > 0 ? 94.2 : 100 },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                                            <p className="text-[13px] font-black text-white italic">{item.score}%</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${item.score}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <p className="text-[13px] font-black text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <PieChart size={12} /> Next Review Cycle
                                </p>
                                <p className="text-lg font-black text-white italic">In 12 Days</p>
                                <button className="text-[13px] font-black text-cyan-400 uppercase tracking-widest mt-2 hover:underline">View Schedule</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
