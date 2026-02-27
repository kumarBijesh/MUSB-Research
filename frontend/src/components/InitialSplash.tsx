"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function InitialSplash() {
    const pathname = usePathname();
    const text = "MusB Research";

    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);
    const [showSplash, setShowSplash] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (pathname !== "/") setShowSplash(false);
    }, [pathname]);

    useEffect(() => {
        if (!showSplash || isFadingOut) return;

        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[index]);
                setIndex(index + 1);
            }, 80);
            return () => clearTimeout(timeout);
        } else {
            const fadeTimeout = setTimeout(() => {
                setIsFadingOut(true);
                setTimeout(() => setShowSplash(false), 800);
            }, 600);
            return () => clearTimeout(fadeTimeout);
        }
    }, [index, text, showSplash, isFadingOut]);

    if (!isMounted || !showSplash) return null;

    return (
        <div
            className={`fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[9999] overflow-hidden transition-opacity duration-700 pointer-events-none ${isFadingOut ? "opacity-0" : "opacity-100"
                }`}
        >
            <div
                className={`relative pb-8 px-4 pointer-events-auto transition-all duration-1000 ease-in-out ${isFadingOut ? "scale-110 blur-sm" : "scale-100 blur-0"
                    }`}
            >
                <h1
                    className="text-white h-[80px] md:h-[120px] text-6xl md:text-8xl font-black tracking-tighter whitespace-nowrap flex items-center"
                    style={{ textShadow: "0 0 40px rgba(255,255,255,0.2)" }}
                >
                    {displayedText}
                    {index < text.length ? (
                        <span className="inline-block w-[4px] h-[70%] bg-white ml-2 animate-[pulse_0.7s_infinite]" />
                    ) : (
                        <span className="inline-block w-[4px] h-[70%] bg-transparent ml-2" />
                    )}
                </h1>

                <div className="absolute bottom-0 left-0 mt-6 w-full h-[6px] bg-[#2a2a2a] rounded-full overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <div
                        className="h-full bg-white transition-all duration-100 ease-linear rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                        style={{ width: `${(index / text.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-white/5 blur-[80px] pointer-events-none" />
        </div>
    );
}