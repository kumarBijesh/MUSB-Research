"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    CheckSquare,
    Package,
    FileText,
    MessageSquare,
    FolderOpen,
    UserCircle,
    LogOut,
    Activity,
    Bell,
    HeartPulse,
} from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/dashboard/participant", icon: LayoutDashboard },
    { name: "Tasks", href: "/dashboard/participant/tasks", icon: CheckSquare },
    { name: "Study Kit", href: "/dashboard/participant/kit", icon: Package },
    { name: "Logs", href: "/dashboard/participant/logs", icon: FileText },
    { name: "Messages", href: "/dashboard/participant/messages", icon: MessageSquare },
    { name: "Documents", href: "/dashboard/participant/documents", icon: FolderOpen },
    { name: "Profile", href: "/dashboard/participant/profile", icon: UserCircle },
];

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    // Redirect unauthenticated users to sign in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/signin");
        }
    }, [status, router]);

    const user = session?.user;
    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

    if (status === "loading") {
        return (
            <div className="h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden">
            {/* ── Sidebar ── */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <Link href="/dashboard/participant" className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20 shrink-0">
                            <HeartPulse size={16} className="text-white" />
                        </div>
                        <span className="text-white font-bold tracking-tight text-sm">
                            MUSB <span className="text-cyan-400">Portal</span>
                        </span>
                    </Link>
                </div>

                {/* User Card */}
                <div className="p-4 mx-3 mt-4 bg-slate-800/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt={user.name || ""}
                                className="w-10 h-10 rounded-full border-2 border-cyan-500/30 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                                {initials}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name || "Participant"}</p>
                            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Participant</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.href === "/dashboard/participant"
                            ? pathname === "/dashboard/participant"
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group text-sm font-semibold ${isActive
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
                                    }`}
                            >
                                <item.icon size={18} className={isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out */}
                <div className="p-3 border-t border-slate-800">
                    <button
                        onClick={() => signOut({ callbackUrl: "/signin" })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all text-sm font-semibold"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Activity size={16} className="text-cyan-400" />
                        <span className="font-bold text-white">
                            {navItems.find(n => pathname === n.href || (n.href !== "/dashboard/participant" && pathname.startsWith(n.href)))?.name || "Dashboard"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        </button>
                        <div className="h-5 w-px bg-slate-800" />
                        <div className="flex items-center gap-3">
                            {user?.image ? (
                                <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover border border-cyan-500/30" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs">
                                    {initials}
                                </div>
                            )}
                            <div className="hidden md:block">
                                <p className="text-xs font-bold text-white leading-none">{user?.name || "Participant"}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[#020617] p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
