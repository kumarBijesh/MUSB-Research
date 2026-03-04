"use client";

import {
    BarChart3, Users, FileText, Bell, ChevronRight, TrendingUp,
    Activity, Clock, DollarSign, Download, Eye, AlertTriangle,
    CheckCircle2, FlaskConical, Target, Calendar, MessageSquare,
    LogOut, ChevronDown, Shield, PieChart, ArrowUpRight, ArrowDownRight,
    Microscope, HeartPulse, X, Loader2, ExternalLink, Globe
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { AdminAuth } from "@/lib/portal-auth";
import { useRef } from "react";

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

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    UNDER_REVIEW: { label: "Pending Approval", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    ACTIVE: { label: "Live on MusB Site", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    DRAFT: { label: "Draft", cls: "bg-slate-800 text-slate-400 border-white/10" },
    RECRUITING: { label: "Recruiting", cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status.replace(/_/g, " "), cls: "bg-slate-800 text-slate-400 border-white/10" };
    return (
        <span className={`px-2 py-0.5 rounded text-[11px] font-black tracking-widest uppercase border whitespace-nowrap ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
}

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
    const router = useRouter();

    // ── Per-tab auth: reads from THIS TAB's sessionStorage only ──
    const portalSession = typeof window !== "undefined" ? AdminAuth.get() : null;
    const sponsorUser = portalSession?.user;

    const [activeTab, setActiveTab] = useState<"overview" | "mystudies" | "participants" | "safety" | "documents" | "reports">("overview");
    const [stats, setStats] = useState<any>(null);
    const [studies, setStudies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);

    // ── Study submission form state ──
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        condition: "",
        location: "",
        duration: "",
        compensation: "",
        timeCommitment: "",
    });
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // ── RBAC Guard ──
    useEffect(() => {
        const session = AdminAuth.get();
        if (!session || session.user.role !== "SPONSOR") {
            router.replace("/sponsor/login");
        }

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [router]);

    const handleSignOut = async () => {
        AdminAuth.clear();
        await signOut({ redirect: false });
        window.location.href = "https://musbresearchwebsite-1.vercel.app/";
    };

    // Mock participants with PII for export (Special Sponsor Request)
    const exportParticipants = [
        { name: "James Wilson", email: "j.wilson@teleworm.com", id: "P-001", status: "Active" },
        { name: "Sarah Jenkins", email: "s.jenkins@rhyta.com", id: "P-002", status: "Active" },
        { name: "Michael Chen", email: "m.chen@jourrapide.com", id: "P-003", status: "On Hold" },
        { name: "Elena Rodriguez", email: "e.rodriguez@dayrep.com", id: "P-004", status: "Active" },
        { name: "David Thompson", email: "d.thompson@armyspy.com", id: "P-005", status: "Completed" },
    ];

    const handleExportReport = () => {
        setIsExporting(true);
        try {
            const activeStudy = studies[0] || sponsoredStudies[0];
            const studyTitle = activeStudy.title;

            // CSV content (Special Sponsor Request: Name, Email, Study Title)
            let csvContent = `STUDY SUMMARY: ${studyTitle}\n`;
            csvContent += `Status: ${activeStudy.status}\n`;
            csvContent += `Progress: ${Math.round(((activeStudy.enrolled ?? activeStudy.enrolledCount ?? 0) / Math.max(activeStudy.target ?? activeStudy.participantCount ?? 1, 1)) * 100)}% Enrollment\n\n`;
            csvContent += "Participant Name,Email,Study Title\n";

            // CSV Rows
            exportParticipants.forEach(p => {
                csvContent += `"${p.name}","${p.email}","${studyTitle}"\n`;
            });

            // Trigger Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Study_Report_${studyTitle.replace(/\s+/g, '_')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert("Study report generated successfully. Your download has started.");
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const notifications = [
        { id: 1, title: "Dr. Sarah Mitchell", role: "COORDINATOR", message: "New participant enrollment in NAD+ trial pending document review.", time: "10m ago", color: "text-pink-400", bg: "bg-pink-400/10", read: false },
        { id: 2, title: "Astra Biotech", role: "SPONSOR", message: "Sponsor has requested an updated safety report for the lung cancer study.", time: "2h ago", color: "text-amber-400", bg: "bg-amber-400/10", read: false },
        { id: 3, title: "System Analytics", role: "AUTOMATED", message: "Automated audit log sync completed for all active sites.", time: "5h ago", color: "text-slate-400", bg: "bg-slate-400/10", read: true },
    ];

    const getToken = () => AdminAuth.get()?.token ?? "";

    const fetchData = async () => {
        const token = getToken();
        const authHeader = token ? { "Authorization": `Bearer ${token}` } : {};
        try {
            const [statsRes, studiesRes] = await Promise.all([
                fetch("/api/proxy/sponsor/stats", { headers: authHeader }),
                fetch("/api/proxy/sponsor/studies", { headers: authHeader }),
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (studiesRes.ok) setStudies(await studiesRes.json());
        } catch (error) {
            console.error("Error fetching sponsor data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStudySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        setSubmitError("");
        try {
            const res = await fetch("/api/proxy/sponsor/studies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    ...formData,
                    slug: "auto",
                    status: "UNDER_REVIEW",
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || "Submission failed");
            }
            const created = await res.json();
            setStudies(prev => [created, ...prev]);
            setSubmitSuccess(true);
            setShowSubmitForm(false);
            setFormData({ title: "", description: "", condition: "", location: "", duration: "", compensation: "", timeCommitment: "" });
            setTimeout(() => setSubmitSuccess(false), 4000);
        } catch (err: any) {
            setSubmitError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const study = studies[0] || sponsoredStudies[0]; // Fallback to mock for demo UI consistency if empty
    const enrollmentPct = stats && stats.totalParticipants > 0
        ? Math.round((stats.enrolledParticipants / stats.totalParticipants) * 100)
        : 0;
    const maxWeekly = Math.max(...weeklyEnrollment);

    return (
        <div className="min-h-screen bg-transparent text-white">

            {/* ── Top Nav ── */}
            <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <img src="/musb research.png" alt="MUSB Research" className="h-6 sm:h-8 w-auto object-contain" />
                        <div className="w-px h-6 bg-slate-800 hidden xs:block" />
                        <div className="hidden xs:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                            <Microscope size={12} className="text-amber-400" />
                            <span className="text-amber-400 text-[10px] sm:text-[13px] font-black uppercase tracking-widest">Sponsor</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="sm:relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-2 transition-colors rounded-xl ${isNotificationsOpen ? "bg-amber-500/20 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0A1128] animate-pulse" />
                                )}
                            </button>

                            {/* Notifications Dropdown (Responsive) */}
                            {isNotificationsOpen && (
                                <div className="absolute left-4 right-4 sm:left-auto sm:right-0 top-[70px] sm:top-auto sm:mt-4 sm:w-96 bg-[#0a1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="p-5 border-b border-white/5 flex items-center justify-between bg-amber-500/[0.02]">
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Intelligence</h3>
                                            <p className="text-[11px] text-slate-500 font-bold uppercase mt-1">2 Pending Alerts</p>
                                        </div>
                                        <button
                                            onClick={() => setUnreadCount(0)}
                                            className="text-[11px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {notifications.map((n) => (
                                            <div key={n.id} className={`p-5 border-b border-white/5 hover:bg-white/[0.02] transition-all relative ${!n.read ? "bg-amber-500/[0.01] before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:bg-amber-500" : ""}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-black text-white uppercase tracking-tight">{n.title}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${n.bg} ${n.color}`}>
                                                            {n.role}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-600 uppercase italic whitespace-nowrap">{n.time}</span>
                                                </div>
                                                <p className="text-[12px] font-bold text-slate-400 leading-relaxed">
                                                    {n.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-slate-950/50 text-center border-t border-white/5">
                                        <button className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors">Unified Protocol Inbox</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sm:relative" ref={profileRef}>
                            <button className="flex items-center gap-3 pl-4 border-l border-white/5 cursor-pointer group w-full text-left focus:outline-none" onClick={() => setIsProfileOpen((prev) => !prev)}>
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm group-hover:bg-amber-500/20 transition-all">
                                    {sponsorInfo.name[0]}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-bold text-white leading-none group-hover:text-amber-400 transition-colors">{sponsorInfo.name}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 font-bold uppercase tracking-widest">{sponsorInfo.org}</p>
                                </div>
                                <ChevronDown size={14} className={`text-slate-600 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute left-4 right-4 sm:left-auto sm:right-0 top-[70px] sm:top-auto sm:mt-4 sm:w-64 bg-[#0a1120]/98 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="p-5 border-b border-white/5">
                                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{sponsorInfo.name}</p>
                                        <p className="text-[11px] text-slate-500 font-bold truncate italic">{sponsorInfo.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left">
                                            <Shield size={16} className="text-amber-500/50" /> Portal Security
                                        </button>
                                        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left">
                                            <FileText size={16} className="text-amber-500/50" /> Billing Details
                                        </button>
                                        <div className="h-px bg-white/5 my-1" />
                                        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[13px] font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all text-left text-red-400">
                                            <LogOut size={16} /> Sign Out Partner
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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
                        <Link href="/studies" target="_blank" className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-indigo-500/30 text-indigo-400 text-[13px] font-bold uppercase tracking-widest rounded-xl transition-all">
                            <ExternalLink size={14} /> Visit Public Directory
                        </Link>
                        <Link href="/sponsor/dashboard/new-study" className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-[13px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-600/20">
                            <FlaskConical size={14} /> Inquire New Study
                        </Link>
                        <button
                            onClick={handleExportReport}
                            disabled={isExporting}
                            className={`flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-amber-500/30 text-slate-300 text-[13px] font-bold uppercase tracking-widest rounded-xl transition-all ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            {isExporting ? "Generating..." : "Export Report"}
                        </button>
                    </div>
                </div>

                {/* ── Tabs Navigation ── */}
                <div className="flex items-center gap-1 mb-8 bg-slate-950/50 p-1 rounded-2xl border border-white/5 w-fit">
                    {[
                        { id: "overview", label: "Overview", icon: PieChart },
                        { id: "mystudies", label: "My Studies", icon: FlaskConical },
                        { id: "participants", label: "Participants", icon: Users },
                        { id: "safety", label: "Safety", icon: Shield },
                        { id: "documents", label: "Documents", icon: FileText },
                        { id: "reports", label: "Reports", icon: BarChart3 },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
                        >
                            <t.icon size={14} /> {t.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════════════════════════════════════════════════
                    OVERVIEW TAB
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "overview" && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Active Studies", value: stats?.activeStudies || 0, trend: "+1 this month", icon: FlaskConical, color: "text-amber-400", bg: "bg-amber-500/10" },
                                { label: "Total Participants", value: stats?.totalParticipants || 0, trend: "Across all protocols", icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                                { label: "Enrolled Rate", value: `${enrollmentPct}%`, trend: "Target: 85% avg", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                { label: "Data Integrity", value: "99.8%", trend: "HIPAA Compliant", icon: Shield, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                            ].map((kpi, idx) => (
                                <div key={idx} className="glass p-6 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2`} />
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                                            <kpi.icon size={20} />
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter">{kpi.value}</h3>
                                        <p className="text-[13px] font-black uppercase tracking-widest text-slate-500 mt-1">{kpi.label}</p>
                                        <p className="text-[13px] font-bold text-slate-600 mt-4 flex items-center gap-1">
                                            <ArrowUpRight size={10} className="text-emerald-500" /> {kpi.trend}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Studies List */}
                        <div className="glass border border-white/5 rounded-3xl overflow-hidden bg-slate-900/40">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">My Pipeline</h2>
                                <button className="text-[13px] font-black uppercase text-amber-500 hover:text-amber-400 transition-colors">View All Protocols</button>
                            </div>
                            <div className="divide-y divide-white/5">
                                {loading ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <Activity size={24} className="animate-spin mx-auto mb-4 opacity-20" />
                                        <p className="text-[13px] font-bold uppercase tracking-widest">Hydrating Dashboard...</p>
                                    </div>
                                ) : studies.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <p className="text-[13px] font-bold uppercase tracking-widest mb-4">No studies found</p>
                                        <Link href="/sponsor/dashboard/new-study" className="text-amber-500 font-bold hover:underline">Inquire about your first protocol</Link>
                                    </div>
                                ) : studies.map((s, idx) => (
                                    <div key={idx} className="p-8 hover:bg-white/[0.02] transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 transition-all">
                                                <HeartPulse size={24} className="text-amber-500/50" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors uppercase italic">{s.title}</h3>
                                                    <StatusBadge status={s.status} />
                                                </div>
                                                <div className="flex items-center gap-4 text-[13px] font-medium text-slate-500">
                                                    <span className="flex items-center gap-1.5"><Target size={12} /> {s.targetParticipants || s.target} Target</span>
                                                    <span className="flex items-center gap-1.5"><Calendar size={12} /> Submitted {new Date(s.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden lg:block">
                                                <p className="text-[13px] font-black uppercase text-slate-600 tracking-widest mb-1">Enrollment</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round((s.enrolledCount / s.participantCount) * 100) || 0}%` }} />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-white">{Math.round((s.enrolledCount / s.participantCount) * 100) || 0}%</span>
                                                </div>
                                            </div>
                                            <Link href={`/sponsor/studies/${s.slug || s.id}`} className="px-6 py-2.5 bg-slate-900 border border-white/10 hover:border-amber-500/30 text-white text-[13px] font-black uppercase tracking-widest rounded-xl transition-all">
                                                Manage Study
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 glass border border-white/5 rounded-3xl p-8 bg-slate-900/40">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Intelligence Feed</h3>
                                    <MessageSquare size={16} className="text-slate-600" />
                                </div>
                                <div className="space-y-6">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex gap-4 group">
                                            <div className={`p-2 rounded-xl bg-slate-950 border border-white/5 ${activity.color} shrink-0`}>
                                                <activity.icon size={16} />
                                            </div>
                                            <div className="flex-1 border-b border-white/5 pb-4 group-last:border-0">
                                                <p className="text-[13px] text-slate-300 font-medium leading-tight mb-1">{activity.message}</p>
                                                <p className="text-[13px] text-slate-600 font-bold uppercase tracking-widest">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass border border-white/5 rounded-3xl p-8 bg-slate-900/40">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic mb-8">Quick Actions</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: "Request IRB Review", icon: Shield },
                                        { label: "Invite Coordinators", icon: Users },
                                        { label: "Financial Summary", icon: DollarSign },
                                        { label: "Contact Support", icon: MessageSquare },
                                    ].map((action, i) => (
                                        <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-white/5 hover:border-amber-500/30 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <action.icon size={16} className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                                                <span className="text-[13px] font-bold text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-700 group-hover:text-amber-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    PARTICIPANTS TAB
                ═══════════════════════════════════════════════════════ */}
                {/* ═══════════════════════════════════════════════════════
                    MY STUDIES TAB
                ═══════════════════════════════════════════════════════ */}
                {activeTab === "mystudies" && (
                    <div className="space-y-6 animate-in fade-in duration-500">

                        {/* Success Banner */}
                        {submitSuccess && (
                            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold text-sm animate-in fade-in duration-300">
                                <CheckCircle2 size={18} />
                                Study submitted! It is now <strong className="text-emerald-300">Under Review</strong> by MUSB administrators.
                            </div>
                        )}

                        {/* Studies List */}
                        <div className="glass border border-white/5 rounded-3xl overflow-hidden bg-slate-900/40">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">My Studies</h2>
                                    <p className="text-[12px] text-slate-500 mt-1 font-bold">{studies.length} protocol{studies.length !== 1 ? "s" : ""} submitted</p>
                                </div>
                                <button
                                    onClick={() => { setShowSubmitForm(v => !v); setSubmitError(""); }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-[13px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-600/20"
                                >
                                    <FlaskConical size={14} />
                                    {showSubmitForm ? "Cancel" : "Submit New Study"}
                                </button>
                            </div>

                            {/* ── Inline Submission Form ── */}
                            {showSubmitForm && (
                                <form onSubmit={handleStudySubmit} className="p-8 border-b border-white/5 bg-amber-500/[0.02] space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                        <FlaskConical size={14} /> New Study Submission
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Study Title <span className="text-amber-500">*</span></label>
                                            <input
                                                required
                                                value={formData.title}
                                                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                                placeholder="e.g. Gut Microbiome & Cognitive Function Study"
                                                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description <span className="text-amber-500">*</span></label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.description}
                                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                                placeholder="Describe the study objectives, methodology, and expected outcomes…"
                                                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Medical Condition <span className="text-amber-500">*</span></label>
                                            <input
                                                required
                                                value={formData.condition}
                                                onChange={e => setFormData(p => ({ ...p, condition: e.target.value }))}
                                                placeholder="e.g. IBS, Type 2 Diabetes, Hypertension"
                                                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location <span className="text-amber-500">*</span></label>
                                            <input
                                                required
                                                value={formData.location}
                                                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                                                placeholder="e.g. Remote, Boston MA, Hybrid"
                                                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Duration <span className="text-amber-500">*</span></label>
                                            <input
                                                required
                                                value={formData.duration}
                                                onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                                                placeholder="e.g. 4 Weeks, 3 Months"
                                                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Compensation</label>
                                            <input
                                                value={formData.compensation}
                                                onChange={e => setFormData(p => ({ ...p, compensation: e.target.value }))}
                                                placeholder="e.g. $300, Gift Card, None"
                                                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest block mb-2">Time Commitment</label>
                                            <input
                                                value={formData.timeCommitment}
                                                onChange={e => setFormData(p => ({ ...p, timeCommitment: e.target.value }))}
                                                placeholder="e.g. Low, Medium, High"
                                                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {submitError && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm font-bold bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                            <AlertTriangle size={14} /> {submitError}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="flex items-center gap-2 text-[12px] text-slate-500 flex-1">
                                            <Globe size={12} className="text-amber-500/50" />
                                            Submitted as <strong className="text-amber-400">UNDER REVIEW</strong> — visible on the MusB site only after admin approval.
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitLoading}
                                            className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white text-[13px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitLoading ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
                                            {submitLoading ? "Submitting…" : "Submit for Review"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Studies List */}
                            <div className="divide-y divide-white/5">
                                {loading ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <Activity size={24} className="animate-spin mx-auto mb-4 opacity-20" />
                                        <p className="text-[13px] font-bold uppercase tracking-widest">Loading studies…</p>
                                    </div>
                                ) : studies.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <FlaskConical size={28} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-[13px] font-bold uppercase tracking-widest mb-2">No studies submitted yet</p>
                                        <p className="text-[12px] text-slate-600">Click &quot;Submit New Study&quot; above to get started.</p>
                                    </div>
                                ) : studies.map((s, idx) => (
                                    <div key={idx} className="p-6 hover:bg-white/[0.02] transition-all group">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 transition-all shrink-0">
                                                    <HeartPulse size={20} className="text-amber-500/50" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors uppercase italic truncate">{s.title}</h3>
                                                        <StatusBadge status={s.status} />
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-[12px] font-medium text-slate-500 mt-1">
                                                        {s.condition && <span className="flex items-center gap-1"><Target size={11} /> {s.condition}</span>}
                                                        {s.location && <span className="flex items-center gap-1"><Globe size={11} /> {s.location}</span>}
                                                        {s.compensation && <span className="flex items-center gap-1"><DollarSign size={11} /> {s.compensation}</span>}
                                                        <span className="flex items-center gap-1"><Calendar size={11} /> Submitted {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/sponsor/studies/${s.slug || s.id}`} className="shrink-0 px-5 py-2 bg-slate-900 border border-white/10 hover:border-amber-500/30 text-white text-[12px] font-black uppercase tracking-widest rounded-xl transition-all">
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "participants" && (
                    <div className="glass border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-white">Participant Overview</h2>
                            <p className="text-[13px] text-slate-500">Anonymized view — ID numbers only</p>
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
                                    <p className="text-[13px] text-slate-400 uppercase tracking-widest font-bold mt-1">{f.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Status Breakdown & Adherence Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest mb-3">By Status</p>
                                {[
                                    { label: "Active", count: 81, pct: 93 },
                                    { label: "On Hold", count: 5, pct: 5.7 },
                                    { label: "Withdrawn", count: study.withdrawn, pct: 6.9 },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-3 mb-2">
                                        <p className="text-[13px] text-slate-400 w-20 shrink-0">{s.label}</p>
                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${s.pct}%` }} />
                                        </div>
                                        <p className="text-[13px] font-bold text-white w-6 text-right">{s.count}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest mb-3">By Age Group</p>
                                {[
                                    { label: "50–60", count: 52, pct: 60 },
                                    { label: "61–70", count: 28, pct: 32 },
                                    { label: "71–80", count: 7, pct: 8 },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-3 mb-2">
                                        <p className="text-[13px] text-slate-400 w-20 shrink-0">{s.label}</p>
                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${s.pct}%` }} />
                                        </div>
                                        <p className="text-[13px] font-bold text-white w-6 text-right">{s.count}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest mb-3">Adherence</p>
                                <div className="text-center py-4">
                                    <p className="text-4xl font-black text-emerald-400">{study.adherence}%</p>
                                    <p className="text-[13px] text-slate-500 mt-1">Overall task completion rate</p>
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
                                        <tr className="border-b border-white/5 text-[13px] uppercase tracking-widest text-slate-500">
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
                                                    <span className={`px-2 py-1 rounded text-[13px] font-bold uppercase ${p.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : p.status === "Completed" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}`}>
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
                                                    <button className="text-[13px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
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
                                    <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest mt-2">{s.label}</p>
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
                                            <th key={h} className="text-left text-[13px] font-black text-slate-500 uppercase tracking-widest px-6 py-3">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {adverseEvents.map((ae) => (
                                        <tr key={ae.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-4 text-[13px] font-bold text-amber-400">{ae.id}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-400">{ae.participant}</td>
                                            <td className="px-6 py-4 text-[13px] text-slate-300">{ae.description}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[13px] font-black uppercase tracking-widest border rounded-md ${severity[ae.severity]}`}>
                                                    {ae.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-slate-500">{ae.date}</td>
                                            <td className={`px-6 py-4 text-[13px] font-bold ${aeStatus[ae.status]}`}>{ae.status}</td>
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
                            <span className="text-[13px] text-slate-500">Read-only access</span>
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
                                            <p className="text-[13px] text-slate-500 mt-0.5">{doc.type} · {doc.size} · Uploaded {doc.date}</p>
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
                                            <p className="text-[13px] text-slate-500 mb-3">{r.desc}</p>
                                            <p className="text-[13px] text-slate-600 flex items-center gap-1">
                                                <Clock size={10} /> {r.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                                        <button className="flex-1 py-2 text-[13px] font-bold text-slate-400 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-all flex items-center justify-center gap-1">
                                            <Eye size={12} /> Preview
                                        </button>
                                        <button className="flex-1 py-2 text-[13px] font-bold text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 rounded-lg transition-all flex items-center justify-center gap-1">
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
