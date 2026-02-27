"use client";

import { useState, useEffect } from "react";

export default function Loading() {
    const text = "MusB Research";
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            // Typing effect speed
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[index]);
                setIndex(index + 1);
            }, 80);
            return () => clearTimeout(timeout);
        }
    }, [index, text]);

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[100] overflow-hidden">
            <div className="relative pb-6 px-2">
                {/* Text Container */}
                <h1 className="text-white h-[60px] md:h-[80px] text-5xl md:text-6xl font-black tracking-tight whitespace-nowrap flex items-center">
                    {displayedText}
                    {/* Blinking Cursor */}
                    {index < text.length ? (
                        <span className="inline-block w-[4px] h-[70%] bg-white ml-2 animate-[pulse_0.7s_infinite]" />
                    ) : (
                        <span className="inline-block w-[4px] h-[70%] bg-transparent ml-2" />
                    )}
                </h1>

                {/* Progress Bar Container - matches image style */}
                <div className="absolute bottom-0 left-0 mt-4 w-full h-[4px] bg-[#2a2a2a] rounded-full overflow-hidden">
                    {/* Active Progress Line */}
                    <div
                        className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                        style={{ width: `${(index / text.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Optional ambient glow matching the image's deep contrast */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-white/5 blur-[80px] pointer-events-none" />
        </div>
    );
}
