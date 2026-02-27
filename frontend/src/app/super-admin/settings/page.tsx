"use client";

import { useEffect, useState } from "react";
import { Settings, Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";

export default function SuperAdminSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    const token = SuperAdminAuth.get()?.token || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const showToast = (msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/settings`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setSettings(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(settings),
            });
            if (res.ok) showToast("Settings saved successfully!");
            else showToast("Failed to save settings.", "err");
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, desc, settingKey, type = "text", placeholder = "" }: {
        label: string; desc?: string; settingKey: string; type?: string; placeholder?: string;
    }) => (
        <div className="py-5 border-b border-white/5 last:border-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                    <p className="text-sm font-bold text-white">{label}</p>
                    {desc && <p className="text-[12px] text-slate-500 mt-0.5">{desc}</p>}
                </div>
                {type === "boolean" ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!settings[settingKey]}
                            onChange={(e) => setSettings((s: any) => ({ ...s, [settingKey]: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                ) : (
                    <input
                        type={type}
                        value={settings[settingKey] || ""}
                        onChange={(e) => setSettings((s: any) => ({ ...s, [settingKey]: e.target.value }))}
                        placeholder={placeholder}
                        className="sm:w-72 bg-slate-900/60 border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl ${toast.type === "ok"
                        ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
                        : "bg-red-900/90 border-red-500/30 text-red-300"
                    }`}>
                    {toast.type === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Settings size={22} className="text-violet-400" /> System Settings
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Global platform configuration managed by Super Admin</p>
                </div>
                <button onClick={fetchSettings} disabled={loading}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-400 rounded-xl transition-all disabled:opacity-50">
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="glass rounded-2xl border border-white/5 p-8">
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* Platform */}
                    <div className="glass rounded-2xl border border-white/5 p-6">
                        <h2 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-1">Platform Configuration</h2>
                        <Field label="Platform Name" desc="Displayed across all portals" settingKey="platformName" placeholder="MUSB Research" />
                        <Field label="Support Email" desc="Sent in system notifications" settingKey="supportEmail" type="email" placeholder="support@musbresearch.com" />
                        <Field label="Max Users" desc="Maximum registered users (0 = unlimited)" settingKey="maxUsers" type="number" placeholder="0" />
                        <Field label="Max Active Studies" desc="Maximum simultaneous active studies" settingKey="maxActiveStudies" type="number" placeholder="50" />
                    </div>

                    {/* Security */}
                    <div className="glass rounded-2xl border border-white/5 p-6">
                        <h2 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-1">Security</h2>
                        <Field label="Enforce 2FA for Admins" desc="Require two-factor auth for all admin roles" settingKey="enforce2FAAdmins" type="boolean" />
                        <Field label="Enforce 2FA for Sponsors" desc="Require two-factor auth for sponsor accounts" settingKey="enforce2FASponsors" type="boolean" />
                        <Field label="Session Timeout (hours)" desc="Idle session auto-logout duration" settingKey="sessionTimeoutHours" type="number" placeholder="8" />
                        <Field label="Max Login Attempts" desc="Lockout threshold before blocking login" settingKey="maxLoginAttempts" type="number" placeholder="5" />
                    </div>

                    {/* Features */}
                    <div className="glass rounded-2xl border border-white/5 p-6">
                        <h2 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-1">Feature Toggles</h2>
                        <Field label="Sponsor Portal" desc="Enable the sponsor inquiry portal" settingKey="featureSponsorPortal" type="boolean" />
                        <Field label="Google OAuth Login" desc="Allow sign-in via Google" settingKey="featureGoogleAuth" type="boolean" />
                        <Field label="Participant Self-Registration" desc="Allow public participant sign-up" settingKey="featureSelfRegistration" type="boolean" />
                        <Field label="Email Notifications" desc="Send automated email alerts" settingKey="featureEmailNotif" type="boolean" />
                        <Field label="Maintenance Mode" desc="Show maintenance page to all users" settingKey="maintenanceMode" type="boolean" />
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-800/30 disabled:opacity-50">
                            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
