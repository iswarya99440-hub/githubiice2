"use client";

import React, { useState } from "react";
import Image from "next/image";

type Role = "student" | "supervisor";

interface Step {
    number: string;
    label: string;
    image: string;
    icon: React.ReactNode;
}

const steps: Record<Role, Step[]> = {
    student: [
        {
            number: "1",
            label: "Register & Complete Your Profile",
            image: "/user.JPG",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
        },
        {
            number: "2",
            label: "Submit Your Internship Application",
            image: "/apply.png",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
                </svg>
            ),
        },
        {
            number: "3",
            label: "Get Placed & Track Your Progress",
            image: "/track.jfif ",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                </svg>
            ),
        },
        {
            number: "4",
            label: "Submit Reports & View Evaluations",
            image: "/reports.jpg",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
            ),
        },
    ],
    supervisor: [
        {
            number: "1",
            label: "Register & Set Up Your Profile",
            image: "/user.JPG",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
        },
        {
            number: "2",
            label: "Review & Accept Assigned Interns",
            image: "/evaluation.png",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
            ),
        },
        {
            number: "3",
            label: "Monitor Progress & Give Feedback",
            image: "/monitor.jpg",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
            ),
        },
        {
            number: "4",
            label: "Submit Mid-Term & Final Evaluations",
            image: "/evaluations.jpg",
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            ),
        },
    ],
};

const ctaLabel: Record<Role, string> = {
    student: "Apply for Internship",
    supervisor: "Register as Supervisor",
};

const HowItWorksSection: React.FC = () => {
    const [activeRole, setActiveRole] = useState<Role>("student");
    const activeSteps = steps[activeRole];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .hiw-root { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          opacity: 0;
          animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* Tab toggle */
        .role-tab {
          padding: 10px 28px;
          border-radius: 999px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          border: none;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .role-tab.active {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: white;
          box-shadow: 0 6px 20px rgba(37,99,235,0.3);
        }
        .role-tab.inactive {
          background: transparent;
          color: #475569;
        }
        .role-tab.inactive:hover { color: #1e3a8a; }

        /* Step cards */
        .step-card {
          border-radius: 20px;
          overflow: hidden;
          background: #162040;
          border: 1px solid rgba(99,179,237,0.1);
          transition: transform 0.25s, box-shadow 0.25s;
          cursor: default;
        }
        .step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(37,99,235,0.2);
        }

        /* Steps grid: first card larger */
        .steps-grid {
          display: grid;
          grid-template-columns: 1.55fr 1fr 1fr 1fr;
          gap: 16px;
          align-items: stretch;
        }

        @media (max-width: 1024px) {
          .steps-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 640px) {
          .steps-grid {
            grid-template-columns: 1fr;
          }
        }

        /* CTA button */
        .cta-btn {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: white;
          border: none;
          border-radius: 999px;
          padding: 16px 52px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Sora', sans-serif;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 24px rgba(37,99,235,0.3);
        }
        .cta-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.4);
        }
      `}</style>

            <section id="how-it-works" className="hiw-root scroll-mt-28 bg-white py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-6 lg:px-16">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2
                            className="text-4xl lg:text-5xl font-extrabold mb-8 animate-fadeUp"
                            style={{ color: "#1e3a8a", fontFamily: "'Sora', sans-serif", animationDelay: "0.05s" }}
                        >
                            How It Works?
                        </h2>

                        {/* Role toggle */}
                        <div
                            className="inline-flex items-center p-1.5 rounded-full animate-fadeUp"
                            style={{
                                background: "#eef2fb",
                                border: "1px solid #dde6f8",
                                animationDelay: "0.15s",
                                gap: "4px",
                            }}
                        >
                            {(["student", "supervisor"] as Role[]).map((role) => (
                                <button
                                    key={role}
                                    className={`role-tab ${activeRole === role ? "active" : "inactive"}`}
                                    onClick={() => setActiveRole(role)}
                                >
                                    {role === "student" ? "Student" : "Supervisor"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Steps grid */}
                    <div className="steps-grid mb-12 animate-fadeUp" style={{ animationDelay: "0.25s" }}>
                        {activeSteps.map((step, i) => (
                            <div key={step.number} className="step-card flex flex-col">
                                {/* Image — only first card shows image prominently */}
                                {i === 0 ? (
                                    <div className="relative" style={{ height: "220px" }}>
                                        <Image
                                            src={step.image}
                                            alt={step.label}
                                            fill
                                            className="object-cover"
                                            style={{ display: "block" }}
                                        />
                                        <div
                                            className="absolute inset-0"
                                            style={{ background: "linear-gradient(180deg, transparent 40%, rgba(22,32,64,0.85) 100%)" }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="relative flex items-center justify-center"
                                        style={{
                                            height: "160px",
                                            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(99,179,237,0.08))",
                                        }}
                                    >
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                            style={{
                                                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                                boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                                            }}
                                        >
                                            {step.icon}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-end gap-4 p-5 mt-auto">
                                    {/* Number badge */}
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base"
                                        style={{
                                            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                            fontFamily: "'Sora', sans-serif",
                                            boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
                                        }}
                                    >
                                        {step.number}
                                    </div>
                                    <p
                                        className="text-sm font-semibold text-white leading-snug"
                                        style={{ fontFamily: "'Sora', sans-serif" }}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex justify-center animate-fadeUp" style={{ animationDelay: "0.38s" }}>
                        <button className="cta-btn">{ctaLabel[activeRole]}</button>
                    </div>

                </div>
            </section>
        </>
    );
};

export default HowItWorksSection;
