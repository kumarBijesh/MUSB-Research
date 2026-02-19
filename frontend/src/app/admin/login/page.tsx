"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            // Only ADMIN and COORDINATOR can log in here
            allowedRole: "ADMIN,COORDINATOR",
            redirect: false,
        });

        if (result?.error) {
            setError("Access denied. Invalid credentials or insufficient permissions.");
        } else {
            router.push("/admin");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] relative isolate overflow-hidden flex items-center justify-center py-20 px-6">
            {/* Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[130px] rounded-full -z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent -z-10" />

            <div className="w-full max-w-md">
                {/* Security Badge */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest">
                        <ShieldCheck size={14} /> Restricted Access
                    </div>
                </div>

                <div className="glass rounded-[2.5rem] border border-indigo-500/10 p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-black/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <Link href="/" className="inline-flex items-center gap-2 mb-6">
                                <img src="/musb research.png" alt="MUSB Research" className="h-10 w-auto object-contain" />
                            </Link>
                            <h1 className="text-2xl font-black text-white italic tracking-tight mb-2">
                                Admin Console
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Authorized personnel only.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                                        placeholder="admin@musbresearch.com" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                                        placeholder="••••••••••••" />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-red-200 text-xs font-medium">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50">
                                {loading ? 'Authenticating...' : 'Access Console'} <ArrowRight size={18} />
                            </button>
                        </form>

                        <p className="text-center text-slate-600 text-xs mt-8">
                            <ShieldCheck size={12} className="inline mr-1" />
                            All access attempts are logged and monitored.
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6 text-xs text-slate-600">
                    Not an admin?{" "}
                    <Link href="/signin" className="text-cyan-400 hover:text-cyan-300 font-bold">
                        Participant Portal →
                    </Link>
                </p>
            </div>
        </div>
    );
}
