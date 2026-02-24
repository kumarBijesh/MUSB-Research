"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    FileText,
    Upload,
    Search,
    Filter,
    Download,
    Trash2,
    ExternalLink,
    Folder,
    Clock,
    User,
    Loader2,
    ShieldCheck,
    FileSignature,
    Beaker,
    MoreHorizontal
} from "lucide-react";

export default function DocumentsPage() {
    const { data: session } = useSession();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (session) {
            fetch("/api/proxy/documents")
                .then(res => res.json())
                .then(data => {
                    setDocuments(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Documents fetch error", err);
                    setLoading(false);
                });
        }
    }, [session]);

    const categories: any = {
        "CONSENT": { label: "Informed Consent", icon: FileSignature, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        "LAB_RESULT": { label: "Lab Results", icon: Beaker, color: "text-cyan-400", bg: "bg-cyan-500/10" },
        "PROTOCOL": { label: "Trial Protocol", icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
        "OTHER": { label: "Miscellanous", icon: Folder, color: "text-slate-400", bg: "bg-slate-500/10" },
    };

    const filteredDocs = documents.filter(d =>
        d.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.participantId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
                        <FileText className="text-cyan-500" size={32} /> Central <span className="text-cyan-500">eTMF</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Electronic Trial Master File - Secure document repository and audit trail.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all flex items-center gap-2">
                        <Upload size={18} /> Upload Document
                    </button>
                </div>
            </div>

            {/* Dashboard Mini-header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Artifacts</h3>
                        <FileText className="text-cyan-500" size={16} />
                    </div>
                    <p className="text-3xl font-black text-white">{documents.length}</p>
                    <p className="text-[13px] text-emerald-400 font-bold mt-2 flex items-center gap-1 italic">
                        +3 uploaded today
                    </p>
                </div>
                <div className="glass p-6 rounded-2xl border border-white/5 bg-slate-900/40">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest leading-none">Security Status</h3>
                        <ShieldCheck className="text-emerald-500" size={16} />
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-wider">HIPAA Compliant</p>
                    <p className="text-[13px] text-slate-500 font-bold mt-2 italic">
                        Encrypted at rest (AES-256)
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by filename or participant ID..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {Object.keys(categories).map(cat => (
                            <button key={cat} className="p-2 px-3 rounded-lg bg-slate-800 border border-white/5 text-[13px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-700 transition-all">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Document List */}
                <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/80 border-b border-white/5">
                            <tr>
                                <th className="py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest">Document / Category</th>
                                <th className="py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest">Linked To</th>
                                <th className="py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest">Added Date</th>
                                <th className="py-4 px-6 text-[13px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin inline text-cyan-500" size={32} /></td></tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr><td colSpan={4} className="py-20 text-center text-slate-500 font-bold italic uppercase tracking-wider">No matching artifacts found.</td></tr>
                            ) : filteredDocs.map((doc) => {
                                const catInfo = categories[doc.category] || categories.OTHER;
                                return (
                                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl ${catInfo.bg} flex items-center justify-center ${catInfo.color}`}>
                                                    <catInfo.icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{doc.filename}</p>
                                                    <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest">{catInfo.label}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-500" />
                                                <span className="text-[13px] font-bold text-slate-300">P-{doc.participantId.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-500" />
                                                <span className="text-[13px] font-bold text-slate-300 italic">{new Date(doc.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-all">
                                                    <Download size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
