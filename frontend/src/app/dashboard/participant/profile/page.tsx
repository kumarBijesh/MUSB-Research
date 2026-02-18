"use client";

import { UserCircle, Mail, Phone, MapPin, Globe, PenSquare } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-white italic tracking-tight">Profile & Preferences</h1>

            <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-cyan-500/20">
                        JD
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">John Doe</h2>
                        <p className="text-slate-400 text-sm font-medium">Participant ID: #8291</p>
                        <div className="flex gap-4 mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <span>Joined Jan 2026</span>
                            <span>•</span>
                            <span>Active in 2 Studies</span>
                        </div>
                    </div>
                    <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider transition-all">
                        <PenSquare size={14} /> Edit Profile
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center gap-4">
                        <div className="p-3 bg-slate-800 text-slate-400 rounded-xl">
                            <Mail size={20} />
                        </div>
                        <div>
                            <div className="text-xs uppercase font-bold text-slate-500 mb-1">Email Address</div>
                            <div className="text-white font-medium">john.doe@example.com</div>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center gap-4">
                        <div className="p-3 bg-slate-800 text-slate-400 rounded-xl">
                            <Phone size={20} />
                        </div>
                        <div>
                            <div className="text-xs uppercase font-bold text-slate-500 mb-1">Phone Number</div>
                            <div className="text-white font-medium">+1 (555) 123-4567</div>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center gap-4">
                        <div className="p-3 bg-slate-800 text-slate-400 rounded-xl">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <div className="text-xs uppercase font-bold text-slate-500 mb-1">Location</div>
                            <div className="text-white font-medium">New York, USA</div>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center gap-4">
                        <div className="p-3 bg-slate-800 text-slate-400 rounded-xl">
                            <Globe size={20} />
                        </div>
                        <div>
                            <div className="text-xs uppercase font-bold text-slate-500 mb-1">Language</div>
                            <div className="text-white font-medium">English (US)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40">
                    <h3 className="font-bold text-white mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                        {['Email Notifications', 'SMS Alerts', 'In-App Reminders'].map((setting) => (
                            <div key={setting} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                <span className="text-slate-300 font-medium text-sm group-hover:text-white transition-colors">{setting}</span>
                                <div className="w-10 h-6 bg-cyan-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40">
                    <h3 className="font-bold text-white mb-4">Privacy & Security</h3>
                    <div className="space-y-4">
                        <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-slate-300 text-sm font-medium hover:text-white flex justify-between items-center group">
                            Change Password <span className="text-slate-500 group-hover:text-cyan-400 text-xs uppercase font-bold tracking-wider">Update</span>
                        </button>
                        <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-slate-300 text-sm font-medium hover:text-white flex justify-between items-center group">
                            Two-Factor Authentication <span className="text-emerald-400 text-xs uppercase font-bold tracking-wider bg-emerald-500/10 px-2 py-1 rounded">Enabled</span>
                        </button>
                        <button className="w-full text-left p-3 rounded-xl hover:bg-red-500/10 transition-all text-red-400 text-sm font-medium hover:text-red-300 border border-transparent hover:border-red-500/20">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
