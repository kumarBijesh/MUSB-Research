"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, AlertCircle, Calendar, ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function StudyScreenerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [study, setStudy] = useState<any | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [eligibilityStatus, setEligibilityStatus] = useState<"eligible" | "maybe" | "ineligible" | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    useEffect(() => {
        const studyData = {
            slug: slug,
            id: searchParams.get('study') || slug,
            title: searchParams.get('name') || 'Study',
            duration: searchParams.get('duration') || '',
            compensation: searchParams.get('compensation') || '',
            location: searchParams.get('location') || '',
            timeCommitment: searchParams.get('commitment') || '',
            condition: searchParams.get('category') || '',
            eligibilityRules: [],
        };
        setStudy(studyData);

        // Check if there's a saved eligibility state after login (from session-handling logic)
        const savedState = sessionStorage.getItem(`screenerState_${slug}`);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.status) {
                    setEligibilityStatus(parsed.status);
                    sessionStorage.removeItem(`screenerState_${slug}`);
                }
            } catch (e) { }
        }
    }, [slug, searchParams]);

    if (status === "loading" || !study) {
        return (
            <div className="min-h-screen bg-transparent pt-32 flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-cyan-500" size={32} />
            </div>
        );
    }

    const handleAnswer = (question: string, value: any) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            calculateEligibility();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const calculateEligibility = async () => {
        if (!study) return;

        setIsRegistering(true);
        try {
            // Mock logic for guests (they will re-validate upon signup)
            const age = parseInt(answers.age);
            const participatedRecently = answers.recentTrial === true;
            const hasConditions = (answers.conditions || []).length > 0;

            if (isNaN(age) || age < 18 || participatedRecently) {
                setEligibilityStatus("ineligible");
            } else if (hasConditions) {
                // If they have conditions, they are "maybe" eligible (need call)
                setEligibilityStatus("maybe");
            } else {
                setEligibilityStatus("eligible");
            }

            // Immediately dispatch the email using our Next.js API route
            if (answers.email) {
                // Ensure the status matches what we just set
                const currentStatus = (age < 18 || participatedRecently) ? "ineligible" : hasConditions ? "maybe" : "eligible";
                await fetch("/api/notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: answers.email,
                        type: "SCREENER_RESULT",
                        studyTitle: study.title,
                        status: currentStatus
                    })
                }).catch(err => console.error("Failed to send notification:", err));
            }

            // If logged in, we could sync this to backend
            if (status === "authenticated") {
                await fetch("/api/proxy/participants/screener", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        studyId: study.id,
                        responses: answers,
                        status: eligibilityStatus
                    })
                }).catch(() => { });
            }
        } catch (error) {
            console.error("Screening error:", error);
            setEligibilityStatus("maybe"); // fallback
        } finally {
            setIsRegistering(false);
        }
    };

    const handleRegistration = async () => {
        // Redirect to consent page, keeping the query params for study info
        router.push(`/studies/${slug}/consent?${searchParams.toString()}`);
    };

    const canProceed = () => {
        if (currentStep === 1) {
            return !!answers.age && !!answers.location && answers.recentTrial !== undefined;
        }
        if (currentStep === 2) {
            return (answers.conditions || []).length > 0;
        }
        if (currentStep === 3) {
            return !!answers.medications;
        }
        if (currentStep === 4) {
            const hasEmail = status === "authenticated" ? true : !!answers.email;
            return hasEmail && !!answers.phone && !!answers.callTime && !!answers.contactConsent;
        }
        return true;
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Step 1: Basics & Location</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">What is your age?</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                    placeholder="Enter your age"
                                    value={answers.age || ""}
                                    onChange={(e) => handleAnswer("age", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">What is your current country/state of residence?</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                    placeholder="e.g. California, USA"
                                    value={answers.location || ""}
                                    onChange={(e) => handleAnswer("location", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 italic">Major Exclusion Check</label>
                                <p className="text-[13px] text-slate-500 mb-3">Have you participated in any other clinical trial in the last 30 days?</p>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleAnswer("recentTrial", true)}
                                        className={`flex-1 p-3 rounded-lg border ${answers.recentTrial === true ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAnswer("recentTrial", false)}
                                        className={`flex-1 p-3 rounded-lg border ${answers.recentTrial === false ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Step 2: Health History</h2>
                        <div className="space-y-4">
                            <p className="text-slate-400 text-sm mb-4">Please select any of the following conditions you have been diagnosed with (Global Use):</p>
                            {["Diabetes", "Hypertension", "Asthma", "Migraine", "Heart Condition", "Cancer history", "None of the above"].map(condition => (
                                <label key={condition} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-cyan-500"
                                        checked={(answers.conditions || []).includes(condition)}
                                        onChange={(e) => {
                                            const current = answers.conditions || [];
                                            if (e.target.checked) handleAnswer("conditions", [...current, condition]);
                                            else handleAnswer("conditions", current.filter((c: string) => c !== condition));
                                        }}
                                    />
                                    <span className="text-white text-sm font-medium">{condition}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Step 3: Medications / Supplements</h2>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-400 mb-2">Are you currently taking any prescription medications or recurring supplements?</label>
                            <textarea
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors h-32"
                                placeholder="List medications/supplements or type 'None'"
                                value={answers.medications || ""}
                                onChange={(e) => handleAnswer("medications", e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Step 4: Contact & Availability</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors ${status === "authenticated" ? "cursor-not-allowed opacity-70" : ""}`}
                                    value={status === "authenticated" ? (session?.user?.email || "") : (answers.email || "")}
                                    readOnly={status === "authenticated"}
                                    onChange={(e) => status !== "authenticated" && handleAnswer("email", e.target.value)}
                                    placeholder={status === "authenticated" ? "" : "you@example.com"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                    placeholder="(555) 123-4567"
                                    value={answers.phone || ""}
                                    onChange={(e) => handleAnswer("phone", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Availability for Onboarding Call</label>
                                <select
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                    value={answers.callTime || ""}
                                    onChange={(e) => handleAnswer("callTime", e.target.value)}
                                >
                                    <option value="">Select a time...</option>
                                    <option value="morning">Morning (9am - 12pm)</option>
                                    <option value="afternoon">Afternoon (1pm - 5pm)</option>
                                    <option value="evening">Evening (5pm - 8pm)</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-slate-700/50 mt-4">
                                <label className="flex flex-row items-start gap-4 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-1">
                                        <input
                                            type="checkbox"
                                            className="appearance-none peer w-5 h-5 border-2 border-slate-600 rounded-md bg-slate-900 checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer"
                                            checked={answers.contactConsent === true}
                                            onChange={(e) => handleAnswer("contactConsent", e.target.checked)}
                                        />
                                        <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors">
                                            Consent to Contact
                                        </p>
                                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                            By checking this box, I agree that the research team may contact me via email or phone regarding my eligibility and potential study participation.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (eligibilityStatus) {
        return (
            <div className="min-h-screen bg-transparent pt-32 pb-20 px-6 flex items-center justify-center">
                <div className="max-w-xl w-full">
                    {eligibilityStatus === "eligible" && !registrationComplete && (
                        <div className="glass p-8 rounded-3xl border border-emerald-500/30 bg-emerald-900/10 text-center animate-fade-in-up">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white italic mb-4">Pre-Qualified for Possible Research</h2>
                            <p className="text-slate-300 leading-relaxed mb-8">
                                Based on your answers, you appear to be pre-qualified for possible research in the <strong>{study.title}</strong> study.
                            </p>
                            {status === "authenticated" ? (
                                <button
                                    onClick={handleRegistration}
                                    disabled={isRegistering}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isRegistering ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} /> Registering...
                                        </>
                                    ) : (
                                        <>
                                            Register & Notify Lab <Send size={18} />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        sessionStorage.setItem(`screenerState_${study.slug}`, JSON.stringify({ status: "eligible" }));
                                        const callbackUrl = encodeURIComponent(window.location.pathname);
                                        router.push(`/signin?callbackUrl=${callbackUrl}`);
                                    }}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Login / Sign Up to Register <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    )}

                    {eligibilityStatus === "eligible" && registrationComplete && (
                        <div className="glass p-8 rounded-3xl border border-emerald-500/30 bg-slate-900/50 text-center animate-fade-in-up">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white italic mb-4">Notifications Sent!</h2>
                            <p className="text-slate-300 leading-relaxed mb-8">
                                We have sent a confirmation email to <strong>{session?.user?.email}</strong> and notified the study sponsor with your details.
                            </p>
                            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mb-8">
                                <p className="text-emerald-400 text-sm font-bold">Registration ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            </div>
                            <Link href="/dashboard" className="inline-block px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest rounded-xl transition-all">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {eligibilityStatus === "maybe" && (
                        <div className="glass p-8 rounded-3xl border border-amber-500/30 bg-amber-900/10 text-center animate-fade-in-up">
                            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={40} className="text-amber-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white italic mb-4">Further Screening Needed</h2>
                            <p className="text-slate-300 leading-relaxed mb-8">
                                You meet most criteria for the <strong>{study.title}</strong> study, but we need to clarify a few details. Please schedule a quick call with a coordinator.
                            </p>
                            {status === "authenticated" ? (
                                <button
                                    onClick={() => alert('Opening screening calendar...')}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Calendar size={18} /> Schedule Screening Call
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        sessionStorage.setItem(`screenerState_${study.slug}`, JSON.stringify({ status: "maybe" }));
                                        const callbackUrl = encodeURIComponent(window.location.pathname);
                                        router.push(`/signin?callbackUrl=${callbackUrl}`);
                                    }}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Login / Sign Up to Continue <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    )}

                    {eligibilityStatus === "ineligible" && (
                        <div className="glass p-8 rounded-3xl border border-red-500/30 bg-red-900/10 text-center animate-fade-in-up">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle size={40} className="text-red-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white italic mb-4">Not Eligible at this time</h2>
                            <p className="text-slate-300 leading-relaxed mb-8">
                                Unfortunately, you do not meet the specific criteria for the <strong>{study.title}</strong> study. However, you can create a profile to join our database for future opportunities.
                            </p>
                            {status === "authenticated" ? (
                                <Link href="/studies" className="inline-block px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest rounded-xl transition-all">
                                    Browse Other Studies
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            sessionStorage.setItem(`screenerState_${study.slug}`, JSON.stringify({ status: "ineligible" }));
                                            const callbackUrl = encodeURIComponent(window.location.pathname);
                                            router.push(`/signin?callbackUrl=${callbackUrl}`);
                                        }}
                                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Create Profile & Join Database <ArrowRight size={18} />
                                    </button>
                                    <Link href="/studies" className="inline-block w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition-all">
                                        Browse Other Studies
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-12 text-center">
                    <span className="text-cyan-400 text-[13px] font-black uppercase tracking-widest mb-2 block">Eligibility Check</span>
                    <h1 className="text-3xl font-black text-white italic">{study.title}</h1>
                </div>

                <div className="mb-8 bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                </div>

                <div className="glass p-8 md:p-12 rounded-3xl border border-white/5 relative">
                    {renderStepContent()}

                    <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${currentStep === 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                        >
                            <ChevronLeft size={16} /> BACK
                        </button>
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className={`flex items-center gap-2 px-8 py-3 font-bold uppercase tracking-widest rounded-xl transition-all ${!canProceed()
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                                }`}
                        >
                            {currentStep === 4 ? 'CHECK RESULT' : 'NEXT'} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
