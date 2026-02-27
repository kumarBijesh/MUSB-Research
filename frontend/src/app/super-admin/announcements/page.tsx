"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Megaphone, Plus, Trash2, RefreshCw, X, CheckCircle2, AlertCircle
} from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";

const TYPE_STYLES: Record<string, string> = {
    INFO: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    WARNING: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    CRITICAL: "bg-red-500/15 text-red-300 border-red-500/25",
};

export default function SuperAdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", message: "", target: "ALL", type: "INFO" });
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    const token = SuperAdminAuth.get()?.token || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const showToast = (msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/announcements`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setAnnouncements(await res.json());
        } finally {
            setLoading(false);
        }
    }, [token, apiUrl]);

    useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/announcements`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                showToast("Announcement created!");
                setForm({ title: "", message: "", target: "ALL", type: "INFO" });
                setShowForm(false);
                fetchAnnouncements();
            } else {
                showToast("Failed to create announcement.", "err");
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this announcement?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/announcements/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) { showToast("Deleted."); fetchAnnouncements(); }
            else showToast("Failed to delete.", "err");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Megaphone size={22} className="text-violet-400" /> Announcements
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Broadcast platform-wide messages to users</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchAnnouncements} disabled={loading}
                        className="p-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-400 rounded-xl transition-all disabled:opacity-50">
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white text-[12px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-800/30">
                        <Plus size={14} /> New Announcement
                    </button>
                </div>
            </div>

            {/* Create form */}
            {showForm && (
                <div className="glass rounded-2xl border border-violet-500/20 p-6 shadow-xl shadow-violet-900/20">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">New Announcement</h2>
                        <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                required
                                placeholder="System Maintenance Tonight at 11 PM"
                                className="w-full bg-slate-900/60 border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">Message</label>
                            <textarea
                                value={form.message}
                                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                                required
                                rows={4}
                                placeholder="Detailed announcement message..."
                                className="w-full bg-slate-900/60 border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">Audience</label>
                                <select value={form.target} onChange={(e) => setForm(f => ({ ...f, target: e.target.value }))}
                                    className="w-full bg-slate-900/60 border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all">
                                    {["ALL", "ADMIN", "PARTICIPANT", "SPONSOR"].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">Type</label>
                                <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                                    className="w-full bg-slate-900/60 border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all">
                                    {["INFO", "WARNING", "CRITICAL"].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all">
                                Cancel
                            </button>
                            <button type="submit" disabled={creating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                                {creating ? <RefreshCw size={14} className="animate-spin" /> : <Megaphone size={14} />}
                                {creating ? "Creating..." : "Broadcast"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass rounded-2xl border border-white/5 p-5 h-28 animate-pulse" />
                    ))
                ) : announcements.length === 0 ? (
                    <div className="glass rounded-2xl border border-white/5 p-12 text-center">
                        <Megaphone size={36} className="text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">No announcements yet</p>
                        <p className="text-slate-700 text-sm mt-1">Create one to broadcast a message to users</p>
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className={`glass rounded-2xl border p-5 relative ${type_border(ann.type)}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${TYPE_STYLES[ann.type] || TYPE_STYLES.INFO}`}>
                                            {ann.type}
                                        </span>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-700/40 text-slate-400 border border-slate-600/20 uppercase tracking-widest">
                                            → {ann.target}
                                        </span>
                                        {ann.active && (
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-white font-black text-sm mb-1">{ann.title}</h3>
                                    <p className="text-slate-400 text-[13px] leading-relaxed">{ann.message}</p>
                                    <p className="text-slate-700 text-[11px] mt-2">
                                        {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ""}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(ann.id)}
                                    disabled={deleting === ann.id}
                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0 disabled:opacity-50"
                                    title="Delete"
                                >
                                    {deleting === ann.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function type_border(type: string) {
    if (type === "CRITICAL") return "border-red-500/20";
    if (type === "WARNING") return "border-amber-500/20";
    return "border-white/5";
}
