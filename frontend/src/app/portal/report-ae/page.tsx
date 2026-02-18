"use client";

import { useState } from "react";
import {
    AlertCircle,
    ChevronRight,
    ShieldAlert,
    Clock,
    Activity,
    Send,
    ChevronLeft,
    CheckCircle2,
    Lock
} from "lucide-react";
import Link from "next/link";

type AEState = "form" | "confirm";

export default function AEReportPage() {
    const [state, setState] = useState<AEState>("form");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setState("confirm");
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="glass max-w-xl w-full p-10 rounded-[2.5rem] border border-white/5">
                {state === "form" ? (
                    <div className="space-y-8 animate-fade-in-up">
                        <h1 className="text-2xl font-black text-white italic tracking-tight uppercase">Report Adverse Event</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Please describe any new health changes or side effects you are experiencing.</p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <textarea placeholder="Describe symptoms..." className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500/30 h-32" required />
                            <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2">
                                Submit Formal Report <Send size={14} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="text-center space-y-8 animate-fade-in-up">
                        <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
                        <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Report Submitted</h2>
                        <Link href="/portal" className="w-full block py-5 bg-cyan-600 text-white font-black uppercase tracking-widest rounded-2xl">Return to Portal</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
