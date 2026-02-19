"use client";

import {
    Users,
    ArrowUpRight,
    TrendingUp,
    AlertCircle,
    Package,
    Clock,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import Link from "next/link";

const stats = [
    { label: "Total Leads", value: "1,284", change: "+12%", icon: Users, color: "text-cyan-400" },
    { label: "Screened", value: "856", change: "+8%", icon: TrendingUp, color: "text-purple-400" },
    { label: "Active Participants", value: "312", change: "+5%", icon: ArrowUpRight, color: "text-emerald-400" },
    { label: "Open AEs", value: "4", change: "", icon: AlertCircle, color: "text-red-400" },
];

const pendingTasks = [
    { id: "T1", title: "Eligibility Review: John D.", category: "Intake", priority: "High", time: "2h ago" },
    { id: "T2", title: "Missing AE Follow-up: Sarah M.", category: "Safety", priority: "Urgent", time: "5h ago" },
    { id: "T3", title: "Kit Reshipment: Mike R.", category: "Logistics", priority: "Medium", time: "1d ago" },
];

const studies = [
    { name: "NAD+ Longevity Trial", status: "Live", enrollment: "85%", primaryIndication: "Aging" },
    { name: "GI Microbiome Phase II", status: "Recruiting", enrollment: "42%", primaryIndication: "Gut Health" },
    { name: "Sleep Quality Supplement", status: "Live", enrollment: "92%", primaryIndication: "Insomnia" },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Coordinator Console</h1>
                    <p className="text-slate-500 mt-2 font-medium">Welcome back, Alex. Monitoring recruitment, retention, and site operations.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/studies/new" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                        <Package size={14} /> New Protocol
                    </Link>
                    <Link href="/admin/participants/new" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-600/20">
                        <Users size={14} /> Register Participant
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/5 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -rotate-45 translate-x-8 -translate-y-8 rounded-2xl" />
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-slate-900/50 border border-white/5 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            {stat.change && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <div className="text-2xl font-black text-white">{stat.value}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recruitment Funnel */}
                <div className="lg:col-span-8 glass rounded-2xl border border-white/5 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider italic">Recruitment Funnel</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter:</span>
                            <select className="bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-bold py-1 px-3 text-slate-400 focus:outline-none focus:border-cyan-500/50">
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                                <option>Year to Date</option>
                            </select>
                        </div>
                    </div>
                    {/* Mock Funnel Chart */}
                    <div className="space-y-6">
                        {[
                            { label: "Website Visits", value: 1284, color: "bg-cyan-500", width: "100%" },
                            { label: "Screener Starts", value: 856, color: "bg-cyan-600", width: "66%" },
                            { label: "Pre-Eligible", value: 432, color: "bg-cyan-700", width: "33%" },
                            { label: "Consented", value: 312, color: "bg-cyan-800", width: "24%" },
                            { label: "Enrolled", value: 248, color: "bg-emerald-500", width: "19%" },
                        ].map((step, i) => (
                            <div key={i} className="space-y-2 group">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400 group-hover:text-white transition-colors">{step.label}</span>
                                    <span className="text-white">{step.value}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${step.color} transition-all duration-1000 group-hover:brightness-110`}
                                        style={{ width: step.width }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Critical Tasks */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass rounded-2xl border border-white/5 p-6 h-full flex flex-col">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Clock size={16} className="text-cyan-400" /> Critical Tasks
                        </h2>
                        <div className="space-y-4 flex-1">
                            {pendingTasks.map((task) => (
                                <div key={task.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-800/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${task.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/10' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold">{task.time}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{task.title}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{task.category}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700/50 flex items-center justify-center gap-2 group">
                            View All Tasks <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Participant Overview Section - Added as requested */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/30">
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Recent Participant Activity</h2>
                        <p className="text-xs text-slate-500 mt-1">Live feed of enrollment and adherence data.</p>
                    </div>
                    <Link href="/admin/participants" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                        View All <ArrowUpRight size={12} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                                <th className="py-4 px-6 font-bold">Participant ID</th>
                                <th className="py-4 px-6 font-bold">Protocol</th>
                                <th className="py-4 px-6 font-bold">Status</th>
                                <th className="py-4 px-6 font-bold">Enrollment Date</th>
                                <th className="py-4 px-6 font-bold">Adherence</th>
                                <th className="py-4 px-6 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                            {[
                                { id: "P-1024", protocol: "Lung Cancer Screening", status: "Active", date: "Feb 18, 2025", adherence: 96 },
                                { id: "P-1023", protocol: "Migraine Wearable", status: "Screening", date: "Feb 18, 2025", adherence: 0 },
                                { id: "P-1022", protocol: "T2D Dietary", status: "Consented", date: "Feb 17, 2025", adherence: 0 },
                                { id: "P-1021", protocol: "Lung Cancer Screening", status: "Active", date: "Feb 15, 2025", adherence: 88 },
                                { id: "P-1020", protocol: "Anxiety VR", status: "Withdrawn", date: "Feb 10, 2025", adherence: 45 },
                            ].map((p, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/30 transition-colors group cursor-pointer">
                                    <td className="py-4 px-6 font-mono text-cyan-400 font-bold">{p.id}</td>
                                    <td className="py-4 px-6 font-bold text-white">{p.protocol}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${p.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            p.status === "Withdrawn" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-500">{p.date}</td>
                                    <td className="py-4 px-6">
                                        {p.status === "Active" || p.status === "Withdrawn" ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${p.adherence > 90 ? "bg-emerald-500" : p.adherence > 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${p.adherence}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-white">{p.adherence}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-600 italic">N/A</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-[10px] uppercase font-bold text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900 border border-slate-800 hover:border-cyan-500/30 px-3 py-1.5 rounded-lg">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Studies Overview */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Active Studies</h2>
                    <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">See all</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Study Name</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Enrollment</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Indication</th>
                                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {studies.map((study, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{study.name}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${study.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                            }`}>
                                            {study.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500" style={{ width: study.enrollment }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300">{study.enrollment}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-400">{study.primaryIndication}</td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
