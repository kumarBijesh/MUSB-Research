"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    FileText, Upload, Search, Download, Trash2, Clock,
    User, Loader2, ShieldCheck, FileSignature, X, Plus
} from "lucide-react";
import { Beaker, Folder, ScanLine } from "lucide-react";
import { AdminAuth } from "@/lib/portal-auth";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CATEGORIES: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    CONSENT: { label: "Informed Consent", icon: FileSignature, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    LAB_RESULT: { label: "Lab Results", icon: Beaker, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    PROTOCOL: { label: "Trial Protocol", icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10" },
    OTHER: { label: "Miscellaneous", icon: Folder, color: "text-slate-400", bg: "bg-slate-500/10" },
};

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [upForm, setUpForm] = useState({ participantId: "", category: "CONSENT", notes: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const getToken = () => AdminAuth.get()?.token ?? "";

    const fetchDocs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/documents/", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setDocuments(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchDocs(); }, [fetchDocs]);

    const handleUpload = async () => {
        if (!selectedFile || !upForm.participantId.trim()) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("participantId", upForm.participantId.trim());
            formData.append("category", upForm.category);
            if (upForm.notes) formData.append("notes", upForm.notes);
            const res = await fetch(`${API_URL}/api/documents/`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            });
            if (res.ok) {
                await fetchDocs();
                setShowUploadModal(false);
                setSelectedFile(null);
                setUpForm({ participantId: "", category: "CONSENT", notes: "" });
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm("Delete this document?")) return;
        await fetch(`/api/proxy/documents/${docId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        setDocuments(prev => prev.filter(d => d.id !== docId));
    };

    const handleDownload = async (doc: any) => {
        const res = await fetch(`${API_URL}/api/documents/${doc.id}/download`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = doc.filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const todayCount = documents.filter(d =>
        d.uploadedAt && new Date(d.uploadedAt).toDateString() === new Date().toDateString()
    ).length;

    const filtered = documents.filter(d => {
        const matchSearch = !searchTerm ||
            d.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.participantId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = !categoryFilter || d.category === categoryFilter;
        return matchSearch && matchCat;
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
                        <FileText className="text-cyan-500" size={32} /> Central <span className="text-cyan-500">eTMF</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Electronic Trial Master File — Secure document repository and audit trail.</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all flex items-center gap-2"
                >
                    <Upload size={18} /> Upload Document
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Total Artifacts</h3>
                        <FileText className="text-cyan-500" size={16} />
                    </div>
                    <p className="text-3xl font-black text-white">{loading ? "—" : documents.length}</p>
                    {todayCount > 0 && <p className="text-[13px] text-emerald-400 font-bold mt-2 italic">+{todayCount} uploaded today</p>}
                </div>
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Security Status</h3>
                        <ShieldCheck className="text-emerald-500" size={16} />
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-wider">HIPAA Compliant</p>
                    <p className="text-[13px] text-slate-500 font-bold mt-2 italic">Encrypted at rest (AES-256)</p>
                </div>
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest">Categories</h3>
                        <Folder className="text-purple-500" size={16} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {Object.keys(CATEGORIES).map(cat => {
                            const count = documents.filter(d => d.category === cat).length;
                            return count > 0 ? (
                                <span key={cat} className={`text-[11px] font-black px-2 py-0.5 rounded border ${CATEGORIES[cat].color} ${CATEGORIES[cat].bg} border-white/5`}>
                                    {cat}: {count}
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            </div>

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
                    {["", ...Object.keys(CATEGORIES)].map(cat => (
                        <button
                            key={cat || "ALL"}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all border ${categoryFilter === cat ? "bg-cyan-600 text-white border-cyan-600" : "bg-slate-800 text-slate-400 border-white/5 hover:text-white"}`}
                        >
                            {cat || "ALL"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Document Table */}
            <div className="bg-slate-900/40 rounded-[2rem] border border-white/5 overflow-hidden">
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
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className="py-20 text-center text-slate-500 font-bold italic uppercase tracking-wider">
                                {documents.length === 0 ? "No documents yet — upload your first artifact." : "No matching documents found."}
                            </td></tr>
                        ) : filtered.map((doc) => {
                            const cat = CATEGORIES[doc.category] || CATEGORIES.OTHER;
                            return (
                                <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center ${cat.color}`}>
                                                <cat.icon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{doc.filename}</p>
                                                <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest">{cat.label}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-slate-500" />
                                            <span className="text-[13px] font-bold text-slate-300">P-{doc.participantId?.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-500" />
                                            <span className="text-[13px] font-bold text-slate-300 italic">
                                                {doc.uploadedAt ? format(new Date(doc.uploadedAt), "dd MMM yyyy") : "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDownload(doc)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-all" title="Download">
                                                <Download size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
                            <h2 className="text-white font-black text-lg italic">Upload Document</h2>
                            <button onClick={() => setShowUploadModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Participant ID *</label>
                                <input
                                    value={upForm.participantId}
                                    onChange={e => setUpForm(p => ({ ...p, participantId: e.target.value }))}
                                    placeholder="Paste participant MongoDB ID..."
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                                <select
                                    value={upForm.category}
                                    onChange={e => setUpForm(p => ({ ...p, category: e.target.value }))}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                >
                                    {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">File *</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl px-4 py-8 text-center cursor-pointer transition-all group"
                                >
                                    {selectedFile ? (
                                        <p className="text-sm text-cyan-400 font-bold">{selectedFile.name}</p>
                                    ) : (
                                        <>
                                            <Upload size={24} className="text-slate-600 mx-auto mb-2 group-hover:text-cyan-500 transition-colors" />
                                            <p className="text-slate-500 text-sm">Click to choose file</p>
                                        </>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Notes <span className="text-slate-600">(optional)</span></label>
                                <textarea
                                    value={upForm.notes}
                                    onChange={e => setUpForm(p => ({ ...p, notes: e.target.value }))}
                                    rows={2}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 resize-none"
                                />
                            </div>
                        </div>
                        <div className="px-8 pb-8 flex gap-3">
                            <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-[13px] hover:border-slate-500 transition-all">Cancel</button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !selectedFile || !upForm.participantId.trim()}
                                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[13px] shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {uploading ? "Uploading…" : "Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
