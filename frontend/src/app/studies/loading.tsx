import { ArrowRight, Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#020617] pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center max-w-3xl mx-auto animate-pulse">
                    <div className="h-8 w-32 bg-slate-800 rounded-full mx-auto mb-6" />
                    <div className="h-16 w-3/4 bg-slate-800 rounded-2xl mx-auto mb-6" />
                    <div className="h-20 w-full bg-slate-800 rounded-2xl mx-auto mb-8" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="glass p-6 rounded-2xl space-y-8 animate-pulse">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i}>
                                    <div className="h-3 w-16 bg-slate-800 rounded mb-3" />
                                    <div className="h-10 w-full bg-slate-800 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 4, 5].map(i => (
                                <div key={i} className="glass rounded-3xl p-1 border border-white/5 animate-pulse">
                                    <div className="bg-slate-950/50 rounded-[22px] p-7 h-80 flex flex-col">
                                        <div className="flex justify-between mb-6">
                                            <div className="h-6 w-20 bg-slate-800 rounded-lg" />
                                            <div className="h-4 w-16 bg-slate-800 rounded" />
                                        </div>
                                        <div className="h-8 w-full bg-slate-800 rounded-lg mb-4" />
                                        <div className="flex gap-2 mb-4">
                                            <div className="h-4 w-16 bg-slate-800 rounded" />
                                            <div className="h-4 w-16 bg-slate-800 rounded" />
                                        </div>
                                        <div className="h-20 w-full bg-slate-800 rounded-lg mb-6" />
                                        <div className="mt-auto pt-5 border-t border-white/5">
                                            <div className="h-10 w-full bg-slate-800 rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
