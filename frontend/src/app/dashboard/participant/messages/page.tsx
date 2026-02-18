"use client";

import { MessageSquare, Bell, User, Send } from "lucide-react";
import { useState } from "react";

export default function MessagesPage() {
    const [messages, setMessages] = useState([
        { id: 1, sender: "Study Coordinator", text: "Welcome to the study! Please complete your baseline survey.", time: "Jan 10, 09:00 AM", type: "received" },
        { id: 2, sender: "You", text: "Thank you! I just submitted it.", time: "Jan 10, 09:30 AM", type: "sent" },
        { id: 3, sender: "Study Coordinator", text: "Great, we received it. Your kit has been shipped.", time: "Jan 11, 10:00 AM", type: "received" },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const handleSend = () => {
        if (!newMessage.trim()) return;
        setMessages([...messages, { id: messages.length + 1, sender: "You", text: newMessage, time: "Just now", type: "sent" }]);
        setNewMessage("");
    };

    return (
        <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
            <h1 className="text-3xl font-black text-white italic tracking-tight">Messages & Updates</h1>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Announcements / Sidebar */}
                <div className="hidden lg:flex flex-col gap-4">
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Bell size={18} className="text-cyan-400" /> Announcements
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 relative">
                                <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <div className="text-xs text-slate-500 font-bold mb-1">Yesterday</div>
                                <h4 className="text-white font-bold text-sm mb-1">New Protocol Update</h4>
                                <p className="text-slate-400 text-xs">Please review the updated consent form in documents.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                                <div className="text-xs text-slate-500 font-bold mb-1">Jan 12</div>
                                <h4 className="text-white font-bold text-sm mb-1">Webinar Reminder</h4>
                                <p className="text-slate-400 text-xs">Join our Q&A session tomorrow at 2 PM EST.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2 glass flex flex-col rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/5 bg-slate-950/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Study Coordinator</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.type === 'sent' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.type === 'sent'
                                        ? 'bg-cyan-600 text-white rounded-br-none'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/5 bg-slate-950/30">
                        <div className="relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-lg transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
