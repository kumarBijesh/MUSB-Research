"use client";

import { useState } from "react";
import {
    Settings as SettingsIcon, Shield, Server, Zap,
    Save, RefreshCw, Loader2, Check, Globe, Cloud, Cpu, Database, Lock
} from "lucide-react";
import { AdminAuth } from "@/lib/portal-auth";

const TABS = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "compliance", label: "Compliance & Security", icon: Shield },
    { id: "automations", label: "Automations", icon: Zap },
    { id: "integrations", label: "API & Infrastructure", icon: Server },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // General settings state
    const [generalSettings, setGeneral] = useState({
        masterStudyId: "MUSB-TECH-2024-XP",
        protocolVersion: "v2.4.1 (Stable)",
        language: "English (US)",
        timezone: "UTC (Coordinated Universal Time)",
    });

    // Compliance toggles
    const [complianceSettings, setCompliance] = useState({
        sessionTimeout: true,
        ipWhitelisting: false,
        encryptionAtRest: true,
        electronicSignature: true,
    });

    // Automation toggles
    const [autoSettings, setAuto] = useState({
        aeAlertEmail: true,
        weeklyReport: false,
        enrollmentNotify: true,
        dataBackup: true,
    });

    const getToken = () => AdminAuth.get()?.token ?? "";

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/proxy/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ generalSettings, complianceSettings, autoSettings }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
        <div
            onClick={onChange}
            className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${value ? "bg-cyan-500" : "bg-slate-800"}`}
        >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${value ? "right-1" : "left-1"}`} />
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
                    <SettingsIcon className="text-slate-400" size={32} /> System <span className="text-slate-400">Configuration</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Fine-tune global trial parameters, security protocols, and integration hooks.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="lg:w-64 flex flex-col gap-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? "bg-white/10 text-white border border-white/10 shadow-lg"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-900/40 rounded-[2rem] border border-white/5 p-8">
                    {/* General */}
                    {activeTab === "general" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Trial Environment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Master Study ID</label>
                                        <input readOnly value={generalSettings.masterStudyId} className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-[13px] font-mono text-cyan-400 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Protocol Version</label>
                                        <input
                                            value={generalSettings.protocolVersion}
                                            onChange={e => setGeneral(p => ({ ...p, protocolVersion: e.target.value }))}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-[13px] text-white outline-none focus:border-cyan-500/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6 pt-8 border-t border-white/5">
                                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Localization</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Default Language</label>
                                        <select
                                            value={generalSettings.language}
                                            onChange={e => setGeneral(p => ({ ...p, language: e.target.value }))}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-[13px] text-white outline-none"
                                        >
                                            <option>English (US)</option>
                                            <option>Spanish (EMEA)</option>
                                            <option>Mandarin (APAC)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Reporting Timezone</label>
                                        <select
                                            value={generalSettings.timezone}
                                            onChange={e => setGeneral(p => ({ ...p, timezone: e.target.value }))}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-[13px] text-white outline-none"
                                        >
                                            <option>UTC (Coordinated Universal Time)</option>
                                            <option>EST (Eastern Standard Time)</option>
                                            <option>PST (Pacific Standard Time)</option>
                                            <option>IST (India Standard Time)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compliance */}
                    {activeTab === "compliance" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Shield className="text-emerald-500" />
                                    <div>
                                        <p className="text-[13px] font-black text-white uppercase italic">Regulatory Guard Enabled</p>
                                        <p className="text-[13px] text-emerald-400 font-bold">HIPAA &amp; GDPR Enforcement Active</p>
                                    </div>
                                </div>
                                <RefreshCw size={18} className="text-emerald-500 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                            </div>
                            <div className="space-y-6">
                                {([
                                    { key: "sessionTimeout", label: "Automatic Session Timeout", desc: "Logs off users after 15 minutes of inactivity." },
                                    { key: "ipWhitelisting", label: "IP Whitelisting", desc: "Restrict console access to known clinic ranges." },
                                    { key: "encryptionAtRest", label: "Data-at-Rest Encryption", desc: "Enforce AES-256 for all PII fields." },
                                    { key: "electronicSignature", label: "Electronic Signature Trail", desc: "Require 2FA for all medical adjudication." },
                                ] as const).map(setting => (
                                    <div key={setting.key} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase italic tracking-tight">{setting.label}</p>
                                            <p className="text-[13px] text-slate-500 font-medium">{setting.desc}</p>
                                        </div>
                                        <Toggle
                                            value={complianceSettings[setting.key]}
                                            onChange={() => setCompliance(p => ({ ...p, [setting.key]: !p[setting.key] }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Automations */}
                    {activeTab === "automations" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Automated Workflows</h3>
                            <div className="space-y-6">
                                {([
                                    { key: "aeAlertEmail", label: "AE Alert Emails", desc: "Email admin on every new adverse event report." },
                                    { key: "weeklyReport", label: "Weekly Summary Report", desc: "Send automated PDF report every Monday 9AM UTC." },
                                    { key: "enrollmentNotify", label: "Enrollment Notifications", desc: "Notify coordinator when study hits enrollment targets." },
                                    { key: "dataBackup", label: "Daily Database Backup", desc: "Automated encrypted backup at 04:00 UTC daily." },
                                ] as const).map(setting => (
                                    <div key={setting.key} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase italic tracking-tight">{setting.label}</p>
                                            <p className="text-[13px] text-slate-500 font-medium">{setting.desc}</p>
                                        </div>
                                        <Toggle
                                            value={autoSettings[setting.key]}
                                            onChange={() => setAuto(p => ({ ...p, [setting.key]: !p[setting.key] }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* API & Integrations */}
                    {activeTab === "integrations" && (
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
                                            <p className={`text-[13px] font-bold uppercase ${integ.status.includes("Connected") || integ.status.includes("Live") ? "text-emerald-400" : "text-slate-500"}`}>
                                                {integ.status} · {integ.uptime}
                                            </p>
                                        </div>
                                        <button className="text-[13px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors">Config</button>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[13px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Lock size={14} /> API Secret Key</h4>
                                    <button className="text-[13px] font-black text-cyan-400 uppercase tracking-widest hover:underline">Regenerate</button>
                                </div>
                                <div className="flex gap-2">
                                    <input type="password" readOnly value="musb_live_sk_8293750293847502938475" className="flex-1 bg-slate-900 border border-white/5 rounded-xl p-3 text-[13px] font-mono text-slate-400 outline-none" />
                                    <button
                                        onClick={() => navigator.clipboard.writeText("musb_live_sk_8293750293847502938475")}
                                        className="px-4 py-2 bg-slate-800 text-white rounded-xl text-[13px] font-black uppercase tracking-widest hover:bg-slate-700"
                                    >Copy</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Bar */}
                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-end gap-3">
                        <button className="px-6 py-3 text-slate-500 hover:text-white text-[13px] font-black uppercase tracking-widest transition-all">
                            Discard Changes
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : <Save size={18} />}
                            {saving ? "Saving…" : saved ? "Saved!" : "Apply Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
