"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Layout,
    Users,
    Calendar,
    FileText,
    ShieldCheck,
    Plus,
    Trash2,
    FlaskConical,
    FileSignature,
    ClipboardList,
    Binary,
    Truck,
    ShieldAlert,
    Rocket,
    Clock,
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
        { id: 1, title: "1. Setup", icon: Layout },
        { id: 2, title: "2. Design", icon: FlaskConical },
        { id: 3, title: "3. Arms", icon: Binary },
        { id: 4, title: "4. Eligibility", icon: Users },
        { id: 5, title: "5. Consent", icon: FileSignature },
        { id: 6, title: "6. Assessments", icon: ClipboardList },
        { id: 7, title: "7. Schedule", icon: Calendar },
        { id: 8, title: "8. IRT", icon: Binary },
        { id: 9, title: "9. Logistics", icon: Truck },
        { id: 10, title: "10. Safety", icon: ShieldAlert },
        { id: 11, title: "11. Launch", icon: Rocket },
    ];

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 11));
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
        <div className="space-y-8 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <Link href="/admin/studies" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-white italic tracking-tight uppercase">Protocol Builder</h1>
                    <p className="text-slate-500 text-sm font-medium">Virtual Clinical Trial System • No-Code Interface</p>
                </div>
            </div>

            {/* Stepper (Scrollable for 11 steps) */}
            <div className="flex justify-between items-start gap-2 overflow-x-auto pb-6 custom-scrollbar-hide px-2">
                {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center min-w-[80px] group">
                        <div
                            onClick={() => setCurrentStep(step.id)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${currentStep === step.id ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20 scale-110' :
                                    currentStep > step.id ? 'bg-cyan-950 text-cyan-400 border-cyan-500/50' :
                                        'bg-slate-900 text-slate-600 border-slate-700 hover:border-slate-500'
                                }`}>
                            <step.icon size={18} />
                        </div>
                        <span className={`text-[13px] font-black uppercase tracking-tighter mt-2 text-center w-max ${currentStep === step.id ? 'text-cyan-400' : 'text-slate-600'}`}>
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="glass p-8 rounded-[2rem] border border-white/5 min-h-[550px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

                {/* Step 1: Study Setup */}
                {currentStep === 1 && (
                    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Layout className="text-cyan-400" size={20} /> Protocol Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Internal Study Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-all"
                                    placeholder="e.g. NAD+ Supplementation for Longevity Phase II"
                                    value={studyData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Primary Indication</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-all appearance-none"
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
                                    <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Sponsor ID</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-all"
                                        placeholder="e.g. SP-2026-001"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Study Objectives</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-700/50 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-all h-32"
                                    placeholder="Describe the primary and secondary endpoints..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Study Design */}
                {currentStep === 2 && (
                    <div className="space-y-8 max-w-3xl mx-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white mb-6">Execution Methodology</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { id: 'Parallel', title: 'Parallel', desc: 'Control and treatment groups run simultaneously.' },
                                { id: 'Crossover', title: 'Crossover', desc: 'Participants switch treatments after a washout.' },
                                { id: 'Open-label', title: 'Open-label', desc: 'Both researchers and participants know the treatment.' },
                                { id: 'Double-blind', title: 'Double-blind', desc: 'Highest standard, preventing bias on both sides.' },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => updateField('design', item.id)}
                                    className={`p-6 rounded-2xl border text-left transition-all ${studyData.type === item.id ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                >
                                    <h3 className="font-bold text-lg mb-1 italic">{item.title}</h3>
                                    <p className="text-[13px] opacity-70 leading-relaxed">{item.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Arms & Products */}
                {currentStep === 3 && (
                    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white">Trial Arms & Investigational Products</h3>
                            <button onClick={() => addArrayItem('arms', { name: "New Arm", product: "" })} className="text-[13px] font-black uppercase text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                                <Plus size={14} /> Add Arm
                            </button>
                        </div>
                        <div className="space-y-3">
                            {studyData.arms.map((arm, idx) => (
                                <div key={idx} className="flex gap-4 items-center bg-slate-950/50 p-6 rounded-2xl border border-white/5 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[13px] font-black text-cyan-500 border border-white/5">{String.fromCharCode(65 + idx)}</div>
                                    <div className="flex-1 space-y-2">
                                        <input type="text" className="bg-transparent border-b border-slate-700 text-white font-bold w-full py-1 focus:border-cyan-500 outline-none text-sm" value={arm.name} onChange={(e) => {
                                            const newArms = [...studyData.arms];
                                            newArms[idx].name = e.target.value;
                                            setStudyData(prev => ({ ...prev, arms: newArms }));
                                        }} />
                                        <input type="text" className="bg-transparent border-b border-slate-800 text-slate-500 text-[13px] w-full py-1 focus:border-cyan-500 outline-none" placeholder="Investigational Product (IP)" value={arm.product} onChange={(e) => {
                                            const newArms = [...studyData.arms];
                                            newArms[idx].product = e.target.value;
                                            setStudyData(prev => ({ ...prev, arms: newArms }));
                                        }} />
                                    </div>
                                    <button onClick={() => removeArrayItem('arms', idx)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Eligibility Rules */}
                {currentStep === 4 && (
                    <div className="grid grid-cols-2 gap-8 animate-fade-in-up h-full">
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black text-[13px] uppercase tracking-widest text-emerald-400 flex items-center gap-2 italic"><CheckCircle2 size={16} /> Inclusion</h3>
                                <button onClick={() => addArrayItem('inclusion', "")} className="text-slate-500 hover:text-white"><Plus size={18} /></button>
                            </div>
                            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                                {studyData.inclusion.map((crit, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="text" className="w-full bg-slate-900/50 rounded-xl p-4 text-sm text-white border border-slate-800 focus:border-emerald-500/50 outline-none font-medium" placeholder="Condition..." value={crit} onChange={(e) => updateArrayItem('inclusion', idx, e.target.value)} />
                                        <button onClick={() => removeArrayItem('inclusion', idx)} className="text-slate-700 hover:text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col h-full border-l border-white/5 pl-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black text-[13px] uppercase tracking-widest text-red-400 flex items-center gap-2 italic"><ShieldCheck size={16} /> Exclusion</h3>
                                <button onClick={() => addArrayItem('exclusion', "")} className="text-slate-500 hover:text-white"><Plus size={18} /></button>
                            </div>
                            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                                {studyData.exclusion.map((crit, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="text" className="w-full bg-slate-900/50 rounded-xl p-4 text-sm text-white border border-slate-800 focus:border-red-500/50 outline-none font-medium" placeholder="Condition..." value={crit} onChange={(e) => updateArrayItem('exclusion', idx, e.target.value)} />
                                        <button onClick={() => removeArrayItem('exclusion', idx)} className="text-slate-700 hover:text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Consent Management */}
                {currentStep === 5 && (
                    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white mb-2">E-Consent Workflow</h2>
                        <p className="text-slate-500 text-sm mb-8">Define version control and re-consent triggers.</p>

                        <div className="space-y-8">
                            <div className="p-10 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30 text-center group hover:border-cyan-500/50 transition-all cursor-pointer">
                                <FileSignature className="mx-auto text-slate-600 mb-4 group-hover:text-cyan-400" size={40} />
                                <p className="text-white font-bold mb-1">Click to upload ICD (Informed Consent Document)</p>
                                <p className="text-[13px] text-slate-500 uppercase tracking-widest font-black">Support PDF (Max 20MB)</p>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <input type="checkbox" className="w-5 h-5 accent-cyan-500" />
                                <div>
                                    <p className="text-sm font-bold text-white">Enable Automatic Re-consent</p>
                                    <p className="text-[13px] text-slate-500">Triggered when ICF version index increases by major version.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Assessments Library */}
                {currentStep === 6 && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Validated Assessments</h2>
                            <button className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-xl text-[13px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all">
                                <Plus size={14} /> New Custom Form
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: 'Gut Health Questionnaire', category: 'Validated', questions: 12 },
                                { title: 'Sleep Quality Index (PSQI)', category: 'Standard', questions: 18 },
                                { title: 'Mood & Stress Scale (DASS-21)', category: 'Psychological', questions: 21 },
                                { title: 'Weekly Intake Diary', category: 'Custom', questions: 5 },
                            ].map(form => (
                                <div key={form.title} className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all group cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[13px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-white/5">{form.category}</span>
                                        <input type="checkbox" className="w-4 h-4 accent-cyan-500" />
                                    </div>
                                    <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{form.title}</h4>
                                    <p className="text-[13px] text-slate-500 mt-1">{form.questions} data points</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 7: Schedule Designer */}
                {currentStep === 7 && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up h-full flex flex-col">
                        <h2 className="text-xl font-bold text-white mb-4">Timeline & Reminder Rules</h2>
                        <div className="flex-1 bg-slate-950/50 rounded-3xl border border-white/5 p-8 relative overflow-hidden">
                            <div className="flex items-center gap-8 mb-12 relative">
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800 -z-10" />
                                {[0, 7, 14, 28, 56].map(day => (
                                    <div key={day} className="flex flex-col items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-cyan-500 border border-white/5 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                                        <div className="px-3 py-1 bg-slate-900 rounded-lg text-[13px] font-black text-cyan-400 border border-white/5 whitespace-nowrap">Day {day}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-4 bg-slate-900/80 rounded-2xl border border-indigo-500/20">
                                    <h4 className="text-indigo-400 font-black text-[13px] uppercase tracking-widest mb-2 italic">Triggers</h4>
                                    <p className="text-white text-[13px] font-bold">Relative to Enrollment</p>
                                </div>
                                <div className="p-4 bg-slate-900/80 rounded-2xl border border-amber-500/20">
                                    <h4 className="text-amber-500 font-black text-[13px] uppercase tracking-widest mb-2 italic">Reminders</h4>
                                    <p className="text-white text-[13px] font-bold">SMS + Push (T-24h)</p>
                                </div>
                                <div className="p-4 bg-slate-900/80 rounded-2xl border border-emerald-500/20">
                                    <h4 className="text-emerald-400 font-black text-[13px] uppercase tracking-widest mb-2 italic">Escalation</h4>
                                    <p className="text-white text-[13px] font-bold">Coordinator Call (T+48h)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 8: Randomization / IRT */}
                {currentStep === 8 && (
                    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white mb-2">Randomization Strategy</h2>
                        <p className="text-slate-500 text-sm mb-8">Set block size and stratification factors.</p>

                        <div className="space-y-4">
                            {[
                                { title: 'Block Randomization', desc: 'Maintains balance within small groups of participants.' },
                                { title: 'Stratified Randomization', desc: 'Balances according to factors like Age or BMI.' },
                                { title: 'Simple Randomization', desc: 'Purely random coin-toss logic.' },
                            ].map(type => (
                                <label key={type.title} className="flex items-start gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl cursor-pointer hover:border-cyan-500 transition-all group">
                                    <input type="radio" name="randomType" className="mt-1 accent-cyan-500" />
                                    <div>
                                        <p className="text-white font-bold group-hover:text-cyan-400">{type.title}</p>
                                        <p className="text-[13px] text-slate-500 mt-1">{type.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 9: Logistics */}
                {currentStep === 9 && (
                    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white mb-2">Shipping & Fulfillment</h2>
                        <p className="text-slate-500 text-sm mb-8">Integrated with global carrier services.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Kit Type</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm">
                                    <option>Stool Collection (Gut)</option>
                                    <option>Saliva (DNA/Cortisal)</option>
                                    <option>Blood Spot (Metabolic)</option>
                                    <option>Physical Product (Supplement)</option>
                                </select>
                            </div>
                            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Carrier Preference</label>
                                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm">
                                    <option>FedEx Health</option>
                                    <option>UPS Healthcare</option>
                                    <option>DHL Medical Express</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center gap-4">
                            <input type="checkbox" className="w-5 h-5 accent-cyan-500" defaultChecked />
                            <div>
                                <p className="text-sm font-bold text-white">Generate Auto-Return Labels</p>
                                <p className="text-[13px] text-slate-500">Provide digital return label instantly upon delivery confirmation.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 10: Safety Configuration */}
                {currentStep === 10 && (
                    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold text-white mb-2">Automated Safety Alerts</h2>
                        <p className="text-slate-500 text-sm mb-8">Define triggers for internal safety review.</p>

                        <div className="space-y-4">
                            <div className="p-6 bg-slate-900/50 border border-red-500/20 rounded-2xl">
                                <h4 className="text-red-400 font-bold text-sm mb-4">Escalation Trigger</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-slate-300 italic">Report of Severe AE</span>
                                        <div className="w-10 h-5 bg-red-500 rounded-full flex items-center justify-end px-1"><div className="w-3 h-3 bg-white rounded-full" /></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[13px] text-slate-300 italic">Abnormal Weight Loss (&gt;10%)</span>
                                        <div className="w-10 h-5 bg-slate-700 rounded-full flex items-center justify-start px-1"><div className="w-3 h-3 bg-slate-400 rounded-full" /></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                                <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Immediate Notification Distribution List</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm" placeholder="pi@university.com, safety@cro.com" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 11: Launch */}
                {currentStep === 11 && (
                    <div className="text-center py-12 animate-fade-in-up">
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                            <Rocket size={48} className="text-emerald-400 animate-bounce" />
                        </div>
                        <h2 className="text-4xl font-black text-white italic mb-4">Protocol Validated</h2>
                        <p className="text-slate-400 leading-relaxed max-w-xl mx-auto mb-10 font-medium">Your study configuration has passed automated logic checks. Publishing will initiate public recruitment and enable landing page indexing.</p>
                        <div className="flex justify-center gap-6">
                            <button className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all text-[13px]">Save as Build</button>
                            <Link href="/admin/studies" className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all text-[13px]">Publish Protocol</Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-64 right-0 p-6 bg-[#020617]/80 backdrop-blur-xl border-t border-white/5 z-20">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 1}
                        className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[13px] flex items-center gap-2 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <div className="hidden md:flex items-center gap-2">
                        {steps.map(s => (
                            <div key={s.id} className={`w-1.5 h-1.5 rounded-full ${currentStep === s.id ? 'bg-cyan-500 w-4' : currentStep > s.id ? 'bg-cyan-900' : 'bg-slate-800'} transition-all`} />
                        ))}
                    </div>

                    {currentStep < 11 ? (
                        <button
                            onClick={handleNext}
                            className="px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 text-[13px]"
                        >
                            Continue <ChevronRight size={16} />
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
