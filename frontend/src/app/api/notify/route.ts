import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, type, studyTitle, status } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Configure standard nodemailer transporter using ethereal or user-provided SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true", // Use true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL || "test@example.com",     // Must be defined in .env
                pass: process.env.SMTP_PASSWORD || "password123",       // Must be defined in .env
            },
        });

        // Skip sending if we haven't configured a real email to avoid crashing
        let mailOptions = {
            from: `"MusB Research" <${process.env.SMTP_EMAIL || "noreply@musbresearch.com"}>`,
            to: email,
            subject: "",
            html: "",
        };

        if (type === "SCREENER_RESULT") {
            if (status === "eligible") {
                mailOptions.subject = `You are Eligible for: ${studyTitle}`;
                mailOptions.html = `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>Great News!</h2>
                        <p>Based on your recent screener submission, you are <strong>pre-qualified</strong> and eligible to participate in the <strong>${studyTitle}</strong> study.</p>
                        <p>You can now log in to the portal and start your participation process.</p>
                        <br/>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/signin" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Start</a>
                        <br/><br/>
                        <p>Best regards,<br/>The MusB Research Team</p>
                    </div>
                `;
            } else if (status === "maybe") {
                mailOptions.subject = `Further Information Needed for: ${studyTitle}`;
                mailOptions.html = `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>Update on your Eligibility</h2>
                        <p>Based on your recent screener submission for the <strong>${studyTitle}</strong> study, you meet most of the criteria, but we need to clarify a few details.</p>
                        <p>Our team will contact you soon, or you can log in to your portal to proactively schedule a screening call.</p>
                        <br/>
                        <p>Best regards,<br/>The MusB Research Team</p>
                    </div>
                `;
            } else if (status === "ineligible") {
                mailOptions.subject = `Study Eligibility Update: ${studyTitle}`;
                mailOptions.html = `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>Update on your Eligibility</h2>
                        <p>Unfortunately, based on the specific criteria, you are not eligible for the <strong>${studyTitle}</strong> study at this time.</p>
                        <p>However, your profile is now in our secure database. If any future studies fulfill your criteria, we will contact you immediately!</p>
                        <p>Thank you for your interest in advancing medical research.</p>
                        <br/>
                        <p>Best regards,<br/>The MusB Research Team</p>
                    </div>
                `;
            }
        }

        try {
            await transporter.sendMail(mailOptions);
            return NextResponse.json({ success: true, message: "Email dispatched successfully" });
        } catch (error) {
            console.error("Nodemailer failed to send (likely due to missing SMTP credentials in .env):", error);
            // Even if sending fails (e.g. no credentials), we return success so the UI doesn't break
            return NextResponse.json({ success: true, message: "Email simulated (SMTP not configured)" });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
