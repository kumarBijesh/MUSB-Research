"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Mail, Phone, Hash, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RegisterParticipantPage() {
    const [status, setStatus] = useState("idle"); // idle, submitting, success

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        // Simulate API call
        setTimeout(() => {
            setStatus("success");
        }, 1500);
    };

    if (status === "success") {
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 animate-scale-in">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-black text-white italic tracking-tight mb-4">Registration Successful</h1>
                <p className="text-slate-400 mb-8">
                    The participant has been registered. An invitation email with login credentials has been sent to their inbox.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/admin/participants" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
                        Back to List
                    </Link>
                    <button onClick={() => setStatus("idle")} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
                        Register Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <Link href="/admin/participants" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors font-bold text-xs uppercase tracking-widest">
                <ArrowLeft size={14} /> Back to Participants
            </Link>

            <div className="flex items-start gap-6 mb-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-600/20 shrink-0">
                    <UserPlus size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Register New Participant</h1>
                    <p className="text-slate-400 mt-2">Manually enroll a participant into a protocol. They will receive an email to complete setup.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass border border-white/5 rounded-2xl p-8 space-y-8 animate-fade-in-up">

                {/* Section 1: Identity */}
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Participant Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                            <input required type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:bg-slate-900 outline-none transition-all" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date of Birth</label>
                            <input required type="date" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:bg-slate-900 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Mail size={12} className="text-slate-500" />
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                            </div>
                            <input required type="email" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:bg-slate-900 outline-none transition-all" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Phone size={12} className="text-slate-500" />
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                            </div>
                            <input type="tel" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:bg-slate-900 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                        </div>
                    </div>
                </div>

                {/* Section 2: Study Assignment */}
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Protocol Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Hash size={12} className="text-slate-500" />
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Protocol</label>
                            </div>
                            <select className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:bg-slate-900 outline-none transition-all appearance-none cursor-pointer">
                                <option>Early Detection Lung Cancer Screening (Phase II)</option>
                                <option>NAD+ Longevity Trial</option>
                                <option>Sleep Quality Supplement</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={12} className="text-slate-500" />
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Status</label>
                            </div>
                            <select className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:bg-slate-900 outline-none transition-all appearance-none cursor-pointer">
                                <option value="screening">Screening (Send Screener)</option>
                                <option value="consented">Consented (Manual)</option>
                                <option value="randomized">Randomized / Active</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                    <Link href="/admin/participants" className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {status === "submitting" ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <UserPlus size={16} /> Register Participant
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
