"use client";

import { useState } from "react";
import {
    BarChart3, Users, FileText, Bell, ChevronRight, TrendingUp,
    Activity, Clock, DollarSign, Download, Eye, AlertTriangle,
    CheckCircle2, FlaskConical, Target, Calendar, MessageSquare,
    LogOut, ChevronDown, Shield, PieChart, ArrowUpRight, ArrowDownRight,
    Microscope, HeartPulse
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const sponsorInfo = {
    name: "Sponsor Partner",
    org: "BioGen Pharma Inc.",
    email: "sponsor@musbresearch.com",
    sponsorId: "SP-ORG-001",
};

const sponsoredStudies = [
    {
        id: "lung-cancer-screening",
        title: "Early Detection Lung Cancer Screening",
        condition: "Oncology",
        status: "RECRUITING",
        phase: "Phase II",
        enrolled: 87,
        target: 200,
        screened: 143,
        withdrawn: 6,
        startDate: "Jan 2025",
        endDate: "Jan 2026",
        budget: 420000,
        spent: 187400,
        primaryEndpoint: "VOC Biomarker Sensitivity ≥ 85%",
        site: "Hybrid (Remote + 2 Clinic Visits)",
        compensation: "$850/participant",
        aeCount: 3,
        adherence: 91,
    },
];

const recentActivity = [
    { id: 1, type: "enrollment", message: "3 new participants enrolled today", time: "2h ago", icon: Users, color: "text-cyan-400" },
    { id: 2, type: "report", message: "Monthly Safety Report available for download", time: "Yesterday", icon: FileText, color: "text-indigo-400" },
    { id: 3, type: "ae", message: "1 Adverse Event flagged — MILD severity", time: "2 days ago", icon: AlertTriangle, color: "text-amber-400" },
    { id: 4, type: "milestone", message: "40% enrollment milestone reached!", time: "3 days ago", icon: CheckCircle2, color: "text-emerald-400" },
    { id: 5, type: "consent", message: "8 participants completed e-Consent", time: "4 days ago", icon: Shield, color: "text-purple-400" },
];

const weeklyEnrollment = [12, 18, 9, 24, 15, 21, 17];
const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const documents = [
    { id: 1, name: "Protocol v2.1", type: "Protocol", date: "Jan 15, 2025", size: "2.4 MB" },
    { id: 2, name: "January Safety Report", type: "Safety", date: "Feb 1, 2025", size: "1.1 MB" },
    { id: 3, name: "IRB Approval Letter", type: "Regulatory", date: "Dec 10, 2024", size: "480 KB" },
    { id: 4, name: "Informed Consent v1.2", type: "Consent", date: "Jan 3, 2025", size: "890 KB" },
];

const adverseEvents = [
    { id: "AE-001", participant: "P-0032", severity: "MILD", description: "Mild dizziness post breath sample", date: "Feb 17, 2025", status: "Resolved" },
    { id: "AE-002", participant: "P-0045", severity: "MILD", description: "Transient nasal irritation", date: "Feb 15, 2025", status: "Resolved" },
    { id: "AE-003", participant: "P-0071", severity: "MODERATE", description: "Persistent cough, 3 days", date: "Feb 12, 2025", status: "Under Review" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const severity: Record<string, string> = {
    MILD: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MODERATE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SEVERE: "bg-red-500/10 text-red-400 border-red-500/20",
};

const aeStatus: Record<string, string> = {
    "Resolved": "text-emerald-400",
    "Under Review": "text-amber-400",
};

export default function SponsorDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "participants" | "safety" | "documents" | "reports">("overview");
    const study = sponsoredStudies[0];
    const enrollmentPct = Math.round((study.enrolled / study.target) * 100);
    const budgetPct = Math.round((study.spent / study.budget) * 100);
    const maxWeekly = Math.max(...weeklyEnrollment);

    return (
        <div className="min-h-screen bg-[#020617] text-white">

            {/* ── Top Nav ── */}
            <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/musb research.png" alt="MUSB Research" className="h-8 w-auto object-contain" />
                        <div className="w-px h-6 bg-slate-800" />
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                            <Microscope size={12} className="text-amber-400" />
                            <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Sponsor Portal</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm">
                                {sponsorInfo.name[0]}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-bold text-white leading-none">{sponsorInfo.name}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{sponsorInfo.org}</p>
                            </div>
                            <ChevronDown size={14} className="text-slate-600" />
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/sponsor/login' })}
                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                            title="Sign Out">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white italic tracking-tight">Sponsor Dashboard</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {sponsorInfo.org} · ID: <span className="text-amber-400 font-bold">{sponsorInfo.sponsorId}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/sponsor/studies/new" className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-600/20">
                            <FlaskConical size={14} /> Launch New Study
                        </Link>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-amber-500/30 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                            <Download size={14} /> Export Report
                        </button>
                    </div>
                </div>

                {/* ... (KPI Cards and Tabs remain same) ... */}

                {/* ═══════════════════════════════════════════════════════
                    PARTICIPANTS TAB
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "participants" && (
                    <div className="glass border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-white">Participant Overview</h2>
                            <p className="text-xs text-slate-500">Anonymized view — ID numbers only</p>
                        </div>

                        {/* Funnel */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                            {[
                                { label: "Total Screened", value: study.screened, color: "from-slate-700 to-slate-600" },
                                { label: "Eligible", value: 110, color: "from-cyan-900 to-cyan-800" },
                                { label: "Consented", value: 97, color: "from-indigo-900 to-indigo-800" },
                                { label: "Enrolled", value: study.enrolled, color: "from-amber-900 to-amber-800" },
                                { label: "Active", value: 81, color: "from-emerald-900 to-emerald-800" },
                            ].map((f) => (
                                <div key={f.label} className={`bg-gradient-to-br ${f.color} rounded-xl p-4 text-center border border-white/5`}>
                                    <p className="text-2xl font-black text-white">{f.value}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">{f.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Status Breakdown & Adherence Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">By Status</p>
                                {[
                                    { label: "Active", count: 81, pct: 93 },
                                    { label: "On Hold", count: 5, pct: 5.7 },
                                    { label: "Withdrawn", count: study.withdrawn, pct: 6.9 },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-3 mb-2">
                                        <p className="text-xs text-slate-400 w-20 shrink-0">{s.label}</p>
                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.pct}%` }} />
                                        </div>
                                        <p className="text-xs font-bold text-white w-6 text-right">{s.count}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">By Age Group</p>
                                {[
                                    { label: "50–60", count: 52, pct: 60 },
                                    { label: "61–70", count: 28, pct: 32 },
                                    { label: "71–80", count: 7, pct: 8 },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-3 mb-2">
                                        <p className="text-xs text-slate-400 w-20 shrink-0">{s.label}</p>
                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${s.pct}%` }} />
                                        </div>
                                        <p className="text-xs font-bold text-white w-6 text-right">{s.count}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Adherence</p>
                                <div className="text-center py-4">
                                    <p className="text-4xl font-black text-emerald-400">{study.adherence}%</p>
                                    <p className="text-xs text-slate-500 mt-1">Overall task completion rate</p>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${study.adherence}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Detailed Participant List Table */}
                        <div className="border-t border-white/5 pt-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Participant Data</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                                            <th className="py-3 font-bold">Participant ID</th>
                                            <th className="py-3 font-bold">Status</th>
                                            <th className="py-3 font-bold">Enrolled Date</th>
                                            <th className="py-3 font-bold">Progress</th>
                                            <th className="py-3 font-bold">Adherence</th>
                                            <th className="py-3 font-bold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-slate-300">
                                        {[
                                            { id: "P-001", status: "Active", date: "Jan 10, 2025", progress: 75, adherence: 98 },
                                            { id: "P-002", status: "Active", date: "Jan 12, 2025", progress: 60, adherence: 85 },
                                            { id: "P-003", status: "On Hold", date: "Jan 15, 2025", progress: 45, adherence: 70 },
                                            { id: "P-004", status: "Active", date: "Jan 20, 2025", progress: 30, adherence: 92 },
                                            { id: "P-005", status: "Completed", date: "Dec 05, 2024", progress: 100, adherence: 100 },
                                        ].map((p, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 font-mono text-cyan-400">{p.id}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : p.status === "Completed" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-slate-500">{p.date}</td>
                                                <td className="py-3 w-32">
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500" style={{ width: `${p.progress}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="py-3 font-bold text-white">{p.adherence}%</td>
                                                <td className="py-3 text-right">
                                                    <button className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                                                        View Data
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    SAFETY TAB
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "safety" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Total AEs", value: 3, color: "amber" },
                                { label: "Resolved", value: 2, color: "emerald" },
                                { label: "Under Review", value: 1, color: "rose" },
                            ].map((s) => (
                                <div key={s.label} className={`glass border border-${s.color}-500/10 rounded-2xl p-6 text-center`}>
                                    <p className={`text-4xl font-black text-${s.color}-400`}>{s.value}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="glass border border-white/5 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest">Adverse Event Log</h2>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {["AE ID", "Participant", "Description", "Severity", "Date", "Status"].map((h) => (
                                            <th key={h} className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-6 py-3">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {adverseEvents.map((ae) => (
                                        <tr key={ae.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-amber-400">{ae.id}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{ae.participant}</td>
                                            <td className="px-6 py-4 text-xs text-slate-300">{ae.description}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-md ${severity[ae.severity]}`}>
                                                    {ae.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{ae.date}</td>
                                            <td className={`px-6 py-4 text-xs font-bold ${aeStatus[ae.status]}`}>{ae.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    DOCUMENTS TAB
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "documents" && (
                    <div className="glass border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Study Documents</h2>
                            <span className="text-xs text-slate-500">Read-only access</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {documents.map((doc) => (
                                <div key={doc.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                            <FileText size={16} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{doc.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{doc.type} · {doc.size} · Uploaded {doc.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-slate-600 hover:text-white transition-colors"><Eye size={16} /></button>
                                        <button className="p-2 text-slate-600 hover:text-amber-400 transition-colors"><Download size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    REPORTS TAB
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "reports" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Enrollment & Retention Report", desc: "Weekly breakdown of screening, enrollment, and dropout rates.", date: "Auto-generated weekly", icon: BarChart3, color: "cyan" },
                                { title: "Safety Summary Report", desc: "All adverse events, severity classifications, and resolution status.", date: "Auto-generated monthly", icon: Shield, color: "rose" },
                                { title: "Data Quality Report", desc: "Form completion rates, missing data flags, and ePRO compliance.", date: "Auto-generated monthly", icon: Activity, color: "indigo" },
                                { title: "Financial Report", desc: "Budget burn rate, per-participant cost, and forecast to completion.", date: "Auto-generated monthly", icon: DollarSign, color: "amber" },
                            ].map((r) => (
                                <div key={r.title} className="glass border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl bg-${r.color}-500/10 shrink-0`}>
                                            <r.icon size={20} className={`text-${r.color}-400`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-black text-white mb-1">{r.title}</h3>
                                            <p className="text-xs text-slate-500 mb-3">{r.desc}</p>
                                            <p className="text-[10px] text-slate-600 flex items-center gap-1">
                                                <Clock size={10} /> {r.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                        <button className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-all flex items-center justify-center gap-1">
                                            <Eye size={12} /> Preview
                                        </button>
                                        <button className="flex-1 py-2 text-xs font-bold text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 rounded-lg transition-all flex items-center justify-center gap-1">
                                            <Download size={12} /> Download PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
