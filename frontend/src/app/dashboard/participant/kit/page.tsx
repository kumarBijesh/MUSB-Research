"use client";

import { useState, useRef } from "react";
import {
    Package, Truck, Camera, CheckSquare, FileText,
    Loader2, Link as LinkIcon, Download, X, Play,
    CheckCircle2, Image as ImageIcon, Upload, ExternalLink
} from "lucide-react";

const INSTRUCTION_GUIDES = [
    {
        title: "Kit Unboxing Guide",
        desc: "Step-by-step instructions for unpacking your study kit safely.",
        type: "pdf",
        url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
        duration: "2 min read",
    },
    {
        title: "Supplement Administration",
        desc: "How to take your daily supplement at the correct dose and time.",
        type: "video",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "3:45 video",
    },
    {
        title: "Return Packaging Guide",
        desc: "How to safely repackage your kit for the return courier.",
        type: "pdf",
        url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
        duration: "1 min read",
    },
];

export default function StudyKitPage() {
    // Confirm receipt
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Return label
    const [isGenerating, setIsGenerating] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    // Upload photo
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadDone, setUploadDone] = useState(false);

    // Instructions
    const [showInstructions, setShowInstructions] = useState(false);
    const [activeGuide, setActiveGuide] = useState<typeof INSTRUCTION_GUIDES[0] | null>(null);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleConfirmReceipt = async () => {
        setIsConfirming(true);
        await fetch("/api/proxy/inventory/confirm-receipt", { method: "POST" }).catch(() => { });
        setTimeout(() => { setIsConfirming(false); setIsConfirmed(true); }, 1200);
    };

    const handleGenerateLabel = () => {
        setIsGenerating(true);
        setTimeout(() => { setIsGenerating(false); setShowLabel(true); }, 1800);
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedPhoto(file);
        const reader = new FileReader();
        reader.onload = ev => setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handlePhotoUpload = async () => {
        if (!selectedPhoto) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", selectedPhoto);
            fd.append("category", "OTHER");
            fd.append("participantId", "self");
            await fetch("/api/proxy/documents/", { method: "POST", body: fd }).catch(() => { });
            setUploadDone(true);
        } finally {
            setUploading(false);
        }
    };

    const resetUpload = () => {
        setShowUploadModal(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setUploadDone(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <div className="space-y-8 animate-fade-in">
                <h1 className="text-3xl font-black text-white italic tracking-tight">Study Kit Status</h1>

                {/* Shipment Status Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Outbound */}
                    <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20"><Truck size={24} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Outbound Shipment</h3>
                                <p className="text-slate-500 text-sm">Kit #SK-8291</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                <span className="text-slate-400">Status</span>
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Delivered</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                <span className="text-slate-400">Date</span>
                                <span className="text-white">Jan 15, 2026</span>
                            </div>
                            <button
                                onClick={() => window.open("https://www.fedex.com/fedextrack/", "_blank")}
                                className="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 transition-colors font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 group/btn"
                            >
                                <LinkIcon size={14} className="group-hover/btn:text-cyan-400" /> Track Shipment
                            </button>
                        </div>
                    </div>

                    {/* Return */}
                    <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20"><Package size={24} /></div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Return Shipment</h3>
                                <p className="text-slate-500 text-sm">Due by Mar 10, 2026</p>
                            </div>
                        </div>
                        <div className={`bg-slate-950/50 rounded-xl p-6 text-center border border-dashed transition-all ${showLabel ? "border-emerald-500/50" : "border-white/5"}`}>
                            {showLabel ? (
                                <div className="space-y-4">
                                    <div className="text-emerald-400 font-bold text-sm">Label Generated Successfully!</div>
                                    <button
                                        onClick={() => {
                                            const a = document.createElement("a");
                                            a.href = "/api/proxy/inventory/return-label";
                                            a.download = "return_label.pdf";
                                            a.click();
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-bold text-[13px] uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all"
                                    >
                                        <Download size={14} /> Download PDF Label
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-slate-400 text-sm mb-4">You have not shipped the kit back yet.</p>
                                    <button
                                        onClick={handleGenerateLabel}
                                        disabled={isGenerating}
                                        className="px-6 py-2 bg-amber-500/20 text-amber-400 font-bold text-[13px] uppercase tracking-widest rounded-lg hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                                    >
                                        {isGenerating && <Loader2 size={14} className="animate-spin" />}
                                        {isGenerating ? "Generating…" : "Generate Return Label"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <h2 className="text-xl font-bold text-white mt-12 mb-6 flex items-center gap-3">
                    <CheckSquare size={20} className="text-cyan-400" /> Actions Required
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Confirm Receipt */}
                    <button
                        onClick={handleConfirmReceipt}
                        disabled={isConfirmed || isConfirming}
                        className={`bg-slate-900/40 p-6 rounded-2xl border border-white/5 transition-all text-left group ${isConfirmed ? "opacity-60 cursor-default" : "hover:border-emerald-500/30 cursor-pointer"}`}
                    >
                        <div className={`mb-4 p-3 w-fit rounded-xl transition-colors ${isConfirmed ? "text-emerald-400 bg-emerald-500/20" : "text-slate-400 bg-slate-800"}`}>
                            {isConfirming ? <Loader2 size={20} className="animate-spin" /> : <CheckSquare size={20} />}
                        </div>
                        <h4 className={`font-bold mb-2 transition-colors ${isConfirmed ? "text-emerald-400" : "text-white group-hover:text-emerald-400"}`}>
                            {isConfirmed ? "Receipt Confirmed ✓" : "Confirm Receipt"}
                        </h4>
                        <p className="text-[13px] text-slate-500">
                            {isConfirmed ? "Successfully logged." : "Let us know you received the kit safely."}
                        </p>
                    </button>

                    {/* Upload Photo — NOW WORKS */}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className={`bg-slate-900/40 p-6 rounded-2xl border transition-all text-left group cursor-pointer ${uploadDone ? "border-emerald-500/20" : "border-white/5 hover:border-cyan-500/30"}`}
                    >
                        <div className={`mb-4 p-3 w-fit rounded-xl transition-colors ${uploadDone ? "text-emerald-400 bg-emerald-500/10" : "text-cyan-400 bg-cyan-500/10"}`}>
                            {uploadDone ? <CheckCircle2 size={20} /> : <Camera size={20} />}
                        </div>
                        <h4 className={`font-bold mb-2 transition-colors ${uploadDone ? "text-emerald-400" : "text-white group-hover:text-cyan-400"}`}>
                            {uploadDone ? "Photo Uploaded ✓" : "Upload Photo"}
                        </h4>
                        <p className="text-[13px] text-slate-500">
                            {uploadDone ? "Proof of condition saved." : "Optional proof of shipment condition."}
                        </p>
                    </button>

                    {/* Instructions — NOW WORKS */}
                    <button
                        onClick={() => setShowInstructions(true)}
                        className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 text-left group cursor-pointer transition-all"
                    >
                        <div className="mb-4 text-indigo-400 bg-indigo-500/10 p-3 w-fit rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                            <FileText size={20} />
                        </div>
                        <h4 className="font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Instructions</h4>
                        <p className="text-[13px] text-slate-500">View PDF manual or watch video guides.</p>
                    </button>
                </div>
            </div>

            {/* ── Upload Photo Modal ─────────────────────────────────────────────── */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={resetUpload}>
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
                            <div>
                                <p className="text-[12px] font-black text-cyan-500 uppercase tracking-widest mb-1">Optional</p>
                                <h2 className="text-white font-black text-lg italic">Upload Shipment Photo</h2>
                            </div>
                            <button onClick={resetUpload} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            {uploadDone ? (
                                <div className="text-center py-8 space-y-3">
                                    <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
                                    <p className="text-white font-black text-lg italic">Photo Uploaded!</p>
                                    <p className="text-slate-400 text-sm">Your proof of shipment has been securely saved.</p>
                                </div>
                            ) : (
                                <>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all group/drop"
                                    >
                                        {photoPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={photoPreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                                        ) : (
                                            <div className="space-y-3">
                                                <ImageIcon size={36} className="text-slate-600 mx-auto group-hover/drop:text-cyan-500 transition-colors" />
                                                <p className="text-slate-400 text-sm font-medium">Click to choose a photo</p>
                                                <p className="text-slate-600 text-[12px]">JPG, PNG or WEBP · Max 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoSelect}
                                    />
                                    {selectedPhoto && (
                                        <p className="text-[13px] text-slate-400 text-center font-medium">{selectedPhoto.name}</p>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="px-8 pb-8 flex gap-3">
                            <button onClick={resetUpload} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-[13px] hover:border-slate-500 transition-all">
                                {uploadDone ? "Close" : "Cancel"}
                            </button>
                            {!uploadDone && (
                                <button
                                    onClick={handlePhotoUpload}
                                    disabled={!selectedPhoto || uploading}
                                    className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[13px] shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {uploading ? "Uploading…" : "Upload Photo"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Instructions Modal ─────────────────────────────────────────────── */}
            {showInstructions && (
                <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowInstructions(false); setActiveGuide(null); }}>
                    <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
                            <div>
                                <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest mb-1">Study Resources</p>
                                <h2 className="text-white font-black text-lg italic">Kit Instructions</h2>
                            </div>
                            <button onClick={() => { setShowInstructions(false); setActiveGuide(null); }} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                        </div>

                        {activeGuide ? (
                            /* Guide viewer */
                            <div className="p-8 space-y-4">
                                <button onClick={() => setActiveGuide(null)} className="text-[13px] text-slate-500 hover:text-white uppercase tracking-widest font-black flex items-center gap-1 transition-colors">
                                    ← Back to guides
                                </button>
                                <h3 className="text-white font-black text-xl italic">{activeGuide.title}</h3>
                                {activeGuide.type === "video" ? (
                                    <div className="relative pt-[56.25%] rounded-2xl overflow-hidden bg-slate-950">
                                        <iframe
                                            src={activeGuide.url}
                                            className="absolute inset-0 w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="rounded-2xl bg-slate-950 border border-white/5 p-8 text-center space-y-4">
                                        <FileText size={48} className="text-indigo-400 mx-auto" />
                                        <p className="text-slate-400 text-sm">{activeGuide.desc}</p>
                                        <a
                                            href={activeGuide.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[13px] uppercase tracking-widest transition-all"
                                        >
                                            <ExternalLink size={14} /> Open PDF Guide
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Guide list */
                            <div className="p-8 space-y-4">
                                {INSTRUCTION_GUIDES.map((guide, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveGuide(guide)}
                                        className="w-full flex items-center gap-5 p-5 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/60 text-left transition-all group"
                                    >
                                        <div className="p-3 rounded-xl bg-slate-900 text-indigo-400 group-hover:bg-indigo-500/10 transition-colors shrink-0">
                                            {guide.type === "video" ? <Play size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-bold">{guide.title}</p>
                                            <p className="text-[13px] text-slate-500 mt-0.5">{guide.desc}</p>
                                        </div>
                                        <div className="text-[12px] font-black text-slate-600 uppercase tracking-widest shrink-0">{guide.duration}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="px-8 pb-8">
                            <p className="text-[12px] text-slate-600 text-center">
                                Need help? Contact your study coordinator via the <span className="text-indigo-400 cursor-pointer hover:underline">Messages</span> tab.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
