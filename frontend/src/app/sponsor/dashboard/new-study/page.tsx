"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight, ChevronLeft, Save, Rocket, Info, Calendar,
    CheckCircle2, Users, DollarSign, Globe, FlaskConical,
    MapPin, Clock, ListChecks, ShieldCheck, X, Loader2, Target
} from "lucide-react";
import Link from "next/link";

type FormData = {
    title: string;
    internalCode: string;
    shortDescription: string;
    description: string;
    condition: string;
    regions: string[];
    locationType: "Remote" | "Hybrid";
    location: string;
    duration: string;
    durationUnit: "weeks" | "months";
    timeCommitment: string;
    activities: string[];
    minAge: number;
    maxAge: number;
    gender: string;
    inclusionCriteria: string;
    exclusionCriteria: string;
    isPaid: boolean;
    compensationAmount: string;
    compensationDescription: string;
    targetParticipants: string;
    status: "DRAFT" | "PUBLISHED";
};

const initialData: FormData = {
    title: "",
    internalCode: "",
    shortDescription: "",
    description: "",
    condition: "",
    regions: [],
    locationType: "Remote",
    location: "",
    duration: "",
    durationUnit: "weeks",
    timeCommitment: "",
    activities: [],
    minAge: 18,
    maxAge: 100,
    gender: "All",
    inclusionCriteria: "",
    exclusionCriteria: "",
    isPaid: false,
    compensationAmount: "",
    compensationDescription: "",
    targetParticipants: "",
    status: "DRAFT",
};

const STEPS = [
    { id: 1, title: "Study Basics", icon: Info },
    { id: 2, title: "Format & Duration", icon: Calendar },
    { id: 3, title: "Eligibility", icon: ListChecks },
    { id: 4, title: "Launch", icon: Rocket },
];

const CATEGORIES = ["Gut Health", "Sleep", "Stress", "Oncology", "Cardiology", "Neurology", "Metabolic"];
const REGIONS = ["United States", "European Union", "United Kingdom", "Canada", "Australia", "Global"];
const ACTIVITIES = ["Surveys", "Supplement/Product logging", "Sample collection (stool, saliva, etc.)", "Lab visits", "Video calls"];
const GENDERS = ["All", "Male", "Female", "Other"];

export default function NewStudyWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateFormData = (fields: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...fields }));
        // Clear error when field is updated
        const newErrors = { ...errors };
        Object.keys(fields).forEach(key => delete newErrors[key]);
        setErrors(newErrors);
    };

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.title) newErrors.title = "Study title is required";
            if (!formData.shortDescription) newErrors.shortDescription = "Short description is required";
            if (!formData.description) newErrors.description = "Full description is required";
            if (!formData.condition) newErrors.condition = "Category is required";
        }
        if (currentStep === 2) {
            if (!formData.duration) newErrors.duration = "Duration is required";
            if (!formData.timeCommitment) newErrors.timeCommitment = "Time commitment is required";
        }
        if (currentStep === 4) {
            if (!formData.targetParticipants) newErrors.targetParticipants = "Target participants is required";
            if (formData.isPaid && !formData.compensationAmount) newErrors.compensationAmount = "Amount is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 4));
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (submitStatus: "DRAFT" | "PUBLISHED") => {
        if (submitStatus === "PUBLISHED" && !validateStep(step)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/proxy/sponsor/studies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    status: submitStatus,
                    slug: "auto", // Backend handles slug
                    targetParticipants: parseInt(formData.targetParticipants) || 0,
                    compensationAmount: parseFloat(formData.compensationAmount) || 0,
                })
            });

            if (res.ok) {
                alert(submitStatus === "PUBLISHED" ? "Study launched successfully!" : "Study saved as draft.");
                router.push("/sponsor/dashboard");
            } else {
                const err = await res.json();
                alert(err.detail || "Failed to save study. Please check your inputs.");
            }
        } catch (err) {
            alert("Connection error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white py-12 px-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/sponsor/dashboard" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest mb-4">
                            <ChevronLeft size={14} /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black italic tracking-tighter">Launch a Study</h1>
                        <p className="text-slate-400 mt-2 text-sm font-medium">Design and deploy your clinical protocol in minutes.</p>
                    </div>
                    <div className="hidden md:flex gap-3">
                        <button
                            onClick={() => handleSubmit("DRAFT")}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-white/10 hover:border-amber-500/30 text-slate-300 text-[13px] font-bold uppercase tracking-widest rounded-2xl transition-all"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
                        </button>
                    </div>
                </div>

                {/* Stepper */}
                <div className="flex justify-between items-center mb-12 relative px-4">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2 z-0" />
                    {STEPS.map((s) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${step === s.id ? "bg-amber-500 border-amber-400 shadow-xl shadow-amber-500/20 text-white" :
                                step > s.id ? "bg-emerald-500 border-emerald-400 text-white" : "bg-slate-950 border-white/5 text-slate-600"
                                }`}>
                                {step > s.id ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                            </div>
                            <span className={`text-[13px] font-black uppercase tracking-widest ${step === s.id ? "text-white" : "text-slate-600"}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="glass p-8 md:p-12 rounded-[40px] border border-white/5 bg-slate-900/40 relative overflow-hidden min-h-[500px]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Study Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => updateFormData({ title: e.target.value })}
                                        className={`w-full bg-slate-950/50 border ${errors.title ? "border-red-500/50" : "border-white/5"} rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors text-lg font-bold`}
                                        placeholder="e.g. Early Detection Lung Cancer Screening"
                                    />
                                    {errors.title && <p className="text-red-400 text-[13px] mt-2 font-bold uppercase">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Internal Code</label>
                                    <input
                                        type="text"
                                        value={formData.internalCode}
                                        onChange={(e) => updateFormData({ internalCode: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                        placeholder="BIO-TX-202"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Short Description *</label>
                                <textarea
                                    value={formData.shortDescription}
                                    onChange={(e) => updateFormData({ shortDescription: e.target.value })}
                                    className={`w-full bg-slate-950/50 border ${errors.shortDescription ? "border-red-500/50" : "border-white/5"} rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[80px]`}
                                    placeholder="Used for study card previews (1-2 lines)..."
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Full Study Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateFormData({ description: e.target.value })}
                                    className={`w-full bg-slate-950/50 border ${errors.description ? "border-red-500/50" : "border-white/5"} rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[160px]`}
                                    placeholder="Provide detailed explanation of the goals, methods, and participant journey..."
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Category / Condition *</label>
                                    <select
                                        value={formData.condition}
                                        onChange={(e) => updateFormData({ condition: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Allowed Regions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {REGIONS.map(r => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => {
                                                    const newRegions = formData.regions.includes(r)
                                                        ? formData.regions.filter(x => x !== r)
                                                        : [...formData.regions, r];
                                                    updateFormData({ regions: newRegions });
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-all ${formData.regions.includes(r) ? "bg-amber-500 text-white border-amber-400" : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/20"
                                                    }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Format & Duration */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4">Study Format *</label>
                                    <div className="space-y-3">
                                        {["Remote", "Hybrid"].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => updateFormData({ locationType: type as any })}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${formData.locationType === type ? "bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10" : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${formData.locationType === type ? "bg-amber-500 text-white" : "bg-slate-800"}`}>
                                                        {type === "Remote" ? <Globe size={18} /> : <MapPin size={18} />}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold">{type}</p>
                                                        <p className="text-[13px] opacity-70 font-medium">{type === "Remote" ? "100% at-home decentralized trial" : "Home activities + Clinic visits"}</p>
                                                    </div>
                                                </div>
                                                {formData.locationType === type && <CheckCircle2 size={18} className="text-amber-400" />}
                                            </button>
                                        ))}
                                    </div>

                                    {formData.locationType === "Hybrid" && (
                                        <div className="mt-4 animate-in slide-in-from-top-2">
                                            <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Clinic Locations</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => updateFormData({ location: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                                placeholder="e.g. London City Clinic, NYC Health Hub"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Total Duration *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={formData.duration}
                                                onChange={(e) => updateFormData({ duration: e.target.value })}
                                                className={`flex-1 bg-slate-950/50 border ${errors.duration ? "border-red-500/50" : "border-white/5"} rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors`}
                                                placeholder="e.g. 12"
                                            />
                                            <select
                                                value={formData.durationUnit}
                                                onChange={(e) => updateFormData({ durationUnit: e.target.value as any })}
                                                className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none w-32"
                                            >
                                                <option value="weeks">Weeks</option>
                                                <option value="months">Months</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Time Commitment *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.timeCommitment}
                                                onChange={(e) => updateFormData({ timeCommitment: e.target.value })}
                                                className={`w-full bg-slate-950/50 border ${errors.timeCommitment ? "border-red-500/50" : "border-white/5"} rounded-2xl px-6 py-4 text-white pl-12 focus:outline-none focus:border-amber-500/50 transition-colors`}
                                                placeholder="e.g. 15 mins / week"
                                            />
                                            <Clock className="absolute left-4 top-4 text-slate-500" size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4">Participant Activities *</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {ACTIVITIES.map(a => (
                                        <button
                                            key={a}
                                            type="button"
                                            onClick={() => {
                                                const newAct = formData.activities.includes(a)
                                                    ? formData.activities.filter(x => x !== a)
                                                    : [...formData.activities, a];
                                                updateFormData({ activities: newAct });
                                            }}
                                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${formData.activities.includes(a) ? "bg-cyan-500/10 border-cyan-500/30 text-white" : "bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10"
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${formData.activities.includes(a) ? "bg-cyan-500 border-cyan-400" : "border-slate-700"}`}>
                                                {formData.activities.includes(a) && <CheckCircle2 size={10} className="text-white" />}
                                            </div>
                                            <span className="text-[13px] font-medium text-left">{a}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Eligibility */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-12">
                                <section>
                                    <h3 className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-sm mb-6 border-b border-white/5 pb-3">
                                        <Users size={16} className="text-indigo-400" /> Inclusion Criteria
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Min Age</label>
                                                <input
                                                    type="number"
                                                    value={formData.minAge}
                                                    onChange={(e) => updateFormData({ minAge: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Max Age</label>
                                                <input
                                                    type="number"
                                                    value={formData.maxAge}
                                                    onChange={(e) => updateFormData({ maxAge: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Gender Eligibility</label>
                                            <div className="flex gap-2">
                                                {GENDERS.map(g => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => updateFormData({ gender: g })}
                                                        className={`flex-1 py-3 rounded-xl border text-[13px] font-bold transition-all ${formData.gender === g ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/10"
                                                            }`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Additional Inclusion Requirements</label>
                                            <textarea
                                                value={formData.inclusionCriteria}
                                                onChange={(e) => updateFormData({ inclusionCriteria: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[100px]"
                                                placeholder="Example: Must have a BMI between 20-30..."
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-sm mb-6 border-b border-white/5 pb-3">
                                        <X size={16} className="text-red-400" /> Exclusion Criteria
                                    </h3>

                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Who cannot join?</label>
                                        <textarea
                                            value={formData.exclusionCriteria}
                                            onChange={(e) => updateFormData({ exclusionCriteria: e.target.value })}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-500/50 transition-colors min-h-[200px]"
                                            placeholder="Participants with severe chronic illness, pregnancy, or recent antibiotic use cannot join..."
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Final Launch */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4">Compensation Model *</label>
                                        <div className="flex gap-4">
                                            {["Unpaid", "Paid"].map((item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => updateFormData({ isPaid: item === "Paid" })}
                                                    className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[13px] ${(formData.isPaid ? "Paid" : "Unpaid") === item ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10" : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10"
                                                        }`}
                                                >
                                                    {item === "Paid" ? <DollarSign size={14} /> : <Info size={14} />} {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.isPaid && (
                                        <div className="space-y-4 animate-in slide-in-from-top-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Amount ($)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.compensationAmount}
                                                        onChange={(e) => updateFormData({ compensationAmount: e.target.value })}
                                                        className={`w-full bg-slate-950/50 border ${errors.compensationAmount ? "border-red-500/50" : "border-white/5"} rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors`}
                                                        placeholder="850.00"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <p className="text-[13px] text-slate-500 font-medium mb-4 italic">Per successful completion</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2">Compensation Terms</label>
                                                <input
                                                    type="text"
                                                    value={formData.compensationDescription}
                                                    onChange={(e) => updateFormData({ compensationDescription: e.target.value })}
                                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                                    placeholder="Paid via digital gift card or wire within 10 days..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-3">Enrollment Target *</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.targetParticipants}
                                                onChange={(e) => updateFormData({ targetParticipants: e.target.value })}
                                                className={`w-full bg-slate-950/50 border ${errors.targetParticipants ? "border-red-500/50" : "border-white/5"} rounded-2xl px-6 py-4 text-white pl-12 focus:outline-none focus:border-cyan-500/50 transition-colors font-black text-xl`}
                                                placeholder="200"
                                            />
                                            <Target className="absolute left-4 top-5 text-slate-500" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 border-b border-white/5 pb-3">Final Review</h3>
                                    <div className="glass p-6 rounded-3xl bg-slate-950/30 border border-white/5 space-y-4">
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-slate-500 font-bold uppercase">Study Status</span>
                                            <span className="text-amber-400 font-black tracking-widest uppercase">Draft</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-slate-500 font-bold uppercase">Regions</span>
                                            <span className="text-white">{formData.regions.length || 0} Allowed</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-slate-500 font-bold uppercase">Category</span>
                                            <span className="text-white">{formData.condition || "Not set"}</span>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-[13px] text-slate-500 leading-relaxed italic">
                                                By publishing, your study will immediately become available for potential participants to screened. You can still edit the details after launch.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSubmit("PUBLISHED")}
                                        disabled={isSubmitting}
                                        className="w-full py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-amber-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
                                        Publish Study
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Controls */}
                    <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all ${step === 1 ? "text-slate-700 pointer-events-none" : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <ChevronLeft size={16} /> Back
                        </button>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleSubmit("DRAFT")}
                                disabled={isSubmitting}
                                className="md:hidden px-4 py-3 bg-slate-900 border border-white/10 text-slate-300 text-[13px] font-bold uppercase tracking-widest rounded-xl"
                            >
                                Save Draft
                            </button>
                            {step < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white text-[13px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-600/20 transition-all"
                                >
                                    Next Step <ChevronRight size={16} />
                                </button>
                            ) : (
                                <div className="w-8" /> // Handled by step 4 main button
                            )}
                        </div>
                    </div>
                </div>

                {/* Compliance Badge */}
                <div className="mt-8 flex items-center justify-center gap-8 text-slate-600 text-[13px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-cyan-600/50" /> Protocol Integrity</div>
                    <div className="flex items-center gap-2"><FlaskConical size={14} className="text-amber-600/50" /> Clinical Compliance</div>
                    <div className="flex items-center gap-2"><Globe size={14} className="text-indigo-600/50" /> Global Data Residency</div>
                </div>

            </div>
        </div>
    );
}
