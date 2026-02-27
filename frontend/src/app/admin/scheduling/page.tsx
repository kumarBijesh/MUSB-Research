"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Clock, User, Plus, ChevronLeft, ChevronRight,
    Phone, Video, X, Check, Ban, Loader2, RefreshCw, CalendarDays
} from "lucide-react";
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, getDay
} from "date-fns";
import { AdminAuth } from "@/lib/portal-auth";

type Appointment = {
    id: string;
    participantId: string;
    coordinatorId?: string;
    scheduledAt: string;
    type: string;
    status: string;
    notes?: string;
    createdAt: string;
};

const APPT_TYPES = ["Screening Call", "Consent Review", "Follow-up", "Protocol Review", "Baseline Visit", "Final Visit", "Check-in"];

function statusStyle(status: string) {
    if (status === "COMPLETED") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (status === "CANCELLED") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (status === "RESCHEDULED") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
}

export default function AdminSchedulingPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

    // New appointment form state
    const [formData, setFormData] = useState({
        participantId: "",
        type: "Screening Call",
        scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        notes: "",
        status: "SCHEDULED",
    });

    const getToken = () => AdminAuth.get()?.token ?? "";

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/scheduling/", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setAppointments(await res.json());
        } catch (err) {
            console.error("Fetch appts error", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    // Build calendar grid (padded to start on Sunday)
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    const allDays = eachDayOfInterval({ start: calStart, end: calEnd });

    const getAppointmentsForDay = (day: Date) =>
        appointments.filter(a => isSameDay(new Date(a.scheduledAt), day))
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const agendaAppts = getAppointmentsForDay(selectedDate)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    // Create appointment
    const handleCreate = async () => {
        if (!formData.participantId.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/proxy/scheduling/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    participantId: formData.participantId.trim(),
                    type: formData.type,
                    scheduledAt: new Date(formData.scheduledAt).toISOString(),
                    notes: formData.notes || null,
                    status: "SCHEDULED",
                }),
            });
            if (res.ok) {
                await fetchAppointments();
                setShowModal(false);
                setFormData({ participantId: "", type: "Screening Call", scheduledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"), notes: "", status: "SCHEDULED" });
            }
        } finally {
            setSaving(false);
        }
    };

    // Update appointment status
    const updateStatus = async (apptId: string, status: string) => {
        setSaving(true);
        try {
            await fetch(`/api/proxy/scheduling/${apptId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ status }),
            });
            await fetchAppointments();
            setSelectedAppt(prev => prev ? { ...prev, status } : null);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Scheduling Console</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage participant calls, screenings, and follow-ups.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchAppointments}
                        className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[13px] rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> New Appointment
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Calendar */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/50 rounded-[2rem] border border-white/5 overflow-hidden">
                        {/* Month navigation */}
                        <div className="p-6 flex justify-between items-center border-b border-white/5">
                            <h2 className="text-xl font-bold text-white italic">{format(currentDate, 'MMMM yyyy')}</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"><ChevronLeft size={20} /></button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-slate-800 rounded-lg text-[13px] font-bold text-white uppercase tracking-widest transition-all">Today</button>
                                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"><ChevronRight size={20} /></button>
                            </div>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 border-b border-white/5">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="py-4 text-center text-[13px] font-black text-slate-500 uppercase tracking-widest italic">{d}</div>
                            ))}
                        </div>

                        {/* Calendar cells */}
                        <div className="grid grid-cols-7">
                            {allDays.map((day, idx) => {
                                const dayAppts = getAppointmentsForDay(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isToday = isSameDay(day, new Date());
                                const isSelected = isSameDay(day, selectedDate);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(day)}
                                        className={`min-h-[110px] p-2 border-r border-b border-white/5 cursor-pointer transition-all
                                            ${isSelected ? 'bg-cyan-500/[0.07]' : 'hover:bg-slate-800/30'}
                                            ${!isCurrentMonth ? 'opacity-25' : ''}`}
                                    >
                                        <div className={`text-[13px] font-bold mb-2 w-7 h-7 flex items-center justify-center rounded-full
                                            ${isToday ? 'bg-cyan-500 text-white' : 'text-slate-400'}`}>
                                            {format(day, 'd')}
                                        </div>
                                        <div className="space-y-1">
                                            {dayAppts.slice(0, 3).map((appt, i) => (
                                                <div
                                                    key={i}
                                                    onClick={e => { e.stopPropagation(); setSelectedAppt(appt); setSelectedDate(day); }}
                                                    className={`px-2 py-1 rounded text-[11px] font-bold truncate border transition-all hover:brightness-125
                                                        ${appt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            appt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}
                                                >
                                                    {format(new Date(appt.scheduledAt), 'HH:mm')} {appt.type}
                                                </div>
                                            ))}
                                            {dayAppts.length > 3 && (
                                                <div className="text-[11px] text-slate-500 font-bold px-2">+{dayAppts.length - 3} more</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Agenda */}
                    <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-6 flex items-center gap-2">
                            <Clock className="text-cyan-400" size={14} />
                            Agenda • {format(selectedDate, 'MMM d')}
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 size={20} className="text-cyan-500 animate-spin" />
                            </div>
                        ) : agendaAppts.length === 0 ? (
                            <div className="text-center py-12">
                                <CalendarDays size={28} className="text-slate-700 mx-auto mb-3" />
                                <div className="text-[13px] font-black text-slate-700 uppercase tracking-widest italic">No events scheduled</div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {agendaAppts.map((appt, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedAppt(appt)}
                                        className={`p-4 bg-slate-900/80 border rounded-2xl cursor-pointer transition-all hover:border-cyan-500/30
                                            ${selectedAppt?.id === appt.id ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/5'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[13px] font-black text-cyan-400 italic">{format(new Date(appt.scheduledAt), 'hh:mm a')}</span>
                                            <span className={`text-[11px] font-black px-2 py-0.5 rounded border italic ${statusStyle(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1">{appt.type}</h4>
                                        <div className="flex items-center gap-2 text-[12px] text-slate-500">
                                            <User size={11} />
                                            <span>{appt.participantId.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Appointment Actions */}
                    {selectedAppt && (
                        <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-cyan-500/20">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-black italic uppercase tracking-widest text-[13px]">Quick Actions</h3>
                                <button onClick={() => setSelectedAppt(null)} className="text-slate-600 hover:text-white transition-colors"><X size={16} /></button>
                            </div>
                            <p className="text-[13px] text-slate-400 mb-1 font-bold">{selectedAppt.type}</p>
                            <p className="text-[12px] text-slate-600 mb-4">{format(new Date(selectedAppt.scheduledAt), 'MMM d, yyyy • hh:mm a')}</p>

                            <div className="flex gap-2 mb-3">
                                <a
                                    href={`tel:`}
                                    className="flex-1 p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 flex items-center justify-center gap-2 font-bold text-[12px] transition-all"
                                >
                                    <Phone size={14} /> Call
                                </a>
                                <a
                                    href={`#`}
                                    className="flex-1 p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 flex items-center justify-center gap-2 font-bold text-[12px] transition-all"
                                >
                                    <Video size={14} /> Video
                                </a>
                            </div>

                            {selectedAppt.status !== "COMPLETED" && selectedAppt.status !== "CANCELLED" && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => updateStatus(selectedAppt.id, "COMPLETED")}
                                        disabled={saving}
                                        className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        Mark Completed
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedAppt.id, "CANCELLED")}
                                        disabled={saving}
                                        className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Integrations */}
                    <div className="bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.05] p-6 rounded-[2rem] border border-white/5">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-4">Integrations</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <span className="text-[13px] font-bold text-slate-400">Google Calendar</span>
                                <div className="w-8 h-4 bg-emerald-500 rounded-full flex items-center justify-end px-1 cursor-pointer">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <span className="text-[13px] font-bold text-slate-400">Microsoft Outlook</span>
                                <div className="w-8 h-4 bg-slate-700 rounded-full flex items-center justify-start px-1 cursor-pointer">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── New Appointment Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
                            <h2 className="text-white font-black text-lg italic">New Appointment</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-5">
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Participant ID *</label>
                                <input
                                    value={formData.participantId}
                                    onChange={e => setFormData(p => ({ ...p, participantId: e.target.value }))}
                                    placeholder="Paste participant MongoDB ID..."
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Appointment Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                >
                                    {APPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduledAt}
                                    onChange={e => setFormData(p => ({ ...p, scheduledAt: e.target.value }))}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
                                />
                            </div>

                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Notes <span className="text-slate-600">(optional)</span></label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Internal notes..."
                                    rows={3}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 resize-none"
                                />
                            </div>
                        </div>

                        <div className="px-8 pb-8 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-[13px] hover:border-slate-500 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving || !formData.participantId.trim()}
                                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[13px] shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                {saving ? "Saving..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
