"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
    LayoutDashboard, Briefcase, Users, Calendar, Package, Database,
    ShieldAlert, FileText, Settings, Search, Bell, UserCircle, LogOut, BarChart, Users2,
} from "lucide-react";
import { AdminAuth, type PortalUser } from "@/lib/portal-auth";
import NotificationBell from "@/components/NotificationBell";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Studies", href: "/admin/studies", icon: Briefcase },
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "Scheduling", href: "/admin/scheduling", icon: Calendar },
    { name: "Kits & Inventory", href: "/admin/inventory", icon: Package },
    { name: "Data & Exports", href: "/admin/data", icon: Database },
    { name: "Safety (AE/SAE)", href: "/admin/safety", icon: ShieldAlert },
    { name: "Documents (eTMF-lite)", href: "/admin/documents", icon: FileText },
    { name: "Reports (Sponsor/Claims)", href: "/admin/reports", icon: BarChart },
    { name: "Team & Roles", href: "/admin/team", icon: Users2 },
    { name: "Settings / Integrations", href: "/admin/settings", icon: Settings },
];

const ADMIN_ROLES = new Set(["ADMIN", "COORDINATOR", "PI", "DATA_MANAGER"]);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // ── Per-tab auth: reads from THIS TAB's sessionStorage only ──
    // Admin in Tab 2 does NOT affect Participant Tab 1 — sessionStorage is tab-isolated.
    const [adminUser, setAdminUser] = useState<PortalUser | null>(null);
    const [authStatus, setAuthStatus] = useState<"loading" | "ok" | "denied">("loading");

    useEffect(() => {
        // Login page is always accessible without auth
        if (pathname === "/admin/login") {
            setAuthStatus("ok");
            return;
        }
        const session = AdminAuth.get();
        if (!session || !ADMIN_ROLES.has(session.user.role)) {
            setAuthStatus("denied");
            router.replace("/admin/login");
        } else {
            setAdminUser(session.user);
            setAuthStatus("ok");
        }
    }, [pathname, router]);

    const handleSignOut = async () => {
        AdminAuth.clear(); // Clear only THIS TAB's admin session
        await signOut({ callbackUrl: "/admin/login" });
    };

    // Login page: render without the dashboard shell
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Show spinner while loading or redirecting
    if (authStatus !== "ok") {
        return (
            <div className="h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-cyan-500 rounded-lg shrink-0 shadow-lg shadow-cyan-500/20">
                            <span className="text-white font-bold tracking-tighter">M</span>
                        </div>
                        <span className="text-white font-bold tracking-tight">Coordinator <span className="text-cyan-500">Console</span></span>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"}`}>
                                <item.icon size={20} className={isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"} />
                                <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input type="text" placeholder="Search everything (Ctrl + K)"
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/30 transition-all" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <div className="h-6 w-px bg-slate-800" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[13px] font-bold text-white leading-none mb-1">{adminUser?.name || "Admin User"}</p>
                                <p className="text-[13px] text-slate-500 font-black uppercase tracking-widest">{adminUser?.role || "Admin"}</p>
                            </div>
                            <button onClick={handleSignOut} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Sign Out">
                                <LogOut size={20} />
                            </button>
                            <UserCircle size={32} className="text-slate-700 hover:text-cyan-500 transition-colors cursor-pointer" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[#020617] p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
