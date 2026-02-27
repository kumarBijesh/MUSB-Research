"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, X, ChevronRight } from "lucide-react";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem("musb-privacy-consent");
        if (!consent) {
            // Add a small delay so it doesn't clash with the splash screen
            const timer = setTimeout(() => setIsVisible(true), 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("musb-privacy-consent", "accepted");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("musb-privacy-consent", "declined");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 sm:max-w-md pointer-events-none"
                >
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden pointer-events-auto ring-1 ring-cyan-500/10">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-500/10 blur-3xl rounded-full" />

                        <div className="relative z-10">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
                                    <Shield className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Your Privacy Matters</h3>
                                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                                        We use cookies and similar technologies to ensure our platform functions properly, analyze clinical trial data, and provide you with a secure experience.
                                    </p>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showDetails && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mb-4 overflow-hidden"
                                    >
                                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-400 space-y-2">
                                            <p>• <strong>Strictly Necessary:</strong> Required for secure login and platform functionality (HIPAA compliance features).</p>
                                            <p>• <strong>Analytics:</strong> Helps us understand platform usage to improve our clinical trial matching system.</p>
                                            <p>By clicking &quot;Accept&quot;, you agree to our <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a> and <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a>.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-700/50">
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 py-2 sm:mr-auto"
                                >
                                    {showDetails ? "Hide Details" : "Manage Preferences"}
                                    <ChevronRight className={`w-3 h-3 transition-transform ${showDetails ? "rotate-90" : ""}`} />
                                </button>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={handleDecline}
                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={handleAccept}
                                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Accept
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
