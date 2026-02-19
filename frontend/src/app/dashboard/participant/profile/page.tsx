"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { UserCircle, Mail, Phone, MapPin, Globe, PenSquare, ShieldCheck, Bell, Lock, Check } from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const user = session?.user;

    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        inApp: true,
    });

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

    const joinDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-black text-white italic tracking-tight">Profile & Preferences</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your personal information and notification settings.</p>
            </div>

            {/* Avatar + Info */}
            <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">

                    {/* Avatar */}
                    {user?.image ? (
                        <img
                            src={user.image}
                            alt={user.name || ""}
                            className="w-24 h-24 rounded-full border-4 border-cyan-500/30 object-cover shadow-xl shadow-cyan-500/10 shrink-0"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-cyan-500/20 shrink-0">
                            {initials}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-white mb-1">{user?.name || "Participant"}</h2>
                        <p className="text-slate-400 text-sm font-medium mb-3">{user?.email}</p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
                                <ShieldCheck size={10} /> Participant
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 border border-white/5 px-3 py-1.5 rounded-full">
                                Joined {joinDate}
                            </span>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 self-start">
                        <PenSquare size={14} /> Edit Profile
                    </button>
                </div>
            </div>

            {/* Contact Info */}
            <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40">
                <h3 className="font-black text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                    <UserCircle size={16} className="text-cyan-400" />
                    Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: Mail, label: "Email Address", value: user?.email || "—", readonly: true },
                        { icon: Phone, label: "Phone Number", value: "+1 (555) 000-0000", readonly: false },
                        { icon: MapPin, label: "Location", value: "Not set", readonly: false },
                        { icon: Globe, label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone, readonly: false },
                    ].map((field) => (
                        <div key={field.label} className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center gap-4">
                            <div className="p-3 bg-slate-800 text-slate-400 rounded-xl shrink-0">
                                <field.icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">{field.label}</div>
                                <div className={`font-medium truncate text-sm ${field.readonly ? "text-slate-400" : "text-white"}`}>
                                    {field.value}
                                </div>
                            </div>
                            {!field.readonly && (
                                <button className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest shrink-0">
                                    Edit
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Settings */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Notifications */}
                <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40">
                    <h3 className="font-black text-white text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Bell size={14} className="text-cyan-400" />
                        Notifications
                    </h3>
                    <div className="space-y-3">
                        {[
                            { key: "email" as const, label: "Email Notifications", desc: "Task reminders & updates" },
                            { key: "sms" as const, label: "SMS Alerts", desc: "Urgent study messages" },
                            { key: "inApp" as const, label: "In-App Reminders", desc: "Dashboard alerts" },
                        ].map((setting) => (
                            <button
                                key={setting.key}
                                onClick={() => setNotifications(p => ({ ...p, [setting.key]: !p[setting.key] }))}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">{setting.label}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{setting.desc}</p>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifications[setting.key] ? "bg-cyan-500" : "bg-slate-700"}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications[setting.key] ? "left-6" : "left-1"}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40">
                    <h3 className="font-black text-white text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Lock size={14} className="text-cyan-400" />
                        Privacy & Security
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-slate-300 text-sm font-medium hover:text-white flex justify-between items-center group">
                            Change Password
                            <span className="text-slate-500 group-hover:text-cyan-400 text-[10px] uppercase font-black tracking-wider">Update →</span>
                        </button>
                        <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-slate-300 text-sm font-medium hover:text-white flex justify-between items-center">
                            Two-Factor Authentication
                            <span className="flex items-center gap-1 text-emerald-400 text-[10px] uppercase font-black bg-emerald-500/10 px-2 py-1 rounded">
                                <Check size={10} /> Enabled
                            </span>
                        </button>
                        <div className="pt-2 border-t border-white/5 mt-2">
                            <button className="w-full text-left p-3 rounded-xl hover:bg-red-500/10 transition-all text-red-400 text-sm font-medium hover:text-red-300 border border-transparent hover:border-red-500/20">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
