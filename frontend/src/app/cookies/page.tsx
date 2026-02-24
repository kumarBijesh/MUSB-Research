"use client";

import { Shield, Zap, Info, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CookieSettings() {
    const [perfMode, setPerfMode] = useState("high");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const cookies = document.cookie.split(';');
        const mode = cookies.find(c => c.trim().startsWith('perf-mode='))?.split('=')[1];
        if (mode) setPerfMode(mode);
    }, []);

    const saveSettings = (mode: string) => {
        const cookieSettings = "; path=/; max-age=31536000; SameSite=Lax";
        document.cookie = `perf-mode=${mode}${cookieSettings}`;
        setPerfMode(mode);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        // Refresh to apply changes immediately
        window.location.reload();
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-8 gap-2 transition-colors">
                    <ArrowLeft size={16} />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                </Link>

                <h1 className="text-4xl font-bold text-white mb-4">Performance & Cookie Settings</h1>
                <p className="text-slate-400 mb-12">Adjust how MusB Research loads on your device. We use cookies to remember your preferences and optimize your experience.</p>

                <div className="space-y-6">
                    {/* Performance Mode */}
                    <div className="glass p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="flex items-start gap-6">
                            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                                <Zap className="text-cyan-400" size={24} />
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-white mb-2">Performance Mode</h3>
                                <p className="text-sm text-slate-400 mb-6 font-medium">
                                    High performance enables all animations and high-resolution assets. Low performance (Fast Loading) disables heavy animations to ensure the fastest possible experience on any device.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => saveSettings('high')}
                                        className={`p-4 rounded-2xl border transition-all text-left group ${perfMode === 'high'
                                                ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/50'
                                                : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="font-bold text-white mb-1">Standard (Full Bio-Tech)</div>
                                        <div className="text-[13px] text-slate-500 uppercase tracking-wider">Default Experience</div>
                                    </button>
                                    <button
                                        onClick={() => saveSettings('low')}
                                        className={`p-4 rounded-2xl border transition-all text-left group ${perfMode === 'low'
                                                ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/50'
                                                : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="font-bold text-white mb-1">Fast Loading (Reduced Motion)</div>
                                        <div className="text-[13px] text-slate-500 uppercase tracking-wider">Optimized for low-bandwidth</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Info */}
                    <div className="glass p-8 rounded-3xl border border-white/5">
                        <div className="flex items-start gap-6">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                <Shield className="text-emerald-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Privacy & Compliance</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                    Our use of cookies is strictly limited to improving performance and ensuring session security (HIPAA/GDPR compliant). We do not use third-party tracking cookies or sell your data.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Device Detection Info */}
                    <div className="glass p-8 rounded-3xl border border-white/5">
                        <div className="flex items-start gap-6">
                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                <Info className="text-indigo-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Device Awareness</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                    Our platform automatically adjusts asset quality based on your detected device. You are currently browsing from a <span className="text-cyan-400 font-bold uppercase tracking-wider">device optimized environment</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {saved && (
                    <div className="fixed bottom-10 right-10 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 animate-fade-in-up">
                        <CheckCircle2 size={18} />
                        Settings Saved Successfully
                    </div>
                )}
            </div>
        </div>
    );
}
