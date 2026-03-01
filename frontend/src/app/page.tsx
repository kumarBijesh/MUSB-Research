
import { ArrowRight, Activity, ShieldCheck, Zap, Globe, Users } from "lucide-react";
import Link from "next/link";
import Container from "@/components/Container";

export default function Home() {
    return (
        <div className="relative isolate overflow-hidden">
            {/* Hero Section */}
            <section className="pt-32 pb-20 relative min-h-[85vh] md:min-h-screen flex items-center justify-center">
                <Container className="text-center relative z-10 w-full">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400 animate-fade-in-up px-2">
                        Accelerating <br className="hidden sm:block" /> Medical Discovery
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-prose md:max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-3 px-4 sm:px-0">
                        MUSB Research connects patients, researchers, and biotech leaders in a unified virtual ecosystem.
                        Experience the future of decentralized clinical trials.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-4 w-full px-4 sm:px-0">
                        <Link href="/studies" className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-1 text-center justify-center flex items-center">
                            Start Your Journey
                        </Link>
                        <Link href="/about" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-full font-semibold transition-all backdrop-blur-sm text-center justify-center flex items-center">
                            Explore Innovation
                        </Link>
                    </div>
                </Container>

                {/* Decorative elements - hidden on mobile to prevent scaling weirdness */}
                <div className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
                <div className="hidden md:block absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
            </section>

            {/* Feature Cards */}
            <section className="py-20 md:py-24 bg-slate-900/20">
                <Container className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
                        <div key={i} className="glass p-6 md:p-8 rounded-3xl hover:border-cyan-500/50 transition-all group overflow-hidden">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shrink-0">
                                <item.icon className="text-cyan-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 md:mb-4 pr-4">{item.title}</h3>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-prose">{item.desc}</p>
                        </div>
                    ))}
                </Container>
            </section>

            {/* Compliance Section */}
            <section className="py-20 md:py-24 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] md:w-full md:h-full bg-cyan-500/[0.02] blur-[120px] pointer-events-none" />
                <Container className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-xl text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight mb-4 sm:mb-6 uppercase">Trusted by Global Institutions</h2>
                        <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6 sm:mb-8 mx-auto lg:mx-0 max-w-prose">
                            Our platform is built on the pillars of data integrity and patient safety. We adhere to the world's most stringent regulatory standards to ensure clinical data is secure, anonymous, and actionable.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4">
                            {['HIPAA', 'GDPR', 'SOC2', '21 CFR Part 11'].map(tag => (
                                <span key={tag} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 border border-white/10 rounded-xl text-[11px] sm:text-[13px] font-black text-slate-300 uppercase tracking-widest leading-none shrink-0 truncate max-w-full">
                                    {tag} Compliant
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap lg:flex-nowrap justify-center gap-3 sm:gap-4 w-full lg:w-auto">
                        {[
                            { label: 'Patient Privacy', icon: ShieldCheck, color: 'text-emerald-400' },
                            { label: 'Encrypted Data', icon: Zap, color: 'text-cyan-400' },
                            { label: 'Audit Ready', icon: Activity, color: 'text-indigo-400' }
                        ].map((badge, i) => (
                            <div key={i} className="glass p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-2 md:gap-3 w-[140px] md:w-32 shrink-0">
                                <badge.icon className={badge.color} size={32} />
                                <span className="text-[11px] md:text-[13px] font-black text-slate-500 uppercase tracking-tighter text-center leading-tight">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>
        </div>
    );
}
