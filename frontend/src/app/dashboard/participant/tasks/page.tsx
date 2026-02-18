"use client";

import { CheckCircle, Clock, Calendar, AlertCircle } from "lucide-react";

const tasks = [
    { title: "Baseline Survey", date: "Jan 10 - Jan 12", status: "completed", type: "Survey" },
    { title: "Week 1 Check-in", date: "Jan 17 - Jan 19", status: "completed", type: "Log" },
    { title: "Week 2 Check-in", date: "Jan 24 - Jan 26", status: "active", type: "Log" },
    { title: "Mid-Study Lab Visit", date: "Feb 10 - Feb 15", status: "upcoming", type: "Visit" },
    { title: "Final Assessment", date: "Mar 01 - Mar 05", status: "upcoming", type: "Survey" },
];

export default function TasksPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-white italic tracking-tight">My Task Timeline</h1>

            <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8 py-2">
                {tasks.map((task, idx) => (
                    <div key={idx} className="relative group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[39px] w-5 h-5 rounded-full border-4 border-[#020617] transition-colors ${task.status === 'completed' ? 'bg-emerald-400' :
                                task.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                            }`} />

                        <div className={`glass p-6 rounded-2xl border transition-all ${task.status === 'active'
                                ? 'border-cyan-500/30 bg-cyan-500/5 shadow-lg shadow-cyan-500/10'
                                : 'border-white/5 bg-slate-900/40 opacity-80 hover:opacity-100 hover:border-white/20'
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${task.status === 'completed' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
                                        task.status === 'active' ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10' :
                                            'text-slate-500 border-slate-700 bg-slate-800/50'
                                    }`}>
                                    {task.status}
                                </span>
                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                    <Calendar size={12} /> {task.date}
                                </span>
                            </div>

                            <h3 className={`text-lg font-bold mb-1 ${task.status === 'active' ? 'text-white' : 'text-slate-300'}`}>
                                {task.title}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                {task.type} • Estimated time: 10 mins
                            </p>

                            {task.status === 'active' && (
                                <button className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-cyan-500/25">
                                    Start Now
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
