"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Users, Briefcase, Activity, ShieldAlert, Building2, BarChart3,
    TrendingUp, Crown, RefreshCw, ArrowUpRight, UserCheck, Globe,
    Settings, Zap, Megaphone, FileText, ChevronRight, AlertTriangle
} from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";

// ─── helpers ──────────────────────────────────────────────────────────────────

function StatCard({
    label, value, sub, icon: Icon, color, href, trend
}: {
    label: string; value: string | number; sub?: string;
    icon: React.FC<any>; color: string; href?: string; trend?: "up" | "neutral";
}) {
    const inner = (
        <div className={`glass p-5 rounded-2xl border border-white/5 relative group overflow-hidden transition-all hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-900/20 ${href ? "cursor-pointer" : ""}`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] -rotate-45 translate-x-8 -translate-y-8 rounded-2xl" />
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl bg-slate-900/70 border border-white/5 ${color}`}>
                    <Icon size={18} />
                </div>
                {trend === "up" && (
                    <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <TrendingUp size={10} className="inline mr-0.5" />Live
                    </span>
                )}
            </div>
            <div className="text-2xl font-black text-white mt-2">{value}</div>
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</div>
            {sub && <div className="text-[11px] text-slate-600 mt-0.5">{sub}</div>}
            {href && (
                <div className="absolute right-4 bottom-4 text-slate-700 group-hover:text-violet-400 transition-colors">
                    <ChevronRight size={16} />
                </div>
            )}
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Quick Action Button ───────────────────────────────────────────────────────

function QuickAction({ label, icon: Icon, href, color }: { label: string; icon: React.FC<any>; href: string; color: string }) {
    return (
        <Link href={href}
            className="flex flex-col items-center gap-2.5 p-4 bg-slate-900/50 hover:bg-slate-800/70 border border-white/5 hover:border-violet-500/20 rounded-2xl transition-all group">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <span className="text-[12px] font-bold text-slate-400 group-hover:text-white transition-colors text-center leading-tight">{label}</span>
        </Link>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const token = SuperAdminAuth.get()?.token;
    const saUser = SuperAdminAuth.get()?.user;

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const [statsRes, logsRes] = await Promise.all([
                fetch(`${apiUrl}/api/super-admin/stats`, { headers }),
                fetch(`${apiUrl}/api/super-admin/audit-logs?limit=8`, { headers }),
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (logsRes.ok) {
                const d = await logsRes.json();
                setRecentLogs(Array.isArray(d.logs) ? d.logs : []);
            }
            setLastRefresh(new Date());
        } catch (e) {
            console.error("Super Admin fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const statCards = stats ? [
        { label: "Total Users", value: stats.totalUsers?.toLocaleString() || "0", icon: Users, color: "text-violet-400", href: "/super-admin/users", trend: "up" as const },
        { label: "Total Studies", value: stats.totalStudies?.toLocaleString() || "0", icon: Briefcase, color: "text-blue-400", href: "/super-admin/studies" },
        { label: "Active Participants", value: stats.activeParticipants?.toLocaleString() || "0", icon: UserCheck, color: "text-emerald-400" },
        { label: "Admins & Staff", value: stats.totalAdmins?.toLocaleString() || "0", icon: Crown, color: "text-amber-400", href: "/super-admin/users" },
        { label: "Sponsors", value: stats.totalSponsors?.toLocaleString() || "0", icon: Building2, color: "text-pink-400", href: "/super-admin/sponsors" },
        { label: "Active Studies", value: stats.activeStudies?.toLocaleString() || "0", icon: Activity, color: "text-cyan-400" },
        { label: "Open Adverse Events", value: stats.openAdverseEvents?.toLocaleString() || "0", icon: ShieldAlert, color: "text-red-400" },
        { label: "Audit Events Today", value: stats.auditEventsToday?.toLocaleString() || "0", icon: FileText, color: "text-slate-400", href: "/super-admin/audit" },
    ] : [];

    return (
        <div className="space-y-8 max-w-[1400px]">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Crown size={18} className="text-violet-400" />
                        <span className="text-[11px] font-black text-violet-400/70 uppercase tracking-widest">
                            Super Administrator
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Platform Control Center
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        Welcome, {saUser?.name || "Super Admin"}. You have complete platform visibility and control.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-400 hover:text-slate-200 text-[12px] font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    <Link href="/super-admin/users"
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white text-[12px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-800/30">
                        <Users size={13} /> Create User
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            {loading && !stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="glass p-5 rounded-2xl border border-white/5 h-28 animate-pulse">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl mb-3" />
                            <div className="h-7 bg-slate-800 rounded w-16 mb-2" />
                            <div className="h-3 bg-slate-800 rounded w-24" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((s, i) => (
                        <StatCard key={i} {...s} />
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-4 glass rounded-2xl border border-white/5 p-6">
                    <h2 className="text-[12px] font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Zap size={14} className="text-violet-400" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <QuickAction label="Manage Users" icon={Users} href="/super-admin/users" color="bg-violet-600/20 text-violet-400" />
                        <QuickAction label="Manage Studies" icon={Briefcase} href="/super-admin/studies" color="bg-blue-600/20 text-blue-400" />
                        <QuickAction label="View Sponsors" icon={Building2} href="/super-admin/sponsors" color="bg-pink-600/20 text-pink-400" />
                        <QuickAction label="Audit Logs" icon={FileText} href="/super-admin/audit" color="bg-slate-700/60 text-slate-300" />
                        <QuickAction label="Announcements" icon={Megaphone} href="/super-admin/announcements" color="bg-amber-600/20 text-amber-400" />
                        <QuickAction label="System Settings" icon={Settings} href="/super-admin/settings" color="bg-emerald-600/20 text-emerald-400" />
                    </div>
                </div>

                {/* Recent Audit Logs */}
                <div className="lg:col-span-8 glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-900/20">
                        <h2 className="text-[12px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-violet-400" />
                            Recent Platform Activity
                        </h2>
                        <Link href="/super-admin/audit" className="text-[11px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                            View all <ArrowUpRight size={11} />
                        </Link>
                    </div>

                    {loading && recentLogs.length === 0 ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-10 bg-slate-800/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : recentLogs.length === 0 ? (
                        <div className="p-10 text-center">
                            <Activity size={28} className="text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-600 text-sm font-medium">No audit events found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {recentLogs.map((log, idx) => (
                                <div key={idx} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-800/20 transition-colors group">
                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${log.action?.includes("DELETE") ? "bg-red-500" :
                                        log.action?.includes("LOGIN") ? "bg-emerald-500" :
                                            log.action?.includes("ERROR") ? "bg-amber-500" :
                                                "bg-violet-500"
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[12px] font-black text-slate-300">{log.action}</span>
                                            <span className="text-[11px] text-slate-600 font-mono truncate">
                                                {log.resource}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                                            {log.details || "—"}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[11px] font-mono text-slate-600">
                                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                                        </p>
                                        <p className="text-[10px] text-slate-700">
                                            {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ""}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Platform Health & Permissions info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Permission Hierarchy */}
                <div className="glass rounded-2xl border border-white/5 p-6 md:col-span-2">
                    <h2 className="text-[12px] font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Crown size={14} className="text-violet-400" />
                        Role Hierarchy &amp; Permissions
                    </h2>
                    <div className="space-y-3">
                        {[
                            { role: "SUPER_ADMIN", desc: "Full platform access, user management, system settings, all data", color: "bg-violet-500/15 text-violet-300 border-violet-500/30", badge: "You" },
                            { role: "ADMIN", desc: "Study management, team management, participant data, reports", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
                            { role: "COORDINATOR", desc: "Participant management, scheduling, communications, safety", color: "bg-cyan-500/10  text-cyan-300  border-cyan-500/20" },
                            { role: "PI", desc: "Study oversight, protocol review, adverse event management", color: "bg-blue-500/10  text-blue-300  border-blue-500/20" },
                            { role: "DATA_MANAGER", desc: "Read-only data access, exports, reporting", color: "bg-slate-700/40 text-slate-300 border-slate-600/30" },
                            { role: "SPONSOR", desc: "Study inquiry, progress dashboards, blinded reporting", color: "bg-pink-500/10  text-pink-300  border-pink-500/20" },
                            { role: "PARTICIPANT", desc: "Own study data, tasks, communications", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
                        ].map((r) => (
                            <div key={r.role} className={`flex items-start gap-3 p-3 rounded-xl border ${r.color}`}>
                                <span className={`text-[11px] font-black px-2 py-0.5 rounded border shrink-0 ${r.color}`}>
                                    {r.role}
                                </span>
                                <span className="text-[12px] text-slate-400 leading-relaxed">{r.desc}</span>
                                {r.badge && (
                                    <span className="ml-auto text-[10px] font-black text-violet-300 bg-violet-600/20 px-2 py-0.5 rounded-full shrink-0">
                                        {r.badge}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warning / Notice */}
                <div className="glass rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <h2 className="text-[12px] font-black text-amber-300 uppercase tracking-widest">Important Notice</h2>
                    </div>
                    <div className="space-y-3 flex-1 text-[13px] text-slate-400 leading-relaxed">
                        <p>You are logged in as <strong className="text-amber-300">Super Administrator</strong>. All actions you take are irreversible and logged.</p>
                        <p>Before deleting users or studies, ensure you have proper authorization and have reviewed compliance requirements.</p>
                        <p className="text-amber-400/70">Never share your Super Admin credentials with anyone.</p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-amber-500/15">
                        <p className="text-[11px] text-slate-600 font-medium">
                            Last refresh: {lastRefresh.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
