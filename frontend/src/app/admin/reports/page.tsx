"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    BarChart3,
    TrendingUp,
    PieChart,
    Download,
    FileText,
    Users,
    Activity,
    Calendar,
    Loader2,
    Target,
    ClipboardCheck
} from "lucide-react";

export default function ReportsPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetch("/api/proxy/sponsor/stats")
                .then(res => res.json())
                .then(data => {
                    setStats(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Reports fetch error", err);
                    setLoading(false);
                });
        }
    }, [session]);

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
                    <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[13px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center gap-2">
                        <Calendar size={18} /> FY2026 Q1
                    </button>
                    <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 transition-all flex items-center gap-2">
                        <Download size={18} /> Generate PDF Report
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-purple-500" size={40} />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Total Studies", value: stats.totalStudies, icon: FileText, color: "text-purple-400" },
                            { label: "Active Participants", value: stats.totalParticipants, icon: Users, color: "text-cyan-400" },
                            { label: "Enrollment Target", value: `${Math.round((stats.enrolledParticipants / (stats.totalParticipants || 1)) * 100)}%`, icon: Target, color: "text-emerald-400" },
                            { label: "Retention Rate", value: `${stats.completionRate}%`, icon: TrendingUp, color: "text-orange-400" },
                        ].map((stat, i) => (
                            <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex items-center gap-4">
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Enrollment Velocity */}
                        <div className="lg:col-span-2 glass rounded-[2rem] border border-white/5 p-8 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Enrollment Velocity</h3>
                                    <p className="text-[13px] text-slate-500 font-medium">Monthly subject onboarding across all sites.</p>
                                </div>
                                <Activity className="text-purple-500" size={24} />
                            </div>

                            <div className="h-64 flex items-end gap-2 px-4 mb-4">
                                {[65, 45, 78, 92, 55, 61, 85, 42, 70, 88].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-cyan-400 rounded-t-lg transition-all hover:brightness-125 cursor-pointer relative group" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-[13px] font-black text-white px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h * 2}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between px-4 text-[13px] font-black text-slate-600 uppercase tracking-widest">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        <div className="glass rounded-[2rem] border border-white/5 p-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                <ClipboardCheck size={18} className="text-emerald-500" /> Compliance Status
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { label: "Data Quality Check", status: "PASSED", score: 99.8 },
                                    { label: "Electronic Signature Audit", status: "PASSED", score: 100 },
                                    { label: "Adverse Event Reporting", status: "ON-TRACK", score: 94.2 },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                                            <p className="text-[13px] font-black text-white italic">{item.score}%</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-emerald-500" style={{ width: `${item.score}%` }} />
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
