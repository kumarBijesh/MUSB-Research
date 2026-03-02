"use client";

import { MessageSquare, Bell, User, Send, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ParticipantAuth } from "@/lib/portal-auth";

export default function MessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const getAuthHeader = () => {
        const token = ParticipantAuth.get()?.token;
        return token ? { Authorization: `Bearer ${token}` } : {};
    };
    const userId = ParticipantAuth.get()?.user?.id || "";

    // Fetch Profile to get Coordinator info
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/proxy/participants/me/profile", { headers: getAuthHeader() });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };
        fetchProfile();
    }, []);

    // Fetch Messages
    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/proxy/messages/", { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                // Map API messages to UI format
                const formatted = data.map((m: any) => ({
                    id: m.id,
                    sender: m.senderId === userId ? "You" : "Coordinator",
                    text: m.content,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: m.senderId === userId ? "sent" : "received"
                })).reverse(); // Oldest first for chat flow
                setMessages(formatted);
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !profile?.coordinatorId || isSending) return;

        setIsSending(true);
        try {
            const res = await fetch("/api/proxy/messages/", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeader() },
                body: JSON.stringify({
                    receiverId: profile.coordinatorId,
                    content: newMessage,
                    studyId: profile.studyId
                })
            });

            if (res.ok) {
                setNewMessage("");
                fetchMessages();
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Communications Hub</h1>
                    <p className="text-slate-500 text-[13px] font-bold uppercase tracking-widest mt-1">End-to-End Encrypted Medical Channel</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[13px] font-black text-emerald-500 uppercase tracking-tighter">HIPAA Compliant</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                {/* Announcements / Sidebar */}
                <div className="hidden lg:flex flex-col gap-4">
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2 uppercase text-[13px] tracking-widest">
                            <Bell size={18} className="text-cyan-400" /> Study Alerts
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 relative group cursor-pointer hover:border-cyan-500/30 transition-colors">
                                <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <div className="text-[13px] text-slate-500 font-black uppercase mb-1">Direct from Sponsor</div>
                                <h4 className="text-white font-bold text-[13px] mb-1">New Protocol Update</h4>
                                <p className="text-slate-400 text-[13px] leading-relaxed">Please review the updated consent form in your documents area.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-3 glass flex flex-col rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/5 bg-slate-950/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 font-black">
                                {profile?.coordinatorName?.charAt(0) || "C"}
                            </div>
                            <div>
                                <h3 className="font-black text-white text-sm uppercase tracking-tight">{profile?.coordinatorName || "Study Coordinator"}</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[13px] text-emerald-500 font-black uppercase tracking-widest">Secure Link Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Current Protocol</p>
                            <p className="text-[13px] font-bold text-cyan-400">{profile?.studyTitle || "Unassigned"}</p>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900/20">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <MessageSquare size={48} className="text-slate-600 mb-4" />
                                <p className="text-[13px] font-black uppercase tracking-widest text-slate-500">Secure Channel Initialized</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.type === 'sent' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.type === 'sent'
                                        ? 'bg-cyan-600 text-white rounded-br-none border border-cyan-400/20'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 px-1">
                                        <span className="text-[13px] font-bold text-slate-600 uppercase italic">{msg.time}</span>
                                        {msg.type === 'sent' && <ShieldCheck size={10} className="text-cyan-500/50" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/5 bg-slate-950/50">
                        <div className="relative">
                            {!profile?.coordinatorId ? (
                                <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4 text-center">
                                    <p className="text-[13px] font-black text-red-400 uppercase tracking-widest">Awaiting Coordinator Assignment</p>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        disabled={isSending}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type a secure message..."
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900 transition-all font-medium text-sm"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isSending || !newMessage.trim()}
                                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${newMessage.trim() && !isSending
                                            ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                            }`}
                                    >
                                        {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
