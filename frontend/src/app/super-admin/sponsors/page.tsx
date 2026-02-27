"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, RefreshCw, Mail } from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";

export default function SuperAdminSponsorsPage() {
    const [sponsors, setSponsors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const token = SuperAdminAuth.get()?.token || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchSponsors = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/sponsors`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setSponsors(await res.json());
        } finally {
            setLoading(false);
        }
    }, [token, apiUrl]);

    useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

    return (
        <div className="space-y-6 max-w-[1200px]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Building2 size={22} className="text-violet-400" /> Sponsors
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{sponsors.length} registered sponsor accounts</p>
                </div>
                <button onClick={fetchSponsors} disabled={loading}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-400 rounded-xl transition-all disabled:opacity-50">
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr>
                                {["Name", "Email", "Member Since"].map(h => (
                                    <th key={h} className="py-3.5 px-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i}>
                                    {[1, 2, 3].map(j => (
                                        <td key={j} className="py-4 px-5"><div className="h-4 bg-slate-800 rounded animate-pulse w-32" /></td>
                                    ))}
                                </tr>
                            )) : sponsors.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-16 text-center">
                                        <Building2 size={36} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-600 font-medium">No sponsors found</p>
                                    </td>
                                </tr>
                            ) : sponsors.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="py-4 px-5 text-sm font-bold text-white">{s.name || "—"}</td>
                                    <td className="py-4 px-5 text-sm text-slate-400 flex items-center gap-2">
                                        <Mail size={13} className="text-slate-600" />{s.email}
                                    </td>
                                    <td className="py-4 px-5 text-[12px] text-slate-500">
                                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
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
