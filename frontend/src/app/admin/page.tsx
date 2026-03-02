"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminAuth } from "@/lib/portal-auth";
import {
    Users,
    ArrowUpRight,
    TrendingUp,
    AlertCircle,
    Package,
    Clock,
    ChevronRight,
    Search,
    Filter,
    CheckCircle2,
    Truck,
    ShieldAlert,
    Globe
} from "lucide-react";

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

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();

    const [statsData, setStatsData] = useState<any>(null);
    const [funnelData, setFunnelData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [activeStudies, setActiveStudies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = AdminAuth.get()?.token || "";
            const headers: Record<string, string> = token
                ? { Authorization: `Bearer ${token}` }
                : {};
            try {
                const [sRes, fRes, pRes, stRes] = await Promise.all([
                    fetch("/api/proxy/admin/stats", { headers }),
                    fetch("/api/proxy/admin/recruitment-funnel", { headers }),
                    fetch("/api/proxy/participants?limit=5", { headers }),
                    fetch("/api/proxy/studies", { headers })
                ]);

                const [sData, fData, pData, stData] = await Promise.all([
                    sRes.ok ? sRes.json() : {},
                    fRes.ok ? fRes.json() : [],
                    pRes.ok ? pRes.json() : [],
                    stRes.ok ? stRes.json() : []
                ]);

                setStatsData(sData || {});
                setFunnelData(Array.isArray(fData) ? fData : []);
                setRecentActivity(Array.isArray(pData) ? pData : []);
                setActiveStudies(Array.isArray(stData) ? stData : []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setFunnelData([]);
                setRecentActivity([]);
                setActiveStudies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = statsData ? [
        { label: "Total Leads", value: (statsData.totalLeads || 0).toLocaleString(), change: "", icon: Users, color: "text-cyan-400" },
        { label: "Screened", value: (statsData.screened || 0).toLocaleString(), change: "", icon: TrendingUp, color: "text-purple-400" },
        { label: "Enrolled", value: (statsData.enrolled || 0).toLocaleString(), change: "", icon: ArrowUpRight, color: "text-emerald-400" },
        { label: "Open AEs", value: (statsData.openAEs || 0).toString(), change: "", icon: AlertCircle, color: "text-red-400" },
    ] : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Coordinator Console</h1>
                    <p className="text-slate-500 mt-2 font-medium">Welcome back, {session?.user?.name || "Alex"}. Monitoring recruitment, retention, and site operations.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/studies/new" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 text-[13px] font-bold uppercase tracking-widest rounded-xl transition-all">
                        <Package size={14} /> New Protocol
                    </Link>
                    <Link href="/admin/participants/new" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[13px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-600/20">
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
                                <span className={`text-[13px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <div className="text-2xl font-black text-white">{stat.value}</div>
                        <div className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recruitment Funnel */}
                <div className="lg:col-span-8 glass rounded-2xl border border-white/5 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider italic">Recruitment Funnel</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Filter:</span>
                            <select className="bg-slate-900 border border-slate-700 rounded-lg text-[13px] font-bold py-1 px-3 text-slate-400 focus:outline-none focus:border-cyan-500/50">
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                                <option>Year to Date</option>
                            </select>
                        </div>
                    </div>
                    {/* Funnel Chart */}
                    <div className="space-y-6">
                        {Array.isArray(funnelData) && funnelData.map((step, i) => (
                            <div key={i} className="space-y-2 group">
                                <div className="flex justify-between text-[13px] font-black uppercase tracking-widest">
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
                                        <span className={`text-[13px] font-black px-1.5 py-0.5 rounded ${task.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/10' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-[13px] text-slate-500 font-bold">{task.time}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{task.title}</h4>
                                    <p className="text-[13px] text-slate-500 uppercase font-black tracking-widest mt-1">{task.category}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 text-[13px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700/50 flex items-center justify-center gap-2 group">
                            View All Tasks <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Specific Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Compliance / Consent */}
                <Link href="/admin/consent" className="glass p-6 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <CheckCircle2 size={20} className="text-purple-400 group-hover:text-white" />
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">e-Consent</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Templates</span>
                            <span className="font-bold text-white">12</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Pending Version</span>
                            <span className="font-bold text-purple-400">3</span>
                        </div>
                        <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Master Version</span>
                            <span className="text-lg font-black text-emerald-400">v2.4</span>
                        </div>
                    </div>
                </Link>

                {/* Logistics */}
                <Link href="/admin/inventory" className="glass p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Truck size={20} className="text-blue-400 group-hover:text-white" />
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Logistics</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Pending Shipment</span>
                            <span className="font-bold text-white">18</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">In Transit</span>
                            <span className="font-bold text-cyan-400">34</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Overdue Returns</span>
                            <span className="font-bold text-red-400">3</span>
                        </div>
                    </div>
                </Link>

                {/* Safety */}
                <Link href="/admin/safety" className="glass p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                            <ShieldAlert size={20} className="text-red-400 group-hover:text-white" />
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Safety</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Open AEs</span>
                            <span className="font-bold text-amber-400 flex items-center gap-2">4 <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /></span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">High Severity Alerts</span>
                            <span className="font-bold text-red-400 flex items-center gap-2">1 <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /></span>
                        </div>
                    </div>
                </Link>

                {/* Geographic */}
                <div className="glass p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Globe size={20} className="text-emerald-400" />
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Geographic</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">US Participants</span>
                            <span className="font-bold text-white">210</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">UK Participants</span>
                            <span className="font-bold text-white">85</span>
                        </div>
                        <div className="border-t border-white/5 pt-4">
                            <span className="text-[13px] text-slate-500 block mb-2">Top Timezone</span>
                            <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">EST (UTC-5)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Participant Overview Section - Added as requested */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/30">
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Recent Participant Activity</h2>
                        <p className="text-[13px] text-slate-500 mt-1">Live feed of enrollment and adherence data.</p>
                    </div>
                    <Link href="/admin/participants" className="text-[13px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                        View All <ArrowUpRight size={12} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr className="text-[13px] uppercase tracking-widest text-slate-500">
                                <th className="py-4 px-6 font-bold">Participant ID</th>
                                <th className="py-4 px-6 font-bold">Protocol</th>
                                <th className="py-4 px-6 font-bold">Status</th>
                                <th className="py-4 px-6 font-bold">Enrollment Date</th>
                                <th className="py-4 px-6 font-bold">Adherence</th>
                                <th className="py-4 px-6 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                            {Array.isArray(recentActivity) && recentActivity.map((p, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => router.push(`/admin/participants/${p.id}`)}
                                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                >
                                    <td className="py-4 px-6 font-mono text-cyan-400 font-bold">{p.id?.slice(-6).toUpperCase() || "N/A"}</td>
                                    <td className="py-4 px-6 font-bold text-white">{p.name || "Anonymous"}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded text-[13px] font-bold uppercase tracking-wide ${p.status === "ACTIVE" || p.status === "ENROLLED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            p.status === "WITHDRAWN" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-500">{p.consentedAt ? new Date(p.consentedAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className="py-4 px-6">
                                        {p.status === "ACTIVE" || p.status === "ENROLLED" ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `92%` }} />
                                                </div>
                                                <span className="text-[13px] font-bold text-white">92%</span>
                                            </div>
                                        ) : (
                                            <span className="text-[13px] text-slate-600 italic">N/A</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-[13px] uppercase font-bold text-slate-500 hover:text-cyan-400 transition-colors bg-slate-900 border border-slate-800 hover:border-cyan-500/30 px-3 py-1.5 rounded-lg">
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
                    <button className="text-[13px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">See all</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr>
                                <th className="text-left py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest">Study Name</th>
                                <th className="text-left py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="text-left py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest">Enrollment</th>
                                <th className="text-left py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest">Indication</th>
                                <th className="text-right py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {Array.isArray(activeStudies) && activeStudies.map((study, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{study.title}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-[13px] font-black px-1.5 py-0.5 rounded ${study.status === 'ACTIVE' || study.status === 'RECRUITING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                            }`}>
                                            {study.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500" style={{ width: '45%' }} />
                                            </div>
                                            <span className="text-[13px] font-bold text-slate-300">45%</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-400">{study.condition}</td>
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
