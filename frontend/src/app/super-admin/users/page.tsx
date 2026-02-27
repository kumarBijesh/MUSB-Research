"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Users, Plus, Trash2, Edit2, Search, Filter, X,
    ShieldCheck, Crown, UserCircle, AlertCircle, CheckCircle2, RefreshCw
} from "lucide-react";
import { SuperAdminAuth } from "@/lib/portal-auth";

const ALL_ROLES = ["SUPER_ADMIN", "ADMIN", "COORDINATOR", "PI", "DATA_MANAGER", "SPONSOR", "PARTICIPANT"];

const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    ADMIN: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    COORDINATOR: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    PI: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    DATA_MANAGER: "bg-slate-700/40 text-slate-300 border-slate-600/30",
    SPONSOR: "bg-pink-500/10 text-pink-300 border-pink-500/20",
    PARTICIPANT: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

// ─── Create User Modal ──────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated, token }: { onClose: () => void; onCreated: () => void; token: string }) {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "COORDINATOR" });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/api/super-admin/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.detail || "Failed to create user.");
            }
            onCreated();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="w-full max-w-md glass rounded-2xl border border-violet-500/20 p-8 shadow-2xl shadow-violet-900/40">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-white">Create User</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                    {[
                        { label: "Full Name", key: "name", type: "text", placeholder: "Jane Doe" },
                        { label: "Email", key: "email", type: "email", placeholder: "jane@example.com" },
                        { label: "Password", key: "password", type: "password", placeholder: "••••••••" },
                    ].map(({ label, key, type, placeholder }) => (
                        <div key={key}>
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">{label}</label>
                            <input
                                type={type}
                                value={(form as any)[key]}
                                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                                required
                                placeholder={placeholder}
                                className="w-full bg-slate-900/60 border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                            className="w-full bg-slate-900/60 border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                        >
                            {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-[13px] flex gap-2">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />{error}
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                            {loading ? "Creating..." : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Edit Role Modal ────────────────────────────────────────────────────────────
function EditRoleModal({ user, onClose, onSaved, token }: {
    user: any; onClose: () => void; onSaved: () => void; token: string;
}) {
    const [role, setRole] = useState(user.role);
    const [suspended, setSuspended] = useState(user.suspended || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/api/super-admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role, suspended }),
            });
            if (!res.ok) throw new Error("Failed to update user.");
            onSaved();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="w-full max-w-sm glass rounded-2xl border border-violet-500/20 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-white">Edit User</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">User</p>
                        <p className="text-white font-bold text-sm">{user.name || user.email}</p>
                        <p className="text-slate-500 text-[12px]">{user.email}</p>
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-slate-900/60 border border-white/8 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all">
                            {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={suspended} onChange={e => setSuspended(e.target.checked)}
                            className="w-4 h-4 rounded border border-slate-700 bg-slate-900 text-violet-600 focus:ring-0" />
                        <span className="text-sm font-bold text-slate-300">Suspend Account</span>
                    </label>
                    {error && <p className="text-red-400 text-[13px]">{error}</p>}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SuperAdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [editUser, setEditUser] = useState<any | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    const token = SuperAdminAuth.get()?.token || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const showToast = (msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: "100" });
            if (roleFilter) params.set("role", roleFilter);
            if (search) params.set("search", search);
            const res = await fetch(`${apiUrl}/api/super-admin/users?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const d = await res.json();
                setUsers(d.users || []);
                setTotal(d.total || 0);
            }
        } finally {
            setLoading(false);
        }
    }, [token, roleFilter, search, apiUrl]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Permanently delete user "${userName}"? This cannot be undone.`)) return;
        setDeleting(userId);
        try {
            const res = await fetch(`${apiUrl}/api/super-admin/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                showToast("User deleted.");
                fetchUsers();
            } else {
                const d = await res.json().catch(() => ({}));
                showToast(d.detail || "Delete failed.", "err");
            }
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl ${toast.type === "ok"
                        ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
                        : "bg-red-900/90 border-red-500/30 text-red-300"
                    }`}>
                    {toast.type === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Modals */}
            {showCreate && (
                <CreateUserModal
                    token={token}
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { showToast("User created!"); fetchUsers(); }}
                />
            )}
            {editUser && (
                <EditRoleModal
                    user={editUser}
                    token={token}
                    onClose={() => setEditUser(null)}
                    onSaved={() => { showToast("User updated!"); fetchUsers(); }}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Users size={22} className="text-violet-400" /> User Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {total.toLocaleString()} total users across all roles
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchUsers} disabled={loading}
                        className="p-2.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-400 rounded-xl transition-all disabled:opacity-50">
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-700 to-purple-700 hover:from-violet-600 hover:to-purple-600 text-white text-[12px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-800/30">
                        <Plus size={14} /> Create User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-violet-500/30 transition-all"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-violet-500/30 transition-all"
                >
                    <option value="">All Roles</option>
                    {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-white/5">
                            <tr>
                                {["User", "Email", "Role", "Created", "Status", "Actions"].map(h => (
                                    <th key={h} className="py-3.5 px-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="py-4 px-5">
                                                <div className="h-4 bg-slate-800 rounded animate-pulse w-24" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <UserCircle size={36} className="text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-600 font-medium">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-800/20 transition-colors group">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                                    {u.role === "SUPER_ADMIN" ? (
                                                        <Crown size={14} className="text-violet-400" />
                                                    ) : (
                                                        <UserCircle size={14} className="text-slate-500" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold text-white">{u.name || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-sm text-slate-400 font-mono">{u.email}</td>
                                        <td className="py-4 px-5">
                                            <span className={`text-[11px] font-black px-2 py-1 rounded-lg border ${ROLE_COLORS[u.role] || ROLE_COLORS.PARTICIPANT}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-[12px] text-slate-500">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="py-4 px-5">
                                            {u.suspended ? (
                                                <span className="text-[11px] font-black px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                                    Suspended
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-black px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditUser(u)}
                                                    className="p-2 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                                                    title="Edit Role"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id, u.name || u.email)}
                                                    disabled={deleting === u.id}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                                                    title="Delete User"
                                                >
                                                    {deleting === u.id ? (
                                                        <RefreshCw size={14} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
