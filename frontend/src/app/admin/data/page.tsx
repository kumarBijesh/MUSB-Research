"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Database, Download, FileText, Table as TableIcon,
    Zap, ShieldCheck, Lock, Loader2, RefreshCw,
    Users, Activity, AlertTriangle, HeartPulse
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminAuth } from "@/lib/portal-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Stats = {
    totalRecords: number;
    participants: number;
    assessments: number;
    adverseEvents: number;
    dataLogs: number;
    dataCompleteness: number;
    lastSync: string;
};

type AuditLog = {
    id: string;
    userId: string;
    action: string;
    resource: string;
    details?: string;
    ipAddress?: string;
    timestamp: string;
};

const DATASETS = [
    {
        id: "demographics",
        title: "Subject Demographics (DM)",
        desc: "Age, gender, location, and enrollment markers.",
        icon: Users,
        endpoint: "/api/export/demographics",
        filename: "demographics_DM.csv",
    },
    {
        id: "epro",
        title: "ePRO / Assessment Data (QS)",
        desc: "Participant-reported outcomes and questionnaire scores.",
        icon: FileText,
        endpoint: "/api/export/epro",
        filename: "ePRO_assessment_QS.csv",
    },
    {
        id: "adverse-events",
        title: "Adverse Events (AE)",
        desc: "Complete safety log including severity and causality.",
        icon: AlertTriangle,
        endpoint: "/api/export/adverse-events",
        filename: "adverse_events_AE.csv",
    },
    {
        id: "vitals",
        title: "Vital Signs & Device Data (VS)",
        desc: "Logged biometrics and physical measurements.",
        icon: HeartPulse,
        endpoint: "/api/export/vitals",
        filename: "vitals_device_VS.csv",
    },
];

function actionLabel(action: string): string {
    const map: Record<string, string> = {
        EXPORT_CSV: "Exported CSV",
        VIEW_PARTICIPANT: "Accessed Patient PI",
        DATABASE_BACKUP: "BOD Database Backup",
        LOGIN: "Admin Login",
        LOGOUT: "Admin Logout",
        UPDATE_STUDY: "Updated Study",
    };
    return map[action] || action;
}

export default function AdminDataExportPage() {
    const [exporting, setExporting] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [auditLoading, setAuditLoading] = useState(true);
    const [showFullAudit, setShowFullAudit] = useState(false);

    const getToken = () => AdminAuth.get()?.token ?? "";

    // ── Fetch live stats ────────────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await fetch("/api/proxy/export/stats", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setStats(await res.json());
        } catch (e) {
            console.error("Stats error", e);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // ── Fetch HIPAA audit log ───────────────────────────────────────────────
    const fetchAuditLogs = useCallback(async () => {
        setAuditLoading(true);
        try {
            const res = await fetch("/api/proxy/audit/?limit=20", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setAuditLogs(await res.json());
        } catch (e) {
            console.error("Audit error", e);
        } finally {
            setAuditLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchAuditLogs();
    }, [fetchStats, fetchAuditLogs]);

    // ── Real CSV download via direct backend call (bypasses JSON proxy) ─────
    const handleExport = async (dataset: typeof DATASETS[0]) => {
        setExporting(dataset.id);
        try {
            const token = getToken();
            const res = await fetch(`${API_URL}${dataset.endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = dataset.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            // Refresh audit log to show new export entry
            setTimeout(fetchAuditLogs, 1000);
        } catch (err) {
            console.error("Download error", err);
        } finally {
            setExporting(null);
        }
    };

    const visibleLogs = showFullAudit ? auditLogs : auditLogs.slice(0, 5);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight flex items-center gap-3">
                        <Database className="text-cyan-500" size={32} /> Data &amp; Exports
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Extract protocol data for analysis and sponsor reporting.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { fetchStats(); fetchAuditLogs(); }}
                        className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={statsLoading ? "animate-spin" : ""} />
                    </button>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-xl flex items-center gap-3">
                        <ShieldCheck className="text-cyan-400" size={18} />
                        <span className="text-[13px] font-black text-cyan-400 uppercase tracking-widest italic leading-none">CDISC SDTM Compliant</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: datasets + stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dataset List */}
                    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-8">Available Datasets</h3>
                        <div className="space-y-4">
                            {DATASETS.map((dataset) => (
                                <div
                                    key={dataset.id}
                                    className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl group hover:border-cyan-500/30 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-slate-900 rounded-xl text-slate-500 group-hover:text-cyan-400 transition-colors">
                                            <dataset.icon size={22} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{dataset.title}</h4>
                                            <p className="text-[13px] text-slate-500">{dataset.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleExport(dataset)}
                                        disabled={exporting === dataset.id}
                                        className="px-5 py-2.5 bg-slate-800 hover:bg-cyan-600 border border-slate-700 hover:border-cyan-600 text-white font-black uppercase tracking-widest text-[12px] rounded-xl flex items-center gap-2 transition-all min-w-[110px] justify-center disabled:opacity-60 shadow-sm"
                                    >
                                        {exporting === dataset.id
                                            ? <><Loader2 size={14} className="animate-spin" /> Preparing…</>
                                            : <><Download size={14} /> CSV</>
                                        }
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* On-Demand Statistics */}
                    <div className="bg-gradient-to-br from-cyan-500/[0.05] to-blue-500/[0.05] p-8 rounded-[2rem] border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-black italic uppercase tracking-widest text-[13px]">On-Demand Statistics</h3>
                            {statsLoading && <Loader2 size={14} className="text-cyan-500 animate-spin" />}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Total Records</div>
                                <div className="text-2xl font-black text-white italic">
                                    {statsLoading ? "—" : stats?.totalRecords.toLocaleString() ?? "—"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Participants</div>
                                <div className="text-2xl font-black text-slate-300 italic">
                                    {statsLoading ? "—" : stats?.participants.toLocaleString() ?? "—"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Data Completeness</div>
                                <div className={`text-2xl font-black italic ${(stats?.dataCompleteness ?? 0) >= 90 ? "text-emerald-400" : (stats?.dataCompleteness ?? 0) >= 70 ? "text-amber-400" : "text-red-400"}`}>
                                    {statsLoading ? "—" : `${stats?.dataCompleteness ?? 0}%`}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Assessments</div>
                                <div className="text-2xl font-black text-slate-300 italic">
                                    {statsLoading ? "—" : stats?.assessments.toLocaleString() ?? "—"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Adverse Events</div>
                                <div className={`text-2xl font-black italic ${(stats?.adverseEvents ?? 0) > 0 ? "text-amber-400" : "text-slate-300"}`}>
                                    {statsLoading ? "—" : stats?.adverseEvents.toLocaleString() ?? "—"}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Last Sync</div>
                                <div className="text-xl font-black text-slate-300 italic">
                                    {(!statsLoading && stats?.lastSync)
                                        ? formatDistanceToNow(new Date(stats.lastSync), { addSuffix: false }) + " ago"
                                        : "—"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: HIPAA Audit Log */}
                <div>
                    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-8 flex items-center gap-2">
                            <Lock className="text-amber-500" size={14} /> HIPAA Access Log
                        </h3>

                        {auditLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 size={20} className="text-amber-500 animate-spin" />
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <p className="text-slate-600 text-[13px] text-center py-8 italic">No audit events yet.</p>
                        ) : (
                            <div className="space-y-6">
                                {visibleLogs.map((log, i) => (
                                    <div key={log.id} className="flex gap-4 items-start relative group">
                                        {i < visibleLogs.length - 1 && (
                                            <div className="absolute top-8 left-1.5 w-[1px] h-8 bg-slate-800" />
                                        )}
                                        <div className="w-3 h-3 rounded-full bg-slate-700 mt-1 transition-colors group-hover:bg-amber-500 shrink-0" />
                                        <div>
                                            <div className="text-[12px] font-black text-slate-500 uppercase tracking-tighter mb-1">
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </div>
                                            <p className="text-[13px] text-white font-bold">
                                                {log.userId.slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-[13px] text-slate-500 italic mt-0.5">
                                                {actionLabel(log.action)}{log.resource ? `: ${log.resource}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {auditLogs.length > 5 && (
                            <button
                                onClick={() => setShowFullAudit(v => !v)}
                                className="w-full mt-8 py-3 bg-slate-950 border border-white/5 rounded-xl text-[13px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                            >
                                {showFullAudit ? "Show Less" : `View Full Audit Trail (${auditLogs.length})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
