"use client";

import { Activity, Thermometer, Smile, Clock, PlusCircle } from "lucide-react";

export default function LogsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-white italic tracking-tight">Health Logs</h1>

            {/* Supplement Log */}
            <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Supplement Timing</h3>
                        <p className="text-slate-500 text-sm">Track your daily intake.</p>
                    </div>
                    <button className="ml-auto flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                        <PlusCircle size={16} /> Log Now
                    </button>
                </div>

                <div className="border-t border-white/5 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center group-hover:bg-slate-800/50 p-3 rounded-lg transition-colors">
                        <div className="text-xs text-slate-500 mb-1">Dose</div>
                        <div className="font-bold text-white">500mg</div>
                    </div>
                    <div className="text-center group-hover:bg-slate-800/50 p-3 rounded-lg transition-colors">
                        <div className="text-xs text-slate-500 mb-1">Time Taken</div>
                        <div className="font-bold text-emerald-400">08:00 AM</div>
                    </div>
                    <div className="text-center group-hover:bg-slate-800/50 p-3 rounded-lg transition-colors">
                        <div className="text-xs text-slate-500 mb-1">Adherence</div>
                        <div className="font-bold text-cyan-400">100%</div>
                    </div>
                    <div className="text-center group-hover:bg-slate-800/50 p-3 rounded-lg transition-colors">
                        <div className="text-xs text-slate-500 mb-1">Missed Dose?</div>
                        <div className="font-bold text-slate-300">No</div>
                    </div>
                </div>
            </div>

            {/* Daily Feelings Scale */}
            <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                        <Smile size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Daily Mood & Energy</h3>
                        <p className="text-slate-500 text-sm">How are you feeling today?</p>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2 mt-8">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <button key={level} className="flex-1 py-4 rounded-xl border border-white/5 bg-slate-950/30 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-white transition-all text-slate-400 font-bold text-lg group-hover:scale-105">
                            {level}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 uppercase font-black tracking-widest mt-2 px-2">
                    <span>Very Low</span>
                    <span>Excellent</span>
                </div>
            </div>

            {/* Adverse Event Log */}
            <div className="glass p-8 rounded-3xl border border-red-500/10 bg-slate-900/40 relative overflow-hidden group hover:border-red-500/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <Thermometer size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">Report Adverse Event</h3>
                        <p className="text-slate-500 text-sm">Did you experience any side effects?</p>
                    </div>
                    <div className="ml-auto text-slate-600">
                        <PlusCircle size={24} className="group-hover:text-red-400 transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
}
