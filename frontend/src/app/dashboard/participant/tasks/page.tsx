"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
    Calendar, CheckCircle2, Clock, Lock, Loader2,
    X, Send, Pill, HeartPulse, ClipboardList, Activity, Star
} from "lucide-react";

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

// ── Task Form Component ───────────────────────────────────────────────────────

function TaskForm({
    task,
    onClose,
    onComplete,
}: {
    task: Task;
    onClose: () => void;
    onComplete: (taskId: string, data: Record<string, unknown>) => Promise<boolean>;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    // Form fields – keyed by task type
    const [supplementData, setSupp] = useState({ doseMg: "", brand: "", anyEffects: "", mood: "Good" });
    const [surveyData, setSurvey] = useState({ headache: "None", fatigue: "None", nausea: "None", notes: "" });
    const [vitalsData, setVitals] = useState({ systolic: "", diastolic: "", heartRate: "", weight: "" });
    const [eproData, setEpro] = useState({ energy: "3", sleep: "3", focus: "3", notes: "" });

    const typeKey = task.type?.toLowerCase();

    const buildPayload = (): Record<string, unknown> => {
        if (typeKey === "logs" || typeKey === "supplement") return supplementData;
        if (typeKey === "survey") return surveyData;
        if (typeKey === "vitals") return vitalsData;
        if (typeKey === "epro") return eproData;
        return { notes: "Task completed." };
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const ok = await onComplete(task.id, buildPayload());
        if (ok) setDone(true);
        setSubmitting(false);
    };

    const MOOD_OPTS = ["Poor", "Fair", "Good", "Great", "Excellent"];
    const SYM_OPTS = ["None", "Mild", "Moderate", "Severe"];
    const NUM_SCALE = ["1", "2", "3", "4", "5"];

    if (done) return (
        <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-12 text-center shadow-2xl w-80">
                <CheckCircle2 size={56} className="text-emerald-400 mx-auto mb-4" />
                <h3 className="text-white font-black text-xl italic mb-2">Task Complete!</h3>
                <p className="text-slate-400 text-sm mb-6">Your response has been saved securely.</p>
                <button onClick={onClose} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase tracking-widest text-[13px] transition-all">
                    Close
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-950/50">
                    <div>
                        <p className="text-[12px] font-black text-cyan-500 uppercase tracking-widest mb-1">{task.type} · Task</p>
                        <h2 className="text-white font-black text-lg italic">{task.title}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                    {task.description && (
                        <p className="text-slate-400 text-sm leading-relaxed bg-slate-800/30 rounded-xl p-4 border border-white/5">
                            {task.description}
                        </p>
                    )}

                    {/* ── Supplement / Log form ── */}
                    {(typeKey === "logs" || typeKey === "supplement") && (
                        <>
                            <Field label="Dose (mg)">
                                <input type="number" placeholder="e.g. 500" value={supplementData.doseMg}
                                    onChange={e => setSupp(p => ({ ...p, doseMg: e.target.value }))}
                                    className={inputCls} />
                            </Field>
                            <Field label="Brand / Product">
                                <input type="text" placeholder="e.g. Vitamin C — Nature Made" value={supplementData.brand}
                                    onChange={e => setSupp(p => ({ ...p, brand: e.target.value }))}
                                    className={inputCls} />
                            </Field>
                            <Field label="Any Immediate Effects?">
                                <textarea rows={2} placeholder="e.g. Slight energy boost, no side effects…" value={supplementData.anyEffects}
                                    onChange={e => setSupp(p => ({ ...p, anyEffects: e.target.value }))}
                                    className={`${inputCls} resize-none`} />
                            </Field>
                            <Field label="Overall Mood">
                                <div className="flex gap-2 flex-wrap">
                                    {MOOD_OPTS.map(m => (
                                        <button key={m} onClick={() => setSupp(p => ({ ...p, mood: m }))}
                                            className={`px-4 py-2 rounded-xl text-[13px] font-black border transition-all ${supplementData.mood === m ? "bg-cyan-600 border-cyan-600 text-white" : "bg-slate-800 border-white/5 text-slate-400 hover:text-white"}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </>
                    )}

                    {/* ── Survey form ── */}
                    {typeKey === "survey" && (
                        <>
                            <Field label="Headache Level">
                                <ScaleButtons opts={SYM_OPTS} value={surveyData.headache} onChange={v => setSurvey(p => ({ ...p, headache: v }))} />
                            </Field>
                            <Field label="Fatigue Level">
                                <ScaleButtons opts={SYM_OPTS} value={surveyData.fatigue} onChange={v => setSurvey(p => ({ ...p, fatigue: v }))} />
                            </Field>
                            <Field label="Nausea">
                                <ScaleButtons opts={SYM_OPTS} value={surveyData.nausea} onChange={v => setSurvey(p => ({ ...p, nausea: v }))} />
                            </Field>
                            <Field label="Additional Notes">
                                <textarea rows={3} placeholder="Describe any other symptoms you experienced today…" value={surveyData.notes}
                                    onChange={e => setSurvey(p => ({ ...p, notes: e.target.value }))}
                                    className={`${inputCls} resize-none`} />
                            </Field>
                        </>
                    )}

                    {/* ── Vitals form ── */}
                    {typeKey === "vitals" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Systolic (mmHg)">
                                    <input type="number" placeholder="120" value={vitalsData.systolic}
                                        onChange={e => setVitals(p => ({ ...p, systolic: e.target.value }))}
                                        className={inputCls} />
                                </Field>
                                <Field label="Diastolic (mmHg)">
                                    <input type="number" placeholder="80" value={vitalsData.diastolic}
                                        onChange={e => setVitals(p => ({ ...p, diastolic: e.target.value }))}
                                        className={inputCls} />
                                </Field>
                                <Field label="Heart Rate (bpm)">
                                    <input type="number" placeholder="72" value={vitalsData.heartRate}
                                        onChange={e => setVitals(p => ({ ...p, heartRate: e.target.value }))}
                                        className={inputCls} />
                                </Field>
                                <Field label="Weight (kg)">
                                    <input type="number" placeholder="70" value={vitalsData.weight}
                                        onChange={e => setVitals(p => ({ ...p, weight: e.target.value }))}
                                        className={inputCls} />
                                </Field>
                            </div>
                        </>
                    )}

                    {/* ── ePRO form ── */}
                    {typeKey === "epro" && (
                        <>
                            <Field label="Energy Level (1–5)">
                                <ScaleButtons opts={NUM_SCALE} value={eproData.energy} onChange={v => setEpro(p => ({ ...p, energy: v }))} />
                            </Field>
                            <Field label="Sleep Quality (1–5)">
                                <ScaleButtons opts={NUM_SCALE} value={eproData.sleep} onChange={v => setEpro(p => ({ ...p, sleep: v }))} />
                            </Field>
                            <Field label="Focus & Concentration (1–5)">
                                <ScaleButtons opts={NUM_SCALE} value={eproData.focus} onChange={v => setEpro(p => ({ ...p, focus: v }))} />
                            </Field>
                            <Field label="Notes (optional)">
                                <textarea rows={2} placeholder="Any observations this week…" value={eproData.notes}
                                    onChange={e => setEpro(p => ({ ...p, notes: e.target.value }))}
                                    className={`${inputCls} resize-none`} />
                            </Field>
                        </>
                    )}

                    {/* Generic / unknown type */}
                    {!["logs", "supplement", "survey", "vitals", "epro"].includes(typeKey) && (
                        <p className="text-slate-400 text-sm text-center py-6 italic">
                            Click Submit to confirm completion of this task.
                        </p>
                    )}
                </div>

                <div className="px-8 pb-8 pt-4 border-t border-slate-800 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-[13px] hover:border-slate-500 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[13px] shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {submitting ? "Submitting…" : "Submit & Complete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Small reusable helpers ─────────────────────────────────────────────────────

const inputCls = "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

function ScaleButtons({ opts, value, onChange }: { opts: string[]; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex gap-2 flex-wrap">
            {opts.map(o => (
                <button key={o} onClick={() => onChange(o)}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-black border transition-all ${value === o ? "bg-cyan-600 border-cyan-600 text-white" : "bg-slate-800 border-white/5 text-slate-400 hover:text-white"}`}>
                    {o}
                </button>
            ))}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TasksPage() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const fetchTasks = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/tasks/me");
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    // Submit data log then mark task complete
    const handleComplete = async (taskId: string, formData: Record<string, unknown>): Promise<boolean> => {
        try {
            // 1. Submit the data log
            const task = tasks.find(t => t.id === taskId);
            const logType = mapTaskTypeToLogType(task?.type ?? "");
            await fetch("/api/proxy/logs/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: logType,
                    data: formData,
                    notes: (formData.notes as string) || "",
                    loggedAt: new Date().toISOString(),
                }),
            });

            // 2. Mark task as completed
            const res = await fetch(`/api/proxy/tasks/${taskId}/complete`, { method: "PATCH" });
            if (res.ok) {
                setTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, status: "COMPLETED", completedDate: new Date().toISOString() } : t
                ));
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const mapTaskTypeToLogType = (type: string): string => {
        const t = type.toLowerCase();
        if (t === "logs" || t === "supplement") return "SUPPLEMENT";
        if (t === "survey") return "SYMPTOM";
        if (t === "vitals") return "VITALS";
        if (t === "epro") return "SURVEY";
        return "SURVEY";
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "COMPLETED": return {
                dot: "bg-emerald-400",
                badge: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
                card: "border-white/5 bg-slate-900/40 opacity-70",
            };
            case "OVERDUE": return {
                dot: "bg-red-400",
                badge: "text-red-400 border-red-500/20 bg-red-500/10",
                card: "border-red-500/20 bg-red-500/5",
            };
            default: return {
                dot: "bg-cyan-400 animate-pulse",
                badge: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
                card: "border-cyan-500/20 bg-cyan-500/5 shadow-lg shadow-cyan-500/5",
            };
        }
    };

    const typeIcon = (type: string) => {
        const t = type?.toLowerCase();
        if (t === "vitals") return <HeartPulse size={14} className="inline mr-1" />;
        if (t === "survey" || t === "epro") return <ClipboardList size={14} className="inline mr-1" />;
        if (t === "logs" || t === "supplement") return <Pill size={14} className="inline mr-1" />;
        return <Activity size={14} className="inline mr-1" />;
    };

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
                        You&apos;re not enrolled in a study yet. Once a coordinator enrolls you, your tasks will appear here automatically.
                    </p>
                </div>
            </div>
        );
    }

    const completedCount = tasks.filter(t => t.status === "COMPLETED").length;

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white italic tracking-tight">My Task Timeline</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {tasks.length} tasks · {completedCount} completed
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-[13px] font-bold">
                        <div className="flex items-center gap-1.5 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Completed</div>
                        <div className="flex items-center gap-1.5 text-cyan-400"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Active</div>
                        <div className="flex items-center gap-1.5 text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-600" /> Upcoming</div>
                    </div>
                </div>

                {/* Progress bar */}
                {tasks.length > 0 && (
                    <div className="bg-slate-900/40 rounded-2xl border border-white/5 p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                <span>Study Progress</span>
                                <span className="text-cyan-400">{Math.round((completedCount / tasks.length) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 rounded-full transition-all duration-700"
                                    style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-2xl font-black text-white italic">{completedCount}</span>
                            <span className="text-slate-500 font-black text-sm">/{tasks.length}</span>
                        </div>
                    </div>
                )}

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
                                    <div className={`absolute -left-[39px] w-5 h-5 rounded-full border-4 border-[#020617] ${s.dot}`} />
                                    <div className={`p-6 rounded-2xl border transition-all ${s.card}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[13px] font-black uppercase tracking-widest px-2 py-1 rounded border ${s.badge}`}>
                                                {task.status}
                                            </span>
                                            <span className="text-[13px] font-medium text-slate-500 flex items-center gap-1">
                                                <Calendar size={12} /> Due {due}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-1">{task.title}</h3>
                                        {task.description && <p className="text-sm text-slate-500 mb-3">{task.description}</p>}
                                        <p className="text-[13px] text-slate-600 mb-4">
                                            {typeIcon(task.type)}{task.type} · Estimated 10 mins
                                        </p>

                                        {task.status === "COMPLETED" && (
                                            <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-bold">
                                                <CheckCircle2 size={14} />
                                                Completed {task.completedDate ? new Date(task.completedDate).toLocaleDateString() : ""}
                                            </div>
                                        )}

                                        {(task.status === "PENDING" || task.status === "OVERDUE") && (
                                            <button
                                                onClick={() => setActiveTask(task)}
                                                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 group/btn"
                                            >
                                                <Clock size={16} className="group-hover/btn:animate-spin" />
                                                Start Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Task Form Modal */}
            {activeTask && (
                <TaskForm
                    task={activeTask}
                    onClose={() => setActiveTask(null)}
                    onComplete={handleComplete}
                />
            )}
        </>
    );
}
