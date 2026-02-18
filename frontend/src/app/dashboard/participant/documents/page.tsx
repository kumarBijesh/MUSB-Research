"use client";

import { FileText, Download, Eye, ShieldCheck, Lock } from "lucide-react";

const documents = [
    { title: "Informed Consent Form", category: "Legal", date: "Jan 10, 2026", type: "PDF" },
    { title: "Study Protocol Summary", category: "Information", date: "Jan 10, 2026", type: "PDF" },
    { title: "Privacy Policy & Data Use", category: "Legal", date: "Jan 10, 2026", type: "PDF" },
    { title: "Baseline Lab Report", category: "Medical", date: "Feb 15, 2026", type: "PDF" },
];

export default function DocumentsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-white italic tracking-tight">My Documents</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc, idx) => (
                    <div key={idx} className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 transition-opacity opacity-0 group-hover:opacity-100" />

                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-slate-800/50 rounded-xl text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                                <FileText size={20} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/50 px-2 py-1 rounded border border-white/5">
                                {doc.category}
                            </span>
                        </div>

                        <h3 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {doc.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-6">Uploaded on {doc.date}</p>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group/btn">
                                <Eye size={14} className="group-hover/btn:scale-110 transition-transform" /> View
                            </button>
                            <button className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group/btn">
                                <Download size={14} className="group-hover/btn:scale-110 transition-transform" /> PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center gap-4">
                <ShieldCheck size={24} className="text-emerald-400" />
                <div>
                    <h4 className="font-bold text-white">Secure Document Storage</h4>
                    <p className="text-xs text-slate-500 max-w-xl">
                        All your documents are encrypted and stored securely according to HIPAA and GDPR standards. Only authorized study personnel and you have access to these files.
                    </p>
                </div>
                <Lock size={16} className="ml-auto text-slate-600" />
            </div>
        </div>
    );
}
