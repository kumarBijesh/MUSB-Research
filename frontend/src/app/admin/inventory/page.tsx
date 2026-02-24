"use client";

import { useState } from "react";
import {
    Package,
    Truck,
    AlertCircle,
    CheckCircle2,
    RefreshCcw,
    Search,
    Filter,
    ArrowUpRight,
    MapPin,
    Calendar,
    Box
} from "lucide-react";

export default function AdminInventoryPage() {
    const [kitStock, setKitStock] = useState([
        { id: 'KIT-101', type: 'Gut Microbiome Kit', stock: 450, status: 'IN_STOCK', lowThreshold: 100 },
        { id: 'KIT-102', type: 'Blood Collection Set', stock: 82, status: 'LOW_STOCK', lowThreshold: 150 },
        { id: 'KIT-103', type: 'Saliva Extraction Tube', stock: 1200, status: 'IN_STOCK', lowThreshold: 300 },
        { id: 'KIT-104', type: 'Urine Analysis Strips', stock: 12, status: 'OUT_OF_STOCK', lowThreshold: 50 },
    ]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight flex items-center gap-3 text-emerald-500">
                        <Package size={32} /> Logistics & Fulfillment
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage clinical supply chain and participant kit shipments.</p>
                </div>
                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[13px] rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
                    <Box size={16} /> Restock Order
                </button>
            </div>

            {/* Tracking Banner */}
            <div className="glass p-6 rounded-[2rem] border border-blue-500/20 bg-blue-500/[0.03] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                        <Truck size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-white font-black italic uppercase tracking-widest text-[13px]">Active Fulfillment</h4>
                        <p className="text-sm font-bold text-slate-300">12 kits in transit to participants</p>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[13px] font-black text-slate-500">
                            P{i}
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[13px] font-black text-white">
                        +9
                    </div>
                </div>
                <button className="px-5 py-2 bg-slate-900 border border-white/5 text-[13px] font-black text-slate-400 uppercase tracking-widest rounded-xl hover:text-white transition-all">
                    Track All Shipments
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inventory List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-900/50 border-b border-white/5">
                                <tr>
                                    <th className="text-left py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Kit Type / SKU</th>
                                    <th className="text-left py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">On Hand</th>
                                    <th className="text-left py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                                    <th className="text-right py-4 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[13px]">
                                {kitStock.map((kit) => (
                                    <tr key={kit.id} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="py-5 px-8">
                                            <div className="font-bold text-white">{kit.type}</div>
                                            <div className="text-[13px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{kit.id}</div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className={`font-black ${kit.stock < kit.lowThreshold ? 'text-amber-500' : 'text-slate-300'}`}>
                                                {kit.stock} units
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <span className={`px-2 py-0.5 rounded-lg text-[13px] font-black border italic ${kit.status === 'IN_STOCK' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    kit.status === 'LOW_STOCK' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {kit.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <button className="p-2 text-slate-600 hover:text-white transition-all"><RefreshCcw size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-[2rem] border border-white/5 bg-slate-900/40">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-6 flex items-center gap-2">
                            <MapPin className="text-emerald-500" size={14} /> Global Hubs
                        </h3>
                        <div className="space-y-4">
                            {[
                                { city: 'New Jersey, US', status: 'Operational', color: 'emerald' },
                                { city: 'Frankfurt, DE', status: 'Operational', color: 'emerald' },
                                { city: 'Singapore, SG', status: 'Delayed', color: 'amber' },
                            ].map((hub, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                    <span className="text-[13px] font-bold text-slate-300">{hub.city}</span>
                                    <span className={`text-[13px] font-black text-${hub.color}-500 uppercase italic`}>{hub.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-emerald-500/[0.05] to-cyan-500/[0.05]">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-4">Quality Control</h3>
                        <p className="text-[13px] text-slate-500 leading-relaxed italic mb-4">Automated expiration tracking for temperature-sensitive diagnostic supplies.</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[13px] font-bold text-slate-400 uppercase">
                                <span>Cold Chain Compliance</span>
                                <span className="text-emerald-400">100%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
