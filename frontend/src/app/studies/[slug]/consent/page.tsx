"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, FileText, PenTool, Loader2, Info } from "lucide-react";
import { studies } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function StudyConsentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();

    const [study, setStudy] = useState<any | null>(null);
    const [signature, setSignature] = useState("");
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<"consent" | "randomizing" | "success">("consent");
    const [armId, setArmId] = useState<string | null>(null);

    useEffect(() => {
        const foundStudy = studies.find(s => s.slug === slug);
        if (foundStudy) setStudy(foundStudy);
    }, [slug]);

    if (status === "loading" || !study) {
        return (
            <div className="min-h-screen bg-[#020617] pt-32 flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-cyan-500" size={32} />
            </div>
        );
    }

    if (status === "unauthenticated") {
        router.push(`/signin?callbackUrl=${window.location.pathname}`);
        return null;
    }

    const handleConsent = async () => {
        if (!isAgreed || !signature) return;

        setIsSubmitting(true);
        try {
            // 1. Submit Consent
            const consentRes = await fetch(`/api/proxy/participants/consent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studyId: study.id,
                    signatureData: signature,
                    ipAddress: "127.0.0.1" // In production, get from server
                })
            });

            if (!consentRes.ok) throw new Error("Failed to save consent");

            setStep("randomizing");

            // 2. Delay for dramatic effect of "Randomizing..."
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Enroll & Randomize
            const enrollRes = await fetch(`/api/proxy/participants/me/enroll`, {
                method: "POST"
            });
            const enrollData = await enrollRes.json();

            if (enrollRes.ok) {
                setArmId(enrollData.armId);
                setStep("success");
            } else {
                throw new Error("Enrollment failed");
            }

        } catch (error) {
            console.error("Consent/Enrollment error:", error);
            alert("Something went wrong. Please try again.");
            setStep("consent");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === "randomizing") {
        return (
            <div className="min-h-screen bg-[#020617] pt-24 pb-20 px-6 flex items-center justify-center">
                <div className="text-center space-y-8 max-w-md animate-pulse">
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-ping" />
                        <div className="relative bg-slate-900 border border-cyan-500/50 w-full h-full rounded-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-cyan-400" size={32} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tight">Assignment in Progress</h2>
                    <p className="text-slate-400">Our balancing engine is assigning you to a study arm to ensure statistical validity...</p>
                </div>
            </div>
        );
    }

    if (step === "success") {
        return (
            <div className="min-h-screen bg-[#020617] pt-24 pb-20 px-6 flex items-center justify-center">
                <div className="max-w-xl w-full text-center space-y-8 animate-fade-in-up">
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto rotate-12 group hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-emerald-500/10">
                        <CheckCircle2 size={48} className="text-emerald-400" />
                    </div>
                    <h2 className="text-4xl font-black text-white italic tracking-tight">Enrollment Complete!</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Welcome to the study. You have been successfully randomized and assigned to
                        <span className="block text-cyan-400 font-black mt-2 text-2xl uppercase tracking-widest bg-cyan-500/10 py-2 rounded-xl border border-cyan-500/20 mt-4">
                            Arm: {armId || "Cohort Alpha"}
                        </span>
                    </p>
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-left">
                            <Info className="text-blue-400 shrink-0" size={20} />
                            <p className="text-[13px] text-slate-400">Your dashboard is now unlocked. Please complete your baseline tasks today to stay on track.</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/participant"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-cyan-600/20 group"
                    >
                        Go to Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10 text-center">
                    <span className="text-purple-400 text-[13px] font-black uppercase tracking-widest mb-2 block">Part 2: Informed Consent</span>
                    <h1 className="text-3xl font-black text-white italic">Confirm Participation</h1>
                    <p className="text-slate-500 mt-2">Study: {study.title}</p>
                </div>

                <div className="glass rounded-[32px] border border-white/5 overflow-hidden flex flex-col h-[70vh] md:h-[600px]">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-cyan-400" />
                            <span className="text-[13px] font-black text-white uppercase tracking-widest">Legal Disclosure v1.02</span>
                        </div>
                        <span className="text-[13px] text-slate-500 font-bold uppercase tracking-widest px-2 py-1 bg-slate-950 rounded border border-white/5">IRB #2938-A</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-300 text-sm leading-relaxed custom-scrollbar">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                            <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-[13px] text-blue-200/80 italic font-medium">Important: Read this entire document carefully before signing. Your participation is voluntary.</p>
                        </div>

                        <section>
                            <h3 className="text-white font-black uppercase tracking-widest text-[13px] mb-3">1. Purpose of Research</h3>
                            <p>You are being asked to participate in a research study titled "{study.title}". The purpose of this study is to evaluate {study.condition} using decentralized clinical methodology and digital tracking.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-black uppercase tracking-widest text-[13px] mb-3">2. Procedures</h3>
                            <p>By consenting, you agree to:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Provide daily health logs via the MusB portal.</li>
                                    <li>Adhere to the assigned study arm protocols.</li>
                                    <li>Complete scheduled surveys and assessments.</li>
                                    <li>Provide biological samples as requested in your study kit.</li>
                                </ul>
                            </p>
                        </section>

                        <section>
                            <h3 className="text-white font-black uppercase tracking-widest text-[13px] mb-3">3. Risks and Benefits</h3>
                            <p>There are minimal physical risks associated with this study. You may experience fatigue or discomfort from self-monitoring. Benefits include closer tracking of your health metrics and contribution to medical science.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-black uppercase tracking-widest text-[13px] mb-3">4. Privacy and HIPAA</h3>
                            <p>We take your privacy seriously. All data is encrypted using field-level encryption. Your identity will be decoupled from your medical results. Direct access to your identifiable health information is restricted to authorized research staff and auditors as required by law (HIPAA).</p>
                        </section>

                        <section>
                            <h3 className="text-white font-black uppercase tracking-widest text-[13px] mb-3">5. Compensation</h3>
                            <p>Upon successful completion of all required tasks and data entry throughout the duration of the study, you will be eligible for a total compensation of {study.compensation}.</p>
                        </section>
                    </div>

                    {/* Footer / Signing */}
                    <div className="p-8 bg-slate-900 border-t border-white/10 space-y-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAgreed ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'}`}>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                />
                                {isAgreed && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-slate-300">I have read, understood, and agree to the terms above.</span>
                        </label>

                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Digital Signature (Type Full Name)</label>
                                <div className="relative">
                                    <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white focus:border-cyan-500 outline-none transition-all font-serif italic text-lg shadow-inner"
                                        placeholder="Your Full Name"
                                        value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleConsent}
                                disabled={!isAgreed || !signature || isSubmitting}
                                className="px-10 py-5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-cyan-600/20 whitespace-nowrap min-w-[200px]"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Sign & Enroll"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
