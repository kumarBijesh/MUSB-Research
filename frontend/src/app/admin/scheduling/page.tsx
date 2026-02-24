"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    MoreVertical,
    Plus,
    ChevronLeft,
    ChevronRight,
    Phone,
    Video,
    Search,
    Filter
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

export default function AdminSchedulingPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch("/api/proxy/scheduling");
                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data);
                }
            } catch (err) {
                console.error("Fetch appts error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter(appt => isSameDay(new Date(appt.scheduledAt), day));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Scheduling Console</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage participant calls, screenings, and follow-ups.</p>
                </div>
                <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[13px] rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2">
                    <Plus size={16} /> New Appointment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Calendar View */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                        <div className="p-6 bg-slate-900/50 flex justify-between items-center border-b border-white/5">
                            <h2 className="text-xl font-bold text-white italic">{format(currentDate, 'MMMM yyyy')}</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ChevronLeft size={20} /></button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 hover:bg-slate-800 rounded-lg text-[13px] font-bold text-white uppercase tracking-widest">Today</button>
                                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><ChevronRight size={20} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-white/5">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-4 text-center text-[13px] font-black text-slate-500 uppercase tracking-widest italic">{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7">
                            {days.map((day, idx) => {
                                const dayAppts = getAppointmentsForDay(day);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(day)}
                                        className={`min-h-[120px] p-2 border-r border-b border-white/5 cursor-pointer transition-all hover:bg-cyan-500/[0.02] ${isSameDay(day, selectedDate) ? 'bg-cyan-500/[0.05]' : ''}`}
                                    >
                                        <div className={`text-[13px] font-bold mb-2 ml-1 ${isSameDay(day, new Date()) ? 'text-cyan-400' : 'text-slate-500'}`}>
                                            {format(day, 'd')}
                                        </div>
                                        <div className="space-y-1">
                                            {dayAppts.slice(0, 3).map((appt, i) => (
                                                <div key={i} className="px-2 py-1 bg-slate-800/80 rounded text-[13px] font-black text-cyan-500 border border-cyan-500/20 truncate">
                                                    {format(new Date(appt.scheduledAt), 'HH:mm')} {appt.type}
                                                </div>
                                            ))}
                                            {dayAppts.length > 3 && (
                                                <div className="text-[13px] text-slate-600 font-black px-2">+{dayAppts.length - 3} more</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Daily Agenda */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-[2rem] border border-white/5 bg-slate-900/40">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-6 flex items-center gap-2">
                            <Clock className="text-cyan-400" size={14} /> Agenda • {format(selectedDate, 'MMM d')}
                        </h3>

                        <div className="space-y-4">
                            {getAppointmentsForDay(selectedDate).length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-[13px] font-black text-slate-700 uppercase tracking-widest italic">No events scheduled</div>
                                </div>
                            ) : (
                                getAppointmentsForDay(selectedDate).map((appt, i) => (
                                    <div key={i} className="p-4 bg-slate-900/80 border border-white/5 rounded-2xl group hover:border-cyan-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[13px] font-black text-cyan-400 italic">{format(new Date(appt.scheduledAt), 'hh:mm a')}</span>
                                            <span className={`text-[13px] font-black px-2 py-0.5 rounded border italic ${appt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    appt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                }`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-1">{appt.type}</h4>
                                        <div className="flex items-center gap-2 text-[13px] text-slate-500 mb-4">
                                            <User size={12} />
                                            <span>PID-{appt.participantId.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex-1 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 flex justify-center transition-all"><Phone size={14} /></button>
                                            <button className="flex-1 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 flex justify-center transition-all"><Video size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="glass p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.05]">
                        <h3 className="text-white font-black italic uppercase tracking-widest text-[13px] mb-4">Integrations</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <span className="text-[13px] font-bold text-slate-400">Google Calendar</span>
                                <div className="w-8 h-4 bg-emerald-500 rounded-full flex items-center justify-end px-1"><div className="w-2 h-2 bg-white rounded-full" /></div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <span className="text-[13px] font-bold text-slate-400">Microsoft Outlook</span>
                                <div className="w-8 h-4 bg-slate-700 rounded-full flex items-center justify-start px-1"><div className="w-2 h-2 bg-slate-400 rounded-full" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
