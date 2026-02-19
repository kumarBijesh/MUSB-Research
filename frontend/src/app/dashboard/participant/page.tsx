"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Clock,
    Award,
    CheckCircle2,
    AlertTriangle,
    PlusCircle,
    ChevronRight,
    FlaskConical,
    HeartPulse,
    Activity,
    Bell,
    CalendarDays,
    Sparkles,
    Target,
    TrendingUp,
    ArrowRight,
    BookOpen,
} from "lucide-react";

// ─── Mock Study Data (shown only if participant is enrolled) ─────────────────
const MOCK_ENROLLED = false; // flip to true once backend wires up enrollment

const todayTasks = [
    { id: 1, title: "Morning Supplement Log", study: "NAD+ Longevity Trial", time: "10:00 AM", status: "overdue" },
    { id: 2, title: "Daily Symptoms Check-in", study: "NAD+ Longevity Trial", time: "8:00 PM", status: "pending" },
    { id: 3, title: "Weekly Energy Survey", study: "NAD+ Longevity Trial", time: "11:59 PM", status: "pending" },
];

const upcomingEvents = [
    { day: "21 Feb", label: "Baseline Blood Panel Due", color: "cyan" },
    { day: "28 Feb", label: "Week 2 Check-in Visit", color: "indigo" },
    { day: "10 Mar", label: "Kit Resupply Shipment", color: "amber" },
];

// ─── Countdown Hook ───────────────────────────────────────────────────────────
function useCountdown(targetDays: number) {
    const [time, setTime] = useState({ days: targetDays, hours: 4, minutes: 30 });
    useEffect(() => {
        const t = setInterval(() => {
            setTime(p => {
                if (p.minutes > 0) return { ...p, minutes: p.minutes - 1 };
                if (p.hours > 0) return { ...p, hours: p.hours - 1, minutes: 59 };
                if (p.days > 0) return { ...p, days: p.days - 1, hours: 23, minutes: 59 };
                return p;
            });
        }, 60000);
        return () => clearInterval(t);
    }, []);
    return time;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ParticipantDashboard() {
    const { data: session } = useSession();
    const time = useCountdown(12);

    const firstName = session?.user?.name?.split(" ")[0] || "there";
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
    });

    // ── NEW USER (not enrolled yet) view ─────────────────────────────────────
    if (!MOCK_ENROLLED) {
        return (
            <div className="space-y-8 animate-fade-in-up">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 border border-white/5 p-10">
                    {/* Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/20 blur-[80px] rounded-full" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                                    <Sparkles size={12} className="text-cyan-400" />
                                    <span className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Welcome</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tight leading-tight">
                                Hello, {firstName}! 👋
                            </h1>
                            <p className="text-slate-400 mt-3 max-w-lg leading-relaxed">
                                Your participant account is active and ready. Browse open studies below or check your email for an enrollment invitation from a study coordinator.
                            </p>
                            <div className="flex items-center gap-4 mt-6">
                                <Link
                                    href="/studies"
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition-all text-sm"
                                >
                                    <FlaskConical size={16} /> Browse Studies
                                </Link>
                                <Link
                                    href="/dashboard/participant/profile"
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-sm border border-white/5"
                                >
                                    Complete Profile <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Stats card */}
                        <div className="flex flex-col gap-4 shrink-0 min-w-[220px]">
                            {[
                                { label: "Account Status", value: "Active", color: "text-emerald-400", dot: "bg-emerald-400" },
                                { label: "Enrolled Studies", value: "0", color: "text-slate-300", dot: "bg-slate-600" },
                                { label: "Tasks Pending", value: "0", color: "text-slate-300", dot: "bg-slate-600" },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between px-5 py-3 bg-slate-900/60 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
                                        <span className="text-xs text-slate-500 font-bold">{s.label}</span>
                                    </div>
                                    <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div>
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { step: "01", icon: BookOpen, title: "Browse & Apply", desc: "Explore open clinical studies and apply for ones that match your health profile.", color: "cyan" },
                            { step: "02", icon: CheckCircle2, title: "Get Screened", desc: "Complete a short eligibility screener. Our team reviews and confirms your enrollment.", color: "indigo" },
                            { step: "03", icon: Award, title: "Participate & Earn", desc: "Complete tasks, log health data, and receive compensation upon study completion.", color: "emerald" },
                        ].map((s) => (
                            <div key={s.step} className="glass border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-10 h-10 rounded-xl bg-${s.color}-500/10 flex items-center justify-center`}>
                                        <s.icon size={20} className={`text-${s.color}-400`} />
                                    </div>
                                    <span className={`text-xs font-black text-${s.color}-400 uppercase tracking-widest`}>Step {s.step}</span>
                                </div>
                                <h3 className="text-white font-bold mb-2">{s.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Open Studies Teaser */}
                <div className="glass border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Open Studies</h2>
                        <Link href="/studies" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                            View All <ChevronRight size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: "Early Detection Lung Cancer Screening", phase: "Phase II", condition: "Oncology", comp: "$850", spots: 113 },
                            { title: "NAD+ Longevity & Metabolic Health Trial", phase: "Phase II", condition: "Longevity", comp: "$600", spots: 47 },
                        ].map((s) => (
                            <div key={s.title} className="p-5 bg-slate-900/50 rounded-xl border border-white/5 hover:border-cyan-500/20 transition-all group">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded">{s.phase}</span>
                                    <span className="text-[10px] font-bold text-slate-500">{s.spots} spots left</span>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{s.title}</h3>
                                <p className="text-xs text-slate-500 mb-4">{s.condition}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-emerald-400 font-black">{s.comp} <span className="text-slate-600 font-normal text-xs">compensation</span></span>
                                    <Link href="/studies" className="text-xs font-bold text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500 px-3 py-1.5 rounded-lg transition-all">
                                        Apply Now →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── ENROLLED VIEW (shown when participant has an active study) ────────────
    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{today}</p>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">
                        Welcome back, {firstName}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Here's your focus for today.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Study Active</span>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Tasks Today", value: "3", sub: "2 pending", icon: CheckCircle2, color: "cyan" },
                    { label: "Adherence", value: "94%", sub: "Last 30 days", icon: TrendingUp, color: "emerald" },
                    { label: "Total Earned", value: "$120", sub: "+$30 this week", icon: Award, color: "amber" },
                    { label: "Days Active", value: "18", sub: "of 56 total", icon: Target, color: "indigo" },
                ].map((kpi) => (
                    <div key={kpi.label} className="glass border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-all">
                        <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-500/10 flex items-center justify-center shrink-0`}>
                            <kpi.icon size={20} className={`text-${kpi.color}-400`} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{kpi.value}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{kpi.label}</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Countdown + Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Countdown */}
                <div className="md:col-span-2 glass border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-3">
                            <Clock size={12} /> Next Milestone
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4">Week 2 Check-in</h3>
                        <div className="flex items-center gap-6">
                            {[
                                { val: time.days, label: "Days" },
                                { val: time.hours, label: "Hours" },
                                { val: time.minutes, label: "Mins" },
                            ].map((t, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center text-3xl font-black text-white mb-1">
                                        {String(t.val).padStart(2, "0")}
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upcoming Schedule */}
                <div className="glass border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        <CalendarDays size={12} /> Upcoming
                    </div>
                    <div className="space-y-3">
                        {upcomingEvents.map((e) => (
                            <div key={e.day} className="flex items-center gap-3">
                                <div className={`text-center w-12 shrink-0`}>
                                    <p className={`text-xs font-black text-${e.color}-400`}>{e.day.split(" ")[0]}</p>
                                    <p className="text-[9px] text-slate-600 uppercase">{e.day.split(" ")[1]}</p>
                                </div>
                                <div className={`flex-1 px-3 py-2 rounded-lg bg-${e.color}-500/5 border border-${e.color}-500/10`}>
                                    <p className="text-xs font-bold text-slate-300">{e.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: PlusCircle, label: "Log Supplement", desc: "Record your daily dose", color: "cyan", href: "/dashboard/participant/logs" },
                    { icon: AlertTriangle, label: "Report Symptom", desc: "Log adverse events", color: "amber", href: "/dashboard/participant/logs" },
                    { icon: HeartPulse, label: "Vitals Check", desc: "Enter today's measurements", color: "rose", href: "/dashboard/participant/logs" },
                    { icon: Activity, label: "PRO Survey", desc: "Outcome questionnaire", color: "indigo", href: "/dashboard/participant/tasks" },
                ].map((a) => (
                    <Link
                        key={a.label}
                        href={a.href}
                        className={`glass p-4 rounded-xl border border-white/5 hover:border-${a.color}-500/30 hover:bg-${a.color}-500/5 transition-all group`}
                    >
                        <div className={`w-9 h-9 rounded-xl bg-${a.color}-500/10 flex items-center justify-center mb-3 group-hover:bg-${a.color}-500 transition-colors`}>
                            <a.icon size={18} className={`text-${a.color}-400 group-hover:text-white transition-colors`} />
                        </div>
                        <p className="text-sm font-bold text-white mb-0.5">{a.label}</p>
                        <p className="text-[11px] text-slate-500">{a.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Today's Tasks */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Bell size={14} className="text-cyan-400" /> Today's Tasks
                    </h2>
                    <Link href="/dashboard/participant/tasks" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                        See All <ChevronRight size={12} />
                    </Link>
                </div>
                <div className="space-y-3">
                    {todayTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`glass p-5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer group ${task.status === "overdue"
                                    ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40"
                                    : "border-white/5 bg-slate-900/30 hover:border-cyan-500/20"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-12 rounded-full shrink-0 ${task.status === "overdue" ? "bg-red-500" : "bg-cyan-400"}`} />
                                <div>
                                    <p className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">{task.title}</p>
                                    <p className="text-slate-500 text-xs mt-0.5">
                                        {task.study} · <span className={task.status === "overdue" ? "text-red-400 font-bold" : ""}>Due by {task.time}</span>
                                    </p>
                                </div>
                            </div>
                            <button className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${task.status === "overdue"
                                    ? "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                                    : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                                }`}>
                                {task.status === "overdue" ? "Complete Now" : "Start Task"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
