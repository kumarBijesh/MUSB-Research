"use client";

import {
    Package,
    Truck,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    Plus,
    ArrowRight,
    MapPin,
    BarChart
} from "lucide-react";

const inventory = [
    { sku: "KIT-NAD-BL", name: "NAD+ Baseline Kit", available: 142, reserved: 24, expiry: "2026-12", status: "In Stock" },
    { sku: "KIT-GI-ST1", name: "GI Stool Collection V1", available: 8, reserved: 42, expiry: "2026-08", status: "Low Stock" },
];

export default function InventoryPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-white italic">Logistics & Kits</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {inventory.map((item, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-cyan-400">
                                <Package size={20} />
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">{item.name}</h3>
                        <p className="text-[10px] font-bold text-slate-600 mb-4 tracking-widest">{item.sku}</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Available</p>
                                <p className="text-lg font-black text-white">{item.available}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
