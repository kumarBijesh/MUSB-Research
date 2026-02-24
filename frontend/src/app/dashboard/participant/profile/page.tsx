"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { UserCircle, Mail, Phone, MapPin, Globe, PenSquare, ShieldCheck, Bell, Lock, Check, X, Send, ShieldAlert, KeyRound, Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const user = session?.user;

    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        inApp: true,
    });
    const [withdrawing, setWithdrawing] = useState(false);
    const [currentTimezone, setCurrentTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Password Update States
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const handleWithdraw = async () => {
        if (!confirm("Are you sure you want to withdraw from the study? This action is permanent for your current enrollment.")) return;

        setWithdrawing(true);
        try {
            const res = await fetch("/api/proxy/participants/me/withdraw", { method: "POST" });
            if (res.ok) {
                alert("You have successfully withdrawn from the study.");
                window.location.href = "/dashboard/participant";
            }
        } finally {
            setWithdrawing(false);
        }
    };

    const handleSendOtp = async () => {
        if (!user?.email) return;
        setIsSendingOtp(true);
        try {
            const res = await fetch("/api/proxy/auth/verify/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: user.email, type: "EMAIL" })
            });
            if (res.ok) {
                setOtpSent(true);
            } else {
                alert("Failed to send verification code. Please try again.");
            }
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        if (!otp && !confirm("Update password without email verification? It is recommended to verify your email.")) {
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const res = await fetch("/api/proxy/auth/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    code: otp || null
                })
            });
            if (res.ok) {
                alert("Password updated successfully. For security, please log in again if prompted.");
                setIsPasswordModalOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setOtp("");
                setOtpSent(false);
            } else {
                const err = await res.json();
                alert(err.detail || "Failed to update password. Ensure your current password is correct.");
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

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
                            <span className="flex items-center gap-1.5 text-[13px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full">
                                <ShieldCheck size={10} /> Participant
                            </span>
                            <span className="flex items-center gap-1.5 text-[13px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 border border-white/5 px-3 py-1.5 rounded-full">
                                Joined {joinDate}
                            </span>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-bold text-[13px] uppercase tracking-wider transition-all shrink-0 self-start">
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
                                <div className="text-[13px] uppercase font-bold text-slate-500 mb-1">{field.label}</div>
                                <div className={`font-medium truncate text-sm ${field.readonly ? "text-slate-400" : "text-white"}`}>
                                    {field.value}
                                </div>
                            </div>
                            {!field.readonly && (
                                <button className="text-[13px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest shrink-0">
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
                                    <p className="text-[13px] text-slate-500 mt-0.5">{setting.desc}</p>
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
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-slate-300 text-sm font-medium hover:text-white flex justify-between items-center group"
                        >
                            Change Password
                            <span className="text-slate-500 group-hover:text-cyan-400 text-[13px] uppercase font-black tracking-wider">Update →</span>
                        </button>
                        <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-slate-300 text-sm font-medium hover:text-white flex justify-between items-center">
                            Two-Factor Authentication
                            <span className="flex items-center gap-1 text-emerald-400 text-[13px] uppercase font-black bg-emerald-500/10 px-2 py-1 rounded">
                                <Check size={10} /> Enabled
                            </span>
                        </button>
                        <div className="pt-2 border-t border-white/5 mt-2 flex flex-col gap-2">
                            <button
                                onClick={handleWithdraw}
                                disabled={withdrawing}
                                className="w-full text-left p-3 rounded-xl hover:bg-orange-500/10 transition-all text-orange-400 text-sm font-medium hover:text-orange-300 border border-transparent hover:border-orange-500/20 disabled:opacity-50"
                            >
                                {withdrawing ? "Processing..." : "Withdraw from Study"}
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm("GDPR Access Request: Would you like to request a full copy of your personal data? Our data protection officer will process this request within 48 hours.")) {
                                        alert("Request submitted successfully.");
                                    }
                                }}
                                className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-all text-slate-300 text-sm font-medium hover:text-white flex justify-between items-center group"
                            >
                                Request My Data (GDPR)
                                <span className="text-slate-500 group-hover:text-cyan-400 text-[13px] uppercase font-black tracking-wider flex items-center gap-1">
                                    <Globe size={10} /> Request →
                                </span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to PERMANENTLY delete your account and all associated personal data? This action cannot be undone and complies with GDPR 'Right to Erasure'.")) {
                                        setWithdrawing(true);
                                        // Mock delete for demo
                                        setTimeout(() => {
                                            alert("Account deletion request received. You will be logged out and your data purged according to regulatory retention policies.");
                                            window.location.href = "/";
                                        }, 1500);
                                    }
                                }}
                                className="w-full text-left p-3 rounded-xl hover:bg-red-500/10 transition-all text-red-400 text-sm font-medium hover:text-red-300 border border-transparent hover:border-red-500/20"
                            >
                                Delete Account & Personal Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Update Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                    <KeyRound size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Update Password</h3>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Confirm</label>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Verification</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors tracking-[0.5em] text-center font-mono"
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={isSendingOtp || otpSent}
                                            className="px-4 bg-slate-800 hover:bg-slate-700 disabled:bg-emerald-500/20 disabled:text-emerald-400 text-white font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap text-[13px] border border-white/5"
                                        >
                                            {isSendingOtp ? <Loader2 size={14} className="animate-spin" /> : otpSent ? <Check size={14} /> : <Send size={14} />}
                                            {otpSent ? "Sent" : "Verify Code"}
                                        </button>
                                    </div>
                                    <p className="text-[13px] text-slate-600 mt-2 italic px-1">Verification code will be sent to your registered Gmail.</p>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex gap-3">
                                <ShieldAlert size={18} className="text-amber-500 shrink-0" />
                                <p className="text-[13px] text-slate-400 leading-relaxed">
                                    Changing your password will invalidate your current session on other devices. HIPAA policy requires passwords to be updated periodically.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingPassword}
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isUpdatingPassword ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                                Confirm Password Update
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
