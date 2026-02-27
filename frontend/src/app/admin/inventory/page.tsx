"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Package, Truck, RefreshCcw, MapPin, Box, Plus,
    X, Loader2, AlertTriangle, CheckCircle2, Clock, Send
} from "lucide-react";
import { format, isPast } from "date-fns";
import { AdminAuth } from "@/lib/portal-auth";

type Kit = {
    id: string;
    sku: string;
    type: string;
    lotNumber: string;
    expirationDate: string;
    status: string;          // AVAILABLE, ASSIGNED, SHIPPED, RETURNED, EXPIRED
    assignedTo?: string;
    shippedAt?: string;
};

const KIT_TYPES = ["Gut Microbiome Kit", "Blood Collection Set", "Saliva Extraction Tube", "Urine Analysis Strips", "DNA Sample Kit", "Stool Collection Kit"];

function statusBadge(status: string) {
    switch (status) {
        case "AVAILABLE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "SHIPPED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        case "ASSIGNED": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
        case "RETURNED": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        case "EXPIRED": return "bg-red-500/10 text-red-400 border-red-500/20";
        default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
}

function stockLevel(kits: Kit[], type: string) {
    const available = kits.filter(k => k.type === type && k.status === "AVAILABLE").length;
    const total = kits.filter(k => k.type === type).length;
    return { available, total };
}

export default function AdminInventoryPage() {
    const [kits, setKits] = useState<Kit[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showShipModal, setShowShipModal] = useState<Kit | null>(null);
    const [shipParticipantId, setShipParticipantId] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const [addForm, setAddForm] = useState({
        sku: "",
        type: "Gut Microbiome Kit",
        lotNumber: "",
        expirationDate: "",
    });

    const getToken = () => AdminAuth.get()?.token ?? "";

    const fetchKits = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);
            if (typeFilter) params.set("type", typeFilter);
            const res = await fetch(`/api/proxy/inventory/?${params}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setKits(await res.json());
        } catch (err) {
            console.error("Fetch kits error", err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter]);

    useEffect(() => { fetchKits(); }, [fetchKits]);

    // ── Add Kit ──────────────────────────────────────────────────────────────
    const handleAddKit = async () => {
        if (!addForm.sku || !addForm.lotNumber || !addForm.expirationDate) return;
        setSaving(true);
        try {
            const res = await fetch("/api/proxy/inventory/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    sku: addForm.sku,
                    type: addForm.type,
                    lotNumber: addForm.lotNumber,
                    expirationDate: new Date(addForm.expirationDate).toISOString(),
                    status: "AVAILABLE",
                }),
            });
            if (res.ok) {
                await fetchKits();
                setShowAddModal(false);
                setAddForm({ sku: "", type: "Gut Microbiome Kit", lotNumber: "", expirationDate: "" });
            }
        } finally {
            setSaving(false);
        }
    };

    // ── Ship Kit ─────────────────────────────────────────────────────────────
    const handleShip = async () => {
        if (!showShipModal || !shipParticipantId.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/proxy/inventory/${showShipModal.id}/ship?participantId=${shipParticipantId.trim()}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
                await fetchKits();
                setShowShipModal(null);
                setShipParticipantId("");
            }
        } finally {
            setSaving(false);
        }
    };

    // ── Derived Stats ─────────────────────────────────────────────────────────
    const shipped = kits.filter(k => k.status === "SHIPPED").length;
    const available = kits.filter(k => k.status === "AVAILABLE").length;
    const expired = kits.filter(k => k.status === "EXPIRED" || isPast(new Date(k.expirationDate))).length;
    const uniqueTypes = [...new Set(kits.map(k => k.type))];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight flex items-center gap-3">
                        <Package size={32} className="text-emerald-500" /> Logistics &amp; Fulfillment
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage clinical supply chain and participant kit shipments.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchKits}
                        className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                        title="Refresh"
                    >
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[13px] rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                    >
                        <Box size={16} /> Add Kit Stock
                    </button>
                </div>
            </div>

            {/* Active Fulfillment Banner */}
            <div className="p-6 rounded-[2rem] border border-blue-500/20 bg-blue-500/[0.03] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                        <Truck size={24} className={shipped > 0 ? "animate-pulse" : ""} />
                    </div>
                    <div>
                        <h4 className="text-white font-black italic uppercase tracking-widest text-[13px]">Active Fulfillment</h4>
                        <p className="text-sm font-bold text-slate-300">
                            {loading ? "Loading..." : `${shipped} kit${shipped !== 1 ? "s" : ""} in transit to participants`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-6 text-center">
                    <div>
                        <div className="text-2xl font-black text-emerald-400">{available}</div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Available</div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-blue-400">{shipped}</div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Shipped</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-black ${expired > 0 ? "text-red-400" : "text-slate-600"}`}>{expired}</div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Expired</div>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-300">{kits.length}</div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Total</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
                >
                    <option value="">All Statuses</option>
                    {["AVAILABLE", "ASSIGNED", "SHIPPED", "RETURNED", "EXPIRED"].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
                >
                    <option value="">All Types</option>
                    {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(statusFilter || typeFilter) && (
                    <button
                        onClick={() => { setStatusFilter(""); setTypeFilter(""); }}
                        className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-bold transition-all"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inventory Table */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900/50 rounded-[2rem] border border-white/5 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-900/50 border-b border-white/5">
                                <tr>
                                    <th className="text-left py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Kit Type / SKU</th>
                                    <th className="text-left py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Lot / Expiry</th>
                                    <th className="text-left py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                                    <th className="text-right py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[13px]">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-16 text-center">
                                        <Loader2 size={24} className="text-emerald-500 animate-spin mx-auto" />
                                    </td></tr>
                                ) : kits.length === 0 ? (
                                    <tr><td colSpan={4} className="py-16 text-center">
                                        <Package size={32} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-600 font-bold text-sm">No kits found</p>
                                        <p className="text-slate-700 text-[12px] mt-1">Add kit stock to get started</p>
                                    </td></tr>
                                ) : (
                                    kits.map((kit) => {
                                        const isExpired = isPast(new Date(kit.expirationDate));
                                        return (
                                            <tr key={kit.id} className="hover:bg-white/[0.01] transition-colors">
                                                <td className="py-5 px-6">
                                                    <div className="font-bold text-white">{kit.type}</div>
                                                    <div className="text-[12px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{kit.sku}</div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="font-bold text-slate-300 text-[12px]">Lot: {kit.lotNumber}</div>
                                                    <div className={`text-[12px] font-bold mt-0.5 ${isExpired ? "text-red-400" : "text-slate-500"}`}>
                                                        {isExpired ? "⚠ " : ""}Exp: {format(new Date(kit.expirationDate), "MMM d, yyyy")}
                                                    </div>
                                                    {kit.assignedTo && (
                                                        <div className="text-[11px] text-cyan-400 font-bold mt-0.5">→ {kit.assignedTo.slice(-8).toUpperCase()}</div>
                                                    )}
                                                </td>
                                                <td className="py-5 px-6">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[12px] font-black border italic ${statusBadge(kit.status)}`}>
                                                        {kit.status}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    {kit.status === "AVAILABLE" && (
                                                        <button
                                                            onClick={() => setShowShipModal(kit)}
                                                            className="p-2 text-emerald-600 hover:text-emerald-400 transition-all"
                                                            title="Ship to participant"
                                                        >
                                                            <Send size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                    {/* Stock by Type */}
                    <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-4 flex items-center gap-2">
                            <Package className="text-emerald-500" size={14} /> Stock Summary
                        </h3>
                        {loading ? (
                            <div className="flex justify-center py-6"><Loader2 size={20} className="text-emerald-500 animate-spin" /></div>
                        ) : uniqueTypes.length === 0 ? (
                            <p className="text-slate-600 text-[13px] text-center py-4">No inventory data yet</p>
                        ) : (
                            <div className="space-y-3">
                                {uniqueTypes.map(type => {
                                    const { available: avail, total } = stockLevel(kits, type);
                                    const pct = total > 0 ? Math.round((avail / total) * 100) : 0;
                                    return (
                                        <div key={type}>
                                            <div className="flex justify-between text-[12px] font-bold text-slate-400 mb-1">
                                                <span className="truncate mr-2">{type}</span>
                                                <span className={pct < 20 ? "text-red-400" : pct < 50 ? "text-amber-400" : "text-emerald-400"}>
                                                    {avail}/{total}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${pct < 20 ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Global Hubs (static — UI display) */}
                    <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-4 flex items-center gap-2">
                            <MapPin className="text-emerald-500" size={14} /> Global Hubs
                        </h3>
                        <div className="space-y-3">
                            {[
                                { city: "New Jersey, US", status: "Operational", ok: true },
                                { city: "Frankfurt, DE", status: "Operational", ok: true },
                                { city: "Singapore, SG", status: "Delayed", ok: false },
                            ].map((hub, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-white/5">
                                    <span className="text-[13px] font-bold text-slate-300">{hub.city}</span>
                                    <span className={`text-[13px] font-black uppercase italic ${hub.ok ? "text-emerald-500" : "text-amber-500"}`}>{hub.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quality Control */}
                    <div className="bg-gradient-to-br from-emerald-500/[0.05] to-cyan-500/[0.05] p-6 rounded-[2rem] border border-white/5">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-3">Quality Control</h3>
                        <p className="text-[13px] text-slate-500 leading-relaxed italic mb-4">
                            Automated expiration tracking for temperature-sensitive diagnostic supplies.
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[13px] font-bold text-slate-400 uppercase">
                                <span>Cold Chain Compliance</span>
                                <span className="text-emerald-400">100%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: "100%" }} />
                            </div>
                            {expired > 0 && (
                                <div className="mt-3 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                                    <span className="text-[12px] text-red-400 font-bold">{expired} kit{expired !== 1 ? "s" : ""} expired — please remove from stock</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Add Kit Modal ────────────────────────────────────────────── */}
            {showAddModal && (
                <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
                            <h2 className="text-white font-black text-lg italic">Add Kit Stock</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Kit Type</label>
                                <select
                                    value={addForm.type}
                                    onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                >
                                    {KIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">SKU *</label>
                                <input
                                    value={addForm.sku}
                                    onChange={e => setAddForm(p => ({ ...p, sku: e.target.value }))}
                                    placeholder="e.g. KIT-101"
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-600 font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Lot Number *</label>
                                <input
                                    value={addForm.lotNumber}
                                    onChange={e => setAddForm(p => ({ ...p, lotNumber: e.target.value }))}
                                    placeholder="e.g. LOT-2026-001"
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-600 font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Expiration Date *</label>
                                <input
                                    type="date"
                                    value={addForm.expirationDate}
                                    onChange={e => setAddForm(p => ({ ...p, expirationDate: e.target.value }))}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 [color-scheme:dark]"
                                />
                            </div>
                        </div>
                        <div className="px-8 pb-8 flex gap-3">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-[13px] hover:border-slate-500 transition-all">Cancel</button>
                            <button
                                onClick={handleAddKit}
                                disabled={saving || !addForm.sku || !addForm.lotNumber || !addForm.expirationDate}
                                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[13px] shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                {saving ? "Saving..." : "Add Kit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Ship Kit Modal ───────────────────────────────────────────── */}
            {showShipModal && (
                <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShipModal(null)}>
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
                            <h2 className="text-white font-black text-lg italic">Ship Kit</h2>
                            <button onClick={() => setShowShipModal(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                                <p className="text-[13px] font-bold text-white">{showShipModal.type}</p>
                                <p className="text-[12px] text-slate-500 font-mono mt-1">{showShipModal.sku} · Lot: {showShipModal.lotNumber}</p>
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Participant ID *</label>
                                <input
                                    value={shipParticipantId}
                                    onChange={e => setShipParticipantId(e.target.value)}
                                    placeholder="Paste participant MongoDB ID..."
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-600 font-mono"
                                />
                            </div>
                        </div>
                        <div className="px-8 pb-8 flex gap-3">
                            <button onClick={() => setShowShipModal(null)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-[13px] hover:border-slate-500 transition-all">Cancel</button>
                            <button
                                onClick={handleShip}
                                disabled={saving || !shipParticipantId.trim()}
                                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[13px] shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {saving ? "Shipping..." : "Ship"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
