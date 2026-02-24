"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface FormField {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    options?: string[];
    required: boolean;
    minValue?: number;
    maxValue?: number;
}

interface Assessment {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
}

interface FormRendererProps {
    assessment: Assessment;
    studyId: string;
    onSuccess?: () => void;
}

export default function FormRenderer({ assessment, studyId, onSuccess }: FormRendererProps) {
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleInputChange = (fieldId: string, value: any) => {
        setResponses(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            const res = await fetch("/api/proxy/assessments/responses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assessmentId: assessment.id,
                    studyId,
                    responses,
                })
            });

            if (res.ok) {
                setStatus('success');
                if (onSuccess) onSuccess();
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="text-emerald-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Form Submitted</h3>
                <p className="text-slate-400 text-sm">Thank you for your response. Your data has been securely saved.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-white italic tracking-tight">{assessment.title}</h2>
                {assessment.description && <p className="text-slate-500 text-sm mt-1">{assessment.description}</p>}
            </div>

            <div className="space-y-6">
                {assessment.fields.map(field => (
                    <div key={field.id} className="space-y-2">
                        <label className="block text-[13px] font-black text-slate-500 uppercase tracking-widest italic">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'text' && (
                            <input
                                type="text"
                                required={field.required}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-all"
                                placeholder={field.placeholder}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                        )}

                        {field.type === 'number' && (
                            <input
                                type="number"
                                required={field.required}
                                min={field.minValue}
                                max={field.maxValue}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-all"
                                placeholder={field.placeholder}
                                onChange={(e) => handleInputChange(field.id, parseFloat(e.target.value))}
                            />
                        )}

                        {field.type === 'select' && (
                            <select
                                required={field.required}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-all appearance-none"
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                            >
                                <option value="">Select option...</option>
                                {field.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}

                        {field.type === 'scale' && (
                            <div className="flex justify-between gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleInputChange(field.id, val)}
                                        className={`flex-1 aspect-square rounded-lg border font-black text-sm transition-all ${responses[field.id] === val
                                                ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    <span>Failed to submit form. Please try again.</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit Assessment"}
            </button>
        </form>
    );
}
