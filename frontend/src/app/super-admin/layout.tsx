"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard, Users, Briefcase, ShieldCheck, Settings,
    LogOut, Bell, UserCircle, ChevronRight, Activity,
    FileText, Globe, Megaphone, Search, Building2, BarChart3,
    Shield, Crown, ExternalLink
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

    const handleSignOut = () => {
        SuperAdminAuth.clear();
        router.replace("/super-admin/login");
    };

    if (pathname === "/super-admin/login") return <>{children}</>;

    if (authStatus !== "ok") {
        return (
            <div className="h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-[#020617] text-slate-200 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 flex flex-col border-r"
                style={{ borderColor: "rgba(139,92,246,0.15)", background: "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, rgba(2,6,23,0.95) 100%)" }}>

                {/* Logo */}
                <div className="p-5 border-b" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
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

                {/* User card at bottom */}
                <div className="p-4 border-t space-y-2" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
                    {/* View Website button */}
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
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 shrink-0 border-b bg-slate-950/50 backdrop-blur-sm flex items-center justify-between px-6"
                    style={{ borderColor: "rgba(139,92,246,0.12)" }}>
                    <div className="relative group w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search platform..."
                            className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500/30 transition-all placeholder:text-slate-700"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Live badge */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                            <span className="text-[11px] font-black text-violet-400 uppercase tracking-widest">Super Admin Mode</span>
                        </div>

                        <button className="relative p-2 text-slate-500 hover:text-slate-300 transition-colors">
                            <Bell size={18} />
                        </button>

                        {/* View Website link in header */}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-600/15 rounded-full text-emerald-400 text-[11px] font-black uppercase tracking-widest transition-all group"
                            title="Open public website in new tab"
                        >
                            <Globe size={12} className="group-hover:rotate-12 transition-transform" />
                            View Website
                            <ExternalLink size={10} />
                        </a>

                        <div className="h-5 w-px bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-white leading-none">{saUser?.name || "Super Admin"}</p>
                                <p className="text-[11px] text-violet-400/70 font-black uppercase tracking-widest mt-0.5">SUPER ADMIN</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-1.5 text-slate-600 hover:text-red-400 transition-colors text-[12px] font-bold"
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                                <Crown size={14} className="text-white" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page */}
                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar" style={{ background: "#020617" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
