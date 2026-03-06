import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
    NEXTAUTH_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1),
    RECAPTCHA_SECRET_KEY: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const _env = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});

if (!_env.success) {
    const errorDetails = JSON.stringify(_env.error.format(), null, 2);
    console.error("❌ Invalid environment variables during build/runtime:");
    console.error(errorDetails);

    // In production build environments (like Vercel), we need to throw 
    // to prevent a broken deployment, but we should provide the reason.
    throw new Error(`Environment variable validation failed. Missing or invalid keys: ${Object.keys(_env.error.format()).filter(k => k !== "_errors").join(", ")}`);
}

export const env = _env.data;
