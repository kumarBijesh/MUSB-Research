"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

export default function InactivityTimer() {
    const { data: session } = useSession();
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

    const logout = () => {
        signOut({ callbackUrl: "/signin" });
    };

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

        setShowWarning(false);

        // Set warning to appear 1 minute before logout (14 mins)
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
        }, INACTIVITY_LIMIT_MS - 60 * 1000);

        // Set actual logout
        timerRef.current = setTimeout(() => {
            logout();
        }, INACTIVITY_LIMIT_MS);
    };

    useEffect(() => {
        if (!session) return;

        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        const handleActivity = () => resetTimer();

        events.forEach((event) => window.addEventListener(event, handleActivity));
        resetTimer(); // Start timer on mount

        return () => {
            events.forEach((event) => window.removeEventListener(event, handleActivity));
            if (timerRef.current) clearTimeout(timerRef.current);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        };
    }, [session]);

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-background border-border w-full max-w-md rounded-lg border p-6 shadow-lg">
                <h2 className="text-xl font-bold text-red-500">Session Expiring</h2>
                <p className="text-muted-foreground mt-2">
                    Your session has been inactive for 14 minutes. For HIPAA compliance, you
                    will be automatically logged out in 60 seconds.
                </p>
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={resetTimer}
                        className="bg-primary text-primary-foreground rounded-md px-4 py-2 hover:opacity-90"
                    >
                        I'm still here
                    </button>
                </div>
            </div>
        </div>
    );
}
