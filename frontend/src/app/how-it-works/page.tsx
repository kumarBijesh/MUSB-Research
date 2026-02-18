"use client";

import { CheckCircle2, FlaskConical, ClipboardCheck, Package, Activity, Award } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
    const steps = [
        {
            icon: ClipboardCheck,
            title: "1. Eligibility Screening",
            description: "Complete a simple 5-minute online questionnaire to see if a study is the right fit for your health profile.",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20"
        },
        {
            icon: FlaskConical,
            title: "2. eConsent & Enrollment",
            description: "Review study details and sign consent forms digitally from the comfort of your home. No travel required.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            icon: Package,
            title: "3. Receive Your Kit",
            description: "We ship a medical-grade kit directly to your door, containing everything you need for the trial.",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            icon: Activity,
            title: "4. Track & Report",
            description: "Use our secure app to log symptoms, vitals, or take supplements as directed by the study protocol.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            icon: Award,
            title: "5. Completion & Rewards",
            description: "Finish the study, receive health insights, and earn compensation for your contribution to science.",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] relative isolate overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full -z-10" />

            <div className="max-w-7xl mx-auto pt-40 pb-20 px-6">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Science from Home.
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed">
                        We've reimagined the clinical trial experience to fit your life, not the other way around.
                        Participate in groundbreaking research without ever stepping foot in a clinic.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent -translate-x-1/2" />

                    <div className="space-y-12 md:space-y-24">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>

                                    {/* Content Side */}
                                    <div className="flex-1 md:w-1/2 md:flex md:justify-center">
                                        <div className={`
                                            glass p-8 rounded-3xl border border-white/5 relative group hover:border-white/10 transition-all duration-500 max-w-lg
                                            ${index % 2 !== 0 ? 'md:text-left' : 'md:text-right'}
                                         `}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <h3 className={`text-2xl font-black text-white mb-4 italic ${step.color}`}>{step.title}</h3>
                                            <p className="text-slate-400 leading-relaxed font-medium">{step.description}</p>
                                        </div>
                                    </div>

                                    {/* Icon Marker (Center) */}
                                    <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl glass border border-white/10 shadow-lg shadow-black/50 shrink-0">
                                        <div className={`absolute inset-0 rounded-2xl ${step.bg} blur-xl opacity-50`} />
                                        <Icon size={32} className={step.color} />
                                    </div>

                                    {/* Empty Side for Balance */}
                                    <div className="flex-1 md:w-1/2" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-32 text-center">
                    <div className="glass inline-block p-12 rounded-[3rem] border border-white/5 bg-gradient-to-b from-slate-900/50 to-slate-950/80">
                        <h2 className="text-4xl font-black text-white mb-6">Ready to shape the future?</h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto">Join thousands of participants already contributing to medical breakthroughs.</p>
                        <Link href="/studies" className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-1 inline-flex items-center gap-2">
                            View Active Studies <CheckCircle2 size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
