"use client";

import {
    Search,
    Filter,
    MoreVertical,
    ChevronRight,
    Mail,
    Phone,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";


// Status styles mapping
const statusStyles: any = {
    "ACTIVE": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "CONSENTED": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "SCREENED": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "ENROLLED": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "LEAD": "bg-slate-500/10 text-slate-400 border-slate-500/20",
    "COMPLETED": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};


export default function ParticipantsPage() {
    const { data: session } = useSession();
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (session) {
            fetch("/api/proxy/participants")
                .then(res => res.json())
                .then(data => {
                    setParticipants(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Participants fetch error", err);
                    setLoading(false);
                });
        }
    }, [session]);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredParticipants = participants.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredParticipants.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredParticipants.map(p => p.id));
        }
    };

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Participant Registry</h1>
                    <p className="text-slate-500 mt-2 font-medium">Monitoring enrolled subjects and screening leads across global sites.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-[13px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Total Records</div>
                        <div className="text-2xl font-black text-white italic">{participants.length}</div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filter by name, USUBJID, or assigned study..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/30 transition-all font-medium italic"
                    />
                </div>
                <button className="px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-3 text-[13px] font-black uppercase tracking-widest italic">
                    <Filter size={16} /> Advanced Filter
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-cyan-500" size={40} />
                </div>
            ) : (
                /* Table */
                <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto relative mb-24">
                    <table className="w-full">
                        <thead className="bg-slate-900/80 border-b border-white/5">
                            <tr>
                                <th className="py-5 px-8 text-left w-10">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded-md accent-cyan-500 bg-slate-800 border-white/10"
                                        checked={selectedIds.length === filteredParticipants.length && filteredParticipants.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="text-left py-5 px-4 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Subject / ID</th>
                                <th className="text-left py-5 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Status</th>
                                <th className="text-left py-5 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Study assignment</th>
                                <th className="text-left py-5 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Compliance</th>
                                <th className="text-left py-5 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Last Interaction</th>
                                <th className="text-right py-5 px-8 text-[13px] font-black text-slate-500 uppercase tracking-widest italic">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredParticipants.map((p) => (
                                <tr
                                    key={p.id}
                                    onClick={() => router.push(`/admin/participants/${p.id}`)}
                                    className={`hover:bg-cyan-500/[0.02] transition-colors cursor-pointer group ${selectedIds.includes(p.id) ? 'bg-cyan-500/5' : ''}`}
                                >
                                    <td className="py-5 px-8">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded-md accent-cyan-500 bg-slate-800 border-white/10"
                                            checked={selectedIds.includes(p.id)}
                                            onClick={(e) => toggleSelect(p.id, e)}
                                        />
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all border border-white/5">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors leading-none italic">{p.name || "Anonymous Patient"}</p>
                                                <p className="text-[13px] font-bold text-slate-500 mt-2 tracking-tighter uppercase">{p.id.slice(-12).toUpperCase()} • {p.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className={`text-[13px] font-black px-3 py-1 rounded-lg border italic tracking-widest ${statusStyles[p.status] || statusStyles['LEAD']}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 text-[13px] font-bold text-slate-300 italic">{p.studyTitle || p.studyId || "Unenrolled Lead"}</td>
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '92%' }} />
                                            </div>
                                            <span className={`text-[13px] font-black ${p.status === 'ENROLLED' || p.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-700 italic'}`}>
                                                {p.status === 'ENROLLED' || p.status === 'ACTIVE' ? '92%' : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 text-[13px] font-bold text-slate-500 italic uppercase">{p.consentedAt ? "T-04h Active" : "New Lead"}</td>
                                    <td className="py-5 px-8 text-right">
                                        <button className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800/50 rounded-lg">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900 border border-cyan-500/30 px-8 py-4 rounded-3xl shadow-2xl glass z-50 animate-fade-in-up">
                    <div className="text-[13px] font-black text-white italic tracking-widest uppercase">
                        {selectedIds.length} Subjects Selected
                    </div>
                    <div className="h-4 w-[1px] bg-slate-800" />
                    <div className="flex gap-4">
                        <button className="text-[13px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">Send SMS Reminder</button>
                        <button className="text-[13px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">Assign to Study</button>
                        <button className="text-[13px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-all">Bulk Deny</button>
                    </div>
                    <button onClick={() => setSelectedIds([])} className="ml-4 p-2 bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">
                        <CheckCircle2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

