export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-800 rounded" />
                    <div className="h-10 w-64 bg-slate-800 rounded" />
                </div>
                <div className="h-10 w-32 bg-slate-800 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass border border-white/5 rounded-2xl p-5 h-24 bg-slate-900/40" />
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <div className="h-6 w-40 bg-slate-800 rounded" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass p-6 rounded-2xl border border-white/5 h-24 bg-slate-900/30" />
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="h-6 w-40 bg-slate-800 rounded" />
                    <div className="glass p-6 rounded-3xl border border-white/5 h-64 bg-slate-900/40" />
                    <div className="glass p-6 rounded-3xl border border-cyan-500/20 h-48 bg-cyan-500/[0.02]" />
                </div>
            </div>
        </div>
    );
}
