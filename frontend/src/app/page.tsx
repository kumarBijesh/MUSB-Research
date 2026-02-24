
import { ArrowRight, Activity, ShieldCheck, Zap, Globe, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="relative isolate">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400 animate-fade-in-up">
                        Accelerating <br /> Medical Discovery
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-3">
                        MUSB Research connects patients, researchers, and biotech leaders in a unified virtual ecosystem.
                        Experience the future of decentralized clinical trials.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4">
                        <Link href="/studies" className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-1">
                            Start Your Journey
                        </Link>
                        <Link href="/about" className="px-8 py-4 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-full font-semibold transition-all backdrop-blur-sm">
                            Explore Innovation
                        </Link>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10" />
            </section>

            {/* Feature Cards */}
            <section className="py-24 px-6 bg-slate-900/20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Globe,
                            title: "Global Reach",
                            desc: "Remote-first trials that reach patients anywhere, regardless of geography."
                        },
                        {
                            icon: ShieldCheck,
                            title: "HIPAA Compliant",
                            desc: "Highest standards of data security and privacy for every participant."
                        },
                        {
                            icon: Zap,
                            title: "Rapid Insights",
                            desc: "Real-time data collection means faster results and accelerated breakthroughs."
                        }
                    ].map((item, i) => (
                        <div key={i} className="glass p-8 rounded-3xl hover:border-cyan-500/50 transition-all group">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <item.icon className="text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Compliance Section */}
            <section className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/[0.02] blur-[120px]" />
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-black text-white italic tracking-tight mb-6 uppercase">Trusted by Global Institutions</h2>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            Our platform is built on the pillars of data integrity and patient safety. We adhere to the world's most stringent regulatory standards to ensure clinical data is secure, anonymous, and actionable.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {['HIPAA', 'GDPR', 'SOC2', '21 CFR Part 11'].map(tag => (
                                <span key={tag} className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-[13px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                    {tag} Compliant
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {[
                            { label: 'Patient Privacy', icon: ShieldCheck, color: 'text-emerald-400' },
                            { label: 'Encrypted Data', icon: Zap, color: 'text-cyan-400' },
                            { label: 'Audit Ready', icon: Activity, color: 'text-indigo-400' }
                        ].map((badge, i) => (
                            <div key={i} className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3 w-32">
                                <badge.icon className={badge.color} size={32} />
                                <span className="text-[13px] font-black text-slate-500 uppercase tracking-tighter text-center">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
