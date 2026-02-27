"use client";

import { useState, useEffect } from "react";
import { ParticipantAuth } from "@/lib/portal-auth";
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
    Loader2,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const todayTasks = [
    { id: 1, title: "Morning Supplement Log", study: "NAD+ Longevity Trial", time: "10:00 AM", status: "overdue", estTime: "2 mins", dueDate: "Today" },
    { id: 2, title: "Daily Symptoms Check-in", study: "NAD+ Longevity Trial", time: "8:00 PM", status: "pending", estTime: "5 mins", dueDate: "Today" },
    { id: 3, title: "Weekly Energy Survey", study: "NAD+ Longevity Trial", time: "11:59 PM", status: "pending", estTime: "15 mins", dueDate: "Feb 23" },
];

const upcomingEvents = [
    { day: "21 Feb", label: "Baseline Blood Panel Due", color: "cyan" },
    { day: "28 Feb", label: "Week 2 Check-in Visit", color: "indigo" },
    { day: "10 Mar", label: "Kit Resupply Shipment", color: "amber" },
];

const supplementSchedule = [
    { id: 'S1', name: 'NAD+ Supplement (Capsule)', dose: '250mg', time: '08:00 AM', taken: true },
    { id: 'S2', name: 'Multivitamin', dose: '1 Tablet', time: '08:00 AM', taken: true },
    { id: 'S3', name: 'NAD+ Supplement (Capsule)', dose: '250mg', time: '02:00 PM', taken: false },
    { id: 'S4', name: 'Omega-3 (Fish Oil)', dose: '1000mg', time: '08:00 PM', taken: false },
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
    const time = useCountdown(12);

    // Read the strictly isolated sessionStorage for this specific tab
    const [participantSession, setParticipantSession] = useState<{ token: string, user: any } | null>(null);
    const [participant, setParticipant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [taskStates, setTaskStates] = useState(todayTasks);
    const [completingId, setCompletingId] = useState<number | null>(null);
    const [isStudyComplete] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(2);

    const notifications = [
        { id: 1, title: "Dr. Sarah Mitchell", role: "COORDINATOR", message: "Your latest blood work results are ready for review. Please check the Documents tab.", time: "10m ago", color: "text-pink-400", bg: "bg-pink-400/10", read: false },
        { id: 2, title: "Lab Support", role: "AUTOMATED", message: "The week 2 bio-kit shipment has been dispatched to your home address.", time: "2h ago", color: "text-cyan-400", bg: "bg-cyan-400/10", read: false },
        { id: 3, title: "Study System", role: "AUTOMATED", message: "Your afternoon supplement log for 'NAD+ Longevity' was saved successfully.", time: "5h ago", color: "text-slate-400", bg: "bg-slate-400/10", read: true },
    ];

    useEffect(() => {
        const pAuth = typeof window !== "undefined" ? ParticipantAuth.get() : null;
        setParticipantSession(pAuth);

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        if (pAuth?.token) {
            fetch("/api/proxy/participants/me/profile", {
                headers: { Authorization: `Bearer ${pAuth.token}` }
            })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) {
                        setParticipant(data);
                        // Automatic Timezone Detection
                        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        if (data.timezone !== browserTz) {
                            fetch("/api/proxy/participants/me/profile", {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${pAuth.token}`
                                },
                                body: JSON.stringify({ timezone: browserTz })
                            }).catch(err => console.error("Timezone sync error:", err));
                        }
                    }
                })
                .catch(err => console.error("Profile fetch error:", err));

            fetch("/api/proxy/tasks/me?status=PENDING", {
                headers: { Authorization: `Bearer ${pAuth.token}` }
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => {
                    if (data && data.length > 0) {
                        setTaskStates(data);
                    }
                })
                .catch(err => console.error("Tasks fetch error:", err));

            setLoading(false);
        } else {
            setLoading(false);
        }

        return () => clearTimeout(timeout);
    }, []);

    const isEnrolled = true;
    const firstName = participantSession?.user?.name?.split(" ")[0] || "Participant";
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500" size={40} />
            </div>
        );
    }

    if (!isEnrolled) {
        return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 border border-white/5 p-10">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-white italic">Hello, {firstName}! 👋</h1>
                        <p className="text-slate-400 mt-3">Welcome to your participant portal.</p>
                        <Link href="/studies" className="mt-6 inline-block px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl">Browse Studies</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleTaskClick = async (id: number) => {
        setCompletingId(id);
        try {
            const res = await fetch(`/api/proxy/tasks/${id}/complete`, { method: "PATCH" });
            if (res.ok) {
                setTaskStates(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
            } else {
                setTaskStates(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
            }
        } catch (err) {
            setTaskStates(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
        } finally {
            setCompletingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest mb-1">{today}</p>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Welcome back, {firstName}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-2.5 transition-all rounded-xl border ${isNotificationsOpen ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "text-slate-500 border-white/5 hover:text-white hover:bg-white/5"}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-cyan-500 rounded-full border-2 border-[#020617] animate-pulse" />
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-[#0a1120]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                        <div>
                                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Medical Alerts</h3>
                                            <p className="text-[13px] text-slate-500 font-bold uppercase mt-1">{unreadCount} New Protocol Messages</p>
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={() => setUnreadCount(0)}
                                                className="text-[11px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors"
                                            >
                                                Dismiss All
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifications.map((n) => (
                                            <div key={n.id} className={`p-6 border-b border-white/5 hover:bg-white/[0.02] transition-all relative ${!n.read ? "bg-cyan-500/[0.02] before:absolute before:left-0 before:top-6 before:bottom-6 before:w-1 before:bg-cyan-500 shadow-[inset_10px_0_20px_-10px_rgba(6,182,212,0.1)]" : ""}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-black text-white uppercase tracking-tight">{n.title}</span>
                                                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black tracking-widest uppercase ${n.bg} ${n.color}`}>
                                                            {n.role}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-600 uppercase italic whitespace-nowrap">{n.time}</span>
                                                </div>
                                                <p className="text-[13px] font-medium text-slate-400 leading-relaxed">
                                                    {n.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-slate-950/80 text-center border-t border-white/5">
                                        <Link
                                            href="/dashboard/participant/messages"
                                            onClick={() => setIsNotificationsOpen(false)}
                                            className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-white transition-colors"
                                        >
                                            Unified Communication Center
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-10 w-px bg-slate-800/50 mx-1" />

                        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/5">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            Live Study Status
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Medication Adherence", value: "94%", icon: TrendingUp, color: "emerald" },
                    { label: "Protocol Earnings", value: "$120", icon: Award, color: "amber" },
                    { label: "Days in Study", value: "18", icon: Target, color: "indigo" },
                    { label: "Pending Tasks", value: taskStates.filter(t => t.status !== 'completed').length, icon: CheckCircle2, color: "cyan" },
                ].map((kpi) => (
                    <div key={kpi.label} className="glass border border-white/5 rounded-2xl p-6 flex items-center gap-5 transition-transform hover:scale-[1.02] cursor-default">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${kpi.color}-500/10 border border-${kpi.color}-500/20 shrink-0`}>
                            <kpi.icon size={22} className={`text-${kpi.color}-400`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-black text-white italic tracking-tight">{kpi.value}</p>
                            <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-0.5 truncate">{kpi.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Bell size={14} className="text-cyan-400" /> Today's Tasks
                    </h2>
                    <div className="relative pl-10 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800/60">
                        {taskStates.map((task) => (
                            <div key={task.id} className="relative glass p-6 rounded-2xl border border-white/5 bg-slate-900/20 flex justify-between items-center transition-all hover:border-cyan-500/20">
                                <div className={`absolute -left-[39px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full border-[3px] border-[#020617] z-10 ${task.status === "completed" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-700"}`} />
                                <div className="min-w-0 pr-4">
                                    <p className="font-bold text-white tracking-tight">{task.title}</p>
                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-1.5 opacity-80">{task.study} <span className="mx-2 opacity-30">|</span> {task.estTime}</p>
                                </div>
                                <button
                                    onClick={() => handleTaskClick(task.id)}
                                    disabled={completingId === task.id || task.status === "completed"}
                                    className={`px-4 py-2 rounded-xl text-[13px] font-black uppercase ${task.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-600 text-white"}`}
                                >
                                    {task.status === "completed" ? "Done" : "Start"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <PlusCircle size={14} className="text-emerald-400" /> Supplements
                    </h2>
                    <div className="glass p-6 rounded-3xl border border-white/5 bg-slate-900/40 space-y-4">
                        {supplementSchedule.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-[13px]">
                                <div>
                                    <p className="font-bold text-white">{item.name}</p>
                                    <p className="text-slate-500">{item.time}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${item.taken ? "bg-emerald-500 border-emerald-400" : "border-slate-700"}`}>
                                    {item.taken && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass p-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.02] relative overflow-hidden">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Activity size={14} className="text-cyan-400" /> Study Insights
                        </h2>
                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-4xl font-black text-white italic">84%</span>
                            <p className="text-emerald-400 font-bold text-[13px] uppercase pb-1">Compliance</p>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                            <div className="h-full bg-cyan-500 w-[84%]" />
                        </div>
                        <Link href="/dashboard/participant/reports" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white font-black uppercase rounded-xl text-[13px] border border-white/5">
                            Full Report <ChevronRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
