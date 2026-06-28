"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface FormData {
    // User fields
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
    // StudentProfile fields
    student_id: string;
    program: string;
    year_of_study: string;
    graduation_date: string;
    skills: string;
}

const PROGRAMS = [
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Software Engineering",
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Information Systems",
    "Bachelor of Science in Cybersecurity",
    "Bachelor of Science in Data Science & AI",
    "Bachelor of Science in Computer Engineering",
    "Bachelor of Science in Network Engineering",
    "Bachelor of Science in Cloud Computing",
    "Diploma in Software Development",
    "Diploma in IT & Networking",
    "Other",
];

const YEARS = [
    { value: "1", label: "Year 1" },
    { value: "2", label: "Year 2" },
    { value: "3", label: "Year 3" },
    { value: "4", label: "Year 4" },
    { value: "5", label: "Year 5" },
    { value: "6", label: "Year 6" },
];

const SKILL_SUGGESTIONS = [
    "JavaScript", "TypeScript", "Python", "React",
    "Node.js", "SQL", "Git & GitHub", "REST APIs",
    "Docker", "Linux", "UI/UX Design", "Agile/Scrum",
];

type Step = 1 | 2 | 3;

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [customSkill, setCustomSkill] = useState("");

    const [form, setForm] = useState<FormData>({
        first_name: "", last_name: "", username: "",
        email: "", phone: "", password: "", confirm_password: "",
        student_id: "", program: "", year_of_study: "",
        graduation_date: "", skills: "",
    });

    const set = (field: keyof FormData, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) => {
            const updated = prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill];
            setForm((f) => ({ ...f, skills: updated.join(", ") }));
            return updated;
        });
    };

    const addCustomSkill = () => {
        const trimmed = customSkill.trim();
        if (trimmed && !selectedSkills.includes(trimmed)) {
            const updated = [...selectedSkills, trimmed];
            setSelectedSkills(updated);
            setForm((f) => ({ ...f, skills: updated.join(", ") }));
            setCustomSkill("");
        }
    };

    /* ── Validation per step ── */
    const validateStep1 = () => {
        if (!form.first_name || !form.last_name) return "Please enter your full name.";
        if (!form.username) return "Username is required.";
        if (!form.email.includes("@")) return "Enter a valid email address.";
        if (form.phone && !/^\+?\d{9,15}$/.test(form.phone)) return "Enter a valid phone number.";
        return null;
    };

    const validateStep2 = () => {
        if (!form.student_id) return "Student ID is required.";
        if (!form.program) return "Please select your program.";
        if (!form.year_of_study) return "Please select your year of study.";
        if (!form.graduation_date) return "Expected graduation date is required.";
        return null;
    };

    const validateStep3 = () => {
        if (form.password.length < 8) return "Password must be at least 8 characters.";
        if (form.password !== form.confirm_password) return "Passwords do not match.";
        return null;
    };

    const nextStep = () => {
        const err = step === 1 ? validateStep1() : validateStep2();
        if (err) { toast.error(err); return; }
        setStep((s) => (s + 1) as Step);
    };

    const prevStep = () => setStep((s) => (s - 1) as Step);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validateStep3();
        if (err) { toast.error(err); return; }

        setLoading(true);
        try {
            const payload = {
                first_name: form.first_name,
                last_name: form.last_name,
                username: form.username,
                email: form.email,
                phone: form.phone,
                password: form.password,
                role: "Student",           // always Student on self-registration
                student_profile: {
                    student_id: form.student_id,
                    program: form.program,
                    year_of_study: parseInt(form.year_of_study),
                    graduation_date: form.graduation_date,
                    skills: form.skills,
                },
            };

            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const res = await fetch(`${apiBase}/api/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let message = "Registration failed.";
                try {
                    const data = await res.json();
                    message = data?.message || data?.error || message;
                } catch {
                    // keep default message when response is not JSON
                }
                throw new Error(message);
            }

            toast.success("Account created. Check your institutional email to verify ownership, then sign in.", {
                duration: 3500,
                style: {
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    border: "1px solid #6ee7b7",
                    fontWeight: "600",
                },
            });
            setTimeout(() => router.push("/auth"), 1800);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error(err.message || "Something went wrong. Please try again.", {
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

    /* ── Progress % ── */
    const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

    return (
        <div className="relative min-h-screen flex overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                .signup-root * { font-family: 'DM Sans', sans-serif; }
                .signup-root .sora { font-family: 'Sora', sans-serif; }

                .left-panel {
                    background: linear-gradient(160deg, #090f1a 0%, #0b1525 50%, #0d1f3a 100%);
                    position: relative;
                    overflow: hidden;
                }
                .dot-grid {
                    position: absolute; inset: 0; opacity: 0.13;
                    background-image: radial-gradient(circle, #3b82f6 1px, transparent 1px);
                    background-size: 26px 26px;
                }
                .orb-1 {
                    position: absolute; width: 380px; height: 380px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
                    top: -60px; left: -60px; pointer-events: none;
                }
                .orb-2 {
                    position: absolute; width: 280px; height: 280px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(99,179,237,0.1) 0%, transparent 70%);
                    bottom: 60px; right: -40px; pointer-events: none;
                }

                .inp {
                    background: rgba(255,255,255,0.97);
                    border: 1.5px solid #dde6f8;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    color: #1e293b;
                    font-family: 'DM Sans', sans-serif;
                }
                .inp:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
                }
                .inp::placeholder { color: #a8b8cc; }

                .inp-select {
                    background: rgba(255,255,255,0.97);
                    border: 1.5px solid #dde6f8;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    color: #1e293b;
                    font-family: 'DM Sans', sans-serif;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 14px center;
                }
                .inp-select:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    box-shadow: 0 6px 20px rgba(37,99,235,0.32);
                    font-family: 'Sora', sans-serif;
                    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
                }
                .btn-primary:hover:not(:disabled) {
                    opacity: 0.91;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 28px rgba(37,99,235,0.42);
                }
                .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

                .btn-ghost {
                    border: 1.5px solid #dde6f8;
                    color: #475569;
                    font-family: 'Sora', sans-serif;
                    transition: background 0.2s, color 0.2s;
                }
                .btn-ghost:hover { background: #f0f4ff; color: #1e3a8a; }

                .skill-chip {
                    border: 1.5px solid #dde6f8;
                    color: #475569;
                    font-size: 0.78rem;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s, color 0.15s;
                    background: white;
                }
                .skill-chip.active {
                    background: #eff6ff;
                    border-color: #2563eb;
                    color: #2563eb;
                    font-weight: 600;
                }
                .skill-chip:hover { border-color: #93c5fd; }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .slide-up { animation: slideUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }

                @keyframes float {
                    0%,100% { transform: translateY(0); }
                    50%     { transform: translateY(-7px); }
                }
                .float { animation: float 4s ease-in-out infinite; }
                .float-2 { animation: float 5s ease-in-out 0.8s infinite; }

                .progress-bar {
                    height: 4px;
                    border-radius: 2px;
                    background: #e2eaf8;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    border-radius: 2px;
                    background: linear-gradient(90deg, #1e3a8a, #3b82f6);
                    transition: width 0.45s cubic-bezier(0.22,1,0.36,1);
                }

                .step-dot {
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.75rem; font-weight: 700;
                    transition: background 0.3s, color 0.3s, box-shadow 0.3s;
                    font-family: 'Sora', sans-serif;
                }
                .step-dot.done {
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    color: white;
                    box-shadow: 0 4px 12px rgba(37,99,235,0.35);
                }
                .step-dot.active {
                    background: #eff6ff;
                    color: #2563eb;
                    border: 2px solid #2563eb;
                }
                .step-dot.pending {
                    background: #f1f5f9;
                    color: #94a3b8;
                    border: 2px solid #e2eaf8;
                }
            `}</style>

            <div className="signup-root flex w-full min-h-screen">

                {/* ══════════════ LEFT PANEL ══════════════ */}
                <div className="left-panel hidden lg:flex flex-col justify-between w-[44%] px-12 py-12 text-white">
                    <div className="dot-grid" />
                    <div className="orb-1" />
                    <div className="orb-2" />

                    <div className="relative z-10">
                        {/* Logo */}
                        <Link href="/">
                        <div className="flex items-center gap-3 mb-14">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "linear-gradient(135deg,#2563eb,#3b82f6)", boxShadow: "0 0 18px rgba(59,130,246,0.45)" }}
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
                        <h1 className="sora text-3xl xl:text-4xl font-extrabold leading-tight mb-4" style={{ color: "#f0f6ff" }}>
                            Start Your<br />
                            <span style={{ color: "#60a5fa" }}>Internship Journey</span>
                        </h1>
                        <p className="text-sm leading-relaxed mb-10" style={{ color: "#7b92b0", maxWidth: "320px" }}>
                            Create your student account to apply for tech internships, track your
                            progress, and receive supervisor evaluations — all in one place.
                        </p>

                        {/* What you get cards */}
                        <div className="flex flex-col gap-4">
                            {[
                                { icon: "💻", title: "Tech-Focused Placement", desc: "Get matched to internships that fit your stack & specialisation", cls: "float" },
                                { icon: "📊", title: "Real-Time Progress", desc: "Log tasks, submit timesheets & track project milestones", cls: "float-2" },
                                { icon: "📋", title: "Supervisor Feedback", desc: "Receive mid-term & final technical evaluations digitally", cls: "float" },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-xl ${item.cls}`}
                                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,179,237,0.13)", backdropFilter: "blur(8px)" }}
                                >
                                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                                    <div>
                                        <div className="sora text-sm font-semibold text-white">{item.title}</div>
                                        <div className="text-xs" style={{ color: "#7b92b0" }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══════════════ RIGHT PANEL ══════════════ */}
                <div className="flex flex-1 items-start justify-center bg-white px-6 sm:px-10 py-10 overflow-y-auto">
                    <div className="w-full max-w-lg slide-up">

                        {/* Mobile logo */}
                        <div className="flex lg:hidden items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2563eb,#3b82f6)" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                                    <rect x="9" y="3" width="6" height="4" rx="1" />
                                    <path d="M9 14l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="sora text-sm font-bold text-slate-800">Internship Platform</span>
                        </div>

                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#2563eb", fontFamily: "'Sora',sans-serif" }}>
                                Student Registration
                            </p>
                            <h1 className="sora text-2xl font-extrabold text-slate-800 mb-1">Create Your Account</h1>
                            <p className="text-sm" style={{ color: "#64748b" }}>
                                Register as an IT student — takes about 2 minutes.
                            </p>
                        </div>

                        {/* Step indicator */}
                        <div className="mb-7">
                            <div className="flex items-center justify-between mb-3">
                                {[
                                    { n: 1, label: "Personal Info" },
                                    { n: 2, label: "Academic Info" },
                                    { n: 3, label: "Security" },
                                ].map(({ n, label }, i) => (
                                    <div key={n} className="flex items-center gap-2 flex-1">
                                        <div className={`step-dot ${step > n ? "done" : step === n ? "active" : "pending"}`}>
                                            {step > n ? (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                                            ) : n}
                                        </div>
                                        <span className="text-xs font-medium hidden sm:block" style={{ color: step === n ? "#2563eb" : "#94a3b8" }}>{label}</span>
                                        {i < 2 && <div className="flex-1 h-px mx-2" style={{ background: step > n ? "#2563eb" : "#e2eaf8" }} />}
                                    </div>
                                ))}
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        {/* ─── STEP 1: Personal Info ─── */}
                        {step === 1 && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                                        <input className="inp w-full px-4 py-2.5 rounded-xl text-sm" placeholder="Jean" value={form.first_name} onChange={e => set("first_name", e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                                        <input className="inp w-full px-4 py-2.5 rounded-xl text-sm" placeholder="Uwimana" value={form.last_name} onChange={e => set("last_name", e.target.value)} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                                    <input className="inp w-full px-4 py-2.5 rounded-xl text-sm" placeholder="e.g. jean.dev" value={form.username} onChange={e => set("username", e.target.value)} required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Institutional Email <span className="text-red-500">*</span></label>
                                    <input type="email" className="inp w-full px-4 py-2.5 rounded-xl text-sm" placeholder="you@university.ac.rw" value={form.email} onChange={e => set("email", e.target.value)} required />
                                    <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                                        A verification link will be sent here to confirm ownership. No code is required.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                                    <input type="tel" className="inp w-full px-4 py-2.5 rounded-xl text-sm" placeholder="+250 7XX XXX XXX" value={form.phone} onChange={e => set("phone", e.target.value)} />
                                </div>
                                <button type="button" onClick={nextStep} className="btn-primary w-full text-white font-semibold py-3 rounded-xl text-sm mt-1">
                                    Continue to Academic Info →
                                </button>
                            </div>
                        )}

                        {/* ─── STEP 2: Academic Info ─── */}
                        {step === 2 && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Student ID <span className="text-red-500">*</span></label>
                                    <input className="inp w-full px-4 py-2.5 rounded-xl text-sm" placeholder="e.g. CSC-2024-0042" value={form.student_id} onChange={e => set("student_id", e.target.value)} required />
                                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>As shown on your student card or admission letter.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Academic Program <span className="text-red-500">*</span></label>
                                    <select className="inp-select inp w-full px-4 py-2.5 rounded-xl text-sm" value={form.program} onChange={e => set("program", e.target.value)} required>
                                        <option value="">Select your program…</option>
                                        {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Year of Study <span className="text-red-500">*</span></label>
                                        <select className="inp-select inp w-full px-4 py-2.5 rounded-xl text-sm" value={form.year_of_study} onChange={e => set("year_of_study", e.target.value)} required>
                                            <option value="">Select year…</option>
                                            {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Expected Graduation <span className="text-red-500">*</span></label>
                                        <input type="date" className="inp w-full px-4 py-2.5 rounded-xl text-sm" value={form.graduation_date} onChange={e => set("graduation_date", e.target.value)} required />
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Skills <span className="text-slate-400 font-normal">(optional)</span></label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {SKILL_SUGGESTIONS.map(skill => (
                                            <button
                                                type="button"
                                                key={skill}
                                                onClick={() => toggleSkill(skill)}
                                                className={`skill-chip px-3 py-1.5 rounded-full ${selectedSkills.includes(skill) ? "active" : ""}`}
                                            >
                                                {selectedSkills.includes(skill) && "✓ "}{skill}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Custom skill input */}
                                    <div className="flex gap-2">
                                        <input
                                            className="inp flex-1 px-4 py-2 rounded-xl text-sm"
                                            placeholder="Add a skill (e.g. Django, AWS, Figma)…"
                                            value={customSkill}
                                            onChange={e => setCustomSkill(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                                        />
                                        <button
                                            type="button"
                                            onClick={addCustomSkill}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0"
                                            style={{ background: "#2563eb" }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {selectedSkills.length > 0 && (
                                        <p className="text-xs mt-2" style={{ color: "#64748b" }}>
                                            Selected: {selectedSkills.join(" · ")}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-1">
                                    <button type="button" onClick={prevStep} className="btn-ghost flex-1 py-3 rounded-xl text-sm font-semibold">
                                        ← Back
                                    </button>
                                    <button type="button" onClick={nextStep} className="btn-primary flex-1 text-white py-3 rounded-xl text-sm font-semibold">
                                        Continue to Security →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 3: Password ─── */}
                        {step === 3 && (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="inp w-full px-4 py-2.5 rounded-xl text-sm pr-12"
                                            placeholder="Min. 8 characters"
                                            value={form.password}
                                            onChange={e => set("password", e.target.value)}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} tabIndex={-1}>
                                            {showPassword
                                                ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                                : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            }
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {form.password && (
                                        <div className="mt-2">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: form.password.length >= 12 ? "100%" : form.password.length >= 8 ? "65%" : "30%",
                                                        background: form.password.length >= 12 ? "linear-gradient(90deg,#059669,#10b981)" : form.password.length >= 8 ? "linear-gradient(90deg,#d97706,#f59e0b)" : "linear-gradient(90deg,#dc2626,#ef4444)",
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs mt-1" style={{ color: form.password.length >= 12 ? "#059669" : form.password.length >= 8 ? "#d97706" : "#dc2626" }}>
                                                {form.password.length >= 12 ? "Strong password" : form.password.length >= 8 ? "Acceptable — add more characters" : "Too short"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            className="inp w-full px-4 py-2.5 rounded-xl text-sm pr-12"
                                            placeholder="Repeat your password"
                                            value={form.confirm_password}
                                            onChange={e => set("confirm_password", e.target.value)}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} tabIndex={-1}>
                                            {showConfirm
                                                ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                                : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            }
                                        </button>
                                    </div>
                                    {form.confirm_password && form.password !== form.confirm_password && (
                                        <p className="text-xs mt-1 text-red-500">Passwords do not match</p>
                                    )}
                                    {form.confirm_password && form.password === form.confirm_password && (
                                        <p className="text-xs mt-1" style={{ color: "#059669" }}>✓ Passwords match</p>
                                    )}
                                </div>

                                {/* Summary box */}
                                <div className="px-4 py-4 rounded-xl text-sm flex flex-col gap-1.5" style={{ background: "#f8faff", border: "1px solid #dde6f8" }}>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Registration Summary</p>
                                    <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Name</span><span className="font-medium text-slate-700">{form.first_name} {form.last_name}</span></div>
                                    <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Email</span><span className="font-medium text-slate-700">{form.email || "—"}</span></div>
                                    <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Email verification</span><span className="font-medium text-slate-700">Link sent after registration</span></div>
                                    <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Student ID</span><span className="font-medium text-slate-700">{form.student_id || "—"}</span></div>
                                    <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Program</span><span className="font-medium text-slate-700 text-right ml-4 truncate max-w-[180px]">{form.program || "—"}</span></div>
                                    <div className="flex justify-between text-xs"><span style={{ color: "#94a3b8" }}>Role</span><span className="font-semibold text-blue-600">🎓 Student</span></div>
                                </div>

                                <div className="flex gap-3 mt-1">
                                    <button type="button" onClick={prevStep} className="btn-ghost flex-1 py-3 rounded-xl text-sm font-semibold">
                                        ← Back
                                    </button>
                                    <button type="submit" disabled={loading} className="btn-primary flex-1 text-white py-3 rounded-xl text-sm font-semibold">
                                        {loading
                                            ? <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                                                Creating Account…
                                            </span>
                                            : "Create Student Account"
                                        }
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Sign in link */}
                        <p className="text-center text-sm mt-6" style={{ color: "#94a3b8" }}>
                            Already have an account?{" "}
                            <a href="/auth" className="font-semibold transition-colors" style={{ color: "#2563eb" }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                            >
                                Sign In
                            </a>
                        </p>

                        <p className="text-center text-xs mt-3" style={{ color: "#c0cce0" }}>
                            By registering, you agree to our{" "}
                            <a href="#" className="underline hover:text-blue-500">Terms of Use</a> and{" "}
                            <a href="#" className="underline hover:text-blue-500">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

