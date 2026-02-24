import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return handleProxy(req, params);
}

async function handleProxy(req: NextRequest, paramsPromise: Promise<{ path: string[] }>) {
    const { path } = await paramsPromise;
    const session = await getServerSession(authOptions);
    const targetPath = path.join("/");
    const url = new URL(`${API_URL}/api/${targetPath}`);

    // Copy query params
    req.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    const headers = new Headers();
    if (session?.accessToken) {
        headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    // Content-Type might be set by the request, but we should handle it carefully
    const contentType = req.headers.get("content-type");
    if (contentType) {
        headers.set("Content-Type", contentType);
    }

    try {
        const body = req.method !== "GET" && req.method !== "DELETE" ? await req.blob() : undefined;

        const response = await fetch(url.toString(), {
            method: req.method,
            headers: headers,
            body: body,
        });

        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("Proxy error:", error);
        return NextResponse.json({ detail: "Backend connection failed" }, { status: 502 });
    }
}
