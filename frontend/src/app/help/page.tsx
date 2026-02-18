
"use client";

import { useState } from "react";
import { Search, ChevronDown, MessageCircle, Mail, HelpCircle, FileQuestion } from "lucide-react";
import Link from "next/link";

const faqs = [
    {
        category: "General",
        items: [
            {
                q: "Is MusB Research free to use?",
                a: "Yes, joining MusB Research and applying for studies is 100% free for participants. We are funded by the research organizations conducting the studies."
            },
            {
                q: "How do I create an account?",
                a: "Simply click 'Sign In' in the top right corner and select 'Sign Up'. You'll need to provide a valid email address and create a password."
            },
            {
                q: "Is my personal information safe?",
                a: "Absolutely. We use bank-grade encryption and comply with HIPAA and GDPR regulations. Your data is never sold to advertisers and is only shared with researchers when you explicitly consent."
            }
        ]
    },
    {
        category: "Participation",
        items: [
            {
                q: "Can I stop a study after I start?",
                a: "Yes. Participation is always voluntary. You can withdraw from a study at any time for any reason without penalty."
            },
            {
                q: "Do I need insurance to participate?",
                a: "No. Most clinical trials cover all study-related medical costs. You do not need health insurance to participate."
            },
            {
                q: "What kind of studies are available?",
                a: "We host a wide range of studies, including remote observational studies, interventional drug trials, medical device testing, and wellness surveys."
            }
        ]
    },
    {
        category: "Compensation",
        items: [
            {
                q: "How and when do I get paid?",
                a: "Compensation guidelines vary by study. Typically, you are paid via direct deposit, check, or gift card after completing specific milestones (e.g., a clinic visit or a weekly survey)."
            },
            {
                q: "Is compensation taxable?",
                a: "In many jurisdictions, compensation over a certain amount (e.g., $600 in the US) is taxable income. We will provide necessary tax forms if applicable."
            }
        ]
    }
];

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState(`0-0`);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleFAQ = (catIndex: number, itemIndex: number) => {
        const id = `${catIndex}-${itemIndex}`;
        setOpenIndex(openIndex === id ? "" : id);
    };

    const filteredFaqs = faqs.map(cat => ({
        category: cat.category,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">

                {/* Hero */}
                <div className="text-center mb-16">
                    <span className="px-4 py-2 bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest rounded-full mb-6 inline-block border border-cyan-500/20">
                        Support Center
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tight mb-8">
                        How can we help?
                    </h1>

                    {/* Search Bar */}
                    <div className="max-w-lg mx-auto relative group">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800 transition-all shadow-xl"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                    </div>
                </div>

                {/* FAQ Grid */}
                <div className="space-y-12">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((category, catIndex) => (
                            <div key={category.category}>
                                <h2 className="text-xl font-black text-white mb-6 pl-2 border-l-4 border-cyan-500">{category.category}</h2>
                                <div className="space-y-4">
                                    {category.items.map((item, index) => {
                                        const isOpen = openIndex === `${catIndex}-${index}`;
                                        return (
                                            <div
                                                key={index}
                                                className={`glass rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-slate-800/50 border-cyan-500/30' : 'bg-slate-900/30 border-white/5 hover:border-white/10'}`}
                                            >
                                                <button
                                                    onClick={() => toggleFAQ(catIndex, index)}
                                                    className="w-full flex items-center justify-between p-6 text-left"
                                                >
                                                    <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                                                        {item.q}
                                                    </span>
                                                    <ChevronDown
                                                        className={`text-cyan-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                                    />
                                                </button>
                                                <div
                                                    className={`px-6 text-slate-400 leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                                                >
                                                    {item.a}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-500">
                            <FileQuestion size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No results found for "{searchQuery}". Try a different term.</p>
                        </div>
                    )}
                </div>

                {/* Contact CTA */}
                <div className="mt-20 glass p-10 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-900 to-[#0B1121] text-center">
                    <h3 className="text-2xl font-black text-white italic mb-4">Still need assistance?</h3>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                        Our support team is available Monday through Friday, 9am - 5pm EST. We usually respond within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="mailto:support@musbresearch.com" className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20">
                            <Mail size={18} /> Email Support
                        </Link>
                        <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5">
                            <MessageCircle size={18} /> Live Chat
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
