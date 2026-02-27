"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard, CheckSquare, Package, FileText, MessageSquare,
    FolderOpen, UserCircle, LogOut, Activity, Bell, HeartPulse, Home,
} from "lucide-react";
import { ParticipantAuth, type PortalUser } from "@/lib/portal-auth";

const navItems = [
    { name: "Dashboard", href: "/dashboard/participant", icon: LayoutDashboard },
    { name: "Tasks", href: "/dashboard/participant/tasks", icon: CheckSquare },
    { name: "Study Kit", href: "/dashboard/participant/kit", icon: Package },
    { name: "Logs", href: "/dashboard/participant/logs", icon: FileText },
    { name: "Messages", href: "/dashboard/participant/messages", icon: MessageSquare },
    { name: "Documents", href: "/dashboard/participant/documents", icon: FolderOpen },
    { name: "Reports", href: "/dashboard/participant/reports", icon: Activity },
    { name: "Profile", href: "/dashboard/participant/profile", icon: UserCircle },
    { name: "Main Site", href: "/", icon: Home },
];

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // ── Per-tab auth: reads from THIS TAB's sessionStorage only ──
    // sessionStorage is completely isolated between browser tabs.
    // Admin logging in on Tab 2 will NOT affect Tab 1's participant session.
    const [user, setUser] = useState<PortalUser | null>(null);
    const [authStatus, setAuthStatus] = useState<"loading" | "ok" | "denied">("loading");

    // All hooks MUST be declared before any conditional returns (React Rules of Hooks)
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState([
        { id: "1", from: "Dr. Sarah Mitchell", role: "Coordinator", message: "Your latest blood work results have been uploaded. Please review them in the Documents section.", time: "10m ago", unread: true, type: "urgent" },
        { id: "2", from: "Astra Biotech", role: "Sponsor", message: "Important: The NAD+ Longevity Trial protocol has been updated. Check your messages for details.", time: "2h ago", unread: true, type: "info" },
        { id: "3", from: "System Analytics", role: "Automated", message: "Morning supplement log successfully synchronized with the decentralized ledger.", time: "5h ago", unread: false, type: "success" },
    ]);

    useEffect(() => {
        // Read only THIS TAB's sessionStorage — not the shared NextAuth cookie
        const session = ParticipantAuth.get();
        if (!session || session.user.role !== "PARTICIPANT") {
            setAuthStatus("denied");
            router.replace("/signin");
        } else {
            setUser(session.user);
            setAuthStatus("ok");
        }
    }, [router]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node))
                setIsNotifOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Guard — show spinner while loading or redirecting
    if (authStatus !== "ok") {
        return (
            <div className="h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";
    const unreadCount = notifications.filter(n => n.unread).length;
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    const handleSignOut = async () => {
        ParticipantAuth.clear(); // Only clears THIS TAB's session
        await signOut({ callbackUrl: "/signin" });
    };

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden">
            {/* ── Sidebar ── */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
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

                <div className="p-4 mx-3 mt-4 bg-slate-800/40 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="flex items-center gap-3">
                        {user?.image ? (
                            <img src={user.image} alt="" className="w-10 h-10 rounded-full border border-cyan-500/30 object-cover shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shrink-0">
                                {initials}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-white truncate leading-none uppercase tracking-tight">{user?.name || "Participant"}</p>
                            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em] mt-1.5 opacity-70">PARTICIPANT</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.href === "/dashboard/participant"
                            ? pathname === "/dashboard/participant"
                            : pathname.startsWith(item.href);
                        return (
                            <Link key={item.name} href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group text-sm font-semibold ${isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
                                    }`}>
                                <item.icon size={18} className={isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-slate-800">
                    <button onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all text-sm font-semibold">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Activity size={16} className="text-cyan-400" />
                        <span className="font-bold text-white">
                            {navItems.find(n => pathname === n.href || (n.href !== "/dashboard/participant" && pathname.startsWith(n.href)))?.name || "Dashboard"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`relative p-2 transition-all rounded-lg ${isNotifOpen ? "bg-cyan-500/10 text-cyan-400" : "text-slate-500 hover:text-white"}`}>
                                <Bell size={18} />
                                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border-2 border-[#020617] animate-pulse" />}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute right-0 mt-4 w-[380px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Medical Alerts</h3>
                                            <p className="text-[13px] text-slate-500 font-bold uppercase mt-1">{unreadCount} Pending Communications</p>
                                        </div>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-[13px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest">
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        <div className="divide-y divide-white/5">
                                            {notifications.map((notif) => (
                                                <div key={notif.id} className={`p-4 hover:bg-white/[0.03] transition-colors cursor-pointer relative ${notif.unread ? "bg-cyan-500/[0.02]" : ""}`}>
                                                    {notif.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[2px_0_10px_rgba(6,182,212,0.5)]" />}
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[13px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                                            {notif.from}
                                                            <span className={`px-1.5 py-0.5 rounded text-[13px] bg-white/5 ${notif.role === "Coordinator" ? "text-pink-400" : notif.role === "Sponsor" ? "text-amber-400" : "text-slate-500"}`}>{notif.role}</span>
                                                        </span>
                                                        <span className="text-[13px] font-bold text-slate-600 uppercase whitespace-nowrap">{notif.time}</span>
                                                    </div>
                                                    <p className={`text-[13px] leading-relaxed ${notif.unread ? "text-slate-200 font-medium" : "text-slate-400"}`}>{notif.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Link href="/dashboard/participant/messages" onClick={() => setIsNotifOpen(false)}
                                        className="block p-4 text-center text-[13px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] border-t border-white/5 transition-colors">
                                        Protocol Inbox
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="h-5 w-px bg-slate-800" />
                        <div className="flex items-center gap-3 ml-2 border-l border-slate-800 pl-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-white leading-tight truncate max-w-[150px]">{user?.name || "Participant"}</p>
                                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">{user?.email}</p>
                            </div>
                            {user?.image ? (
                                <img src={user.image} alt="" className="w-9 h-9 rounded-xl object-cover border border-cyan-500/30" />
                            ) : (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-[12px] shadow-lg shadow-cyan-500/10">
                                    {initials}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-[#020617] p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
