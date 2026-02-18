"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, User, Fingerprint, AlertCircle, Phone } from "lucide-react";

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/participant";

    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'participant' | 'sponsor'>('participant');

    // Form State
    const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [verificationCode, setVerificationCode] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        // basic form validation
        if (!email || !password || (!isLogin && !name)) {
            setError("Please fill in all fields.");
            return;
        }

        // precise regex for password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
        if (!isLogin && !passwordRegex.test(password)) {
            setError("Password must be at least 12 characters and include uppercase, lowercase, number, and special character.");
            return;
        }

        setLoading(true);
        setError(null);

        // Simulate sending a code
        await new Promise(resolve => setTimeout(resolve, 1500));
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(code);

        console.log(`[MOCK EMAIL SERVICE] Verification Code for ${email}: ${code}`);
        alert(`[DEMO MODE] Your verification code is: ${code}`);

        setStep('verification');
        setLoading(false);
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!verificationCode || inputCode !== verificationCode) {
            setError("Invalid or expired verification code. Please request a new one.");
            setLoading(false);
            return;
        }

        // Burn the OTP (One-time use)
        setVerificationCode(null);

        try {
            // Registration Flow
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    role: role === 'sponsor' ? 'SPONSOR' : 'PARTICIPANT'
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed.");
            } else {
                // Auto login after register
                await signIn("credentials", {
                    email,
                    password,
                    callbackUrl: callbackUrl,
                });
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLogin) {
            // Standard Login Flow
            setError(null);
            setLoading(true);
            try {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    setError("Invalid email or password.");
                } else {
                    router.push(callbackUrl);
                }
            } catch (err) {
                setError("An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        } else {
            // Registration Flow - Step 1
            if (step === 'credentials') {
                await handleSendCode();
            } else {
                // Should not reach here via standard submit, handled by handleVerifyAndRegister
            }
        }
    };

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: callbackUrl });
    };

    return (
        <div className="min-h-screen bg-[#020617] relative isolate overflow-hidden flex items-center justify-center py-20 px-6">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-[130px] rounded-full -z-10 animate-pulse" />

            <div className="w-full max-w-md">
                <div className="glass rounded-[2.5rem] border border-white/5 p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-black/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                                <img
                                    src="/musb research.png"
                                    alt="MUSB Research Logo"
                                    className="h-12 w-auto object-contain"
                                />
                            </Link>

                            <h1 className="text-3xl font-black text-white italic tracking-tight mb-2">
                                {isLogin ? 'Welcome Back.' : (step === 'verification' ? 'Verify Email.' : 'Join the Future.')}
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                {isLogin
                                    ? 'Enter your credentials to access your portal.'
                                    : (step === 'verification'
                                        ? `We sent a code to ${email}${phone ? ' and your phone' : ''}.`
                                        : 'Create an account to start your journey.')}
                            </p>
                        </div>

                        {/* Role Toggle - Hide during verification */}
                        {step === 'credentials' && (
                            <div className="bg-slate-900/50 p-1 rounded-xl flex mb-8 border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setRole('participant')}
                                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'participant' ? 'bg-cyan-600/90 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <User size={14} /> Participant
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('sponsor')}
                                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'sponsor' ? 'bg-indigo-600/90 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <Fingerprint size={14} /> Sponsor
                                </button>
                            </div>
                        )}

                        <form onSubmit={step === 'verification' ? handleVerifyAndRegister : handleSubmit} className="space-y-5">
                            {step === 'credentials' && (
                                <>
                                    {!isLogin && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                    <User size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium"
                                                placeholder="name@example.com"
                                            />
                                        </div>
                                    </div>

                                    {!isLogin && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number (Optional)</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                    <Phone size={18} />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium"
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                        {!isLogin && <p className="text-[10px] text-slate-500 px-1">Min 12 chars, 1 upper, 1 lower, 1 number, 1 special char.</p>}
                                    </div>
                                </>
                            )}

                            {step === 'verification' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Verification Code</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                            <Fingerprint size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={inputCode}
                                            onChange={(e) => setInputCode(e.target.value)}
                                            required
                                            maxLength={6}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all font-medium tracking-[0.5em] text-center text-lg"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep('credentials')}
                                        className="text-xs text-slate-500 hover:text-white mt-2 underline"
                                    >
                                        Change details or resend
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-red-200 text-xs font-medium">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {isLogin && (
                                <div className="flex justify-end">
                                    <Link href="#" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Forgot Password?</Link>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-600/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : (step === 'verification' ? 'Verify & Register' : 'Next Step'))} <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0f172a] px-2 text-slate-500 font-bold">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                            Google
                        </button>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(null); setStep('credentials'); }}
                                className="text-slate-400 text-sm font-medium hover:text-white transition-colors"
                            >
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span className="text-cyan-400 font-bold">{isLogin ? 'Register Now' : 'Sign In'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
}
