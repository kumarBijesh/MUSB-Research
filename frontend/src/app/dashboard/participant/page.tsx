"use client";

import { Activity, Bell, Calendar, ChevronRight, Clock, Award, PlusCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ParticipantDashboard() {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number }>({ days: 12, hours: 4, minutes: 30 });

    useEffect(() => {
        const timer = setInterval(() => {
            // Simplified mock countdown logic
            setTimeLeft(prev => {
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59 };
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
                return prev;
            });
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-8">
            {/* Header with Date */}
            <div className="flex flex-col sm:flex-row justify-between items-end pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight mb-2">My Dashboard</h1>
                    <p className="text-slate-400 text-sm font-medium">Welcome back, John. Here's your focus for today.</p>
                </div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4 sm:mt-0">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
            </div>

            {/* Quick Stats & Countdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Countdown Card */}
                <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40 relative overflow-hidden group col-span-1 md:col-span-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center h-full">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
                                <Clock size={14} /> Next Milestone
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">Week 2 Check-in</h3>
                            <p className="text-slate-400 text-xs font-medium">Due in {timeLeft.days} days</p>
                        </div>
                        <div className="flex gap-4 mt-6 sm:mt-0 text-center">
                            <div>
                                <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Days</div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div>
                                <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Hours</div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div>
                                <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Mins</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rewards Card */}
                <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40 relative overflow-hidden group text-center flex flex-col items-center justify-center">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
                        <Award size={24} />
                    </div>
                    <div className="text-3xl font-black text-white">$120</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Total Earned</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button className="glass p-4 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                            <PlusCircle size={18} />
                        </div>
                        <span className="font-bold text-white text-sm">Log Supplement</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-11">Record your daily dose</p>
                </button>

                <button className="glass p-4 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group text-left">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <AlertTriangle size={18} />
                        </div>
                        <span className="font-bold text-white text-sm">Report Symptom</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-11">Log adverse events or changes</p>
                </button>
            </div>

            {/* Today's Tasks */}
            <div>
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Bell size={18} className="text-cyan-400" /> Today's Tasks
                </h2>
                <div className="space-y-4">
                    {[
                        { title: 'Morning Supplement Log', study: 'NAD+ Longevity Trial', time: 'Due by 10:00 AM', status: 'overdue' },
                        { title: 'Daily Symptoms Check-in', study: 'NAD+ Longevity Trial', time: 'Due by 8:00 PM', status: 'pending' },
                    ].map((task, i) => (
                        <div key={i} className={`glass p-5 rounded-2xl border ${task.status === 'overdue' ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-slate-900/40'} flex items-center justify-between group hover:border-cyan-500/30 transition-all cursor-pointer`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-12 rounded-full ${task.status === 'overdue' ? 'bg-red-500' : 'bg-cyan-400'}`} />
                                <div>
                                    <h4 className="text-white font-bold mb-1 group-hover:text-cyan-400 transition-colors">{task.title}</h4>
                                    <p className="text-slate-500 text-xs font-medium">{task.study} • <span className={task.status === 'overdue' ? 'text-red-400 font-bold' : 'text-slate-400'}>{task.time}</span></p>
                                </div>
                            </div>
                            <button className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${task.status === 'overdue'
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                    : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white'
                                }`}>
                                {task.status === 'overdue' ? 'Complete Now' : 'Start Task'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
