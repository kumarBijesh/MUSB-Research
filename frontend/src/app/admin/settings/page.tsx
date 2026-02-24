"use client";

import { useState } from "react";
import {
    Settings as SettingsIcon,
    Shield,
    Globe,
    Bell,
    Server,
    Database,
    Lock,
    Cpu,
    Cloud,
    Zap,
    Save,
    RefreshCw
} from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        { id: "general", label: "General", icon: SettingsIcon },
        { id: "compliance", label: "Compliance & Security", icon: Shield },
        { id: "notifications", label: "Automations", icon: Zap },
        { id: "integrations", label: "API & Infrastructure", icon: Server },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
                    <SettingsIcon className="text-slate-400" size={32} /> System <span className="text-slate-400">Configuration</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Fine-tune global trial parameters, security protocols, and integration hooks.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="lg:w-64 flex flex-col gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? "bg-white/10 text-white border border-white/10 shadow-lg"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 glass rounded-[2rem] border border-white/5 p-8 bg-slate-900/40">
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Trial Environment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Master Study ID</label>
                                        <input type="text" readOnly value="MUSB-TECH-2024-XP" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-[13px] font-mono text-cyan-400 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Protocol Version</label>
                                        <input type="text" defaultValue="v2.4.1 (Stable)" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-[13px] text-white outline-none focus:border-cyan-500/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-8 border-t border-white/5">
                                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Localization</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Default Language</label>
                                        <select className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-[13px] text-white outline-none">
                                            <option>English (US)</option>
                                            <option>Spanish (EMEA)</option>
                                            <option>Mandarin (APAC)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Reporting Timezone</label>
                                        <select className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-[13px] text-white outline-none">
                                            <option>UTC (Coordinated Universal Time)</option>
                                            <option>EST (Eastern Standard Time)</option>
                                            <option>PST (Pacific Standard Time)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'compliance' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Shield className="text-emerald-500" />
                                    <div>
                                        <p className="text-[13px] font-black text-white uppercase italic">Regulatory Guard Enabled</p>
                                        <p className="text-[13px] text-emerald-400 font-bold">HIPAA & GDPR Enforcement Active</p>
                                    </div>
                                </div>
                                <RefreshCw size={18} className="text-emerald-500 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                            </div>

                            <div className="space-y-6">
                                {[
                                    { label: "Automatic Session Timeout", desc: "Logs off users after 15 minutes of inactivity.", status: true },
                                    { label: "IP Whitelisting", desc: "Restrict console access to known clinic ranges.", status: false },
                                    { label: "Data-at-Rest Encryption", desc: "Enforce AES-256 for all PII fields.", status: true },
                                    { label: "Electronic Signature Trail", desc: "Require 2FA for all medical adjudication.", status: true },
                                ].map((setting, i) => (
                                    <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase italic tracking-tight">{setting.label}</p>
                                            <p className="text-[13px] text-slate-500 font-medium">{setting.desc}</p>
                                        </div>
                                        <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${setting.status ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${setting.status ? 'right-1' : 'left-1'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: "ClinicalTrials.gov Sync", icon: Globe, status: "Connected", uptime: "99.9%" },
                                    { name: "Oracle Health Cloud", icon: Cloud, status: "Idle", uptime: "100%" },
                                    { name: "Wearable Telemetry (S3)", icon: Cpu, status: "Live Feed", uptime: "98.4%" },
                                    { name: "EDC Legacy Bridge", icon: Database, status: "Config Required", uptime: "---" },
                                ].map((integ, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors group">
                                        <div className="p-2 rounded-xl bg-slate-900 text-slate-400 group-hover:text-cyan-400 transition-colors">
                                            <integ.icon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-black text-white uppercase tracking-widest">{integ.name}</p>
                                            <p className={`text-[13px] font-bold uppercase ${integ.status.includes('Connected') || integ.status.includes('Live') ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {integ.status} • {integ.uptime}
                                            </p>
                                        </div>
                                        <button className="text-[13px] font-black text-slate-600 hover:text-white uppercase tracking-widest">Config</button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[13px] font-black text-slate-500 uppercase tracking-widest">API Secret Key</h4>
                                    <button className="text-[13px] font-black text-cyan-400 uppercase tracking-widest hover:underline">Regenerate</button>
                                </div>
                                <div className="flex gap-2">
                                    <input type="password" readOnly value="musb_live_sk_8293750293847502938475" className="flex-1 bg-slate-900 border border-white/5 rounded-xl p-3 text-[13px] font-mono text-slate-400 outline-none" />
                                    <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-[13px] font-black uppercase tracking-widest hover:bg-slate-700">Copy</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-end gap-3">
                        <button className="px-6 py-3 text-slate-500 hover:text-white text-[13px] font-black uppercase tracking-widest transition-all">Discard Changes</button>
                        <button className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all flex items-center gap-2">
                            <Save size={18} /> Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
