export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-slate-800 rounded" />
                    <div className="h-4 w-96 bg-slate-800 rounded" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-slate-800 rounded-xl" />
                    <div className="h-10 w-40 bg-slate-800 rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/5 h-28 bg-slate-900/40" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 glass rounded-2xl border border-white/5 p-8 h-80 bg-slate-900/40" />
                <div className="lg:col-span-4 glass rounded-2xl border border-white/5 p-6 h-80 bg-slate-900/40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/5 h-48 bg-slate-900/40" />
                ))}
            </div>
        </div>
    );
}
