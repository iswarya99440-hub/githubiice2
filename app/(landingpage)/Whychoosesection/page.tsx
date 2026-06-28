"use client";

import React from "react";
import Image from "next/image";

interface ReasonProps {
    number: string;
    description: string;
    delay: string;
}

const Reason: React.FC<ReasonProps> = ({ number, description, delay }) => (
    <div
        className="flex items-start gap-6 animate-fadeUp"
        style={{ animationDelay: delay }}
    >
        <span
            className="flex-shrink-0 text-5xl font-extrabold leading-none"
            style={{
                fontFamily: "'Sora', sans-serif",
                color: "#1e3a8a",
                minWidth: "72px",
            }}
        >
            {number}
        </span>
        <p
            className="text-base leading-relaxed pt-2"
            style={{ color: "#475569", fontFamily: "'DM Sans', sans-serif" }}
        >
            {description}
        </p>
    </div>
);

const WhyChooseSection: React.FC = () => {
    const reasons = [
        {
            number: "01",
            description:
                "By centralising applications, placements, and evaluations in one platform, coordinators gain full visibility over every student's internship journey  from the first application to the final report submission eliminating paperwork and manual follow-ups.",
        },
        {
            number: "02",
            description:
                "Students are matched to internship positions based on their verified academic skills and program requirements. Our algorithm ensures every placement is purposeful, reducing mismatches and improving the quality of learning experiences.",
        },
        {
            number: "03",
            description:
                "The system brings skill-based matching, structured supervisor evaluations, real-time progress tracking, and document management into a single platform  giving institutions a clear, accountable, and transparent internship management process.",
        },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          opacity: 0;
          animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .why-image-wrap {
          position: relative;
          border-radius: 0 120px 0 0;
          overflow: hidden;
        }

        .why-image-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 55%, rgba(10,20,50,0.3) 100%);
          pointer-events: none;
        }
      `}</style>

            <section id="why-choose" className="scroll-mt-28 bg-white py-20 lg:py-28 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

                        {/* ── Left: Image ── */}
                        <div
                            className="why-image-wrap animate-fadeUp shadow-2xl"
                            style={{
                                animationDelay: "0.05s",
                                boxShadow: "0 24px 64px rgba(37,99,235,0.12)",
                            }}
                        >
                            <Image
                                src="/why.jpg"
                                alt="Student working at a healthcare internship"
                                width={680}
                                height={720}
                                className="w-full object-cover"
                                style={{ display: "block", minHeight: "480px", objectPosition: "center" }}
                                priority
                            />
                        </div>

                        {/* ── Right: Content ── */}
                        <div className="flex flex-col gap-12">

                            {/* Heading */}
                            <h2
                                className="text-4xl lg:text-5xl font-extrabold animate-fadeUp"
                                style={{
                                    fontFamily: "'Sora', sans-serif",
                                    color: "#1e3a8a",
                                    lineHeight: 1.15,
                                    animationDelay: "0.1s",
                                }}
                            >
                                Why Choose Our<br />
                                <span style={{ color: "#2563eb" }}>Internship Platform</span>
                            </h2>

                            {/* Numbered reasons */}
                            <div className="flex flex-col gap-10">
                                {reasons.map((r, i) => (
                                    <Reason
                                        key={i}
                                        number={r.number}
                                        description={r.description}
                                        delay={`${0.2 + i * 0.15}s`}
                                    />
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default WhyChooseSection;
