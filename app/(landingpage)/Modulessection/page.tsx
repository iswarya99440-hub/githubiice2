"use client";

import React, { } from "react";
import Image from "next/image";

interface Module {
    category: string;
    image: string;
    title: string;
    description: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
}

const modules: Module[] = [
    {
        category: "Student Portal",
        image: "/apply.png",
        title: "Internship Applications",
        description:
            "Apply online with auto-filled academic profiles, upload CVs and cover letters, and track your application status in real time.",
        stat1Label: "Roles Supported",
        stat1Value: "4 Roles",
        stat2Label: "Doc Types",
        stat2Value: "5 Types",
    },
    {
        category: "Student Portal",
        image: "/track.jfif",
        title: "Progress Tracking",
        description:
            "Log daily tasks, submit weekly timesheets, and track milestone achievements from your personal internship dashboard.",
        stat1Label: "Check-ins",
        stat1Value: "Weekly",
        stat2Label: "Milestones",
        stat2Value: "6 Stages",
    },
    {
        category: "Student Portal",
        image: "/r-submit.jfif",
        title: "Report Submissions",
        description:
            "Submit weekly, monthly, and final internship reports online. Includes plagiarism checks, versioning, and deadline reminders.",
        stat1Label: "Report Types",
        stat1Value: "3 Types",
        stat2Label: "Resubmissions",
        stat2Value: "Allowed",
    },
    // ── Row 2: Coordinator/Supervisor-facing ──
    {
        category: "Coordinator Tools",
        image: "/skills.png",
        title: "Skill-Based Placement",
        description:
            "Automated matching recommendations based on academic competencies, preferred departments, and supervisor workload.",
        stat1Label: "Match Criteria",
        stat1Value: "8 Factors",
        stat2Label: "Placements",
        stat2Value: "Auto-suggest",
    },
    {
        category: "Coordinator Tools",
        image: "/evaluation.png",
        title: "Supervisor Evaluations",
        description:
            "Structured mid-term and final evaluation forms with skill rubrics, attendance scores, and qualitative feedback fields.",
        stat1Label: "Eval Stages",
        stat1Value: "2 Stages",
        stat2Label: "Rubric Items",
        stat2Value: "10+ Items",
    },
    {
        category: "Coordinator Tools",
        image: "/analytics.jpg",
        title: "Analytics & Reporting",
        description:
            "Dashboards with placement success rates, student performance distributions, and department-level insights exportable to PDF or Excel.",
        stat1Label: "KPI Cards",
        stat1Value: "12+ KPIs",
        stat2Label: "Export Formats",
        stat2Value: "PDF & Excel",
    },
];

const Stat: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => (
    <div className="flex items-center gap-2">
        <span style={{ color: "#2563eb" }}>{icon}</span>
        <span className="text-sm font-medium text-slate-700">
            {value} <span className="font-normal text-slate-500">{label}</span>
        </span>
    </div>
);

const ModuleCard: React.FC<{ mod: Module; delay: string }> = ({ mod, delay }) => (
    <div
        className="flex flex-col rounded-2xl overflow-hidden bg-white animate-fadeUp"
        style={{
            border: "1px solid #e2eaf8",
            boxShadow: "0 2px 16px rgba(37,99,235,0.07)",
            animationDelay: delay,
            transition: "box-shadow 0.25s, transform 0.25s",
        }}
        onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(37,99,235,0.14)";
        }}
        onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(37,99,235,0.07)";
        }}
    >
        {/* Image + category badge */}
        <div className="relative">
            <Image
                src={mod.image}
                alt={mod.title}
                width={480}
                height={220}
                className="w-full object-cover"
                style={{ height: "200px", display: "block" }}
            />
            <span
                className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-white"
                style={{
                    background: "rgba(37,99,235,0.82)",
                    backdropFilter: "blur(6px)",
                    letterSpacing: "0.02em",
                }}
            >
                {mod.category}
            </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-6 gap-4">
            <h3
                className="text-lg font-bold"
                style={{ color: "#2563eb", fontFamily: "'Sora', sans-serif" }}
            >
                {mod.title}
            </h3>

            <p className="text-sm leading-relaxed flex-1" style={{ color: "#64748b" }}>
                {mod.description}
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <Stat
                    value={mod.stat1Value}
                    label={mod.stat1Label}
                    icon={
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        </svg>
                    }
                />
                <Stat
                    value={mod.stat2Value}
                    label={mod.stat2Label}
                    icon={
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    }
                />
            </div>

            {/* CTA */}
            <button
                className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-1 transition-all duration-200"
                style={{
                    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "0.02em",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
                View Details
            </button>
        </div>
    </div>
);

const ModulesSection: React.FC = () => {
    const row1 = modules.slice(0, 3);
    const row2 = modules.slice(3, 6);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .modules-root { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          opacity: 0;
          animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>

            <section id="modules" className="modules-root scroll-mt-28 py-20 lg:py-28" style={{ background: "#eef2fb" }}>
                <div className="max-w-7xl mx-auto px-6 lg:px-16">

                    {/* Header */}
                    <div className="text-center mb-14">
                        <p
                            className="text-base font-semibold mb-2 animate-fadeUp"
                            style={{ color: "#2563eb", fontFamily: "'Sora', sans-serif", letterSpacing: "0.04em", animationDelay: "0.05s" }}
                        >
                            Platform Modules
                        </p>
                        <h2
                            className="text-4xl lg:text-5xl font-extrabold animate-fadeUp"
                            style={{ color: "#1e3a8a", fontFamily: "'Sora', sans-serif", animationDelay: "0.12s" }}
                        >
                            Explore What You Can Do
                        </h2>
                        <p
                            className="text-base mt-3 animate-fadeUp"
                            style={{ color: "#64748b", animationDelay: "0.2s" }}
                        >
                            From application to evaluation every module built for efficiency
                        </p>
                    </div>

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {row1.map((mod, i) => (
                            <ModuleCard key={mod.title} mod={mod} delay={`${0.1 + i * 0.1}s`} />
                        ))}
                    </div>

                    {/* Divider */}
                    <div
                        className="my-8 mx-auto"
                        style={{ height: "1px", background: "linear-gradient(90deg, transparent, #c7d7f0 30%, #c7d7f0 70%, transparent)", maxWidth: "80%" }}
                    />

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {row2.map((mod, i) => (
                            <ModuleCard key={mod.title} mod={mod} delay={`${0.25 + i * 0.1}s`} />
                        ))}
                    </div>

                </div>
            </section>
        </>
    );
};

export default ModulesSection;
