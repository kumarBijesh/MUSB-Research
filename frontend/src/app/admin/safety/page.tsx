"use client";

import { ShieldAlert, AlertOctagon, Activity, ChevronRight, User } from "lucide-react";

export default function SafetyPage() {
    return (
        <div className="space-y-8 text-slate-200">
            <h1 className="text-3xl font-black text-white italic tracking-tight flex items-center gap-3">
                <ShieldAlert className="text-red-500" /> Safety Triage (AE/SAE)
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">New Events (24h)</p>
                    <p className="text-2xl font-black text-cyan-400">2</p>
                </div>
            </div>
        </div>
    );
}
