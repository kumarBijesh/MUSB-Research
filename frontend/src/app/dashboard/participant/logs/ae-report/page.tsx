"use client";

import { useState } from "react";
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Activity
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ParticipantAuth } from "@/lib/portal-auth";

export default function AEReportPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        description: "",
        severity: "MILD",
        onsetDate: "",
        actionTaken: "NONE",
        relatedToStudy: "POSSIBLE"
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = ParticipantAuth.get()?.token;
            const res = await fetch("/api/proxy/adverse-events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStep(4); // Success step
            }
        } catch (err) {
            console.error("AE submit error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/participant/logs" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-white italic tracking-tight">Report Adverse Event</h1>
                    <p className="text-slate-500 text-sm">Safety reporting portal • HIPAA Compliant</p>
                </div>
            </div>

            <div className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex items-center gap-3 text-amber-500 mb-6 font-bold uppercase tracking-widest text-[13px]">
                            <AlertTriangle size={16} /> Step 1: Event Details
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest italic">What happened?</label>
                            <textarea
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:border-cyan-500 outline-none h-32"
                                placeholder="Describe the symptom, feeling, or medical event in detail..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Onset Date</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            type="date"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:border-cyan-500 outline-none"
                                            onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.description || !formData.onsetDate}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
                        >
                            Continue <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex items-center gap-3 text-red-500 mb-6 font-bold uppercase tracking-widest text-[13px]">
                            <ShieldAlert size={16} /> Step 2: Severity Assessment
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'MILD', label: 'Mild', desc: 'Aware of sign/symptom, but easily tolerated.' },
                                { id: 'MODERATE', label: 'Moderate', desc: 'Discomfort enough to cause interference with normal activity.' },
                                { id: 'SEVERE', label: 'Severe', desc: 'Incapacitating; inability to work or do usual activity.' },
                                { id: 'LIFE_THREATENING', label: 'Life Threatening', desc: 'Immediate risk of death.' }
                            ].map(level => (
                                <button
                                    key={level.id}
                                    onClick={() => setFormData({ ...formData, severity: level.id })}
                                    className={`p-6 rounded-2xl border text-left transition-all ${formData.severity === level.id ? 'bg-red-500/10 border-red-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}
                                >
                                    <h4 className="font-black italic uppercase tracking-widest text-sm mb-1">{level.label}</h4>
                                    <p className="text-[13px] opacity-60">{level.desc}</p>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-900 text-slate-500 font-bold uppercase tracking-widest rounded-xl hover:text-white transition-all">Back</button>
                            <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition-all">Continue</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex items-center gap-3 text-cyan-500 mb-6 font-bold uppercase tracking-widest text-[13px]">
                            <Activity size={16} /> Step 3: Action Taken
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest italic">What action did you take?</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-cyan-500 outline-none appearance-none"
                                onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                            >
                                <option value="NONE">No action taken</option>
                                <option value="OTC">Took over-the-counter medication</option>
                                <option value="DOCTOR">Consulted a doctor</option>
                                <option value="ER">Visited Emergency Room / Hospital</option>
                                <option value="STOPPED">Stopped study product</option>
                            </select>
                        </div>
                        <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-[13px] text-slate-400 italic leading-relaxed">
                            Note: If this is an emergency, please dial your local emergency number (911) immediately before reporting here.
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-900 text-slate-500 font-bold uppercase tracking-widest rounded-xl hover:text-white transition-all">Back</button>
                            <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20">
                                {loading ? "Reporting..." : "Submit Safety Report"}
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <CheckCircle2 className="text-emerald-400" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white italic mb-2">Report Logged</h2>
                        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 font-medium">Your safety report has been transmitted to the Study Medical Monitor. A coordinator may contact you for further details if necessary.</p>
                        <button onClick={() => router.push('/dashboard/participant/logs')} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest rounded-xl text-[13px] transition-all">Return to Logs</button>
                    </div>
                )}
            </div>
        </div>
    );
}
