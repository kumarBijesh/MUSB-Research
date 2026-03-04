"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Mail, Lock, ArrowRight, ShieldCheck, AlertCircle,
    Eye, EyeOff, Fingerprint
} from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";

export default function SuperAdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        setMounted(true);
        // If already authenticated as super admin, redirect
        const sess = SuperAdminAuth.get();
        if (sess && sess.user.role === "SUPER_ADMIN") {
            setIsRedirecting(true);
            router.replace("/super-admin");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            // Step 1: Authenticate with the backend
            const formBody = new URLSearchParams({ username: email, password });
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formBody.toString(),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setError(err.detail || "Access denied. Invalid credentials.");
                setLoading(false);
                return;
            }

            const tokenData = await res.json();
            const role: string = tokenData.role?.toUpperCase() || "";

            // Strict gating — only SUPER_ADMIN role
            if (role !== "SUPER_ADMIN") {
                setError("Access denied. This portal requires Super Administrator privileges.");
                setLoading(false);
                return;
            }

            // Step 2: Fetch full profile
            const meRes = await fetch(`${apiUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            const user = meRes.ok ? await meRes.json() : { id: "", name: email, email, role };

            // Step 3: Save to Super Admin session
            SuperAdminAuth.save(tokenData.access_token, {
                id: user.id || "",
                name: user.name || email,
                email: user.email || email,
                role,
            });

            router.push("/super-admin");
        } catch (err) {
            setError("Connection failed. Please check your network and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        // Initial client-side rendering - show nothing
        return null;
    }

    if (isRedirecting) {
        // Redirecting to dashboard - show nothing
        return null;
    }

    return (
        <div className="min-h-screen bg-transparent relative isolate overflow-hidden flex items-center justify-center py-20 px-6">
            {/* Animated background grid */}
            <div className="absolute inset-0 -z-20"
                style={{
                    backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }}
            />

            {/* Glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 blur-[140px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/8 blur-[120px] rounded-full -z-10" style={{ animationDelay: '1s', animationDuration: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-fuchsia-800/5 blur-[100px] rounded-full -z-10" />

            <div className="w-full max-w-md">
                {/* Security Badge */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-400 text-[12px] font-black uppercase tracking-widest">
                        <Fingerprint size={14} className="animate-pulse" />
                        Super Administrator Access
                    </div>
                </div>

                {/* Card */}
                <div className="relative rounded-[2.5rem] border border-violet-500/20 overflow-hidden shadow-2xl shadow-violet-900/30"
                    style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(2,6,23,0.95) 60%)" }}>
                    {/* Top border gradient */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

                    {/* Corner glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/8 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 p-10">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <Link href="/" className="inline-flex items-center gap-2 mb-6">
                                <img src="/musb research.png" alt="MUSB Research" className="h-10 w-auto object-contain" />
                            </Link>

                            {/* SA Icon */}
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4 shadow-lg shadow-violet-600/20">
                                <ShieldCheck size={28} className="text-violet-400" />
                            </div>

                            <h1 className="text-2xl font-black text-white tracking-tight mb-2">
                                Super Admin Portal
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Highest-privilege system access. All actions are logged.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors">
                                        <Mail size={17} />
                                    </div>
                                    <input
                                        id="sa-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="username"
                                        className="w-full bg-slate-950/80 border border-white/8 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/50 focus:bg-slate-950 transition-all text-sm font-medium"
                                        placeholder="superadmin@musbresearch.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors">
                                        <Lock size={17} />
                                    </div>
                                    <input
                                        id="sa-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        className="w-full bg-slate-950/80 border border-white/8 rounded-xl py-3.5 pl-11 pr-11 text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-500/50 focus:bg-slate-950 transition-all text-sm font-medium"
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-red-300 text-[13px] font-medium">
                                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                id="sa-login-btn"
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white font-black py-4 rounded-xl shadow-xl shadow-violet-800/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[13px] disabled:opacity-60 group"
                            >
                                <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Access Super Admin Portal
                                        <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer note */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-center text-slate-600 text-[12px] flex items-center justify-center gap-1.5">
                                <ShieldCheck size={12} className="text-violet-600" />
                                All access attempts are encrypted, logged, and monitored 24/7.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Links */}
                <div className="text-center mt-6 space-y-2">
                    <p className="text-[12px] text-slate-600">
                        Looking for the Admin Console?{" "}
                        <Link href="/admin/login" className="text-cyan-500 hover:text-cyan-400 font-bold">
                            Admin Login →
                        </Link>
                    </p>
                    <p className="text-[12px] text-slate-700">
                        <Link href="/signin" className="hover:text-slate-500 transition-colors">
                            Participant Portal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
