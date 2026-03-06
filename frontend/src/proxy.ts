import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🛡️ Rate Limiting Configuration
const rateLimitStore = new Map<string, number[]>();
const LIMIT = 100; // requests
const WINDOW = 60 * 1000; // 1 minute in ms

/**
 * Next.js Edge Middleware (Unified Proxy)
 * 
 * Handles:
 * 1. Robust Rate Limiting
 * 2. Role-Based Access Control (NextAuth)
 * 3. Global Security Headers
 */

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;

        // ── 1. RATE LIMITING ──────────────────────────────────────────────────
        if (pathname.startsWith("/api") || pathname.startsWith("/signin")) {
            const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
            const now = Date.now();

            let timestamps = rateLimitStore.get(ip) || [];
            // Filter timestamps within the window
            timestamps = timestamps.filter((t) => now - t < WINDOW);

            if (timestamps.length >= LIMIT) {
                return new NextResponse(
                    JSON.stringify({ error: "Too many requests. Please try again later." }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "Retry-After": "60"
                        }
                    }
                );
            }

            timestamps.push(now);
            rateLimitStore.set(ip, timestamps);
        }

        // ── 2. AUTHENTICATION (NextAuth withAuth continuation) ────────────────
        // If we reach here, NextAuth has already checked 'authorized' callback.
        const response = NextResponse.next();

        // ── 3. SECURITY HEADERS ───────────────────────────────────────────────
        response.headers.set("X-DNS-Prefetch-Control", "on");
        response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        response.headers.set("X-Frame-Options", "SAMEORIGIN");
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("Referrer-Policy", "origin-when-cross-origin");
        response.headers.set("X-XSS-Protection", "1; mode=block");

        return response;
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Protected routes definition
                const isProtected =
                    pathname.startsWith("/dashboard/participant") ||
                    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
                    pathname.startsWith("/sponsor/dashboard");

                if (isProtected) {
                    return !!token; // Must be logged in for these routes
                }

                return true; // Public routes always allowed
            },
        },
        pages: {
            signIn: "/signin",
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
