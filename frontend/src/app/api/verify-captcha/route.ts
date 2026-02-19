import { NextRequest, NextResponse } from "next/server";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY || "";

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ success: false, error: "No reCAPTCHA token provided." }, { status: 400 });
        }

        // Verify token with Google's reCAPTCHA API
        const verifyRes = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`,
            { method: "POST" }
        );

        const data = await verifyRes.json();

        if (!data.success) {
            return NextResponse.json(
                { success: false, error: "reCAPTCHA verification failed. Please try again." },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, error: "Server error during verification." }, { status: 500 });
    }
}
