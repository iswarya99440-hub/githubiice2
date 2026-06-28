"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";

interface StatCardProps {
    value: string;
    label: string;
    delay: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, delay }) => (
    <div
        className="flex flex-col items-center justify-center px-8 py-5 rounded-2xl text-center animate-fadeUp"
        style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(99,179,237,0.18)",
            backdropFilter: "blur(12px)",
            animationDelay: delay,
        }}
    >
        <span className="text-2xl font-bold text-white tracking-tight mb-1">{value}</span>
        <span className="text-sm font-medium" style={{ color: "#90cdf4" }}>{label}</span>
    </div>
);

const HeroSection: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    /* ── Hexagon + node network canvas ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        let W = 0, H = 0;

        const resize = () => {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        /* Hexagon grid */
        const hexSize = 52;
        const hexW = hexSize * Math.sqrt(3);
        const hexH = hexSize * 2;

        function hexPath(cx: number, cy: number, s: number) {
            ctx!.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                const x = cx + s * Math.cos(angle);
                const y = cy + s * Math.sin(angle);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
            }
            ctx!.closePath();
        }

        /* Floating nodes */
        interface Node { x: number; y: number; vx: number; vy: number; r: number; pulse: number; }
        const nodes: Node[] = Array.from({ length: 28 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: 2 + Math.random() * 2.5,
            pulse: Math.random() * Math.PI * 2,
        }));

        let t = 0;

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.012;

            /* Hex grid — right half only */
            const cols = Math.ceil(W / hexW) + 2;
            const rows = Math.ceil(H / (hexH * 0.75)) + 2;
            for (let r = -1; r < rows; r++) {
                for (let c = Math.floor(cols * 0.45); c < cols; c++) {
                    const cx = c * hexW + (r % 2 === 0 ? 0 : hexW / 2);
                    const cy = r * hexH * 0.75;
                    const alpha = Math.min(1, (cx / W - 0.4) * 2.5) * 0.35;
                    if (alpha <= 0) continue;
                    hexPath(cx, cy, hexSize - 2);
                    ctx.strokeStyle = `rgba(99,179,237,${alpha * (0.6 + 0.4 * Math.sin(t + r * 0.3 + c * 0.2))})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();

                    /* Glowing corner dots */
                    if (Math.random() < 0.003) {
                        ctx.beginPath();
                        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(147,210,250,${alpha})`;
                        ctx.fill();
                    }
                }
            }

            /* Node connections */
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(99,179,237,${(1 - dist / 130) * 0.18})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }

            /* Nodes */
            nodes.forEach((n) => {
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > W) n.vx *= -1;
                if (n.y < 0 || n.y > H) n.vy *= -1;
                n.pulse += 0.04;
                const pulse = 0.5 + 0.5 * Math.sin(n.pulse);
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * (0.85 + 0.15 * pulse), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(147,210,250,${0.5 + 0.4 * pulse})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .hero-root {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          opacity: 0;
          animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        @keyframes shimmerText {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .hero-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          background: linear-gradient(120deg, #ffffff 30%, #63b3ed 60%, #90cdf4 80%, #ffffff 100%);
          background-size: 250% 250%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 5s ease infinite;
        }

        .hero-btn-primary {
          background: transparent;
          border: 1.5px solid rgba(147,210,250,0.7);
          color: #90cdf4;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: background 0.25s, color 0.25s, box-shadow 0.25s, transform 0.2s;
        }
        .hero-btn-primary:hover {
          background: rgba(99,179,237,0.15);
          color: #fff;
          box-shadow: 0 0 24px rgba(99,179,237,0.35);
          transform: translateY(-2px);
        }

        .hero-btn-secondary {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.14);
          color: #e2e8f0;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          letter-spacing: 0.02em;
          backdrop-filter: blur(6px);
          transition: background 0.25s, color 0.25s, transform 0.2s;
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
          transform: translateY(-2px);
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px 5px 8px;
          border-radius: 999px;
          border: 1px solid rgba(99,179,237,0.3);
          background: rgba(99,179,237,0.08);
          font-size: 0.78rem;
          font-family: 'DM Sans', sans-serif;
          color: #90cdf4;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 500;
        }
      `}</style>

            <section
                id="home"
                className="hero-root relative min-h-screen flex items-center overflow-hidden scroll-mt-28"
                style={{ background: "linear-gradient(135deg, #06101e 0%, #0a1628 40%, #0c1f3a 70%, #081525 100%)" }}
            >
                {/* Canvas background */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 0 }}
                />

                {/* Left vignette */}
                <div
                    className="absolute inset-y-0 left-0 w-2/3 pointer-events-none"
                    style={{
                        background: "linear-gradient(90deg, rgba(6,16,30,0.95) 0%, rgba(6,16,30,0.7) 60%, transparent 100%)",
                        zIndex: 1,
                    }}
                />

                {/* Bottom vignette */}
                <div
                    className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(6,16,30,0.9), transparent)", zIndex: 1 }}
                />

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-24 w-full">
                    <div className="max-w-2xl">

                        {/* Badge */}
                        <div className="animate-fadeUp mb-6" style={{ animationDelay: "0.05s" }}>
                            <span className="badge-pill">
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: "#38bdf8", boxShadow: "0 0 8px rgba(56,189,248,0.8)" }}
                                />
                                Academic Internship Platform
                            </span>
                        </div>

                        {/* Headline */}
                        <h1
                            className="hero-title text-5xl lg:text-6xl xl:text-7xl leading-[1.08] tracking-tight mb-6 animate-fadeUp"
                            style={{ animationDelay: "0.15s" }}
                        >
                            Place & Track<br />
                            Student Internships<br />
                            <span style={{ fontSize: "0.88em" }}>Online</span>
                        </h1>

                        {/* Sub */}
                        <p
                            className="text-base lg:text-lg leading-relaxed mb-10 animate-fadeUp"
                            style={{ color: "#94a3b8", maxWidth: "480px", animationDelay: "0.28s" }}
                        >
                            A centralised platform for skill-based internship placement, real-time
                            progress tracking, supervisor evaluations, and report submissions built
                            for healthcare and academic institutions.
                        </p>

                        {/* CTA buttons */}
                        <div
                            className="flex flex-wrap gap-4 mb-16 animate-fadeUp"
                            style={{ animationDelay: "0.4s" }}
                        >
                            <Link href="/auth/signup">
                                <button className="hero-btn-primary px-7 py-3 rounded-xl text-sm">
                                    Apply for Internship
                                </button>
                            </Link>
                            <Link href="/auth">
                                <button className="hero-btn-secondary px-7 py-3 rounded-xl text-sm">
                                    Coordinator Login
                                </button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div
                            className="grid grid-cols-3 gap-4 animate-fadeUp"
                            style={{ animationDelay: "0.55s", maxWidth: "520px" }}
                        >
                            <StatCard value="0+" label="Active Interns" delay="0.6s" />
                            <StatCard value="0+" label="Partner Institutions" delay="0.7s" />
                            <StatCard value="0+" label="Placements Made" delay="0.8s" />
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default HeroSection;

