"use client";

import React from "react";
import Image from "next/image";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => (
    <div
        className="flex flex-col gap-4 p-6 rounded-2xl animate-fadeUp"
        style={{
            background: "#f0f4ff",
            border: "1px solid #e2eaf8",
            animationDelay: delay,
        }}
    >
        <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
        >
            {icon}
        </div>
        <div>
            <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                {description}
            </p>
        </div>
    </div>
);

const AboutSection: React.FC = () => {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .about-root {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          opacity: 0;
          animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        .about-title {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          line-height: 1.15;
        }

        .stat-badge {
          position: absolute;
          bottom: -24px;
          left: -24px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: 0 8px 32px rgba(37,99,235,0.15), 0 2px 8px rgba(0,0,0,0.08);
          min-width: 220px;
          z-index: 10;
        }

        .image-wrapper {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
        }
        .image-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(15,30,70,0.35) 100%);
          border-radius: 24px;
          pointer-events: none;
        }
      `}</style>

            <section id="about" className="about-root scroll-mt-28 bg-white py-20 lg:py-28 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

                        {/* ── Left: Text content ── */}
                        <div>
                            {/* Heading */}
                            <h2
                                className="about-title text-4xl lg:text-5xl mb-8 animate-fadeUp"
                                style={{ animationDelay: "0.05s" }}
                            >
                                <span style={{ color: "#1e3a8a" }}>Bridging Students</span>
                                <br />
                                <span style={{ color: "#2563eb" }}>with the Right Internships</span>
                            </h2>

                            {/* Body paragraphs */}
                            <div
                                className="space-y-5 mb-10 animate-fadeUp"
                                style={{ animationDelay: "0.18s" }}
                            >
                                <p className="text-base lg:text-lg leading-relaxed" style={{ color: "#475569" }}>
                                    The Online Internship Placement and Tracking System is built to transform
                                    how healthcare and academic institutions manage student internships from
                                    application and skill-based matching to real-time progress monitoring and
                                    final report submission.
                                </p>
                                <p className="text-base lg:text-lg leading-relaxed" style={{ color: "#475569" }}>
                                    We prioritise transparency and quality. Every placement is driven by verified
                                    academic profiles and structured supervisor evaluations, ensuring students gain
                                    meaningful, measurable experience in the right environment.
                                </p>
                            </div>

                            {/* Feature cards */}
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeUp"
                                style={{ animationDelay: "0.32s" }}
                            >
                                <FeatureCard
                                    delay="0.38s"
                                    title="Skill-Based Matching"
                                    description="Automated placement recommendations align students with internships that match their academic profile and competencies."
                                    icon={
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            <path d="M9 12l2 2 4-4" />
                                        </svg>
                                    }
                                />
                                <FeatureCard
                                    delay="0.46s"
                                    title="Real-Time Tracking"
                                    description="Supervisors and coordinators monitor intern progress, timesheets, and milestones from a centralised dashboard."
                                    icon={
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>

                        {/* ── Right: Image + stat badge ── */}
                        <div
                            className="relative animate-fadeUp"
                            style={{ animationDelay: "0.22s", paddingBottom: "32px", paddingLeft: "32px" }}
                        >
                            {/* Main image */}
                            <div className="image-wrapper shadow-2xl" style={{ boxShadow: "0 24px 64px rgba(37,99,235,0.15)" }}>
                                <Image
                                    src="/house.jpg"
                                    alt="Students engaged in internship activities"
                                    width={680}
                                    height={520}
                                    className="w-full object-cover"
                                    style={{ borderRadius: "24px", display: "block" }}
                                    priority
                                />
                            </div>

                            {/* Stat badge overlay */}
                            <div className="stat-badge">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                        <path d="M22 4L12 14.01l-3-3" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>
                                        98%
                                    </div>
                                    <div className="text-sm font-semibold text-slate-700 mt-0.5">Placement Success Rate</div>
                                    <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                                        Students successfully placed in host institutions
                                    </div>
                                </div>
                            </div>

                            {/* Decorative background blob */}
                            <div
                                className="absolute -top-8 -right-8 w-64 h-64 rounded-full pointer-events-none -z-10"
                                style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)" }}
                            />
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default AboutSection;
