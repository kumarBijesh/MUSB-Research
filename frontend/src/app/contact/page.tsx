"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight } from "lucide-react";

export default function Contact() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "General Inquiry",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/messages/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to send message");

            setSuccess(true);
            setFormData({ firstName: "", lastName: "", email: "", subject: "General Inquiry", message: "" });
        } catch (err) {
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] relative isolate overflow-hidden pt-32 pb-20 px-6">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[130px] rounded-full -z-10 animate-pulse delay-1000" />

            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <span className="px-4 py-2 bg-slate-800/50 text-slate-300 text-[13px] font-black uppercase tracking-widest rounded-full mb-6 inline-block border border-white/5 backdrop-blur-sm">
                        Get In Touch
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                        We're Here for You.
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed">
                        Have questions about a study? Need support? Our team is ready to help you navigate your research journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl">
                            <h3 className="text-2xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
                                <MessageCircle className="text-cyan-400" /> Contact Details
                            </h3>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4 group">
                                    <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 group-hover:bg-cyan-900/20 group-hover:border-cyan-500/30 transition-all shadow-lg shadow-black/20">
                                        <MapPin size={24} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Our Access Hub</h4>
                                        <p className="text-slate-400 leading-relaxed font-medium">6331 State Road 54, <br /> New Port Richey, FL 34653</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group">
                                    <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 group-hover:bg-cyan-900/20 group-hover:border-cyan-500/30 transition-all shadow-lg shadow-black/20">
                                        <Phone size={24} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Call Us</h4>
                                        <p className="text-slate-400 leading-relaxed font-medium hover:text-white transition-colors cursor-pointer">+1-813-419-0781</p>
                                        <p className="text-slate-500 text-[13px] mt-1">Mon-Fri, 9am - 6pm EST</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group">
                                    <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 group-hover:bg-cyan-900/20 group-hover:border-cyan-500/30 transition-all shadow-lg shadow-black/20">
                                        <Mail size={24} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Email Us</h4>
                                        <p className="text-slate-400 leading-relaxed font-medium hover:text-white transition-colors cursor-pointer">info@musbresearch.com</p>
                                        <p className="text-slate-500 text-[13px] mt-1">24/7 Support for Participants</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder or Image */}
                        <div className="aspect-video w-full rounded-3xl overflow-hidden border border-white/10 relative group">
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                <span className="text-slate-600 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                                    <MapPin size={16} /> Interactive Map Loading...
                                </span>
                            </div>
                            {/* In a real app, embed Google Maps iframe or similar here */}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass p-8 md:p-10 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <h3 className="text-3xl font-black text-white italic tracking-tight mb-2">Send a Message</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8">We usually respond within 24 hours.</p>

                        {success ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-fade-in-up">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                                    <Send size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Message Sent!</h4>
                                <p className="text-slate-400 text-sm">Thank you for reaching out. We'll get back to you shortly.</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-6 text-emerald-400 font-bold uppercase tracking-wider text-[13px] hover:text-emerald-300"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium"
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium"
                                        placeholder="jane@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Subject</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium appearance-none"
                                    >
                                        <option>General Inquiry</option>
                                        <option>Study Participation</option>
                                        <option>Partnership Opportunities</option>
                                        <option>Technical Support</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium resize-none"
                                        placeholder="How can we help you today?"
                                    ></textarea>
                                </div>

                                {error && (
                                    <div className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-600/20 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 uppercase tracking-widest text-sm group"
                                >
                                    {loading ? "Sending..." : "Send Message"}
                                    {!loading && <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
