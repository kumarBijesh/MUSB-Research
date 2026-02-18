"use client";

import {
    Search,
    Filter,
    MoreVertical,
    ChevronRight,
    Mail,
    Phone,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";
import { useState } from "react";

const participants = [
    { id: "P1001", name: "John Doe", email: "john@example.com", status: "Active", study: "NAD+ Longevity", adherence: "98%", lastActive: "10m ago" },
    { id: "P1002", name: "Sarah Miller", email: "sarah.m@gmail.com", status: "Consented", study: "GI Microbiome", adherence: "N/A", lastActive: "2h ago" },
    { id: "P1003", name: "Mike Ross", email: "mross@pearson.com", status: "Screened", study: "NAD+ Longevity", adherence: "N/A", lastActive: "1d ago" },
    { id: "P1004", name: "Emma Wilson", email: "emma.w@outlook.com", status: "Enrolled", study: "Sleep Quality", adherence: "85%", lastActive: "5m ago" },
    { id: "P1005", name: "Robert Chen", email: "rchen@tech.co", status: "Lead", study: "GI Microbiome", adherence: "N/A", lastActive: "New" },
];

const statusStyles: any = {
    "Active": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "Consented": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Screened": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "Enrolled": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Lead": "bg-slate-500/10 text-slate-400 border-slate-500/20",
    "Completed": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function ParticipantsPage() {
    const [filter, setFilter] = useState("All");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic">Participants</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage leads and enrolled participants across all studies.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/30 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-900 border-b border-white/5">
                        <tr>
                            <th className="text-left py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Participant</th>
                            <th className="text-left py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                            <th className="text-left py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Study assignment</th>
                            <th className="text-left py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Adherence</th>
                            <th className="text-left py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Last Activity</th>
                            <th className="text-right py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {participants.map((p) => (
                            <tr key={p.id} className="hover:bg-cyan-500/[0.02] transition-colors cursor-pointer group">
                                <td className="py-5 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors leading-none">{p.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 mt-2 tracking-wide">{p.id} • {p.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-5 px-8">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg border italic tracking-wider ${statusStyles[p.status]}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="py-5 px-8 text-xs font-bold text-slate-300">{p.study}</td>
                                <td className="py-5 px-8">
                                    <span className={`text-xs font-black ${p.adherence === 'N/A' ? 'text-slate-600 italic' : 'text-emerald-400'}`}>
                                        {p.adherence}
                                    </span>
                                </td>
                                <td className="py-5 px-8 text-[10px] font-bold text-slate-500">{p.lastActive}</td>
                                <td className="py-5 px-8 text-right">
                                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
