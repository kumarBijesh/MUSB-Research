import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Base URL for the FastAPI backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Redirect map based on role
const ROLE_REDIRECT: Record<string, string> = {
    ADMIN: "/admin",
    COORDINATOR: "/admin",
    SPONSOR: "/sponsor/dashboard",
    PARTICIPANT: "/dashboard/participant",
    PI: "/admin",
    DATA_MANAGER: "/admin",
};

export const authOptions: NextAuthOptions = {
    providers: [
        // ── Google OAuth ────────────────────────────────────────────────────
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),

        // ── Credentials (Email + Password) ──────────────────────────────────
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                // Passed by each login page to restrict which roles can log in
                allowedRole: { label: "Allowed Role", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter your email and password.");
                }

                try {
                    // Send as form-encoded (required by OAuth2PasswordRequestForm)
                    const formBody = new URLSearchParams({
                        username: credentials.email,
                        password: credentials.password,
                    });

                    const res = await fetch(`${API_URL}/api/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: formBody.toString(),
                    });

                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.detail || "Invalid email or password.");
                    }

                    // Backend returns: { access_token, token_type, role }
                    const tokenData = await res.json();

                    // Fetch the user profile using the returned token
                    const meRes = await fetch(`${API_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${tokenData.access_token}` },
                    });

                    if (!meRes.ok) {
                        throw new Error("Failed to load user profile.");
                    }

                    const user = await meRes.json();
                    const role: string = user.role || "PARTICIPANT";

                    // Role gate: the login page passes `allowedRole` to restrict access
                    if (credentials.allowedRole) {
                        const allowed = credentials.allowedRole
                            .split(",")
                            .map((r: string) => r.trim().toUpperCase());
                        if (!allowed.includes(role.toUpperCase())) {
                            throw new Error(
                                "Access denied. You do not have permission to use this portal."
                            );
                        }
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role,
                        accessToken: tokenData.access_token,
                        redirectTo: ROLE_REDIRECT[role] || "/dashboard/participant",
                    };
                } catch (err: any) {
                    throw new Error(err.message || "Authentication failed.");
                }
            },
        }),
    ],

    session: { strategy: "jwt" },

    pages: {
        signIn: "/signin",
        error: "/signin",
    },

    callbacks: {
        // ── Google sign-in: upsert user into MongoDB ─────────────────────────
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    const res = await fetch(`${API_URL}/api/auth/google-upsert`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            googleId: account.providerAccountId,
                            image: user.image,
                        }),
                    });

                    if (!res.ok) return false; // Block sign-in if upsert fails

                    const dbUser = await res.json();
                    // Attach the MongoDB id and role onto the user object
                    // so the jwt callback can pick them up
                    (user as any).id = dbUser.id;
                    (user as any).role = dbUser.role;
                    (user as any).accessToken = dbUser.access_token;
                    (user as any).redirectTo = ROLE_REDIRECT[dbUser.role] || "/dashboard/participant";
                } catch (err) {
                    console.error("Google sign-in error (backend may be down):", err);
                    return false;
                }
            }
            return true;
        },

        // ── Persist role & id into the JWT ───────────────────────────────────
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
                // @ts-ignore
                token.redirectTo = user.redirectTo;
                // @ts-ignore
                token.accessToken = (user as any).access_token || (user as any).accessToken;
            }
            return token;
        },

        // ── Expose role & id on the client session ────────────────────────────
        async session({ session, token }) {
            if (session?.user) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.redirectTo = token.redirectTo;
                // @ts-ignore
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },
};
