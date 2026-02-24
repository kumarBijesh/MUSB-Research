export default function Loading() {
    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="h-6 w-32 bg-slate-800 rounded animate-pulse mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="animate-pulse">
                            <div className="flex gap-3 mb-6">
                                <div className="h-6 w-20 bg-slate-800 rounded-lg" />
                                <div className="h-6 w-20 bg-slate-800 rounded-lg" />
                            </div>
                            <div className="h-16 w-3/4 bg-slate-800 rounded-2xl mb-6" />
                            <div className="h-24 w-full bg-slate-800 rounded-2xl" />
                        </div>

                        <div className="glass p-8 rounded-3xl border border-white/5 animate-pulse">
                            <div className="h-8 w-1/4 bg-slate-800 rounded-lg mb-6" />
                            <div className="h-20 w-full bg-slate-800 rounded-lg mb-6" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i}>
                                        <div className="h-3 w-12 bg-slate-800 rounded mb-1" />
                                        <div className="h-5 w-20 bg-slate-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="glass p-8 rounded-3xl border border-cyan-500/20 animate-pulse">
                            <div className="h-8 w-1/2 bg-slate-800 rounded-lg mb-4" />
                            <div className="h-12 w-full bg-slate-800 rounded-lg mb-8" />
                            <div className="h-10 w-24 bg-slate-800 rounded mb-8" />
                            <div className="h-14 w-full bg-slate-800 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
