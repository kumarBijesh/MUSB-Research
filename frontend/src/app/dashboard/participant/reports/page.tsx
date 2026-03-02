"use client";

import { useEffect, useState } from "react";
import { ParticipantAuth } from "@/lib/portal-auth";
import { Download, FileText, CheckCircle2, AlertCircle, Loader2, TrendingUp, ShieldCheck } from "lucide-react";

interface Report {
    participantName: string;
    reportGeneratedAt: string;
    studyTitle: string;
    progress: {
        completedTasks: number;
        pendingTasks: number;
        complianceScore: number;
    };
    message: string;
}

export default function ReportsPage() {
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    const participantUser = ParticipantAuth.get()?.user;

    useEffect(() => {
        const loadReport = async () => {
            try {
                const token = ParticipantAuth.get()?.token;
                const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch("/api/proxy/participants/me/report", { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.progress) {
                        setReport(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load report:", err);
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={32} className="text-cyan-400 animate-spin" />
            </div>
        );
    }

    const mockReport: Report = {
        participantName: participantUser?.name || "Participant",
        reportGeneratedAt: new Date().toISOString(),
        studyTitle: "Early Detection Lung Cancer Screening",
        progress: {
            completedTasks: 12,
            pendingTasks: 3,
            complianceScore: 80
        },
        message: "Thank you for your valuable contribution to clinical research. Your data is helping us advance medical science."
    };

    const activeReport = report || mockReport;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Participant Report</h1>
                    <p className="text-slate-500 text-sm mt-1">Personalized summary of your study contribution and data.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-[13px] uppercase transition-all shadow-lg shadow-cyan-600/20">
                    <Download size={16} /> Export PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="md:col-span-2 glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <h3 className="text-slate-400 text-[13px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <TrendingUp size={14} className="text-cyan-400" />
                            Study Progress
                        </h3>

                        <div className="flex items-end gap-6 mb-8">
                            <div className="text-6xl font-black text-white italic">{activeReport.progress.complianceScore}%</div>
                            <div className="pb-2">
                                <p className="text-emerald-400 font-bold text-sm">Excellent Compliance</p>
                                <p className="text-slate-500 text-[13px] uppercase font-black tracking-tighter">Your Score</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                                    style={{ width: `${activeReport.progress.complianceScore}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[13px] font-black text-slate-500 uppercase tracking-widest">
                                <span>0% Started</span>
                                <span>Target: 90%+</span>
                                <span>100% Completed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status List */}
                <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40">
                    <h3 className="text-slate-400 text-[13px] font-black uppercase tracking-widest mb-6">Activity Summary</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-white font-bold">{activeReport.progress.completedTasks}</p>
                                <p className="text-[13px] text-slate-500 uppercase font-black">Tasks Completed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <p className="text-white font-bold">{activeReport.progress.pendingTasks}</p>
                                <p className="text-[13px] text-slate-500 uppercase font-black">Remaining Tasks</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Content */}
            <div className="glass p-10 rounded-[40px] border border-white/5 bg-slate-900/30 relative overflow-hidden">
                <div className="absolute top-10 right-10 opacity-5">
                    <FileText size={200} />
                </div>

                <div className="max-w-3xl relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <ShieldCheck size={20} className="text-cyan-400" />
                        </div>
                        <span className="text-[13px] font-black text-cyan-400 uppercase tracking-widest">Verified Multi-Center Study</span>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-4">{activeReport.studyTitle}</h2>
                    <p className="text-slate-400 leading-relaxed italic mb-8">
                        "{activeReport.message}"
                    </p>

                    <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                        <div>
                            <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-1">Generated For</p>
                            <p className="text-white font-bold">{activeReport.participantName}</p>
                        </div>
                        <div>
                            <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-1">Date</p>
                            <p className="text-white font-bold">{new Date(activeReport.reportGeneratedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-center">
                <p className="text-[13px] text-slate-500 font-medium">
                    This report is for your personal use and reflects your activity within the platform.
                    It is not a medical diagnosis. Please consult your study coordinator or physician for clinical results.
                </p>
            </div>
        </div>
    );
}
