"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, RefreshCw, Search, AlertCircle, Shield } from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";

const ACTION_COLOR: Record<string, string> = {
    LOGIN: "bg-emerald-500/15 text-emerald-300",
    LOGOUT: "bg-slate-700/40 text-slate-400",
    REGISTER: "bg-blue-500/15 text-blue-300",
    DELETE: "bg-red-500/15 text-red-300",
    UPDATE: "bg-amber-500/15 text-amber-300",
    CREATE: "bg-cyan-500/15 text-cyan-300",
    VERIFY_SUCCESS: "bg-violet-500/15 text-violet-300",
    EXPORT: "bg-pink-500/15 text-pink-300",
};

function getActionColor(action: string) {
    for (const key of Object.keys(ACTION_COLOR)) {
        if (action.includes(key)) return ACTION_COLOR[key];
    }
    return "bg-slate-800/60 text-slate-400";
}

export default function SuperAdminAuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [action, setAction] = useState("");

    const token = SuperAdminAuth.get()?.token || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (action) params.set("action", action);
            const res = await fetch(`${apiUrl}/api/super-admin/audit-logs?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const d = await res.json();
                setLogs(d.logs || []);
                setTotal(d.total || 0);
            }
        } finally {
            setLoading(false);
        }
    }, [token, action, apiUrl]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const filtered = logs.filter(l =>
        !search ||
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.resource?.toLowerCase().includes(search.toLowerCase()) ||
        l.userId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1400px]">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <FileText size={22} className="text-violet-400" /> Audit Logs
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {total.toLocaleString()} total events — full platform-wide HIPAA audit trail
                    </p>
                </div>
                <button onClick={fetchLogs} disabled={loading}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-400 rounded-xl transition-all disabled:opacity-50">
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors" size={15} />
                    <input type="text" placeholder="Search action, resource, user ID..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-violet-500/30 transition-all" />
                </div>
                <select value={action} onChange={(e) => setAction(e.target.value)}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500/30 transition-all">
                    <option value="">All Actions</option>
                    {["LOGIN", "LOGOUT", "REGISTER", "DELETE", "UPDATE", "EXPORT", "VERIFY_SUCCESS", "VERIFY_SEND"].map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr>
                                {["Timestamp", "Action", "Resource", "User ID", "Details", "IP"].map(h => (
                                    <th key={h} className="py-3.5 px-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="py-3.5 px-5">
                                                <div className="h-4 bg-slate-800 rounded animate-pulse w-24" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Shield size={36} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-600 font-medium">No audit events found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors text-sm">
                                        <td className="py-3.5 px-5 text-[12px] font-mono text-slate-500 whitespace-nowrap">
                                            {log.timestamp ? (
                                                <>
                                                    <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                                                    <p className="text-slate-700">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                                </>
                                            ) : "—"}
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${getActionColor(log.action || "")}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-5 text-[12px] text-slate-400 font-mono max-w-[200px] truncate">
                                            {log.resource}
                                        </td>
                                        <td className="py-3.5 px-5 text-[12px] text-slate-500 font-mono">
                                            {log.userId?.slice(-8) || "SYSTEM"}
                                        </td>
                                        <td className="py-3.5 px-5 text-[12px] text-slate-500 max-w-[250px] truncate">
                                            {log.details || "—"}
                                        </td>
                                        <td className="py-3.5 px-5 text-[12px] text-slate-600 font-mono">
                                            {log.ipAddress || "—"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
