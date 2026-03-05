import { MapPin, Phone, Mail, Facebook, Youtube, Linkedin, Instagram, Send, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const [newsletterType, setNewsletterType] = useState('individual');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        // Simulate an API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, you would send this to your backend:
        // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email, type: newsletterType }) })

        setStatus('success');
        setEmail('');
    };

    return (
        <footer className="relative overflow-hidden bg-[#060d1f] pt-20 pb-10">
            {/* Background Gradient & Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A1128] via-[#07101f] to-[#050c1a]" />
            <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/15 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-900/10 blur-[100px] rounded-full -z-10" />
            {/* Subtle dot grid matching CosmicBackground */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(6,182,212,0.8) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Stars / Particles effect */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full blur-[2px] opacity-60 animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-500 rounded-full blur-[4px] opacity-40 animate-pulse delay-700" />
            <div className="absolute bottom-10 left-10 w-2 h-2 bg-cyan-300 rounded-full blur-[2px] opacity-50 animate-pulse delay-1000" />
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-violet-400 rounded-full blur-[2px] opacity-50 animate-float" style={{ animationDelay: '1.5s' }} />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-sky-400 rounded-full blur-[2px] opacity-45 animate-float" style={{ animationDelay: '2.5s' }} />
            <div className="absolute top-16 right-1/5 w-1.5 h-1.5 bg-indigo-300 rounded-full blur-[2px] opacity-40 animate-pulse" style={{ animationDelay: '3s' }} />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

                    {/* LEFT COLUMN: Logo & Contact */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href="/" className="inline-block mb-6 group">
                            <div className="
                                flex items-center justify-center
                                bg-[#0d1b35] border border-white/10
                                rounded-xl px-5 py-3 w-max
                                transition-all duration-300 ease-out
                                group-hover:scale-105 group-hover:border-cyan-500/40
                                group-hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]
                                transform-gpu
                            ">
                                <Image
                                    src="/musb research.png"
                                    alt="MUSB Research Logo"
                                    width={200}
                                    height={52}
                                    className="h-12 w-auto object-contain"
                                />
                            </div>
                        </Link>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 group">
                                <div className="p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                                    <MapPin size={18} className="text-cyan-400" />
                                </div>
                                <div className="text-sm text-slate-400 leading-relaxed">
                                    <p>6331 State Road 54</p>
                                    <p>New Port Richey, FL 34653</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                                    <Phone size={18} className="text-cyan-400" />
                                </div>
                                <p className="text-sm text-slate-400">+1-813-419-0781</p>
                            </div>

                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                                    <Mail size={18} className="text-cyan-400" />
                                </div>
                                <p className="text-sm text-slate-400">info@musbresearch.com</p>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: Navigation & Socials */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                        {/* two link groups */}
                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div>
                                <h4 className="text-white font-black text-[13px] uppercase tracking-widest mb-6">Solutions</h4>
                                <ul className="space-y-4">
                                    <li><Link href="/business" className="text-slate-400 hover:text-white text-sm transition-colors">For Businesses</Link></li>
                                    <li><Link href="/patients" className="text-slate-400 hover:text-white text-sm transition-colors">For Patients</Link></li>
                                    <li><Link href="/innovation" className="text-slate-400 hover:text-white text-sm transition-colors">Innovation</Link></li>
                                    <li><Link href="/studies" className="text-slate-400 hover:text-white text-sm transition-colors">Join a Study!</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-black text-[13px] uppercase tracking-widest mb-6">MUSB Group</h4>
                                <ul className="space-y-4">
                                    <li><Link href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">About Us</Link></li>
                                    <li><Link href="/news" className="text-slate-400 hover:text-white text-sm transition-colors">News & Events</Link></li>
                                    <li><Link href="/careers" className="text-slate-400 hover:text-white text-sm transition-colors">Careers</Link></li>
                                    <li><Link href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* social icons */}
                        <div>
                            <h4 className="text-white font-black text-[13px] uppercase tracking-widest mb-6">Join The Community</h4>
                            <div className="flex gap-3">
                                {[
                                    { Icon: Youtube, href: "https://youtube.com/@MusB-v5n" },
                                    { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61579407750169" },
                                    { Icon: Instagram, href: "https://www.instagram.com/musbresearch/?next=%2F" },
                                    { Icon: Linkedin, href: "https://www.linkedin.com/company/musb-res/" },
                                    { Icon: MessageCircle, href: "https://wa.me/18134190781" }
                                ].map(({ Icon, href }, i) => (
                                    <Link key={i} href={href} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-500 transition-all">
                                        <Icon size={18} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Newsletter Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">Get Our Newsletters</h3>

                            {status === 'success' ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-fade-in-up mt-6">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Send size={20} className="text-emerald-400" />
                                    </div>
                                    <h4 className="text-emerald-400 font-bold mb-1">Subscribed Successfully!</h4>
                                    <p className="text-emerald-500/70 text-[13px]">Keep an eye on your inbox for the latest updates.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-slate-400 text-[13px] mb-6 font-medium">Which Best Describes You?</p>

                                    <div className="bg-slate-950 p-1 rounded-xl flex mb-6 border border-white/5">
                                        {['Business', 'Individual'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setNewsletterType(type.toLowerCase())}
                                                className={`flex-1 py-2 text-[13px] font-bold uppercase tracking-wider rounded-lg transition-all ${newsletterType === type.toLowerCase()
                                                    ? 'bg-cyan-900/50 text-cyan-400 shadow-lg'
                                                    : 'text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    <form onSubmit={handleSubscribe} className="relative">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Your Email"
                                            disabled={status === 'loading'}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600 disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="absolute right-2 top-2 bottom-2 px-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center"
                                        >
                                            {status === 'loading' ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send size={16} />
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-start gap-6">
                    {/* left side: copyright & disclaimer */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <p className="text-slate-600 text-[13px] font-bold uppercase tracking-widest">
                            &copy; 2026 MusB Research. All rights reserved.
                        </p>
                        <p className="text-slate-500 text-[11px] max-w-md text-center md:text-left">
                            Information can change without notice. MusB™ Research – Integrated Research & Clinical Solutions.
                        </p>
                    </div>

                    {/* right side: compliance badges + links */}
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1.5 border border-white/10 rounded font-black text-[13px] text-slate-500 uppercase tracking-tighter">HIPAA Compliant</div>
                            <div className="px-3 py-1.5 border border-white/10 rounded font-black text-[13px] text-slate-500 uppercase tracking-tighter">GDPR Ready</div>
                            <div className="px-3 py-1.5 border border-white/10 rounded font-black text-[13px] text-slate-500 uppercase tracking-tighter">21 CFR Part 11</div>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end gap-6">
                            <Link href="/privacy" className="text-slate-600 hover:text-slate-400 text-[13px] font-bold uppercase tracking-widest transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="text-slate-600 hover:text-slate-400 text-[13px] font-bold uppercase tracking-widest transition-colors">Terms of Use</Link>
                            <Link href="/cookies" className="text-slate-600 hover:text-slate-400 text-[13px] font-bold uppercase tracking-widest transition-colors">Cookie Settings</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
