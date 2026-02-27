/**
 * Portal Auth — Per-Tab Session Storage
 *
 * NextAuth uses a single shared cookie for the whole browser.
 * When Admin logs in on Tab 2, that cookie overwrites Tab 1's Participant session.
 *
 * This module solves that by storing EACH portal's token in sessionStorage,
 * which is ISOLATED per browser tab. Tab 1 and Tab 2 never share sessionStorage.
 *
 * Flow:
 *  - Participant logs in (/signin)       → saves token to sessionStorage['musb_p']
 *  - Admin logs in (/admin/login)        → saves token to sessionStorage['musb_a']
 *  - Participant layout reads musb_p     → always gets participant token, regardless of other tabs
 *  - Admin layout reads musb_a           → always gets admin token, regardless of other tabs
 */

const P_KEY = "musb_p";  // Participant portal session key
const A_KEY = "musb_a";  // Admin portal session key
const SA_KEY = "musb_sa"; // Super Admin portal session key
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

export type PortalUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
};

export type PortalSession = {
    token: string;
    user: PortalUser;
    savedAt: number;
};

function save(key: string, token: string, user: PortalUser): void {
    if (typeof window === "undefined") return;
    const data: PortalSession = { token, user, savedAt: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(data));
}

function read(key: string): PortalSession | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const data: PortalSession = JSON.parse(raw);
        if (Date.now() - data.savedAt > MAX_AGE_MS) {
            sessionStorage.removeItem(key);
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

function clear(key: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(key);
}

// ── Participant Portal ────────────────────────────────────────────────────────
export const ParticipantAuth = {
    save: (token: string, user: PortalUser) => save(P_KEY, token, user),
    get: (): PortalSession | null => read(P_KEY),
    clear: () => clear(P_KEY),
};

// ── Admin / Coordinator Portal ────────────────────────────────────────────────
export const AdminAuth = {
    save: (token: string, user: PortalUser) => save(A_KEY, token, user),
    get: (): PortalSession | null => read(A_KEY),
    clear: () => clear(A_KEY),
};

// ── Super Admin Portal ────────────────────────────────────────────────────────
export const SuperAdminAuth = {
    save: (token: string, user: PortalUser) => save(SA_KEY, token, user),
    get: (): PortalSession | null => read(SA_KEY),
    clear: () => clear(SA_KEY),
};
