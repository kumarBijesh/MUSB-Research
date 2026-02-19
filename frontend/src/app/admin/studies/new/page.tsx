"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Save,
    CheckCircle2,
    Layout,
    Users,
    Calendar,
    FileText,
    ShieldCheck,
    Plus,
    Trash2,
    FlaskConical
} from "lucide-react";

export default function NewStudyBuilder() {
    const [currentStep, setCurrentStep] = useState(1);
    const [studyData, setStudyData] = useState({
        title: "",
        indication: "",
        description: "",
        type: "Interventional",
        blinding: "Double Blind",
        arms: [{ name: "Treatment Group", product: "" }, { name: "Placebo Group", product: "Placebo" }],
        inclusion: [""],
        exclusion: [""]
    });

    const steps = [
        { id: 1, title: "Study Basics", icon: Layout },
        { id: 2, title: "Design & Arms", icon: FlaskConical },
        { id: 3, title: "Eligibility", icon: Users },
        { id: 4, title: "Schedule", icon: Calendar },
        { id: 5, title: "Review", icon: CheckCircle2 },
    ];

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const updateField = (field: string, value: any) => {
        setStudyData(prev => ({ ...prev, [field]: value }));
    };

    const addArrayItem = (field: 'inclusion' | 'exclusion' | 'arms', initialValue: any) => {
        setStudyData(prev => ({ ...prev, [field]: [...prev[field], initialValue] }));
    };

    const updateArrayItem = (field: 'inclusion' | 'exclusion', index: number, value: string) => {
        const newArray = [...studyData[field]];
        newArray[index] = value;
        setStudyData(prev => ({ ...prev, [field]: newArray }));
    };

    const removeArrayItem = (field: 'inclusion' | 'exclusion' | 'arms', index: number) => {
        const newArray = [...studyData[field]];
        newArray.splice(index, 1);
        setStudyData(prev => ({ ...prev, [field]: newArray }));
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <Link href="/admin/studies" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-white italic tracking-tight">New Study Configuration</h1>
                    <p className="text-slate-500 text-sm font-medium">Create a new protocol using the no-code builder.</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-between relative px-10">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 -translate-y-1/2" />
                {steps.map((step) => (
                    <div key={step.id} className={`flex flex-col items-center gap-2 bg-[#020617] px-4 z-10 ${currentStep >= step.id ? 'text-cyan-400' : 'text-slate-600'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${currentStep === step.id ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20' :
                                currentStep > step.id ? 'bg-cyan-950 text-cyan-400 border-cyan-500' :
                                    'bg-slate-900 text-slate-600 border-slate-700'
                            }`}>
                            <step.icon size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{step.title}</span>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="glass p-8 rounded-[2rem] border border-white/5 min-h-[500px]">

                {/* Step 1: Basics */}
                {currentStep === 1 && (
                    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white mb-6">Protocol Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Internal Study Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-colors"
                                    placeholder="e.g. NAD+ Supplementation for Longevity Phase II"
                                    value={studyData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Primary Indication</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-colors appearance-none"
                                        value={studyData.indication}
                                        onChange={(e) => updateField('indication', e.target.value)}
                                    >
                                        <option value="">Select Condition...</option>
                                        <option value="aging">Aging / Longevity</option>
                                        <option value="gut">Gut Health</option>
                                        <option value="sleep">Sleep Disorders</option>
                                        <option value="derm">Dermatology</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Sponsor ID</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-colors"
                                        placeholder="e.g. SP-2026-001"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Public Description (Recruitment)</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-colors h-32"
                                    placeholder="Enter the study description that will appear on the public recruitment page..."
                                    value={studyData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Design */}
                {currentStep === 2 && (
                    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in-up">
                        <div className="grid grid-cols-2 gap-6">
                            <button
                                onClick={() => updateField('type', 'Interventional')}
                                className={`p-6 rounded-2xl border text-left transition-all ${studyData.type === 'Interventional' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                            >
                                <FlaskConical className="mb-4" />
                                <h3 className="font-bold text-lg mb-1">Interventional</h3>
                                <p className="text-xs opacity-70">Participants are assigned a treatment or intervention.</p>
                            </button>
                            <button
                                onClick={() => updateField('type', 'Observational')}
                                className={`p-6 rounded-2xl border text-left transition-all ${studyData.type === 'Observational' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                            >
                                <FileText className="mb-4" />
                                <h3 className="font-bold text-lg mb-1">Observational</h3>
                                <p className="text-xs opacity-70">Data is collected without assigning a specific treatment.</p>
                            </button>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white">Study Arms</h3>
                                <button
                                    onClick={() => addArrayItem('arms', { name: "New Arm", product: "" })}
                                    className="text-xs font-black uppercase text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Arm
                                </button>
                            </div>
                            <div className="space-y-3">
                                {studyData.arms.map((arm, idx) => (
                                    <div key={idx} className="flex gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <input
                                            type="text"
                                            className="bg-transparent border-b border-slate-700 text-white font-bold w-1/3 py-1 focus:border-cyan-500 outline-none"
                                            value={arm.name}
                                            onChange={(e) => {
                                                const newArms = [...studyData.arms];
                                                newArms[idx].name = e.target.value;
                                                setStudyData(prev => ({ ...prev, arms: newArms }));
                                            }}
                                        />
                                        <input
                                            type="text"
                                            className="bg-transparent border-b border-slate-700 text-slate-400 text-sm flex-1 py-1 focus:border-cyan-500 outline-none"
                                            placeholder="Assigned Product / Intervention"
                                            value={arm.product}
                                            onChange={(e) => {
                                                const newArms = [...studyData.arms];
                                                newArms[idx].product = e.target.value;
                                                setStudyData(prev => ({ ...prev, arms: newArms }));
                                            }}
                                        />
                                        <button onClick={() => removeArrayItem('arms', idx)} className="text-slate-600 hover:text-red-400">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Eligibility */}
                {currentStep === 3 && (
                    <div className="grid grid-cols-2 gap-8 animate-fade-in-up">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                                    <CheckCircle2 size={18} /> Inclusion Criteria
                                </h3>
                                <button onClick={() => addArrayItem('inclusion', "")} className="text-slate-500 hover:text-white"><Plus size={18} /></button>
                            </div>
                            <div className="space-y-3">
                                {studyData.inclusion.map((crit, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="text-slate-600 font-mono text-xs py-3">{idx + 1}.</span>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 rounded-lg p-3 text-sm text-white resize-none border border-slate-800 focus:border-emerald-500/50 outline-none"
                                            placeholder="Enter criteria..."
                                            value={crit}
                                            onChange={(e) => updateArrayItem('inclusion', idx, e.target.value)}
                                        />
                                        <button onClick={() => removeArrayItem('inclusion', idx)} className="text-slate-700 hover:text-slate-500"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-red-400 flex items-center gap-2">
                                    <ShieldCheck size={18} /> Exclusion Criteria
                                </h3>
                                <button onClick={() => addArrayItem('exclusion', "")} className="text-slate-500 hover:text-white"><Plus size={18} /></button>
                            </div>
                            <div className="space-y-3">
                                {studyData.exclusion.map((crit, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="text-slate-600 font-mono text-xs py-3">{idx + 1}.</span>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 rounded-lg p-3 text-sm text-white resize-none border border-slate-800 focus:border-red-500/50 outline-none"
                                            placeholder="Enter criteria..."
                                            value={crit}
                                            onChange={(e) => updateArrayItem('exclusion', idx, e.target.value)}
                                        />
                                        <button onClick={() => removeArrayItem('exclusion', idx)} className="text-slate-700 hover:text-slate-500"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Schedule */}
                {currentStep === 4 && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="p-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/30 text-center">
                            <Calendar className="mx-auto text-slate-600 mb-4" size={32} />
                            <h3 className="text-white font-bold mb-2">Schedule Builder</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">Drag and drop events to build the study timeline here. Define visits, surveys, and kit shipments.</p>
                            <button className="px-6 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors">
                                Open Visual Editor
                            </button>
                        </div>

                        {/* Mock Timeline Preview */}
                        <div className="relative border-l border-white/10 ml-8 space-y-8 pl-8 py-4">
                            {['Screening', 'Baseline (Day 0)', 'Week 4 Follow-up', 'Week 8 End of Study'].map((point, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-slate-800 border-4 border-[#090e1c] text-white flex items-center justify-center text-[8px]" />
                                    <div className="flex justify-between items-center group cursor-pointer p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                                        <span className="text-white font-bold">{point}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] rounded uppercase font-bold">Survey</span>
                                            {i === 1 && <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[10px] rounded uppercase font-bold">Kit Ship</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                    <div className="text-center py-12 animate-fade-in-up">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <CheckCircle2 size={40} className="text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white italic mb-4">Ready to Launch?</h2>
                        <p className="text-slate-400 leading-relaxed max-w-xl mx-auto mb-8">
                            You have configured <strong>{studyData.title || "Untitled Study"}</strong> with {studyData.arms.length} arms and {studyData.inclusion.length + studyData.exclusion.length} eligibility criteria.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest rounded-xl transition-all">
                                Save as Draft
                            </button>
                            <Link href="/admin/studies" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
                                Publish Study
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center bg-[#020617] pt-4 border-t border-white/5 sticky bottom-0 z-20">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <ChevronLeft size={16} /> Back
                </button>

                {currentStep < 5 ? (
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 text-xs"
                    >
                        Next Step <ChevronRight size={16} />
                    </button>
                ) : null}
            </div>
        </div>
    );
}
