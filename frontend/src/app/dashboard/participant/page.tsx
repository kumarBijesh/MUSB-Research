"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Clock, Award, Bell, ChevronRight, FileText, Calendar, Settings, LogOut } from "lucide-react";

export default function ParticipantDashboard() {
    const [stats, setStats] = useState([
        { label: 'Active Studies', value: '2', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { label: 'Tasks Pending', value: '3', icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Total Rewards', value: '$120', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ]);

    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar / Navigation */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                JD
                            </div>
                            <div>
                                <h3 className="text-white font-bold">John Doe</h3>
                                <p className="text-slate-500 text-xs font-medium">Participant ID: #8291</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {[
                                { name: 'Dashboard', icon: Activity, active: true },
                                { name: 'My Studies', icon: FileText, active: false },
                                { name: 'Schedule', icon: Calendar, active: false },
                                { name: 'Settings', icon: Settings, active: false },
                            ].map((item) => (
                                <button key={item.name} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${item.active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <item.icon size={18} />
                                    {item.name}
                                </button>
                            ))}
                        </nav>

                        <div className="pt-8 mt-8 border-t border-white/5">
                            <Link href="/signin" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
                                <LogOut size={18} />
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tight mb-2">My Dashboard</h1>
                            <p className="text-slate-400 text-sm font-medium">Welcome back! Here's your research overview.</p>
                        </div>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.label} className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity`} />
                                <div className="relative z-10">
                                    <div className={`p-3 rounded-xl w-fit mb-4 ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Items / Tasks */}
                    <div>
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Bell size={18} className="text-cyan-400" /> Pending Tasks
                        </h2>
                        <div className="space-y-4">
                            {[
                                { title: 'Daily Health Log', study: 'NAD+ Longevity Trial', time: 'Due Today', status: 'high' },
                                { title: 'Weekly Sleep Survey', study: 'Circadian Rhythm Study', time: 'Due Tomorrow', status: 'medium' },
                            ].map((task, i) => (
                                <div key={i} className="glass p-5 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center justify-between group hover:border-cyan-500/30 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-12 rounded-full ${task.status === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                                        <div>
                                            <h4 className="text-white font-bold mb-1 group-hover:text-cyan-400 transition-colors">{task.title}</h4>
                                            <p className="text-slate-500 text-xs font-medium">{task.study} • <span className={task.status === 'high' ? 'text-red-400' : 'text-amber-400'}>{task.time}</span></p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Studies List */}
                    <div>
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-cyan-400" /> My Studies
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-cyan-500/20">Active</span>
                                    <div className="text-xs font-bold text-slate-500">Day 12 of 90</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">NAD+ Longevity Trial</h3>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden">
                                    <div className="bg-cyan-400 h-full rounded-full w-[15%]" />
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                    <span>15% Complete</span>
                                    <button className="text-cyan-400 hover:text-white transition-colors">View Details</button>
                                </div>
                            </div>

                            <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-cyan-500/20">Active</span>
                                    <div className="text-xs font-bold text-slate-500">Day 4 of 45</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Circadian Rhythm Study</h3>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden">
                                    <div className="bg-purple-400 h-full rounded-full w-[8%]" />
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                    <span>8% Complete</span>
                                    <button className="text-purple-400 hover:text-white transition-colors">View Details</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
