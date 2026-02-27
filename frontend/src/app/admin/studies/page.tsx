"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Settings2,
    BarChart3,
    FileEdit,
    Globe,
    Lock,
    Link as LinkIcon,
    Loader2
} from "lucide-react";

export default function AdminStudiesPage() {
    const { data: session } = useSession();
    const [studies, setStudies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetch("/api/proxy/studies")
                .then(res => res.json())
                .then(data => {
                    setStudies(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Studies fetch error", err);
                    setLoading(false);
                });
        }
    }, [session]);

    const handleApprove = async (studyId: string) => {
        if (!confirm("Are you sure you want to approve this study and make it ACTIVE?")) return;

        try {
            const res = await fetch(`/api/proxy/admin/studies/${studyId}/approve`, {
                method: "POST"
            });
            if (res.ok) {
                alert("Study approved successfully!");
                // Update local state
                setStudies(prev => prev.map(s => s.id === studyId ? { ...s, status: 'ACTIVE' } : s));
            } else {
                alert("Failed to approve study.");
            }
        } catch (err) {
            alert("Connection error.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">Clinical Studies</h1>
                    <p className="text-slate-500 mt-2 font-medium">Design, launch, and monitor your decentralized trials.</p>
                </div>
                <Link href="/admin/studies/new" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all flex items-center gap-2">
                    <Plus size={18} /> New Study
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-cyan-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {studies.slice(0, 50).map((study) => (
                        <div key={study.id} className="glass rounded-[2rem] border border-white/5 p-8 hover:border-cyan-500/30 transition-all group relative flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[13px] font-black px-2 py-1 rounded-lg border italic tracking-wider uppercase ${study.status === 'ACTIVE' || study.status === 'RECRUITING' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        study.status === 'PAUSED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            study.status === 'CLOSED' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                                                'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        }`}>
                                        {study.status}
                                    </span>
                                    <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors mb-1 italic tracking-tight">{study.title}</h3>
                                <p className="text-[13px] text-slate-500 font-medium mb-6">{study.condition} · {study.designType}</p>

                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Enrollment Progress</span>
                                    <span className="text-[13px] font-black text-white">{study.enrollmentCount || 0} / {study.targetEnrollment || 100}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden mb-6">
                                    <div className="h-full bg-cyan-500 transition-all" style={{ width: `${Math.min(100, ((study.enrollmentCount || 0) / (study.targetEnrollment || 100)) * 100)}%` }} />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 mt-auto flex flex-col sm:flex-row gap-3">
                                <Link href={`/admin/studies/${study.id}`} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[13px] font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 border border-white/5 group-hover:border-white/10">
                                    <FileEdit size={14} /> Manage Study
                                </Link>

                                {(study.status === 'UNDER_REVIEW') && (
                                    <button
                                        onClick={() => handleApprove(study.id)}
                                        className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> Quick Approve
                                    </button>
                                )}

                                {(study.status === 'ACTIVE' || study.status === 'RECRUITING') && (
                                    <button className="flex-1 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-[13px] font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2">
                                        <LinkIcon size={14} /> UTM Links
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

