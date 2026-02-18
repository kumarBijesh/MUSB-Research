"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    Calendar,
    Settings,
    LogOut,
    CheckSquare,
    Package,
    FileText,
    MessageSquare,
    File
} from "lucide-react";

const navigation = [
    { name: 'Home', href: '/dashboard/participant', icon: Activity },
    { name: 'Tasks', href: '/dashboard/participant/tasks', icon: CheckSquare },
    { name: 'Study Kit', href: '/dashboard/participant/kit', icon: Package },
    { name: 'Logs', href: '/dashboard/participant/logs', icon: FileText },
    { name: 'Messages', href: '/dashboard/participant/messages', icon: MessageSquare },
    { name: 'Documents', href: '/dashboard/participant/documents', icon: File },
    { name: 'Profile', href: '/dashboard/participant/profile', icon: Settings },
];

export default function ParticipantSidebar() {
    const pathname = usePathname();

    return (
        <div className="glass p-6 rounded-3xl border border-white/5 bg-slate-900/40 h-fit sticky top-24">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    JD
                </div>
                <div className="overflow-hidden">
                    <h3 className="text-white font-bold truncate">John Doe</h3>
                    <p className="text-slate-500 text-xs font-medium truncate">ID: #8291</p>
                </div>
            </div>

            <nav className="space-y-2">
                {navigation.map((item) => {
                    // Check if active: exact match for home, or startsWith for subpages (except home to avoid partial match on everything)
                    const isActive = item.href === '/dashboard/participant'
                        ? pathname === '/dashboard/participant'
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-8 mt-8 border-t border-white/5">
                <Link href="/signin" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
                    <LogOut size={18} />
                    Sign Out
                </Link>
            </div>
        </div>
    );
}
