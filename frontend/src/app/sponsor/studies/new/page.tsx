"use client";

import Link from "next/link";
import { ArrowLeft, FlaskConical, Clock, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export default function NewStudyPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white p-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/sponsor/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div className="glass border border-white/5 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-amber-900/20">
                            <FlaskConical size={40} className="text-amber-400" />
                        </div>

                        <h1 className="text-4xl font-black text-white italic tracking-tight mb-4">Launch a New Study</h1>
                        <p className="text-slate-400 text-lg max-w-lg mb-10 leading-relaxed">
                            Ready to start your next breakthrough? Submitting a new study protocol initiates our rapid review and site activation process.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10 text-left">
                            {[
                                { title: "Protocol Design", desc: "Upload your synopsis or full protocol.", icon: FileText },
                                { title: "Site Selection", desc: "Choose from our pre-vetted site network.", icon: CheckCircle2 },
                                { title: "Regulatory Review", desc: "Integrated IRB/EC submission path.", icon: ShieldCheck },
                                { title: "Fast Activation", desc: "Go to patient 0 in weeks, not months.", icon: Clock },
                            ].map((item) => (
                                <div key={item.title} className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex items-start gap-4">
                                    <div className="p-2 bg-slate-800 rounded-lg text-amber-400 shrink-0">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-xl shadow-amber-600/20 transition-all transform hover:scale-[1.02] uppercase tracking-widest text-sm w-full md:w-auto">
                            Begin Submission Process
                        </button>

                        <p className="text-xs text-slate-600 mt-6 font-medium">
                            Need help? <Link href="/contact" className="text-amber-400 hover:underline">Contact our CRO team</Link> for full-service support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
