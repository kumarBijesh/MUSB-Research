"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ForgotPasswordPage() {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role") || "PARTICIPANT";

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Steps: 1 = Enter Email, 2 = Enter Code & New Password, 3 = Success
    const [step, setStep] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getReturnLink = () => {
        if (roleParam === "SPONSOR") return "/sponsor/login";
        if (roleParam === "ADMIN") return "/admin/login";
        if (roleParam === "SUPER_ADMIN") return "/super-admin/login";
        return "/signin";
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        try {
            const sendRes = await fetch(`${apiUrl}/api/auth/verify/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: email, type: "EMAIL", purpose: "RESET" }),
            });

            if (!sendRes.ok) {
                const d = await sendRes.json();
                setError(d.detail || "Account not found or failed to send code.");
            } else {
                setStep(2);
            }
        } catch (err) {
            setError("Connection failed. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        try {
            const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword, code }),
            });

            if (!res.ok) {
                const d = await res.json();
                setError(d.detail || "Invalid verification code.");
            } else {
                setStep(3);
            }
        } catch (err) {
            setError("Connection failed. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent relative isolate overflow-hidden flex items-center justify-center py-20 px-6">
            <div className="w-full max-w-md">
                <div className="glass rounded-[2.5rem] border border-white/10 p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <Link href="/" className="inline-flex items-center gap-2 mb-6">
                                <img src="/musb research.png" alt="MUSB Research" className="h-10 w-auto object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                            </Link>
                            <h1 className="text-2xl font-black text-white italic tracking-tight mb-2">
                                {step === 3 ? "Password Reset" : "Forgot Password?"}
                            </h1>
                            <p className="text-slate-400 text-[13px] max-w-[280px] mx-auto leading-relaxed">
                                {step === 1 && "Enter your account email to receive a secure verification code."}
                                {step === 2 && "Enter the verification code sent to your email and your new password."}
                                {step === 3 && "Your password has been successfully updated."}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                <ShieldCheck size={18} className="text-red-400 shrink-0 mt-0.5" />
                                <span className="text-sm text-red-200">{error}</span>
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                            placeholder="you@email.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group overflow-hidden rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                                    <div className="relative flex items-center justify-center gap-2">
                                        {loading ? "Sending..." : "Send Reset Code"}
                                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </div>
                                </button>

                                <div className="text-center mt-6">
                                    <Link href={getReturnLink()} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                                        Return to login
                                    </Link>
                                </div>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Verification Code</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium tracking-[0.2em]"
                                            placeholder="123456"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 mt-4">
                                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group pt-2 overflow-hidden rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                                    <div className="relative flex items-center justify-center gap-2">
                                        {loading ? "Resetting..." : "Reset Password"}
                                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </div>
                                </button>

                                <div className="text-center mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        Use a different email
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                </div>

                                <div>
                                    <Link href={getReturnLink()} className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 transition-all">
                                        Return to Log In
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
