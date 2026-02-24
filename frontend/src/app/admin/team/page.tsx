"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Users,
    UserPlus,
    Shield,
    Mail,
    Search,
    MoreVertical,
    BadgeCheck,
    Key,
    Clock,
    MoreHorizontal,
    Loader2
} from "lucide-react";

export default function TeamPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (session) {
            fetch("/api/proxy/admin/users")
                .then(res => res.json())
                .then(data => {
                    setUsers(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Team fetch error", err);
                    setLoading(false);
                });
        }
    }, [session]);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const roles: any = {
        "ADMIN": { color: "text-red-400", bg: "bg-red-500/10", label: "Super Admin" },
        "COORDINATOR": { color: "text-cyan-400", bg: "bg-cyan-500/10", label: "Study Coordinator" },
        "PI": { color: "text-purple-400", bg: "bg-purple-500/10", label: "Principal Investigator" },
        "PARTICIPANT": { color: "text-slate-400", bg: "bg-slate-500/10", label: "Trial Participant" },
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
                        <Users className="text-orange-500" size={32} /> Command <span className="text-orange-500">Center</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage trial personnel, access permissions, and audit staff activity.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 transition-all flex items-center gap-2">
                        <UserPlus size={18} /> Invite Staff
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Team Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-orange-500" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user) => {
                            const roleInfo = roles[user.role] || roles.PARTICIPANT;
                            return (
                                <div key={user.id} className="glass p-6 rounded-[2rem] border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-xl font-black text-white italic tracking-tighter shadow-xl">
                                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <button className="text-slate-600 hover:text-white transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <h3 className="text-lg font-black text-white italic tracking-tight flex items-center gap-2 uppercase">
                                            {user.name || "Anonymous"}
                                            {user.role === 'ADMIN' && <BadgeCheck size={16} className="text-red-400" />}
                                        </h3>
                                        <p className="text-[13px] font-bold text-slate-500 flex items-center gap-2">
                                            <Mail size={12} /> {user.email}
                                        </p>
                                    </div>

                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border italic text-[13px] font-black uppercase tracking-widest ${roleInfo.bg} ${roleInfo.color} border-white/5`}>
                                        <Shield size={10} /> {roleInfo.label}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-[13px] font-black text-slate-600 uppercase tracking-widest leading-none">
                                            <Clock size={12} /> Joined {new Date(user.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                                        </div>
                                        <button className="text-[13px] font-black text-orange-500 uppercase tracking-widest hover:underline">Permissions</button>
                                    </div>

                                    {/* Subtle hover effect background */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors" />
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && filteredUsers.length === 0 && (
                    <div className="py-20 text-center text-slate-500 font-bold italic uppercase tracking-wider">No matching team members found.</div>
                )}
            </div>
        </div>
    );
}
