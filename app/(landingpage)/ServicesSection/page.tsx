"use client";

import React, { useRef, useEffect, useState } from "react";

interface Service {
    icon: React.ReactNode;
    title: string;
    description: string;
    tag: string;
}

const services: Service[] = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
        ),
        title: "Internship Applications",
        description:
            "Students apply online with auto-filled academic profiles, upload CVs and transcripts, write cover letters, and track their application status in real time.",
        tag: "Multi-role access",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <path d="M11 8v6M8 11h6" />
            </svg>
        ),
        title: "Skill-Based Placement",
        description:
            "Our matching algorithm recommends internship positions based on verified academic skills, department preferences, and supervisor availability.",
        tag: "Automated matching",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
        ),
        title: "Supervisor Evaluations",
        description:
            "Structured mid-term and final evaluation forms with skill rubrics, attendance tracking, and qualitative feedback all accessible to students post-submission.",
        tag: "Mid-term & final",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
        title: "Progress Tracking",
        description:
            "Interns log daily tasks, submit weekly timesheets, and track milestone achievements. Coordinators receive real-time alerts for delayed progress.",
        tag: "Real-time monitoring",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
        ),
        title: "Report Submissions",
        description:
            "Submit weekly, monthly, and final reports via rich-text editor or document upload. Includes plagiarism checks, deadline tracking, and resubmission support.",
        tag: "Version controlled",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
        title: "Analytics & Reporting",
        description:
            "Comprehensive dashboards with placement rates, performance distributions, department statistics, and custom exportable reports for institutional insights.",
        tag: "Analytics & insights",
    },
];

const ServicesSection: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIdx, setActiveIdx] = useState(1);

    /* Auto-scroll on mount for visual effect */
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        // Scroll to center card initially
        const cardW = 380 + 24;
        el.scrollLeft = cardW * 1 - el.offsetWidth / 2 + cardW / 2;
    }, []);

    const scrollTo = (idx: number) => {
        const el = scrollRef.current;
        if (!el) return;
        const cardW = 380 + 24;
        el.scrollTo({ left: cardW * idx - el.offsetWidth / 2 + cardW / 2, behavior: "smooth" });
        setActiveIdx(idx);
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .services-root {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }

        /* Circuit corner decoration */
        .circuit-svg {
          position: absolute;
          opacity: 0.18;
          pointer-events: none;
        }

        /* Hide scrollbar */
        .cards-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
        }
        .cards-scroll::-webkit-scrollbar { display: none; }

        .service-card {
          flex-shrink: 0;
          width: 380px;
          scroll-snap-align: center;
          border-radius: 20px;
          padding: 36px 32px 32px;
          background: #162040;
          border: 1px solid rgba(99,179,237,0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .service-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(37,99,235,0.2);
        }
        .service-card.active {
          background: #1a2a55;
          border-color: rgba(99,179,237,0.22);
          box-shadow: 0 16px 40px rgba(37,99,235,0.18);
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          box-shadow: 0 8px 20px rgba(37,99,235,0.35);
          flex-shrink: 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          opacity: 0;
          animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        /* Dot nav */
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: background 0.2s, width 0.2s;
        }
        .dot.active {
          background: #2563eb;
          width: 24px;
          border-radius: 4px;
        }
      `}</style>

            <section
                id="services"
                className="services-root relative scroll-mt-28 overflow-hidden py-20 lg:py-28"
                style={{ background: "#eef2fb" }}
            >
                {/* Circuit corner — top left */}
                <svg className="circuit-svg top-0 left-0 w-48 lg:w-64" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10 H60 V50 H100 V30 H160" stroke="#2563eb" strokeWidth="1.5" />
                    <path d="M10 40 H40 V80 H90" stroke="#2563eb" strokeWidth="1.5" />
                    <path d="M10 70 H30 V110 H70 V90 H130" stroke="#2563eb" strokeWidth="1.5" />
                    <circle cx="60" cy="10" r="3" fill="#2563eb" />
                    <circle cx="100" cy="50" r="3" fill="#2563eb" />
                    <circle cx="40" cy="80" r="3" fill="#2563eb" />
                    <circle cx="70" cy="90" r="3" fill="#2563eb" />
                </svg>

                {/* Circuit corner — top right */}
                <svg className="circuit-svg top-0 right-0 w-48 lg:w-64" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
                    <path d="M10 10 H60 V50 H100 V30 H160" stroke="#2563eb" strokeWidth="1.5" />
                    <path d="M10 40 H40 V80 H90" stroke="#2563eb" strokeWidth="1.5" />
                    <path d="M10 70 H30 V110 H70 V90 H130" stroke="#2563eb" strokeWidth="1.5" />
                    <circle cx="60" cy="10" r="3" fill="#2563eb" />
                    <circle cx="100" cy="50" r="3" fill="#2563eb" />
                    <circle cx="40" cy="80" r="3" fill="#2563eb" />
                    <circle cx="70" cy="90" r="3" fill="#2563eb" />
                </svg>

                {/* Section header */}
                <div className="text-center mb-14 px-6 animate-fadeUp" style={{ animationDelay: "0.05s" }}>
                    <p
                        className="text-base font-semibold mb-3 animate-fadeUp"
                        style={{ color: "#2563eb", fontFamily: "'Sora', sans-serif", letterSpacing: "0.04em", animationDelay: "0.08s" }}
                    >
                        Our Services
                    </p>
                    <h2
                        className="text-4xl lg:text-5xl font-extrabold animate-fadeUp"
                        style={{ color: "#1e3a8a", fontFamily: "'Sora', sans-serif", animationDelay: "0.16s" }}
                    >
                        What the Platform Offers
                    </h2>
                </div>

                {/* Horizontal scroll cards */}
                <div
                    ref={scrollRef}
                    className="cards-scroll flex gap-6 px-8 lg:px-16 pb-6 overflow-x-auto"
                >
                    {/* Left spacer */}
                    <div className="flex-shrink-0" style={{ width: "calc(50vw - 214px)" }} />

                    {services.map((svc, i) => (
                        <div
                            key={i}
                            className={`service-card ${activeIdx === i ? "active" : ""}`}
                            onClick={() => scrollTo(i)}
                        >
                            <div className="card-icon">{svc.icon}</div>

                            <h3
                                className="text-xl font-bold text-white mb-3"
                                style={{ fontFamily: "'Sora', sans-serif", lineHeight: 1.25 }}
                            >
                                {svc.title}
                            </h3>

                            <p
                                className="text-sm leading-relaxed mb-6"
                                style={{ color: "#94a3b8", lineHeight: "1.75" }}
                            >
                                {svc.description}
                            </p>

                            <div
                                className="inline-flex items-center gap-2 text-xs font-medium"
                                style={{ color: "#90cdf4" }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: "#38bdf8", boxShadow: "0 0 6px rgba(56,189,248,0.8)" }}
                                />
                                {svc.tag}
                            </div>
                        </div>
                    ))}

                    {/* Right spacer */}
                    <div className="flex-shrink-0" style={{ width: "calc(50vw - 214px)" }} />
                </div>

                {/* Dot nav */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    {services.map((_, i) => (
                        <button
                            key={i}
                            className={`dot ${activeIdx === i ? "active" : ""}`}
                            onClick={() => scrollTo(i)}
                            aria-label={`Go to service ${i + 1}`}
                        />
                    ))}
                </div>
            </section>
        </>
    );
};

export default ServicesSection;
