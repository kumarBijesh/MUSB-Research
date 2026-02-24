"use client";

import { useState } from "react";
import { Package, Truck, Camera, CheckSquare, FileText, Loader2, Link as LinkIcon, Download } from "lucide-react";

export default function StudyKitPage() {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    const handleConfirmReceipt = () => {
        setIsConfirming(true);
        // Simulate API call
        setTimeout(() => {
            setIsConfirming(false);
            setIsConfirmed(true);
        }, 1500);
    };

    const handleGenerateLabel = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setShowLabel(true);
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-black text-white italic tracking-tight">Study Kit Status</h1>

            {/* Shipment Status Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 transition-opacity opacity-50 group-hover:opacity-100" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                            <Truck size={24} />
                        </div>
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
                            onClick={() => window.open('https://www.fedex.com/fedextrack/', '_blank')}
                            className="w-full py-3 mt-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 transition-colors font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 group/btn"
                        >
                            <LinkIcon size={14} className="group-hover/btn:text-cyan-400" /> Track Shipment
                        </button>
                    </div>
                </div>

                <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group opacity-100 transition-opacity">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Return Shipment</h3>
                            <p className="text-slate-500 text-sm">Due by Mar 10, 2026</p>
                        </div>
                    </div>
                    <div className={`bg-slate-950/50 rounded-xl p-6 text-center border border-dashed transition-all ${showLabel ? 'border-emerald-500/50' : 'border-white/5'}`}>
                        {showLabel ? (
                            <div className="space-y-4 animate-scale-in">
                                <div className="text-emerald-400 font-bold text-sm">Label Generated Successfully!</div>
                                <button className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-bold text-[13px] uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all">
                                    <Download size={14} /> Download PDF Label
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-400 text-sm mb-4">You have not shipped the kit back yet.</p>
                                <button
                                    onClick={handleGenerateLabel}
                                    disabled={isGenerating}
                                    className="px-6 py-2 bg-amber-500/20 text-amber-400 font-bold text-[13px] uppercase tracking-widest rounded-lg hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                >
                                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : null}
                                    {isGenerating ? 'Generating...' : 'Generate Return Label'}
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
                <button
                    onClick={handleConfirmReceipt}
                    disabled={isConfirmed || isConfirming}
                    className={`glass p-6 rounded-2xl border border-white/5 transition-all text-left group ${isConfirmed ? 'opacity-50 cursor-default' : 'hover:border-emerald-500/30 bg-slate-900/40 cursor-pointer'}`}
                >
                    <div className={`mb-4 p-3 w-fit rounded-xl transition-colors ${isConfirmed ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 bg-slate-800'}`}>
                        {isConfirming ? <Loader2 size={20} className="animate-spin" /> : <CheckSquare size={20} />}
                    </div>
                    <h4 className={`font-bold mb-2 transition-colors ${isConfirmed ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'}`}>
                        {isConfirmed ? 'Receipt Confirmed' : 'Confirm Receipt'}
                    </h4>
                    <p className="text-[13px] text-slate-500">
                        {isConfirmed ? 'Successfully logged on Jan 21.' : 'Let us know you received the kit safely.'}
                    </p>
                </button>

                <button className="glass p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 bg-slate-900/40 text-left group transition-all">
                    <div className="mb-4 text-cyan-400 bg-cyan-500/10 p-3 w-fit rounded-xl">
                        <Camera size={20} />
                    </div>
                    <h4 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Upload Photo</h4>
                    <p className="text-[13px] text-slate-500">Optional proof of shipment condition.</p>
                </button>

                <button className="glass p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 bg-slate-900/40 text-left group transition-all">
                    <div className="mb-4 text-indigo-400 bg-indigo-500/10 p-3 w-fit rounded-xl">
                        <FileText size={20} />
                    </div>
                    <h4 className="font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Instructions</h4>
                    <p className="text-[13px] text-slate-500">View PDF manual or watch video guides.</p>
                </button>
            </div>
        </div>
    );
}
