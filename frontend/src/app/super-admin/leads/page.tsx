"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";

const STATUS_STYLES: Record<string, string> = {
    NEW: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    PRELIMINARY_LEAD: "bg-slate-700/40 text-slate-400 border-slate-600/30",
    NDA_REQUESTED: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    QUALIFIED_LEAD: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
};

export default function SuperAdminLeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const token = SuperAdminAuth.get()?.token || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/sponsor-leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setLeads(await res.json());
        } finally {
            setLoading(false);
        }
    }, [token, apiUrl]);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    return (
        <div className="space-y-6 max-w-[1200px]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <BarChart3 size={22} className="text-violet-400" /> Sponsor Leads
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{leads.length} total sponsor inquiries</p>
                </div>
                <button onClick={fetchLeads} disabled={loading}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-400 rounded-xl transition-all disabled:opacity-50">
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr>
                                {["Company", "Contact", "Study Type", "Status", "Submitted"].map(h => (
                                    <th key={h} className="py-3.5 px-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {[1, 2, 3, 4, 5].map(j => (
                                        <td key={j} className="py-4 px-5"><div className="h-4 bg-slate-800 rounded animate-pulse w-24" /></td>
                                    ))}
                                </tr>
                            )) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <BarChart3 size={36} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-600 font-medium">No sponsor leads found</p>
                                    </td>
                                </tr>
                            ) : leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="py-4 px-5 text-sm font-bold text-white">{lead.companyName || "—"}</td>
                                    <td className="py-4 px-5 text-sm text-slate-400">{lead.contactEmail || "—"}</td>
                                    <td className="py-4 px-5 text-sm text-slate-400">{lead.studyType || "—"}</td>
                                    <td className="py-4 px-5">
                                        <span className={`text-[11px] font-black px-2 py-1 rounded-lg border ${STATUS_STYLES[lead.status] || STATUS_STYLES.NEW}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 text-[12px] text-slate-500">
                                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
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
