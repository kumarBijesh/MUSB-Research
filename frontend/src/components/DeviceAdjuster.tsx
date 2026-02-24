"use client";

import { useEffect } from "react";

export default function DeviceAdjuster() {
    useEffect(() => {
        const detectDevice = () => {
            const width = window.innerWidth;
            const deviceType = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";

            // Basic performance detection
            const hardwareConcurrency = navigator.hardwareConcurrency || 4;
            const isLowEnd = hardwareConcurrency <= 2;
            const perfMode = isLowEnd ? "low" : "high";

            // Set cookies with a 1-year expiry
            const cookieSettings = "; path=/; max-age=31536000; SameSite=Lax";
            document.cookie = `device-type=${deviceType}${cookieSettings}`;
            document.cookie = `device-width=${width}${cookieSettings}`;
            document.cookie = `perf-mode=${perfMode}${cookieSettings}`;
        };

        detectDevice();

        // Update on resize but with debounce
        let timeout: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(detectDevice, 500);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return null;
}
