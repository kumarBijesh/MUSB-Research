"use client";

import { useState, useEffect } from "react";
import { AdminAuth } from "@/lib/portal-auth";
import { MessageCircle, Mail, Calendar, CheckCircle, Clock } from "lucide-react";

interface ContactMessage {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    read: boolean;
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            const token = AdminAuth.get()?.token;
            if (!token) return;

            try {
                const res = await fetch("/api/proxy/messages/contact", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Messages</h1>
                    <p className="text-slate-500 mt-2 font-medium">Inquiries from the public contact form.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : messages.length === 0 ? (
                <div className="glass p-12 rounded-3xl border border-white/5 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <MessageCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Messages Yet</h3>
                    <p className="text-slate-500">When visitors use the contact form, their messages will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="glass p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Sender Info */}
                                <div className="md:w-64 shrink-0 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                            {msg.firstName[0]}{msg.lastName[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">{msg.firstName} {msg.lastName}</h4>
                                            <p className="text-[13px] text-slate-500">{msg.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-slate-500">
                                        <Clock size={12} />
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[13px] font-bold text-cyan-400">
                                            {msg.subject}
                                        </span>
                                        {!msg.read && (
                                            <span className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-widest text-emerald-400">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-300 leading-relaxed text-sm">
                                        {msg.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
