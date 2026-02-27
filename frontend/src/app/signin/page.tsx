"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";
import { Mail, Lock, ArrowRight, User, AlertCircle, ShieldCheck, Clock } from "lucide-react";
import { ParticipantAuth } from "@/lib/portal-auth";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
const CAPTCHA_WIDGET_WIDTH = 304; // px — reCAPTCHA v2 fixed width

function SignInContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/participant";
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const captchaWrapperRef = useRef<HTMLDivElement>(null);
    const [captchaScale, setCaptchaScale] = useState(1);

    // Auto-login sync (Handles Google OAuth return & existing NextAuth cookies)
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const u = session.user as any;
            const s = session as any;

            if (u.role === "PARTICIPANT") {
                // If there's no accessToken in the NextAuth session, it's a stale/corrupted session.
                // Sign them out of the shared cookie to fix it, instead of infinite looping.
                if (!s.accessToken) {
                    signOut({ callbackUrl: "/signin" });
                    return;
                }

                if (!ParticipantAuth.get()) {
                    ParticipantAuth.save(s.accessToken, {
                        id: u.id || "",
                        name: u.name || u.email,
                        email: u.email,
                        role: "PARTICIPANT",
                        image: u.image,
                    });
                }
                router.replace(callbackUrl);
            }
        }
    }, [status, session, router, callbackUrl]);

    // Dynamically scale reCAPTCHA to fit its container on any screen size
    useEffect(() => {
        const measure = () => {
            if (captchaWrapperRef.current) {
                const available = captchaWrapperRef.current.offsetWidth;
                setCaptchaScale(Math.min(1, available / CAPTCHA_WIDGET_WIDTH));
            }
        };
        measure();
        window.addEventListener("resize", measure);

        // Simple Device Fingerprinting for duplicate prevention
        if (!localStorage.getItem("device_fp")) {
            const fp = [
                navigator.userAgent,
                navigator.language,
                screen.colorDepth,
                screen.width + "x" + screen.height,
                new Date().getTimezoneOffset(),
                !!window.indexedDB,
                !!window.sessionStorage,
                !!window.localStorage
            ].join("|");
            // Basic hash-like string
            const fpHash = Array.from(fp).reduce((s, c) => (s << 5) - s + c.charCodeAt(0), 0).toString(16);
            if (!localStorage.getItem("device_fp")) {
                localStorage.setItem("device_fp", `fp_${fpHash}`);
            }
        }

        return () => window.removeEventListener("resize", measure);
    }, []);

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerifiedLocally, setOtpVerifiedLocally] = useState(false);
    const [passwordVerifiedLocally, setPasswordVerifiedLocally] = useState(false);
    const [tempTokenData, setTempTokenData] = useState<any>(null); // To hold the token during login OTP step
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Called by reCAPTCHA widget when user completes the challenge
    const onCaptchaChange = useCallback((token: string | null) => {
        setCaptchaToken(token);
        if (error === "Please complete the reCAPTCHA verification.") setError(null);
    }, [error]);

    // Reset captcha widget (called after each submission attempt)
    const resetCaptcha = () => {
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // ── 1. reCAPTCHA check (Registration Only) ────────────────────────────
        if (!isLogin && !captchaToken) {
            setError("Please complete the reCAPTCHA verification.");
            return;
        }

        setLoading(true);

        // ── 2. Verify token server-side (Registration Only) ───────────────────
        if (!isLogin) {
            const verifyRes = await fetch("/api/verify-captcha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: captchaToken }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
                setError("reCAPTCHA check failed. Please try again.");
                resetCaptcha();
                setLoading(false);
                return;
            }
        }

        // ── 3a. Login flow (With Initial OTP) ─────────────────────────────────
        if (isLogin) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            if (!passwordVerifiedLocally) {
                // Step 1: Authenticate their password FIRST
                const formBody = new URLSearchParams({ username: email, password });
                const res = await fetch(`${apiUrl}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formBody.toString(),
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    setError(err.detail || "Invalid email or password.");
                    setLoading(false);
                    return;
                }

                const tokenData = await res.json();
                const role: string = tokenData.role?.toUpperCase() || "";

                // Strict portal gating — only PARTICIPANT can use this portal
                if (role !== "PARTICIPANT") {
                    setError("This portal is for participants only. Please use the Admin Console.");
                    setLoading(false);
                    return;
                }

                // Password is correct, now send OTP
                const sendRes = await fetch(`${apiUrl}/api/auth/verify/send`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: email, type: "EMAIL", purpose: "LOGIN" }),
                });

                if (!sendRes.ok) {
                    const d = await sendRes.json();
                    setError(d.detail || "Failed to send verification code.");
                    setLoading(false);
                    return;
                }

                setTempTokenData(tokenData);
                setPasswordVerifiedLocally(true);
                setShowOtp(true);
                setError(null);
                setLoading(false);
                return;
            } else if (showOtp && passwordVerifiedLocally && !otpVerifiedLocally) {
                // Step 2: Verify OTP
                const checkRes = await fetch(`${apiUrl}/api/auth/verify/check`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: email, code: otp, purpose: "LOGIN" }),
                });

                if (!checkRes.ok) {
                    setError("Invalid or expired verification code. Use the latest one sent.");
                    setLoading(false);
                    return;
                }

                // OTP is good! Complete login with the token we got in Step 1
                const tokenData = tempTokenData;
                const role: string = tokenData.role?.toUpperCase() || "";

                const meRes = await fetch(`${apiUrl}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${tokenData.access_token}` },
                });
                const user = meRes.ok ? await meRes.json() : { id: "", name: email, email, role: role };

                ParticipantAuth.save(tokenData.access_token, {
                    id: user.id || "",
                    name: user.name || email,
                    email: user.email || email,
                    role: "PARTICIPANT",
                });

                await signIn("credentials", { email, password, allowedRole: "PARTICIPANT", redirect: false });
                router.push(callbackUrl);
            }

            // ── 3b. Register flow (With OTP Verification) ────────────────────────
        } else {
            if (!name.trim()) {
                setError("Please enter your full name.");
                resetCaptcha();
                setLoading(false);
                return;
            }

            if (otpVerifiedLocally) {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
                if (!passwordRegex.test(password)) {
                    setError("Password: 12+ chars, uppercase, lowercase, number & special character.");
                    resetCaptcha();
                    setLoading(false);
                    return;
                }
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            if (!showOtp && !otpVerifiedLocally) {
                // Step 1: Send OTP (Purpose: REGISTER)
                const sendRes = await fetch(`${apiUrl}/api/auth/verify/send`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: email, type: "EMAIL", purpose: "REGISTER" }),
                });
                if (!sendRes.ok) {
                    const d = await sendRes.json();
                    setError(d.detail || "Failed to send verification code.");
                } else {
                    setShowOtp(true);
                    setError(null);
                }
            } else if (showOtp && !otpVerifiedLocally) {
                // Step 2: Verify OTP
                const checkRes = await fetch(`${apiUrl}/api/auth/verify/check`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: email, code: otp, purpose: "REGISTER" }),
                });

                if (!checkRes.ok) {
                    setError("Invalid or expired verification code. Use the latest one sent.");
                } else {
                    setOtpVerifiedLocally(true);
                    setShowOtp(false);
                    setError(null);
                }
            } else if (otpVerifiedLocally) {
                // Step 3: Register
                const res = await fetch(`${apiUrl}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, deviceFingerprint: localStorage.getItem("device_fp") }),
                });
                const data = await res.json();

                if (!res.ok) {
                    setError(data.detail || "Registration failed.");
                    resetCaptcha();
                } else {
                    await signIn("credentials", { email, password, allowedRole: "PARTICIPANT", redirect: false });
                    router.push(callbackUrl);
                }
            }
        }

        setLoading(false);
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const purpose = isLogin ? "LOGIN" : "REGISTER";

        const sendRes = await fetch(`${apiUrl}/api/auth/verify/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: email, type: "EMAIL", purpose }),
        });

        if (!sendRes.ok) {
            const d = await sendRes.json();
            setError(d.detail || "Failed to resend code.");
        } else {
            setError("New verification code sent!");
            setTimeout(() => setError(null), 3000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] relative isolate overflow-hidden flex items-center justify-center py-20 px-3 sm:px-6">
            {/* Background glow */}
            <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-[130px] rounded-full -z-10 animate-pulse" />

            <div className="w-full max-w-md">
                <div className="glass rounded-2xl sm:rounded-[2.5rem] border border-white/5 p-5 sm:p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-black/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        {/* Logo & Title */}
                        <div className="text-center mb-10">
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity bg-white px-8 py-4 mb-2 shadow-2xl shadow-black">
                                    <Image
                                        src="/musb research.png"
                                        alt="MUSB Research"
                                        width={320}
                                        height={80}
                                        className="h-16 w-auto object-contain"
                                        priority
                                    />
                                </Link>
                                {/* Operation Hours */}
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
                                    <Clock size={10} className="text-cyan-400" />
                                    <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                                        Monday to Saturday · 08:30 AM - 05:00 PM
                                    </span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-black text-white italic tracking-tight mb-2">
                                {isLogin ? "Welcome Back." : "Join the Future."}
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">
                                {isLogin ? "Participant portal — enter your credentials." : "Create your participant account."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name (register only) */}
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={showOtp || isVerified}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium disabled:opacity-50"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password - Login: Show upfront | Register: Only reveal if verified via OTP */}
                            {((isLogin && !showOtp) || otpVerifiedLocally) && (
                                <div className="space-y-1.5 animate-in slide-in-from-top duration-300">
                                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={showOtp}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-medium disabled:opacity-50"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                    {!isLogin && (
                                        <p className="text-[13px] text-slate-500 px-1">Min 12 chars, uppercase, lowercase, number & special char.</p>
                                    )}
                                </div>
                            )}

                            {/* ── reCAPTCHA (Register Only) ───────────────────────── */}
                            {!isLogin && !otpVerifiedLocally && !showOtp && (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[13px] text-slate-500 font-bold uppercase tracking-widest ml-1">
                                        <ShieldCheck size={12} className="text-cyan-400" />
                                        Human Verification
                                    </div>

                                    {/* Responsive wrapper — scales widget to fit any screen */}
                                    <div
                                        ref={captchaWrapperRef}
                                        className={`w-full rounded-xl overflow-hidden border transition-all ${!captchaToken && error === "Please complete the reCAPTCHA verification."
                                            ? "border-red-500/40 bg-red-500/5"
                                            : captchaToken
                                                ? "border-emerald-500/30 bg-emerald-500/5"
                                                : "border-white/10 bg-slate-950/30"
                                            }`}
                                        style={{ height: `${Math.round(78 * captchaScale)}px` }}
                                    >
                                        <div
                                            style={{
                                                transform: `scale(${captchaScale})`,
                                                transformOrigin: "left top",
                                                width: `${CAPTCHA_WIDGET_WIDTH}px`,
                                            }}
                                        >
                                            <ReCAPTCHA
                                                ref={recaptchaRef}
                                                sitekey={RECAPTCHA_SITE_KEY}
                                                onChange={onCaptchaChange}
                                                theme="dark"
                                                size="normal"
                                            />
                                        </div>
                                    </div>

                                    {captchaToken && (
                                        <div className="flex items-center gap-1.5 ml-1">
                                            <ShieldCheck size={12} className="text-emerald-400" />
                                            <span className="text-[13px] text-emerald-400 font-bold">Verified — you&apos;re human!</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-red-200 text-[13px] font-medium">
                                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                                </div>
                            )}

                            {/* OTP Verification (Login or Register) */}
                            {showOtp && (
                                <div className="space-y-1.5 animate-in slide-in-from-top duration-300">
                                    <label className="text-[13px] font-bold text-cyan-400 uppercase tracking-wider ml-1">Verification Code</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 group-focus-within:text-cyan-300 transition-colors">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="w-full bg-slate-950/50 border border-cyan-500/30 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-black tracking-[1em] text-center"
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                    </div>
                                    <p className="text-[13px] text-slate-500 mt-2 px-1">Please enter the 6-digit code sent to your email.</p>

                                    <div className="mt-4 text-center">
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="text-cyan-400 text-[13px] font-bold hover:text-cyan-300 transition-colors disabled:opacity-50"
                                        >
                                            Didn&apos;t receive code? Resend
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Forgot Password */}
                            {isLogin && (
                                <div className="flex justify-end -mt-1">
                                    <Link href="#" className="text-[13px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                ) : (
                                    <>
                                        {showOtp ? "Verify & Continue" : otpVerifiedLocally ? (isLogin ? "Sign In Securely" : "Complete Registration") : "Continue"}
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-[13px] uppercase">
                                <span className="bg-[#0f172a] px-3 text-slate-500 font-bold">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign In (no reCAPTCHA needed — Google handles it) */}
                        <button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl })}
                            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Toggle Login / Register */}
                        <div className="mt-8 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                    setShowOtp(false);
                                    setTempTokenData(null);
                                    setOtpVerifiedLocally(false);
                                    setPasswordVerifiedLocally(false);
                                    resetCaptcha();
                                }}
                                className="text-slate-400 text-sm font-medium hover:text-white transition-colors"
                            >
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span className="text-cyan-400 font-bold">
                                    {isLogin ? "Register Now" : "Sign In"}
                                </span>
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
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
