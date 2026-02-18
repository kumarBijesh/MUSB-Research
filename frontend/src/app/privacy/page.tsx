
"use client";

import { ShieldCheck, Lock, Eye, FileText, Server, Globe } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-full mb-6 inline-block border border-emerald-500/20">
                        Trust & Security
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tight mb-6">
                        Privacy & Data Use
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        Your privacy is not just a policy—it's our product. We enforce the strictest standards to ensure your health data remains yours.
                    </p>
                </div>

                {/* Key Principles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                        <Lock className="text-cyan-400 mb-6" size={32} />
                        <h3 className="text-lg font-bold text-white mb-3">End-to-End Encryption</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            All data is encrypted in transit and at rest using AES-256 standards. Only authorized personnel can access anonymized datasets.
                        </p>
                    </div>
                    <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                        <Eye className="text-purple-400 mb-6" size={32} />
                        <h3 className="text-lg font-bold text-white mb-3">Total Transparency</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            You effectively own your data. We will always explicitly ask for consent before sharing any identifiable information with researchers.
                        </p>
                    </div>
                    <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                        <ShieldCheck className="text-emerald-400 mb-6" size={32} />
                        <h3 className="text-lg font-bold text-white mb-3">Compliance First</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Our platform is fully HIPAA and GDPR compliant, ensuring global standards for health data protection are met.
                        </p>
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="space-y-12">
                    <section className="glass p-10 rounded-3xl border border-white/5">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                            <Server className="text-slate-500" /> Data Collection
                        </h2>
                        <div className="space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                We collect information you provide directly to us when you create an account, complete eligibility screeners, or participate in studies. This may include:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-cyan-500">
                                <li>Contact information (name, email, phone number)</li>
                                <li>Demographic data (age, gender, location)</li>
                                <li>Health information (diagnoses, medications, symptoms)</li>
                                <li>Device data (IP address, browser type) for security purposes</li>
                            </ul>
                        </div>
                    </section>

                    <section className="glass p-10 rounded-3xl border border-white/5">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                            <Globe className="text-slate-500" /> Data Usage & Sharing
                        </h2>
                        <div className="space-y-4 text-slate-400 leading-relaxed">
                            <p>
                                We use your data to specifically match you with clinical trials and research studies. <strong className="text-white">We do not sell your personal data to advertisers.</strong>
                            </p>
                            <p>
                                Your data is only shared with:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-cyan-500">
                                <li><strong>Research Sites:</strong> When you explicitly apply for a study.</li>
                                <li><strong>Service Providers:</strong> Who assist with secure hosting and data processing (under strict BAAs).</li>
                                <li><strong>Legal Authorities:</strong> Only when absolutely required by law.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="glass p-10 rounded-3xl border border-white/5">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                            <FileText className="text-slate-500" /> Your Rights
                        </h2>
                        <div className="space-y-4 text-slate-400 leading-relaxed">
                            <p>You have the right to:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {[
                                    "Access your personal data",
                                    "Correct inaccurate data",
                                    "Request deletion of your data",
                                    "Withdraw consent at any time",
                                    "Restrict processing",
                                    "Data portability"
                                ].map((right, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        <span className="text-sm font-bold text-slate-300">{right}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-20 text-center pt-12 border-t border-white/5">
                    <p className="text-slate-500 text-sm mb-4">Last Updated: February 2026</p>
                    <p className="text-slate-400">
                        Have questions about our privacy practices? <Link href="/contact" className="text-cyan-400 hover:text-white transition-colors underline decoration-cyan-500/30 hover:decoration-white">Contact our Data Protection Officer</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
