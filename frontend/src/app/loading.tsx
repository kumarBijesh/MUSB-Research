import { Loader2, Activity, Shield, Binary } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[100] overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />

            {/* Main Animation Core */}
            <div className="relative">
                {/* Orbital Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                {/* Glowing Core */}
                <div className="relative bg-slate-900 w-24 h-24 rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_50px_-10px_rgba(34,211,238,0.3)] z-10 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent opacity-50" />
                    <Loader2 className="animate-spin text-cyan-400" size={40} />
                </div>

                {/* Floating Tech Icons */}
                <div className="absolute -top-12 -left-12 p-3 bg-slate-900/80 border border-white/5 rounded-xl backdrop-blur-md animate-bounce delay-100 shadow-xl">
                    <Activity size={20} className="text-pink-500" />
                </div>
                <div className="absolute -bottom-8 -right-12 p-3 bg-slate-900/80 border border-white/5 rounded-xl backdrop-blur-md animate-bounce delay-500 shadow-xl">
                    <Shield size={20} className="text-emerald-500" />
                </div>
                <div className="absolute top-10 -right-20 p-2 bg-slate-900/50 border border-white/5 rounded-lg backdrop-blur-sm animate-pulse delay-300">
                    <Binary size={16} className="text-cyan-600" />
                </div>
            </div>

            {/* Status Labels */}
            <div className="mt-16 text-center space-y-4 relative">
                <div className="flex items-center justify-center gap-3">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
                    <h2 className="text-white text-sm font-black uppercase tracking-[0.4em] italic">
                        Quantum Synchronization
                    </h2>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                        Initializing Encrypted Protocol <br />
                        <span className="text-cyan-800">Status: Secure Link Established</span>
                    </p>
                    <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

