export default function HipaaBadge() {
    return (
        <div className="fixed bottom-4 right-4 z-40 hidden md:flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[13px] font-medium text-green-500 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            HIPAA Compliant Environment
        </div>
    );
}
