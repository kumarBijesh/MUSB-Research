import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(12, "Password must be at least 12 characters")
        .max(32, "Password must not exceed 32 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    role: z.enum(["PARTICIPANT", "RESEARCHER"]), // simplified for signup
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, role } = schema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists with this email." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                role: role === "RESEARCHER" ? "PI" : "PARTICIPANT", // Basic mapping
                accounts: {
                    create: {
                        type: "credentials",
                        provider: "credentials",
                        providerAccountId: email,
                    },
                },
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
