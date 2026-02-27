"use client";

import { useState, useRef } from "react";
import {
    FlaskConical, ChevronRight, ChevronLeft, Check,
    Loader2, Lock, Shield, Phone, FileText, Rocket,
    Building2, User, Mail, MapPin, Calendar, CheckSquare,
    Upload, X, Star, ArrowRight
} from "lucide-react";
import { AdminAuth } from "@/lib/portal-auth";
import { useRouter } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Step = "step1" | "nda" | "nda_confirm" | "nda_sent" | "step2" | "done";

type Step1Data = {
    productName: string;
    productCategory: string;
    stage: string;
    need: string[];
    healthFocus: string;
    timeline: string;
};

type NdaData = {
    choice: "yes" | "no" | "";
    companyName: string;
    signatoryName: string;
    title: string;
    address: string;
};

type Step2Data = {
    studyType: string[];
    targetPopulation: string;
    specificCondition: string;
    ageRange: string;
    budget: string;
    services: string[];
    description: string;
};

// ─── Field helpers ─────────────────────────────────────────────────────────────

const inputCls = "w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors";
const labelCls = "text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className={labelCls}>{label}{required && <span className="text-amber-500 ml-1">*</span>}</label>
            {children}
        </div>
    );
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-2">
            {options.map(o => (
                <label key={o} className="flex items-center gap-3 cursor-pointer group">
                    <div
                        onClick={() => onChange(o)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${value === o ? "border-amber-500 bg-amber-500" : "border-slate-600 group-hover:border-amber-500/50"}`}
                    >
                        {value === o && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{o}</span>
                </label>
            ))}
        </div>
    );
}

function CheckboxGroup({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string[]) => void }) {
    const toggle = (o: string) => {
        onChange(values.includes(o) ? values.filter(x => x !== o) : [...values, o]);
    };
    return (
        <div className="flex flex-col gap-2">
            {options.map(o => (
                <label key={o} className="flex items-center gap-3 cursor-pointer group">
                    <div
                        onClick={() => toggle(o)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${values.includes(o) ? "border-amber-500 bg-amber-500" : "border-slate-600 group-hover:border-amber-500/50"}`}
                    >
                        {values.includes(o) && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{o}</span>
                </label>
            ))}
        </div>
    );
}

function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map(o => (
                <button
                    key={o}
                    type="button"
                    onClick={() => onChange(o)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-black border transition-all ${value === o ? "bg-amber-600 border-amber-600 text-white" : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-amber-500/30"}`}
                >
                    {o}
                </button>
            ))}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function NewStudyInquiryPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("step1");
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    const getToken = () => AdminAuth.get()?.token ?? "";

    const [s1, setS1] = useState<Step1Data>({
        productName: "", productCategory: "", stage: "",
        need: [], healthFocus: "", timeline: "",
    });

    const [nda, setNda] = useState<NdaData>({
        choice: "",
        companyName: "", signatoryName: "", title: "", address: "",
    });

    const [s2, setS2] = useState<Step2Data>({
        studyType: [], targetPopulation: "", specificCondition: "",
        ageRange: "", budget: "", services: [], description: "",
    });

    const step1Valid = s1.productName.trim() && s1.productCategory && s1.stage && s1.need.length > 0 && s1.healthFocus && s1.timeline;
    const ndaValid = nda.choice !== "";
    const ndaFormValid = nda.companyName.trim() && nda.signatoryName.trim() && nda.title.trim() && nda.address.trim();
    const step2Valid = s2.studyType.length > 0 && s2.budget && s2.description.trim().length > 20;

    // ── Submit Step 1 lead + NDA logic ────────────────────────────────────────

    const handleNdaRequest = async () => {
        setSubmitting(true);
        try {
            await fetch("/api/proxy/sponsor/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({
                    step: 1,
                    status: "NDA_REQUESTED",
                    ndaRequested: true,
                    step1: s1,
                    ndaInfo: nda,
                }),
            });
            setStep("nda_sent");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Submit full Step 2 qualified lead ─────────────────────────────────────

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("data", JSON.stringify({
                step: 2,
                status: "QUALIFIED_LEAD",
                ndaRequested: nda.choice === "yes",
                step1: s1,
                step2: s2,
            }));
            if (attachedFile) formData.append("file", attachedFile);

            await fetch("/api/proxy/sponsor/lead", {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            });
            setStep("done");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Stepper header ────────────────────────────────────────────────────────

    const stepperSteps = [
        { id: "step1", label: "Quick Check" },
        { id: "nda", label: "NDA" },
        { id: "step2", label: "Full Details" },
        { id: "done", label: "Confirm" },
    ];
    const stepOrder: Step[] = ["step1", "nda", "nda_confirm", "nda_sent", "step2", "done"];
    const stepIdx = stepperSteps.findIndex(s => s.id === (step === "nda_confirm" || step === "nda_sent" ? "nda" : step));

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 text-slate-500 hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <img src="/musb research.png" alt="MUSB Research" className="h-7 w-auto object-contain" />
                        <div className="w-px h-5 bg-slate-800" />
                        <span className="text-amber-400 text-[13px] font-black uppercase tracking-widest">Study Inquiry</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-slate-600 font-bold uppercase tracking-widest">
                        <Shield size={12} className="text-emerald-500" /> Confidential & Secure
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Progress Stepper */}
                {step !== "done" && step !== "nda_sent" && (
                    <div className="flex items-center gap-0 mb-12">
                        {stepperSteps.map((s, i) => (
                            <div key={s.id} className="flex items-center flex-1 last:flex-none">
                                <div className={`flex items-center gap-2 ${i <= stepIdx ? "text-amber-400" : "text-slate-600"}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[13px] border-2 transition-all ${i < stepIdx ? "bg-amber-500 border-amber-500 text-white" : i === stepIdx ? "border-amber-500 text-amber-400 bg-amber-500/10" : "border-slate-700 text-slate-600"}`}>
                                        {i < stepIdx ? <Check size={14} /> : i + 1}
                                    </div>
                                    <span className="text-[12px] font-black uppercase tracking-widest hidden md:block">{s.label}</span>
                                </div>
                                {i < stepperSteps.length - 1 && (
                                    <div className={`flex-1 h-px mx-4 transition-colors ${i < stepIdx ? "bg-amber-500/50" : "bg-slate-800"}`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── STEP 1: Quick Project Check ──────────────────────────── */}
                {step === "step1" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-10">
                            <div className="text-[12px] font-black text-amber-500 uppercase tracking-widest mb-3">Step 1 of 2 · 60 Seconds</div>
                            <h1 className="text-4xl font-black text-white italic tracking-tight mb-3">
                                Let&apos;s Explore Your<br /><span className="text-amber-400">Study Concept</span>
                            </h1>
                            <p className="text-slate-400 text-base">Tell us a little about your project. Our team will guide the rest.</p>
                        </div>

                        <div className="space-y-10">
                            {/* Section A */}
                            <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-8 space-y-6">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                                    <FlaskConical size={16} className="text-amber-400" /> A — Product Overview
                                </h2>
                                <Field label="Product / Ingredient Name" required>
                                    <input value={s1.productName} onChange={e => setS1(p => ({ ...p, productName: e.target.value }))}
                                        placeholder="e.g. LactoBifidus Pro, NAD+, Curcumin Complex…"
                                        className={inputCls} />
                                </Field>
                                <Field label="Product Category" required>
                                    <PillGroup
                                        options={["Probiotic / Postbiotic", "Nutraceutical", "Botanical", "Functional Food", "Pharmaceutical", "Device", "Other"]}
                                        value={s1.productCategory}
                                        onChange={v => setS1(p => ({ ...p, productCategory: v }))}
                                    />
                                </Field>
                                <Field label="Stage of Development" required>
                                    <RadioGroup
                                        options={["Concept", "Preclinical Complete", "Ready for Clinical", "Marketed Product Seeking Data"]}
                                        value={s1.stage}
                                        onChange={v => setS1(p => ({ ...p, stage: v }))}
                                    />
                                </Field>
                            </div>

                            {/* Section B */}
                            <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-8 space-y-6">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                                    <Star size={16} className="text-cyan-400" /> B — Study Scope
                                </h2>
                                <Field label="What best describes your need?" required>
                                    <CheckboxGroup
                                        options={["New Clinical Study", "Preclinical Validation", "Biomarker / Lab Support", "Biorepository", "Not Sure – Need Guidance"]}
                                        values={s1.need}
                                        onChange={v => setS1(p => ({ ...p, need: v }))}
                                    />
                                </Field>
                                <Field label="Primary Health Focus" required>
                                    <PillGroup
                                        options={["Gut", "Metabolic", "Brain", "Aging", "Women's Health", "Environmental", "Liver / Behavioral", "Other"]}
                                        value={s1.healthFocus}
                                        onChange={v => setS1(p => ({ ...p, healthFocus: v }))}
                                    />
                                </Field>
                                <Field label="Estimated Timeline" required>
                                    <RadioGroup
                                        options={["Immediate (0–3 months)", "3–6 months", "6–12 months", "Exploring Options"]}
                                        value={s1.timeline}
                                        onChange={v => setS1(p => ({ ...p, timeline: v }))}
                                    />
                                </Field>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => step1Valid && setStep("nda")}
                                disabled={!step1Valid}
                                className="flex items-center gap-3 px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[13px]"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── NDA GATE ─────────────────────────────────────────────── */}
                {step === "nda" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
                        <div className="bg-slate-900/60 border border-amber-500/20 rounded-3xl p-10 text-center shadow-2xl shadow-amber-500/5">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                                <Lock size={28} className="text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white italic mb-3">
                                Would You Like an NDA<br />Before Sharing Detailed Information?
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                                We understand that your concept, formulation, or data may be confidential.
                                If you prefer, we can execute a mutual NDA before reviewing detailed project materials.
                            </p>
                            <div className="space-y-3 text-left mb-8">
                                {([
                                    { val: "yes", label: "Yes — Send NDA Before Proceeding", sub: "Our team will send a Mutual NDA within 1–2 business days.", color: "amber" },
                                    { val: "no", label: "No — Continue to Detailed Submission", sub: "Proceed directly to full project qualification.", color: "cyan" },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.val}
                                        onClick={() => setNda(p => ({ ...p, choice: opt.val }))}
                                        className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${nda.choice === opt.val ? `border-${opt.color}-500 bg-${opt.color}-500/10` : "border-slate-700/50 hover:border-slate-600"}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${nda.choice === opt.val ? `border-${opt.color}-500 bg-${opt.color}-500` : "border-slate-600"}`}>
                                            {nda.choice === opt.val && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">{opt.label}</p>
                                            <p className="text-[13px] text-slate-500 mt-0.5">{opt.sub}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep("step1")} className="flex-1 py-3 border border-slate-700 text-slate-400 font-black uppercase tracking-widest text-[13px] rounded-xl hover:border-slate-500 transition-all">
                                    ← Back
                                </button>
                                <button
                                    onClick={() => {
                                        if (!ndaValid) return;
                                        if (nda.choice === "yes") setStep("nda_confirm");
                                        else setStep("step2");
                                    }}
                                    disabled={!ndaValid}
                                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[13px] rounded-xl transition-all disabled:opacity-40"
                                >
                                    {nda.choice === "yes" ? "Request NDA →" : "Continue to Step 2 →"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── NDA: Company Details Form ─────────────────────────────── */}
                {step === "nda_confirm" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-amber-400 font-black text-[13px] uppercase tracking-widest mb-3">
                                <Lock size={14} /> NDA Request
                            </div>
                            <h2 className="text-3xl font-black text-white italic mb-2">Confirm Your Details</h2>
                            <p className="text-slate-400 text-sm">We&apos;ll prepare a Mutual NDA using the information below.</p>
                        </div>
                        <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Legal Name of Company" required>
                                    <input value={nda.companyName} onChange={e => setNda(p => ({ ...p, companyName: e.target.value }))}
                                        placeholder="BioGen Pharma Inc." className={inputCls} />
                                </Field>
                                <Field label="Authorized Signatory Name" required>
                                    <input value={nda.signatoryName} onChange={e => setNda(p => ({ ...p, signatoryName: e.target.value }))}
                                        placeholder="Dr. James Wilson" className={inputCls} />
                                </Field>
                                <Field label="Title / Role" required>
                                    <input value={nda.title} onChange={e => setNda(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Chief Scientific Officer" className={inputCls} />
                                </Field>
                                <Field label="Corporate Address" required>
                                    <input value={nda.address} onChange={e => setNda(p => ({ ...p, address: e.target.value }))}
                                        placeholder="123 Innovation Drive, Boston MA" className={inputCls} />
                                </Field>
                            </div>
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-sm text-slate-400">
                                <p className="font-bold text-amber-400 mb-1 flex items-center gap-2"><Shield size={14} /> What happens next?</p>
                                Our team will review your details and send a Mutual NDA to your email within <strong className="text-white">1–2 business days</strong>.
                                Once executed, your Step 2 form will be unlocked for full project submission.
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setStep("nda")} className="flex-1 py-3 border border-slate-700 text-slate-400 font-black uppercase tracking-widest text-[13px] rounded-xl hover:border-slate-500 transition-all">
                                ← Back
                            </button>
                            <button
                                onClick={handleNdaRequest}
                                disabled={!ndaFormValid || submitting}
                                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[13px] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                {submitting ? "Sending…" : "Request NDA"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── NDA: Sent Confirmation ────────────────────────────────── */}
                {step === "nda_sent" && (
                    <div className="max-w-lg mx-auto text-center py-12 animate-in fade-in duration-500">
                        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                            <Check size={36} className="text-amber-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white italic mb-3">NDA Request Submitted</h2>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            Thank you. Our team will send a <strong className="text-white">Mutual NDA</strong> within 1–2 business days.
                            Once executed, you may proceed with your detailed study submission.
                        </p>
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 mb-8 text-left space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-slate-300">Lead status: <strong className="text-amber-400">NDA Requested</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-slate-600" />
                                <span className="text-slate-500">Step 2 locked until NDA is executed</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-slate-600" />
                                <span className="text-slate-500">Internal legal alert sent to MUSB team</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <a
                                href="https://calendly.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-black uppercase tracking-widest text-[13px] rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                <Phone size={16} /> Schedule Intro Call (Non-confidential)
                            </a>
                            <button
                                onClick={() => router.push("/sponsor/dashboard")}
                                className="w-full py-4 text-slate-500 font-black uppercase tracking-widest text-[13px] hover:text-white transition-colors"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Full Project Details ─────────────────────────── */}
                {step === "step2" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-10">
                            <div className="text-[12px] font-black text-amber-500 uppercase tracking-widest mb-3">Step 2 of 2 · Full Qualification</div>
                            <h1 className="text-4xl font-black text-white italic tracking-tight mb-3">
                                Tell Us More About<br /><span className="text-amber-400">Your Study</span>
                            </h1>
                            <p className="text-slate-400 text-base">Help us understand the scope so we can build the right team and proposal.</p>
                        </div>

                        <div className="space-y-8">
                            {/* Product re-confirmation */}
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
                                <FlaskConical size={20} className="text-amber-400 shrink-0" />
                                <div>
                                    <p className="text-[13px] font-black text-white">{s1.productName} · {s1.productCategory}</p>
                                    <p className="text-[12px] text-slate-500">{s1.stage} · {s1.healthFocus} focus · {s1.timeline}</p>
                                </div>
                                <button onClick={() => setStep("step1")} className="ml-auto text-[12px] text-amber-400 hover:underline font-black uppercase tracking-widest shrink-0">Edit</button>
                            </div>

                            {/* Section B */}
                            <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-8 space-y-6">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">B — Study Scope</h2>
                                <Field label="Study Type Needed" required>
                                    <CheckboxGroup
                                        options={["Pilot Study", "Randomized Controlled Trial", "Mechanistic Study", "Observational", "Not Sure"]}
                                        values={s2.studyType}
                                        onChange={v => setS2(p => ({ ...p, studyType: v }))}
                                    />
                                </Field>
                                <Field label="Target Population" required>
                                    <RadioGroup
                                        options={["Healthy Adults", "Specific Condition (see below)", "Mixed / TBD"]}
                                        value={s2.targetPopulation}
                                        onChange={v => setS2(p => ({ ...p, targetPopulation: v }))}
                                    />
                                    {s2.targetPopulation === "Specific Condition (see below)" && (
                                        <input value={s2.specificCondition} onChange={e => setS2(p => ({ ...p, specificCondition: e.target.value }))}
                                            placeholder="e.g. IBS, Type 2 Diabetes, Post-menopausal women…"
                                            className={`${inputCls} mt-3`} />
                                    )}
                                </Field>
                                <Field label="Age Range">
                                    <input value={s2.ageRange} onChange={e => setS2(p => ({ ...p, ageRange: e.target.value }))}
                                        placeholder="e.g. 30–65 years" className={inputCls} />
                                </Field>
                                <Field label="Estimated Budget Range" required>
                                    <RadioGroup
                                        options={["<$100K", "$100K–$250K", "$250K–$500K", "$500K+", "Prefer to Discuss"]}
                                        value={s2.budget}
                                        onChange={v => setS2(p => ({ ...p, budget: v }))}
                                    />
                                </Field>
                            </div>

                            {/* Section C */}
                            <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-8 space-y-6">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">C — Services Needed</h2>
                                <CheckboxGroup
                                    options={[
                                        "Study Design & Protocol Development",
                                        "IRB & Regulatory Support",
                                        "Participant Recruitment",
                                        "Clinical Site Execution",
                                        "Central Laboratory Services",
                                        "Microbiome / Omics Analysis",
                                        "Biostatistics",
                                        "End-to-End Study Management",
                                    ]}
                                    values={s2.services}
                                    onChange={v => setS2(p => ({ ...p, services: v }))}
                                />
                            </div>

                            {/* Section D */}
                            <div className="bg-slate-900/40 rounded-3xl border border-white/5 p-8 space-y-6">
                                <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">D — Additional Information</h2>
                                <Field label="Project Description" required>
                                    <textarea
                                        value={s2.description}
                                        onChange={e => setS2(p => ({ ...p, description: e.target.value }))}
                                        rows={5}
                                        placeholder="Briefly describe your product, the scientific rationale, your hypothesis, and any prior data you have (preclinical, observational, etc.)…"
                                        className={`${inputCls} resize-none`}
                                    />
                                    <p className="text-[12px] text-slate-600 mt-1">{s2.description.length} characters</p>
                                </Field>
                                <Field label="Upload Supporting Documents (optional)">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                                    >
                                        {attachedFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText size={20} className="text-amber-400" />
                                                <span className="text-sm text-white font-bold">{attachedFile.name}</span>
                                                <button onClick={e => { e.stopPropagation(); setAttachedFile(null); }} className="text-slate-500 hover:text-red-400 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-slate-600 mx-auto mb-2 group-hover:text-amber-500 transition-colors" />
                                                <p className="text-slate-400 text-sm">Click to attach a PDF, presentation, or data summary</p>
                                                <p className="text-slate-600 text-[12px] mt-1">PDF, DOCX, PPTX · Max 25MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden"
                                        onChange={e => setAttachedFile(e.target.files?.[0] ?? null)} />
                                </Field>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setStep("nda")} className="px-8 py-4 border border-slate-700 text-slate-400 font-black uppercase tracking-widest text-[13px] rounded-2xl hover:border-slate-500 transition-all">
                                ← Back
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={!step2Valid || submitting}
                                className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[13px] rounded-2xl shadow-xl shadow-amber-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
                                {submitting ? "Submitting…" : "Request Clinical Study Consultation"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── DONE: Confirmation ─────────────────────────────────────── */}
                {step === "done" && (
                    <div className="max-w-xl mx-auto text-center py-12 animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                                <Rocket size={40} className="text-amber-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-[#020617]">
                                <Check size={14} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-white italic mb-3">Submission Received!</h2>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            Thank you for your submission. Our clinical development team will review your project and contact you within <strong className="text-white">2–3 business days</strong>.
                        </p>

                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 mb-8 text-left space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-slate-300">Lead status: <strong className="text-amber-400">Qualified Lead</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-slate-300">Confirmation email sent to your inbox</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-slate-300">Clinical development team notified</span>
                            </div>
                            {s2.services.includes("Biorepository") && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                    <span className="text-slate-300">Routed to: <strong className="text-cyan-400">biorepository@musbresearch.com</strong></span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <a
                                href="https://calendly.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[13px] rounded-2xl shadow-xl shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Calendar size={16} /> Schedule a Call Now
                            </a>
                            <button
                                onClick={() => router.push("/sponsor/dashboard")}
                                className="w-full py-4 bg-slate-900/50 border border-white/5 text-slate-300 font-black uppercase tracking-widest text-[13px] rounded-2xl hover:border-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowRight size={16} /> Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
