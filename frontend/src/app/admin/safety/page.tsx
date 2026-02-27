"use client";

import { useState, useEffect, useCallback } from "react";
import {
    AlertTriangle, ShieldAlert, Activity, CheckCircle2,
    User, Loader2, MessageSquare, ChevronRight, RefreshCw, Check
} from "lucide-react";
import { format, isToday } from "date-fns";
import { AdminAuth } from "@/lib/portal-auth";

type AE = {
    id: string;
    participantId: string;
    description: string;
    severity: string;
    onsetDate: string;
    reportedAt: string;
    status: string;
    actionTaken?: string;
};

const SEV_STYLES: Record<string, string> = {
    MILD: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MODERATE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SEVERE: "bg-red-500/10 text-red-400 border-red-500/20",
    LIFE_THREATENING: "bg-rose-600 text-white border-rose-600 animate-pulse",
};

export default function AdminSafetyPage() {
    const [aeList, setAeList] = useState<AE[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [updating, setUpdating] = useState<string | null>(null);

    const getToken = () => AdminAuth.get()?.token ?? "";

    const fetchAEs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/adverse-events/all", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setAeList(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAEs(); }, [fetchAEs]);

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdating(id);
        try {
            await fetch(`/api/proxy/adverse-events/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            setAeList(prev => prev.map(ae => ae.id === id ? { ...ae, status: newStatus } : ae));
        } finally {
            setUpdating(null);
        }
    };

    const critical = aeList.filter(ae => ae.severity === "LIFE_THREATENING").length;
    const open = aeList.filter(ae => ae.status === "Under Review" || ae.status === "PENDING").length;
    const resolvedToday = aeList.filter(ae => ae.status === "RESOLVED" && isToday(new Date(ae.reportedAt))).length;

    const displayed = aeList.filter(ae => {
        if (filter === "SEVERE") return ae.severity === "SEVERE" || ae.severity === "LIFE_THREATENING";
        if (filter === "PENDING") return ae.status === "Under Review" || ae.status === "PENDING";
        return true;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={32} /> Safety &amp; AE Console
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Monitor adverse events, escalate SAEs, and manage medical review.</p>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={fetchAEs} className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <div className="text-right">
                        <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Active Alerts</div>
                        <div className={`text-2xl font-black italic ${open > 0 ? "text-red-500" : "text-slate-600"}`}>
                            {open.toString().padStart(2, "0")}
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-3 text-red-400 mb-4 font-black uppercase tracking-widest text-[13px] italic">
                        <AlertTriangle size={14} /> Critical Events
                    </div>
                    <div className={`text-3xl font-black italic ${critical > 0 ? "text-red-500 animate-pulse" : "text-white"}`}>
                        {critical.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[13px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Life Threatening / SAE</div>
                </div>
                <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-3 text-amber-400 mb-4 font-black uppercase tracking-widest text-[13px] italic">
                        <Activity size={14} /> Open AE Log
                    </div>
                    <div className="text-3xl font-black text-white italic">{open.toString().padStart(2, "0")}</div>
                    <div className="text-[13px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Requiring Coordinator Review</div>
                </div>
                <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-3 text-cyan-400 mb-4 font-black uppercase tracking-widest text-[13px] italic">
                        <CheckCircle2 size={14} /> Resolved Today
                    </div>
                    <div className="text-3xl font-black text-white italic">{resolvedToday.toString().padStart(2, "0")}</div>
                    <div className="text-[13px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Validated by Medical Monitor</div>
                </div>
            </div>

            {/* AE Queue */}
            <div className="bg-slate-900/40 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-6 bg-slate-900/50 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-white font-black italic uppercase tracking-widest text-[13px]">Intake Queue</h3>
                    <div className="flex gap-2">
                        {["ALL", "SEVERE", "PENDING"].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-1.5 rounded-lg text-[13px] font-black uppercase tracking-widest italic transition-all border ${filter === t ? "bg-cyan-500 text-white border-cyan-500" : "bg-slate-800 text-slate-500 border-white/5 hover:text-white"}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900 border-b border-white/5">
                            <tr>
                                <th className="text-left py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Reported At</th>
                                <th className="text-left py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Participant</th>
                                <th className="text-left py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Event Description</th>
                                <th className="text-left py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Severity</th>
                                <th className="text-left py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                                <th className="text-right py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin text-red-500 inline" size={32} /></td></tr>
                            ) : displayed.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-600 font-black italic uppercase tracking-widest text-[13px]">No adverse events in queue</td></tr>
                            ) : displayed.map(ae => (
                                <tr key={ae.id} className="hover:bg-red-500/[0.02] transition-colors cursor-pointer group">
                                    <td className="py-5 px-8">
                                        <div className="text-[13px] text-white font-bold">{format(new Date(ae.reportedAt), "MMM dd, HH:mm")}</div>
                                        <div className="text-[12px] text-slate-500 mt-1 uppercase font-black tracking-tighter italic">Source: Intake Form</div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-red-500/10 group-hover:text-red-400 transition-all">
                                                <User size={16} />
                                            </div>
                                            <div className="text-[13px] text-white font-bold">PID-{ae.participantId.slice(-6).toUpperCase()}</div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="text-[13px] text-slate-300 font-medium max-w-xs">{ae.description}</div>
                                        <div className="text-[12px] text-slate-500 mt-1 italic">Onset: {format(new Date(ae.onsetDate), "MMM dd")}</div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className={`text-[13px] font-black px-2 py-1 rounded border italic tracking-wider ${SEV_STYLES[ae.severity] || SEV_STYLES.MILD}`}>
                                            {ae.severity}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8">
                                        {ae.status === "RESOLVED" ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[13px] font-black text-emerald-500 uppercase tracking-widest">Resolved</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                <span className="text-[13px] font-black text-amber-500 uppercase tracking-widest">Awaiting Review</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-5 px-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            {ae.status !== "RESOLVED" && (
                                                <button
                                                    onClick={() => updateStatus(ae.id, "RESOLVED")}
                                                    disabled={updating === ae.id}
                                                    className="p-2 text-slate-500 hover:text-emerald-400 transition-colors bg-slate-800/50 rounded-lg"
                                                    title="Mark Resolved"
                                                >
                                                    {updating === ae.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                </button>
                                            )}
                                            <button className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-lg"><MessageSquare size={16} /></button>
                                            <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors bg-slate-800/50 rounded-lg"><ChevronRight size={16} /></button>
                                        </div>
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
