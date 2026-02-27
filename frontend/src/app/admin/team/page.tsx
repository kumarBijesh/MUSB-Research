"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, UserPlus, Shield, Mail, Search, MoreVertical,
    BadgeCheck, Clock, Loader2, RefreshCw, X, Check, Trash2
} from "lucide-react";
import { AdminAuth } from "@/lib/portal-auth";
import { format } from "date-fns";

type TeamUser = {
    id: string;
    name?: string;
    email: string;
    role: string;
    createdAt: string;
    lastLogin?: string;
};

const ROLES: Record<string, { color: string; bg: string; label: string }> = {
    ADMIN: { color: "text-red-400", bg: "bg-red-500/10", label: "Super Admin" },
    COORDINATOR: { color: "text-cyan-400", bg: "bg-cyan-500/10", label: "Study Coordinator" },
    PI: { color: "text-purple-400", bg: "bg-purple-500/10", label: "Principal Investigator" },
    PARTICIPANT: { color: "text-slate-400", bg: "bg-slate-500/10", label: "Trial Participant" },
    SPONSOR: { color: "text-amber-400", bg: "bg-amber-500/10", label: "Sponsor" },
};

export default function TeamPage() {
    const [users, setUsers] = useState<TeamUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [showInvite, setShowInvite] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "COORDINATOR" });
    const [inviteError, setInviteError] = useState("");

    const getToken = () => AdminAuth.get()?.token ?? "";

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/proxy/admin/users", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleInvite = async () => {
        if (!inviteForm.email.trim()) return;
        setInviting(true);
        setInviteError("");
        try {
            const res = await fetch("/api/proxy/admin/invite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(inviteForm),
            });
            if (res.ok) {
                await fetchUsers();
                setShowInvite(false);
                setInviteForm({ email: "", name: "", role: "COORDINATOR" });
            } else {
                const err = await res.json();
                setInviteError(err.detail || "Invite failed.");
            }
        } finally {
            setInviting(false);
        }
    };

    const filtered = users.filter(u => {
        const matchSearch = !searchTerm ||
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
    });

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
                    <button onClick={fetchUsers} className="p-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setShowInvite(true)}
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 transition-all flex items-center gap-2"
                    >
                        <UserPlus size={18} /> Invite Staff
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50"
                >
                    <option value="">All Roles</option>
                    {Object.keys(ROLES).map(r => <option key={r} value={r}>{ROLES[r].label}</option>)}
                </select>
            </div>

            {/* Stats Bar */}
            {!loading && (
                <div className="flex gap-4 flex-wrap">
                    {Object.entries(ROLES).map(([role, info]) => {
                        const count = users.filter(u => u.role === role).length;
                        if (count === 0) return null;
                        return (
                            <div key={role} className={`px-4 py-2 rounded-xl border border-white/5 ${info.bg} flex items-center gap-2`}>
                                <span className={`text-[12px] font-black uppercase ${info.color}`}>{info.label}</span>
                                <span className="text-[12px] font-black text-white">{count}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Team Grid */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-slate-500 font-bold italic uppercase tracking-wider">
                    {users.length === 0 ? "No team members found." : "No matching results."}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((user) => {
                        const roleInfo = ROLES[user.role] || ROLES.PARTICIPANT;
                        return (
                            <div key={user.id} className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:border-orange-500/20 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-xl font-black text-white italic tracking-tighter shadow-xl">
                                        {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <button className="text-slate-600 hover:text-white transition-colors"><MoreVertical size={20} /></button>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-lg font-black text-white italic tracking-tight flex items-center gap-2 uppercase">
                                        {user.name || "Anonymous"}
                                        {user.role === "ADMIN" && <BadgeCheck size={16} className="text-red-400" />}
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
                                        <Clock size={12} /> Joined {format(new Date(user.createdAt), "MMM yyyy")}
                                    </div>
                                    <button className="text-[13px] font-black text-orange-500 uppercase tracking-widest hover:underline">Permissions</button>
                                </div>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors" />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Invite Modal */}
            {showInvite && (
                <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
                            <h2 className="text-white font-black text-lg italic">Invite Staff Member</h2>
                            <button onClick={() => setShowInvite(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            {inviteError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-[13px] font-bold">{inviteError}</div>
                            )}
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                                <input
                                    value={inviteForm.name}
                                    onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Dr. Jane Smith"
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 placeholder:text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email *</label>
                                <input
                                    value={inviteForm.email}
                                    onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="staff@hospital.org"
                                    type="email"
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 placeholder:text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
                                <select
                                    value={inviteForm.role}
                                    onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
                                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50"
                                >
                                    {["COORDINATOR", "PI", "ADMIN"].map(r => (
                                        <option key={r} value={r}>{ROLES[r].label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="px-8 pb-8 flex gap-3">
                            <button onClick={() => setShowInvite(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-[13px] hover:border-slate-500 transition-all">Cancel</button>
                            <button
                                onClick={handleInvite}
                                disabled={inviting || !inviteForm.email.trim()}
                                className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[13px] shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {inviting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                {inviting ? "Inviting…" : "Send Invite"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
