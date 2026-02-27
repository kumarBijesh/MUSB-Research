"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, CheckCheck, Briefcase, MessageSquare, AlertTriangle, Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AdminAuth } from "@/lib/portal-auth";

type Notification = {
    id: string;
    title: string;
    content: string;
    type: string;
    status: "UNREAD" | "READ";
    studyId?: string;
    createdAt: string;
};

function typeIcon(type: string) {
    switch (type) {
        case "STUDY_INQUIRY": return <Briefcase size={16} className="text-cyan-400 shrink-0 mt-0.5" />;
        case "MESSAGE": return <MessageSquare size={16} className="text-emerald-400 shrink-0 mt-0.5" />;
        case "ADVERSE_EVENT":
        case "AE": return <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />;
        default: return <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />;
    }
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const unread = notifications.filter(n => n.status === "UNREAD").length;

    const fetchNotifications = useCallback(async () => {
        const session = AdminAuth.get();
        if (!session) return;
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/notifications/", {
                headers: { Authorization: `Bearer ${session.token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch {
            // fail silently — bell still works
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30_000); // Poll every 30s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close when clicking outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const markRead = async (id: string) => {
        const session = AdminAuth.get();
        if (!session) return;
        await fetch(`/api/proxy/notifications/${id}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${session.token}` },
        });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "READ" } : n));
    };

    const markAllRead = async () => {
        const session = AdminAuth.get();
        if (!session) return;
        await fetch("/api/proxy/notifications/mark-all-read", {
            method: "PATCH",
            headers: { Authorization: `Bearer ${session.token}` },
        });
        setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                id="notif-bell-btn"
                onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
                className="relative p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800/60"
                title="Notifications"
            >
                <Bell size={20} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#0a0f1e] flex items-center justify-center text-[10px] font-black text-white leading-none px-1">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-3 w-[380px] z-[200] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-cyan-400" />
                            <h3 className="text-[13px] font-black text-white uppercase tracking-widest">Notifications</h3>
                            {unread > 0 && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[11px] font-bold">
                                    {unread} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors font-semibold"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={14} />
                                    All read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 text-slate-600 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell size={32} className="text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm font-semibold">All caught up!</p>
                                <p className="text-slate-600 text-[12px] mt-1">No notifications yet.</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => n.status === "UNREAD" && markRead(n.id)}
                                    className={`group flex gap-3 px-5 py-4 border-b border-slate-800/60 cursor-pointer transition-all hover:bg-slate-800/40 ${n.status === "UNREAD" ? "bg-cyan-500/5" : ""}`}
                                >
                                    {/* Type Icon */}
                                    <div className="mt-0.5">{typeIcon(n.type)}</div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-[13px] font-bold leading-snug ${n.status === "UNREAD" ? "text-white" : "text-slate-300"}`}>
                                                {n.title}
                                            </p>
                                            {n.status === "UNREAD" && (
                                                <span className="shrink-0 w-2 h-2 rounded-full bg-cyan-400 mt-1" />
                                            )}
                                        </div>
                                        <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{n.content}</p>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-[11px] text-slate-600">{timeAgo(n.createdAt)}</span>
                                            {n.type === "STUDY_INQUIRY" && n.studyId && (
                                                <Link
                                                    href={`/admin/studies`}
                                                    onClick={() => setOpen(false)}
                                                    className="flex items-center gap-1 text-[11px] text-cyan-500 hover:text-cyan-300 font-semibold"
                                                >
                                                    Review <ExternalLink size={10} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80">
                            <p className="text-[11px] text-slate-600 text-center">
                                Showing {notifications.length} recent notifications
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
