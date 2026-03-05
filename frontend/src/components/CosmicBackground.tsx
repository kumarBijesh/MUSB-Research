"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseVx: number;   // original drift velocity
    baseVy: number;
    radius: number;
    color: string;
    baseColor: string;
    opacity: number;
    pulsePhase: number;
    pulseSpeed: number;
}

const PALETTE = [
    { dot: "#67e8f9", glow: "34,211,238" },   // cyan-300
    { dot: "#22d3ee", glow: "34,211,238" },   // cyan-400
    { dot: "#5eead4", glow: "45,212,191" },   // teal-300
    { dot: "#c084fc", glow: "192,132,252" },  // purple-400
    { dot: "#a78bfa", glow: "167,139,250" },  // violet-400
    { dot: "#e879f9", glow: "232,121,249" },  // fuchsia-400
    { dot: "#f9a8d4", glow: "244,114,182" },  // pink-300
    { dot: "#93c5fd", glow: "147,197,253" },  // blue-300
    { dot: "#818cf8", glow: "129,140,248" },  // indigo-400
];

const NUM_PARTICLES = 60;
const CONNECTION_DIST = 170;
const PARTICLE_SPEED = 0.35;
const MOUSE_RADIUS = 180;   // distance within which cursor attracts dots
const MOUSE_FORCE = 0.018; // attraction strength
const CLICK_FORCE = 8.5;   // initial burst toward click
const CLICK_RADIUS = 350;   // particles affected by click

function mkParticle(w: number, h: number): Particle {
    const p = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = PARTICLE_SPEED * (0.4 + Math.random() * 0.8);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx, vy,
        baseVx: vx,
        baseVy: vy,
        radius: 1.3 + Math.random() * 2.2,
        color: `rgba(${p.glow},`,
        baseColor: p.dot,
        opacity: 0.55 + Math.random() * 0.45,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.018,
    };
}

export default function CosmicBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Make canvas interactive (but still visually behind everything)
        canvas.style.pointerEvents = "all";

        let animId: number;
        let particles: Particle[] = [];
        const mouse = { x: -9999, y: -9999 };

        // ── Resize ─────────────────────────────────────────────────────────
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = Array.from({ length: NUM_PARTICLES }, () =>
                mkParticle(canvas.width, canvas.height)
            );
        };
        resize();
        window.addEventListener("resize", resize);

        // ── Mouse move: track cursor ────────────────────────────────────────
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener("mousemove", onMouseMove);

        // ── Click: burst particles toward click point ───────────────────────
        const onClick = (e: MouseEvent) => {
            const cx = e.clientX;
            const cy = e.clientY;
            for (const p of particles) {
                const dx = cx - p.x;
                const dy = cy - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CLICK_RADIUS && dist > 0) {
                    // Push particle toward the click with force inversely proportional to distance
                    const force = CLICK_FORCE * (1 - dist / CLICK_RADIUS);
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
            }
        };
        canvas.addEventListener("click", onClick);

        // ── Draw loop ───────────────────────────────────────────────────────
        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;

            ctx.fillStyle = "#0A1128";
            ctx.fillRect(0, 0, W, H);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // ── Mouse attraction ──────────────────────────────────────
                const mdx = mouse.x - p.x;
                const mdy = mouse.y - p.y;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mDist < MOUSE_RADIUS && mDist > 0) {
                    const strength = MOUSE_FORCE * (1 - mDist / MOUSE_RADIUS);
                    p.vx += (mdx / mDist) * strength;
                    p.vy += (mdy / mDist) * strength;
                }

                // ── Velocity damping: gradually return to base drift ──────
                p.vx = p.vx * 0.96 + p.baseVx * 0.04;
                p.vy = p.vy * 0.96 + p.baseVy * 0.04;

                // ── Speed cap ─────────────────────────────────────────────
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 6) {
                    p.vx = (p.vx / speed) * 6;
                    p.vy = (p.vy / speed) * 6;
                }

                // ── Move ──────────────────────────────────────────────────
                p.x += p.vx;
                p.y += p.vy;

                // ── Wrap edges ────────────────────────────────────────────
                if (p.x < -10) p.x = W + 10;
                if (p.x > W + 10) p.x = -10;
                if (p.y < -10) p.y = H + 10;
                if (p.y > H + 10) p.y = -10;

                // ── Pulse ─────────────────────────────────────────────────
                p.pulsePhase += p.pulseSpeed;
                const po = p.opacity * (0.65 + 0.35 * Math.sin(p.pulsePhase));

                // ── Connection lines ──────────────────────────────────────
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.28 * po;
                        ctx.strokeStyle = `${p.color}${lineAlpha})`;
                        ctx.lineWidth = 0.75;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }

                // ── Extra line to cursor (if nearby) ─────────────────────
                if (mDist < MOUSE_RADIUS) {
                    const lineAlpha = (1 - mDist / MOUSE_RADIUS) * 0.35 * po;
                    ctx.strokeStyle = `${p.color}${lineAlpha})`;
                    ctx.lineWidth = 0.9;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                // ── Glow halo ─────────────────────────────────────────────
                const glowR = p.radius * 5.5;
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
                grad.addColorStop(0, `${p.color}${po * 0.75})`);
                grad.addColorStop(0.4, `${p.color}${po * 0.25})`);
                grad.addColorStop(1, `${p.color}0)`);
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // ── Dot core ─────────────────────────────────────────────
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.baseColor;
                ctx.globalAlpha = po;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("click", onClick);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-[100]"
            style={{ cursor: "default" }}
            aria-hidden="true"
        />
    );
}
