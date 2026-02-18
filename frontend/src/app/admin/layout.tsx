"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Users, Calendar, Package, Database, ShieldAlert, FileText, Settings, Search, Bell, UserCircle } from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Studies", href: "/admin/studies", icon: Briefcase },
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "Scheduling", href: "/admin/scheduling", icon: Calendar },
    { name: "Kits & Inventory", href: "/admin/inventory", icon: Package },
    { name: "Data & Exports", href: "/admin/data", icon: Database },
    { name: "Safety (AE/SAE)", href: "/admin/safety", icon: ShieldAlert },
    { name: "Document Vault", href: "/admin/documents", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

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
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"} />
                                <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all">
                        <Settings size={20} />
                        <span className="text-sm font-semibold">Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search everything (Ctrl + K)"
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
                        </button>
                        <div className="h-6 w-px bg-slate-800" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs font-bold text-white leading-none mb-1">Alex Johnson</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Lead Coordinator</p>
                            </div>
                            <UserCircle size={32} className="text-slate-700 hover:text-cyan-500 transition-colors cursor-pointer" />
                        </div>
                    </div>
                </header>

                {/* Dashboard Scroll Area */}
                <main className="flex-1 overflow-y-auto bg-[#020617] p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
