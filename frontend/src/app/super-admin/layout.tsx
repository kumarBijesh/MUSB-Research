"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard, Users, Briefcase, ShieldCheck, Settings,
    LogOut, Bell, UserCircle, ChevronRight, Activity,
    FileText, Globe, Megaphone, Search, Building2, BarChart3,
    Shield, Crown, ExternalLink, Menu, X, Bell as BellIcon
} from "lucide-react";
import { SuperAdminAuth, type PortalUser } from "@/lib/portal-auth";

const navSections = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
            { name: "Activity Log", href: "/super-admin/activity", icon: Activity },
        ]
    },
    {
        label: "Platform Management",
        items: [
            { name: "All Users", href: "/super-admin/users", icon: Users },
            { name: "All Studies", href: "/super-admin/studies", icon: Briefcase },
            { name: "Sponsors", href: "/super-admin/sponsors", icon: Building2 },
            { name: "Sponsor Leads", href: "/super-admin/leads", icon: BarChart3 },
        ]
    },
    {
        label: "System",
        items: [
            { name: "Announcements", href: "/super-admin/announcements", icon: Megaphone },
            { name: "Audit Logs", href: "/super-admin/audit", icon: FileText },
            { name: "System Settings", href: "/super-admin/settings", icon: Settings },
        ]
    },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [saUser, setSaUser] = useState<PortalUser | null>(null);
    const [authStatus, setAuthStatus] = useState<"loading" | "ok" | "denied">("loading");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (pathname === "/super-admin/login") {
            setAuthStatus("ok");
            return;
        }
        const sess = SuperAdminAuth.get();
        if (!sess || sess.user.role !== "SUPER_ADMIN") {
            setAuthStatus("denied");
            router.replace("/super-admin/login");
        } else {
            setSaUser(sess.user);
            setAuthStatus("ok");
        }
    }, [pathname, router]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    const handleSignOut = () => {
        SuperAdminAuth.clear();
        router.replace("/super-admin/login");
    };

    if (pathname === "/super-admin/login") return <>{children}</>;

    if (authStatus !== "ok") {
        return (
            <div className="h-screen bg-transparent flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-transparent text-slate-200 overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-72 shrink-0 flex flex-col border-r z-[70] transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ borderColor: "rgba(139,92,246,0.15)", background: "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, rgba(2,6,23,0.95) 100%)" }}>

                {/* Logo */}
                <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
                    <Link href="/super-admin" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-600/30">
                            <Crown size={16} className="text-white" />
                            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight leading-none">Super Admin</p>
                            <p className="text-violet-400/70 text-[11px] font-bold uppercase tracking-widest leading-none mt-0.5">Master Control</p>
                        </div>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-3 mb-2">
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-sm font-semibold ${isActive
                                                ? "bg-violet-600/15 text-violet-300 border border-violet-500/25 shadow-sm shadow-violet-600/10"
                                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
                                                }`}
                                        >
                                            <item.icon
                                                size={17}
                                                className={isActive ? "text-violet-400" : "text-slate-600 group-hover:text-slate-400"}
                                            />
                                            <span className="tracking-tight">{item.name}</span>
                                            {isActive && (
                                                <ChevronRight size={13} className="ml-auto text-violet-500" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User card at bottom (HIDDEN ON MOBILE, integrated into header) */}
                <div className="hidden lg:block p-4 border-t space-y-2" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/8 border border-transparent hover:border-emerald-500/20 transition-all group text-sm font-semibold"
                    >
                        <Globe size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                        <span className="tracking-tight">View Website</span>
                        <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    </a>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-600/8 border border-violet-500/15">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0">
                            <Shield size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-white truncate leading-none">
                                {saUser?.name || "Super Admin"}
                            </p>
                            <p className="text-[11px] font-black text-violet-400/80 uppercase tracking-widest mt-0.5">
                                Super Admin
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                            title="Sign Out"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 shrink-0 border-b bg-slate-950/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 z-[50]"
                    style={{ borderColor: "rgba(139,92,246,0.12)" }}>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <Menu size={20} />
                        </button>
                        <div className="relative group w-48 sm:w-72 hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search platform..."
                                className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500/30 transition-all placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Live badge (Desktop only) */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                            <span className="text-[11px] font-black text-violet-400 uppercase tracking-widest">Master Access</span>
                        </div>

                        <div className="sm:relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`p-2 rounded-xl transition-all border ${isNotificationsOpen ? 'bg-violet-600/10 border-violet-500/30 text-violet-400' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'}`}
                            >
                                <BellIcon size={18} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                            </button>

                            {/* Notifications Dropdown (Responsive) */}
                            {isNotificationsOpen && (
                                <div className="absolute left-4 right-4 sm:left-auto sm:right-0 top-[70px] sm:top-auto sm:mt-1 sm:w-80 bg-[#0a1120]/95 backdrop-blur-xl border border-violet-500/20 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-4 border-b border-white/5 bg-violet-600/5">
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Platform Activity</h3>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="p-3 rounded-xl hover:bg-white/5 transition-all text-[12px] text-slate-400 leading-relaxed border border-transparent hover:border-white/5 mb-1">
                                                <span className="text-violet-400 font-bold">System:</span> New sponsor inquiry registered for "Phase III Cardio trial".
                                                <div className="text-[10px] text-slate-600 mt-1 uppercase font-black">2 mins ago</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-5 w-px bg-slate-800" />

                        <div className="sm:relative" ref={profileRef}>
                            <button className="flex items-center gap-2 cursor-pointer group w-full text-left focus:outline-none" onClick={() => setIsProfileOpen((prev) => !prev)}>
                                <div className="text-right hidden sm:block">
                                    <p className="text-[13px] font-bold text-white group-hover:text-violet-400 transition-colors leading-none mb-1">{saUser?.name || "Master"}</p>
                                    <p className="text-[10px] text-violet-400/70 font-black uppercase tracking-widest">SYSTEM_ADMIN</p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-600/10 border border-violet-500/20 group-hover:border-violet-500/50 transition-all">
                                    <Shield size={16} className="text-white" />
                                </div>
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute left-4 right-4 sm:left-auto sm:right-0 top-[70px] sm:top-auto sm:mt-1 sm:w-56 bg-[#0a1120]/98 backdrop-blur-xl border border-violet-500/20 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-4 border-b border-white/5 bg-violet-600/5">
                                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{saUser?.name}</p>
                                        <p className="text-[10px] text-violet-400/70 font-bold italic truncate">Master Platform Control</p>
                                    </div>
                                    <div className="p-2">
                                        <Link href="/super-admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                            <Settings size={15} /> System Config
                                        </Link>
                                        <Link href="/super-admin/audit" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                            <Activity size={15} /> Audit Explorer
                                        </Link>
                                        <div className="h-px bg-white/5 my-1" />
                                        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all text-left">
                                            <LogOut size={15} /> Terminate Master
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page */}
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-transparent">
                    {children}
                </main>
            </div>
        </div>
    );
}
