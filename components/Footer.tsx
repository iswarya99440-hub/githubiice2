import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: 'Task Assignment', href: '#tasks' },
        { label: 'Attendance Tracking', href: '#attendance' },
        { label: 'Performance Dashboard', href: '#dashboard' },
        { label: 'Reports', href: '#reports' },
        { label: 'Notifications', href: '#notifications' },
    ];

    const legalLinks = [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Cookie Policy', href: '#cookie' },
    ];

    const socialLinks = [
        {
            label: 'Facebook',
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
            ),
        },
        {
            label: 'LinkedIn',
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                </svg>
            ),
        },
        {
            label: 'Instagram',
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
            ),
        },
        {
            label: 'Twitter',
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
    ];

    return (
        <footer
            className="relative overflow-hidden text-white"
            style={{
                background: 'linear-gradient(160deg, #090f1a 0%, #0b1220 50%, #0a1018 100%)',
                fontFamily: "'Sora', 'Segoe UI', sans-serif",
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

                /* Dot-grid world-map effect */
                .footer-dotmap {
                    position: absolute;
                    inset: 0;
                    opacity: 0.18;
                    background-image: radial-gradient(circle, #3b82f6 1px, transparent 1px);
                    background-size: 22px 22px;
                    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cellipse cx='800' cy='200' rx='450' ry='200' fill='white'/%3E%3C/svg%3E");
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: right center;
                    -webkit-mask-size: 70% 100%;
                    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 400'%3E%3Cellipse cx='800' cy='200' rx='450' ry='200' fill='white'/%3E%3C/svg%3E");
                    mask-repeat: no-repeat;
                    mask-position: right center;
                    mask-size: 70% 100%;
                    pointer-events: none;
                }

                /* Nav link hover dot */
                .f-link {
                    position: relative;
                    padding-left: 14px;
                    transition: color 0.2s;
                }
                .f-link::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: #3b82f6;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .f-link:hover { color: #e2e8f0 !important; }
                .f-link:hover::before { opacity: 1; }

                /* Social icon button */
                .f-social {
                    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
                }
                .f-social:hover {
                    background: rgba(59,130,246,0.15) !important;
                    border-color: rgba(59,130,246,0.4) !important;
                    color: #60a5fa !important;
                    transform: translateY(-2px);
                }

                /* Gradient divider */
                .f-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent);
                }
            `}</style>

            {/* ── Backgrounds ── */}
            <div className="footer-dotmap" />
            {/* Blue glow top-right */}
            <div
                className="absolute pointer-events-none rounded-full -top-52 right-[5%] w-[500px] h-[500px]"
                style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
            />
            {/* Indigo glow bottom-center */}
            <div
                className="absolute pointer-events-none rounded-full bottom-0 right-[30%] w-72 h-72"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
            />

            {/* ── Main content ── */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 lg:px-10 pt-16 pb-8">

                {/* 4-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div>
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                    boxShadow: '0 0 16px rgba(59,130,246,0.4)',
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                                    <rect x="9" y="3" width="6" height="4" rx="1" />
                                    <path d="M9 14l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-widest uppercase text-blue-500 leading-none">
                                    Internship & Placement
                                </p>
                                <p className="text-base font-bold text-slate-100 leading-tight">
                                    Platform
                                </p>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: '#6b7a90' }}>
                            A platform built to streamline internship
                            operations, enforce compliance standards, and empower supervisors
                            with real-time insights.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-base font-semibold text-slate-100 tracking-wide mb-5">
                            Quick Links
                        </h4>
                        <ul className="space-y-3 list-none p-0 m-0">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="f-link no-underline text-sm"
                                        style={{ color: '#8b9ab0' }}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-base font-semibold text-slate-100 tracking-wide mb-5">
                            Legal
                        </h4>
                        <ul className="space-y-3 list-none p-0 m-0">
                            {legalLinks.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="f-link no-underline text-sm"
                                        style={{ color: '#8b9ab0' }}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-base font-semibold text-slate-100 tracking-wide mb-5">
                            Contact us
                        </h4>
                        <div className="flex flex-col gap-3">
                            <a
                                href="mailto:admin@ndengera-clinic.rw"
                                className="text-sm no-underline transition-colors duration-200 hover:text-slate-200"
                                style={{ color: '#8b9ab0' }}
                            >
                                admin@internship-platform.rw
                            </a>
                            <a
                                href="tel:+250788000000"
                                className="text-sm no-underline transition-colors duration-200 hover:text-slate-200"
                                style={{ color: '#8b9ab0' }}
                            >
                                +250 788 000 000
                            </a>
                            <p className="text-sm m-0" style={{ color: '#8b9ab0' }}>
                                Mon – Sat: 7:00 AM – 6:00 PM
                            </p>
                            <p className="text-sm m-0" style={{ color: '#8b9ab0' }}>
                                Internship & Placement Platform, Kigali, Rwanda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="f-divider my-10" />

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Copyright */}
                    <div className="flex items-center gap-2.5">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4b5a6e" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M14.83 14.83A4 4 0 119.17 9.17" />
                        </svg>
                        <span className="text-sm" style={{ color: '#4b5a6e' }}>
                            {currentYear} Internship & Placement Platform — All rights reserved.
                        </span>
                    </div>

                    {/* Social icons */}
                    <div className="flex items-center gap-2.5">
                        {socialLinks.map(({ label, icon }) => (
                            <a
                                key={label}
                                href="#"
                                aria-label={label}
                                className="f-social w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 no-underline"
                                style={{
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.04)',
                                    color: '#8b9ab0',
                                }}
                            >
                                {icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;