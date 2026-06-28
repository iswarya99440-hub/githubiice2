"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "Admin": return "👑";
            case "Student": return "🎓";
            case "Coordinator": return "🗂️";
            case "Supervisor": return "📋";
            case "Partner": return "🏢";
            default: return "👋";
        }
    };

    const getRoleMessage = (role: string) => {
        switch (role) {
            case "Admin": return "Welcome, HOD — System Dashboard";
            case "Student": return "Welcome back — Student Portal";
            case "Coordinator": return "Welcome back — Coordinator Dashboard";
            case "Supervisor": return "Welcome back — Supervisor Dashboard";
            case "Partner": return "Welcome back - Partner Organization Portal";
            default: return "Welcome to the Internship Platform";
        }
    };

    const getRedirectPath = (role: string) => {
        switch (role) {
            case "Admin": return "/admin";
            case "Student": return "/student";
            case "Coordinator": return "/coordinator";
            case "Supervisor": return "/supervisor";
            case "Partner": return "/partner";
            default: return "/";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                toast.error(
                    result.error === "CredentialsSignin" ? "Invalid email or password" : result.error,
                    {
                        style: {
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "white",
                            border: "1px solid #fca5a5",
                        },
                    }
                );
            } else {
                const sessionResponse = await fetch("/api/auth/session");
                const session = await sessionResponse.json();
                const userRole = session?.user?.role || "Student";
                const redirectPath = getRedirectPath(userRole);

                if (session?.user?.token) {
                    localStorage.setItem("access", session.user.token);
                }
                if (session?.user?.refreshToken) {
                    localStorage.setItem("refresh", session.user.refreshToken);
                }

                toast.success(`${getRoleIcon(userRole)} ${getRoleMessage(userRole)}`, {
                    duration: 3000,
                    style: {
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                        border: "1px solid #6ee7b7",
                        fontWeight: "600",
                    },
                });

                setTimeout(() => router.push(redirectPath), 1500);
            }
        } catch {
            toast.error("Login failed. Please try again.", {
                style: {
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "white",
                    border: "1px solid #fca5a5",
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                .login-root * { font-family: 'DM Sans', sans-serif; }
                .login-root h1, .login-root h2, .login-root .sora { font-family: 'Sora', sans-serif; }

                /* Left panel dark navy */
                .left-panel {
                    background: linear-gradient(160deg, #090f1a 0%, #0b1525 50%, #0d1f3a 100%);
                    position: relative;
                    overflow: hidden;
                }

                /* Dot grid */
                .dot-grid {
                    position: absolute;
                    inset: 0;
                    opacity: 0.15;
                    background-image: radial-gradient(circle, #3b82f6 1px, transparent 1px);
                    background-size: 26px 26px;
                }

                /* Glow orbs */
                .orb-1 {
                    position: absolute;
                    width: 420px; height: 420px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%);
                    top: -80px; left: -80px;
                    pointer-events: none;
                }
                .orb-2 {
                    position: absolute;
                    width: 300px; height: 300px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%);
                    bottom: 40px; right: -60px;
                    pointer-events: none;
                }

                /* Input */
                .inp {
                    background: rgba(255,255,255,0.97);
                    border: 1.5px solid #dde6f8;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: 'DM Sans', sans-serif;
                    color: #1e293b;
                }
                .inp:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
                }
                .inp::placeholder { color: #a8b8cc; }

                /* Button */
                .btn-submit {
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    box-shadow: 0 6px 20px rgba(37,99,235,0.35);
                    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
                    font-family: 'Sora', sans-serif;
                }
                .btn-submit:hover:not(:disabled) {
                    opacity: 0.92;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 28px rgba(37,99,235,0.45);
                }
                .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

                /* Card slide-up */
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .slide-up { animation: slideUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }

                /* Floating step cards on left panel */
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-8px); }
                }
                .float-card { animation: float 4s ease-in-out infinite; }
                .float-card-2 { animation: float 5s ease-in-out 1s infinite; }
                .float-card-3 { animation: float 4.5s ease-in-out 0.5s infinite; }

                /* Hex grid lines */
                @keyframes hexPulse {
                    0%, 100% { opacity: 0.12; }
                    50%       { opacity: 0.28; }
                }
                .hex-line { animation: hexPulse 3s ease-in-out infinite; }
            `}</style>

            <div className="login-root flex w-full min-h-screen">

                {/* ══════════════════════════════
                    LEFT — Branding / Info panel
                ══════════════════════════════ */}
                <div className="left-panel hidden lg:flex flex-col justify-between w-[52%] px-14 py-14 text-white">
                    <div className="dot-grid" />
                    <div className="orb-1" />
                    <div className="orb-2" />

                    {/* Hex SVG decoration */}
                    <svg
                        className="absolute right-0 top-0 h-full w-64 pointer-events-none hex-line"
                        viewBox="0 0 200 560"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {[60, 120, 180, 240, 300, 360, 420, 480].map((y, i) => (
                            <polygon
                                key={i}
                                points={`${i % 2 === 0 ? 30 : 70},${y - 34} ${i % 2 === 0 ? 70 : 110},${y - 34} ${i % 2 === 0 ? 90 : 130},${y} ${i % 2 === 0 ? 70 : 110},${y + 34} ${i % 2 === 0 ? 30 : 70},${y + 34} ${i % 2 === 0 ? 10 : 50},${y}`}
                                stroke="#3b82f6"
                                strokeWidth="0.8"
                                fill="none"
                            />
                        ))}
                    </svg>

                    {/* Logo */}

                    <div className="relative z-10">
                        <Link href="/">
                            <div className="flex items-center gap-3 mb-14">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                        boxShadow: "0 0 18px rgba(59,130,246,0.45)",
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                                        <rect x="9" y="3" width="6" height="4" rx="1" />
                                        <path d="M9 14l2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="sora text-sm font-bold text-white leading-tight">Internship Platform</div>
                                </div>
                            </div>
                        </Link>
                        {/* Headline */}
                        <h1 className="sora text-4xl xl:text-5xl font-extrabold leading-tight mb-5" style={{ color: "#f0f6ff" }}>
                            Manage Internships<br />
                            <span style={{ color: "#60a5fa" }}>Smarter & Faster</span>
                        </h1>
                        <p className="text-base leading-relaxed mb-12" style={{ color: "#7b92b0", maxWidth: "380px" }}>
                            A centralised platform for skill-based placement, real-time progress
                            tracking, supervisor evaluations, and report submissions.
                        </p>

                        {/* Role access cards */}
                        <div className="flex flex-col gap-4">
                            {[
                                { role: "Student", desc: "Apply, track progress & submit reports", icon: "🎓", delay: "0s" },
                                { role: "Supervisor", desc: "Evaluate interns & provide feedback", icon: "📋", delay: "0.1s" },
                                { role: "Coordinator", desc: "Manage placements & oversee evaluations", icon: "🗂️", delay: "0.2s" },
                            ].map((item, i) => (
                                <div
                                    key={item.role}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-xl ${i === 0 ? "float-card" : i === 1 ? "float-card-2" : "float-card-3"}`}
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(99,179,237,0.14)",
                                        backdropFilter: "blur(8px)",
                                    }}
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    <div>
                                        <div className="sora text-sm font-semibold text-white">{item.role}</div>
                                        <div className="text-xs" style={{ color: "#7b92b0" }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════
                    RIGHT — Login form
                ══════════════════════════════ */}
                <div className="flex flex-1 items-center justify-center bg-white px-6 sm:px-12 py-12">
                    <div className="w-full max-w-md slide-up">

                        {/* Mobile logo */}
                        <div className="flex lg:hidden items-center gap-2 mb-8">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                                    <rect x="9" y="3" width="6" height="4" rx="1" />
                                    <path d="M9 14l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="sora text-sm font-bold text-slate-800">Internship Platform</span>
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#2563eb", fontFamily: "'Sora', sans-serif" }}>
                                Welcome Back
                            </p>
                            <h1 className="sora text-3xl font-extrabold text-slate-800 mb-2">Sign In</h1>
                            <p className="text-sm" style={{ color: "#64748b" }}>
                                Access your internship dashboard — Student, Supervisor, Coordinator or Admin.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Institutional Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@institution.ac.rw"
                                    required
                                    className="inp w-full px-4 py-3 rounded-xl text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="inp w-full px-4 py-3 rounded-xl text-sm pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: "#94a3b8" }}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs" style={{ color: "#94a3b8" }}>Use your institution-issued credentials.</p>
                                    <a href="#" className="text-xs font-medium transition-colors" style={{ color: "#2563eb" }}
                                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                                    >
                                        Forgot Password?
                                    </a>
                                </div>
                            </div>
                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-submit w-full text-white font-semibold py-3.5 rounded-xl text-base mt-1"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Signing in…
                                    </span>
                                ) : (
                                    "Sign In to Dashboard"
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-6">
                            <div className="flex-1 h-px" style={{ background: "#e8edf8" }} />
                            <span className="text-xs" style={{ color: "#94a3b8" }}>New to the platform?</span>
                            <div className="flex-1 h-px" style={{ background: "#e8edf8" }} />
                        </div>

                        {/* Register link */}
                        <a
                            href="/auth/signup"
                            className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                            style={{
                                border: "1.5px solid #dde6f8",
                                color: "#2563eb",
                                fontFamily: "'Sora', sans-serif",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLAnchorElement).style.background = "#f0f4ff";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                            }}
                        >
                            Create a Student Account
                        </a>

                        {/* Footer note */}
                        <p className="text-center text-xs mt-6" style={{ color: "#94a3b8" }}>
                            By signing in, you agree to our{" "}
                            <a href="#" className="underline hover:text-blue-500 transition-colors">Terms of Use</a>
                            {" "}and{" "}
                            <a href="#" className="underline hover:text-blue-500 transition-colors">Privacy Policy</a>.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
