"use client";

import { useState } from "react";
import { ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ConsentPage() {
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="glass max-w-2xl w-full p-10 rounded-[2.5rem] border border-white/5">
                {step === 1 ? (
                    <div className="space-y-8 animate-fade-in-up">
                        <ShieldCheck className="text-cyan-400" size={48} />
                        <h1 className="text-3xl font-black text-white italic tracking-tight">Informed Consent</h1>
                        <p className="text-slate-400 leading-relaxed font-medium">Please review the following document carefully and sign at the bottom to continue your enrollment.</p>
                        <div className="h-64 overflow-y-auto bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-sm text-slate-500 custom-scrollbar">
                            <p className="mb-4">This study aims to evaluate the effects of NAD+ supplementation on cellular longevity...</p>
                            <p>You may withdraw at any time...</p>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full py-5 bg-cyan-600 text-white font-black uppercase tracking-widest rounded-2xl">I Agree & Continue</button>
                    </div>
                ) : (
                    <div className="text-center space-y-8 animate-fade-in-up">
                        <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
                        <h2 className="text-3xl font-black text-white italic tracking-tight">Consent Signed</h2>
                        <Link href="/portal" className="w-full block py-5 bg-cyan-600 text-white font-black uppercase tracking-widest rounded-2xl">Go to Portal</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
