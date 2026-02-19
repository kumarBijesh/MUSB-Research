"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Activity,
    FileText,
    Package,
    MessageSquare,
    MoreVertical,
    Clock,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

export default function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState("overview");

    const participant = {
        id: id,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 012-3456",
        dob: "1985-04-12",
        location: "California, USA",
        status: "Active",
        enrolledDate: "Jan 10, 2026",
        study: "NAD+ Longevity Trial",
        arm: "Arm A (Intervention)",
        progress: 65,
        compliance: 92
    };

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "timeline", label: "Timeline" },
        { id: "eligibility", label: "Eligibility" },
        { id: "logs", label: "Daily Logs" },
        { id: "documents", label: "Documents" },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Nav Back */}
            <div>
                <Link href="/admin/participants" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
                    <ChevronLeft size={16} /> Back to Participants
                </Link>

                {/* Profile Header */}
                <div className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                        <div className="flex gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5 shadow-2xl">
                                <User size={40} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-black text-white">{participant.name}</h1>
                                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                        {participant.status}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm font-bold flex items-center gap-4 mb-4">
                                    <span className="flex items-center gap-1"><Mail size={14} /> {participant.email}</span>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                    <span className="flex items-center gap-1"><Phone size={14} /> {participant.phone}</span>
                                </p>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-slate-700">
                                        Send Message
                                    </button>
                                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-slate-700">
                                        Log Call
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-8 border-l border-white/5 pl-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Study</p>
                                <p className="text-white font-bold mb-4">{participant.study}</p>

                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Enrolled</p>
                                <p className="text-white font-bold">{participant.enrolledDate}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Adherence</p>
                                <p className="text-emerald-400 font-black text-2xl mb-2">{participant.compliance}%</p>

                                <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${participant.compliance}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div>
                <div className="flex gap-2 border-b border-white/5 mb-8 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Panels */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="glass p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Activity size={18} className="text-cyan-400" /> Recent Activity
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { title: "Daily Supplement Log", time: "Today, 9:00 AM", status: "Completed", icon: CheckCircle2, color: "text-emerald-400" },
                                            { title: "Week 2 Symptom Survey", time: "Yesterday, 2:30 PM", status: "Completed", icon: FileText, color: "text-purple-400" },
                                            { title: "Kit Shipment Delivered", time: "Jan 15, 2026", status: "System", icon: Package, color: "text-cyan-400" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5">
                                                <div className={`p-2 rounded-full bg-slate-800 ${item.color}`}>
                                                    <item.icon size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-sm">{item.title}</h4>
                                                    <p className="text-slate-500 text-xs">{item.time}</p>
                                                </div>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 py-1 rounded bg-slate-800">
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="glass p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <AlertCircle size={18} className="text-red-400" /> Outstanding Tasks
                                    </h3>
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        No outstanding tasks.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'eligibility' && (
                        <div className="glass p-8 rounded-2xl border border-white/5">
                            <h3 className="text-white font-bold mb-6">Screening Responses</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {[
                                    { q: "Age", a: "42" },
                                    { q: "BMI", a: "24.5" },
                                    { q: "Smoker", a: "No" },
                                    { q: "Current Medications", a: "None" },
                                    { q: "Pre-existing Conditions", a: "None of the above" },
                                    { q: "Smartphone Access", a: "Yes" },
                                ].map((item, i) => (
                                    <div key={i} className="pb-4 border-b border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.q}</p>
                                        <p className="text-white font-bold">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
