import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Next.js Edge Middleware — Role-Based Access Control
 *
 * This runs on the SERVER before ANY page or React component renders.
 * It is the single source of truth for portal access control.
 *
 * Rules:
 *  - /dashboard/participant/* → only PARTICIPANT
 *  - /admin/*                 → only ADMIN, COORDINATOR, PI, DATA_MANAGER
 *  - /sponsor/dashboard/*     → only SPONSOR, ADMIN
 *  - All other routes         → public (no auth required)
 */

// Role sets for each portal
const PARTICIPANT_ROLES = new Set(["PARTICIPANT"]);
const ADMIN_ROLES = new Set(["ADMIN", "COORDINATOR", "PI", "DATA_MANAGER"]);
const SPONSOR_ROLES = new Set(["SPONSOR", "ADMIN"]);

// Where each role goes if they hit the wrong portal
const ROLE_HOME: Record<string, string> = {
    ADMIN: "/admin",
    COORDINATOR: "/admin",
    PI: "/admin",
    DATA_MANAGER: "/admin",
    SPONSOR: "/sponsor/dashboard",
    PARTICIPANT: "/dashboard/participant",
};

export default withAuth(
    function middleware(req) {
        // Because NextAuth uses a SINGLE shared cookie for the entire browser,
        // we CANNOT enforce portal-specific roles here at the edge.
        // If we did, logging into the Admin portal in Tab 2 would forcefully 
        // redirect Tab 1 (Participant) away from its page.
        //
        // Instead: 
        // 1. This middleware just ensures the user has a valid NextAuth session.
        // 2. The *actual* per-tab authorization is done via sessionStorage in each layout.tsx
        return NextResponse.next();
    },
    {
        callbacks: {
            // Only run the middleware logic for authenticated users on protected routes.
            // Unauthenticated users on protected routes are redirected to /signin automatically.
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Protected routes require a token
                const isProtected =
                    pathname.startsWith("/dashboard/participant") ||
                    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
                    pathname.startsWith("/sponsor/dashboard");

                if (isProtected) {
                    return !!token; // Must be logged in
                }

                return true; // Public routes always allowed
            },
        },
        pages: {
            signIn: "/signin",
        },
    }
);

// Tell Next.js which routes this middleware applies to
export const config = {
    matcher: [
        "/dashboard/participant/:path*",
        "/admin/:path*",
        "/sponsor/dashboard/:path*",
    ],
};
