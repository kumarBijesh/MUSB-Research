import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(12, "Password must be at least 12 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
        .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message || "Validation failed";
            return NextResponse.json({ detail: msg }, { status: 422 });
        }

        const { name, email, password } = parsed.data;

        // Proxy to FastAPI backend
        const backendRes = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { detail: data.detail || "Registration failed." },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error("[register route error]", err);
        return NextResponse.json({ detail: "Server error during registration." }, { status: 500 });
    }
}
