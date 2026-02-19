"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Calendar, CheckCircle2, Clock, Lock, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Task {
    id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    availableDate: string;
    dueDate: string;
    completedDate?: string;
}

export default function TasksPage() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            // Tasks require a backend JWT token — currently we store role in session but not the backend JWT.
            // For now we show the no-study state. When backend auth tokens are bridged, this will populate.
            const res = await fetch(`${API_URL}/api/tasks/me`, {
                headers: session?.user ? { "Authorization": `Bearer no-token-yet` } : {},
            });
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            } else {
                // 401/404 means not enrolled yet — show empty state
                setTasks([]);
            }
        } catch {
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleComplete = async (taskId: string) => {
        setCompleting(taskId);
        try {
            const res = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
                method: "PATCH",
            });
            if (res.ok) {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "COMPLETED" } : t));
            }
        } finally {
            setCompleting(null);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "COMPLETED": return { dot: "bg-emerald-400", badge: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", card: "border-white/5 bg-slate-900/40 opacity-70" };
            case "OVERDUE": return { dot: "bg-red-400", badge: "text-red-400 border-red-500/20 bg-red-500/10", card: "border-red-500/20 bg-red-500/5" };
            default: return { dot: "bg-cyan-400 animate-pulse", badge: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10", card: "border-cyan-500/20 bg-cyan-500/5 shadow-lg shadow-cyan-500/5" };
        }
    };

    // ── No study enrolled state ────────────────────────────────────────────────
    if (!loading && tasks.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">My Task Timeline</h1>
                    <p className="text-slate-500 text-sm mt-1">All scheduled tasks for your active study will appear here.</p>
                </div>

                <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-white/5 flex items-center justify-center mb-2">
                        <Lock size={28} className="text-slate-600" />
                    </div>
                    <h2 className="text-xl font-bold text-white">No Tasks Yet</h2>
                    <p className="text-slate-500 text-sm max-w-sm">
                        You're not enrolled in a study yet. Once a coordinator enrolls you, your tasks will appear here automatically.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">My Task Timeline</h1>
                    <p className="text-slate-500 text-sm mt-1">{tasks.length} tasks in your study schedule.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Completed</div>
                    <div className="flex items-center gap-1.5 text-cyan-400"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Active</div>
                    <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-600" /> Upcoming</div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 size={32} className="text-cyan-400 animate-spin" />
                </div>
            ) : (
                <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8 py-2">
                    {tasks.map((task) => {
                        const s = getStatusStyle(task.status);
                        const due = new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                        return (
                            <div key={task.id} className="relative group">
                                {/* Timeline dot */}
                                <div className={`absolute -left-[39px] w-5 h-5 rounded-full border-4 border-[#020617] ${s.dot}`} />

                                <div className={`glass p-6 rounded-2xl border transition-all ${s.card}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${s.badge}`}>
                                            {task.status}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                            <Calendar size={12} /> Due {due}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm text-slate-500 mb-4">{task.description}</p>
                                    )}
                                    <p className="text-xs text-slate-600 mb-4">{task.type} · Estimated 10 mins</p>

                                    {task.status === "COMPLETED" && (
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                            <CheckCircle2 size={14} />
                                            Completed {task.completedDate ? new Date(task.completedDate).toLocaleDateString() : ""}
                                        </div>
                                    )}

                                    {(task.status === "PENDING" || task.status === "OVERDUE") && (
                                        <button
                                            onClick={() => handleComplete(task.id)}
                                            disabled={completing === task.id}
                                            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
                                        >
                                            {completing === task.id ? (
                                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                            ) : (
                                                <><Clock size={16} /> Start Now</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
