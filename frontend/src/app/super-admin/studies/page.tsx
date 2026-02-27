"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Briefcase, Trash2, Play, Pause, Archive, RefreshCw,
    Search, CheckCircle2, AlertCircle, XCircle, ChevronRight
} from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    DRAFT: "bg-slate-700/40 text-slate-400 border-slate-600/30",
    PAUSED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    ARCHIVED: "bg-red-500/10 text-red-400 border-red-500/20",
    UNDER_REVIEW: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function SuperAdminStudiesPage() {
    const [studies, setStudies] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
    const [actioning, setActioning] = useState<string | null>(null);

    const token = SuperAdminAuth.get()?.token || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const showToast = (msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStudies = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (statusFilter) params.set("status", statusFilter);
            const res = await fetch(`${apiUrl}/api/super-admin/studies?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const d = await res.json();
                setStudies(d.studies || []);
                setTotal(d.total || 0);
            }
        } finally {
            setLoading(false);
        }
    }, [token, statusFilter, apiUrl]);

    useEffect(() => { fetchStudies(); }, [fetchStudies]);

    const changeStatus = async (studyId: string, status: string) => {
        setActioning(studyId);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/studies/${studyId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            if (res.ok) { showToast(`Study set to ${status}`); fetchStudies(); }
            else { const d = await res.json().catch(() => ({})); showToast(d.detail || "Failed.", "err"); }
        } finally {
            setActioning(null);
        }
    };

    const deleteStudy = async (studyId: string, title: string) => {
        if (!confirm(`Permanently delete study "${title}" and ALL associated data? This cannot be undone.`)) return;
        setActioning(studyId);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/studies/${studyId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) { showToast("Study deleted."); fetchStudies(); }
            else { showToast("Delete failed.", "err"); }
        } finally {
            setActioning(null);
        }
    };

    const filtered = studies.filter(s =>
        !search || s.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl ${toast.type === "ok"
                        ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
                        : "bg-red-900/90 border-red-500/30 text-red-300"
                    }`}>
                    {toast.type === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Briefcase size={22} className="text-violet-400" /> Studies Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{total.toLocaleString()} total studies across all statuses</p>
                </div>
                <button onClick={fetchStudies} disabled={loading}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-400 rounded-xl transition-all disabled:opacity-50">
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors" size={15} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-violet-500/30 transition-all"
                    />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500/30 transition-all">
                    <option value="">All Statuses</option>
                    {["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED", "UNDER_REVIEW"].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr>
                                {["Title", "Condition", "Status", "Target", "Created", "Actions"].map(h => (
                                    <th key={h} className="py-3.5 px-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="py-4 px-5"><div className="h-4 bg-slate-800 rounded animate-pulse w-24" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Briefcase size={36} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-600 font-medium">No studies found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((study) => {
                                    const isActioning = actioning === study.id;
                                    return (
                                        <tr key={study.id} className="hover:bg-slate-800/20 transition-colors group">
                                            <td className="py-4 px-5">
                                                <p className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                                                    {study.title}
                                                </p>
                                                <p className="text-[11px] text-slate-600 font-mono mt-0.5">{study.slug}</p>
                                            </td>
                                            <td className="py-4 px-5 text-sm text-slate-400">{study.condition || "—"}</td>
                                            <td className="py-4 px-5">
                                                <span className={`text-[11px] font-black px-2 py-1 rounded-lg border ${STATUS_STYLES[study.status] || STATUS_STYLES.DRAFT}`}>
                                                    {study.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-sm text-slate-400">
                                                {study.targetParticipants?.toLocaleString() || "—"}
                                            </td>
                                            <td className="py-4 px-5 text-[12px] text-slate-500">
                                                {study.createdAt ? new Date(study.createdAt).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-1.5">
                                                    {study.status !== "ACTIVE" && (
                                                        <button onClick={() => changeStatus(study.id, "ACTIVE")} disabled={isActioning}
                                                            title="Activate"
                                                            className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50">
                                                            <Play size={13} />
                                                        </button>
                                                    )}
                                                    {study.status === "ACTIVE" && (
                                                        <button onClick={() => changeStatus(study.id, "PAUSED")} disabled={isActioning}
                                                            title="Pause"
                                                            className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all disabled:opacity-50">
                                                            <Pause size={13} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => changeStatus(study.id, "ARCHIVED")} disabled={isActioning}
                                                        title="Archive"
                                                        className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all disabled:opacity-50">
                                                        <Archive size={13} />
                                                    </button>
                                                    <button onClick={() => deleteStudy(study.id, study.title)} disabled={isActioning}
                                                        title="Delete"
                                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50">
                                                        {isActioning ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
