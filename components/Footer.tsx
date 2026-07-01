import React from 'react';
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12a10 10 0 10-11.56 9.88v-7H7.9v-2.88h2.54V9.8c0-2.5 1.5-3.88 3.78-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.88h-2.34v7A10 10 0 0022 12z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.98 3.5A2.5 2.5 0 102.5 6a2.5 2.5 0 002.48-2.5zM3 8h4v13H3zm7 0h3.8v1.8h.1c.5-.9 1.8-1.8 3.7-1.8 4 0 4.7 2.6 4.7 6V21h-4v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21h-4z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5zm5 5a5 5 0 110 10 5 5 0 010-10zm6-1a1.2 1.2 0 110 2.4A1.2 1.2 0 0118 6z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.3L6.3 22H3.2l7.3-8.4L1 2h6.3l4.4 5.8z"/>
  </svg>
);
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
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: <FacebookIcon />,   // உங்க existing Facebook SVG
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: <LinkedInIcon />,   // உங்க existing LinkedIn SVG
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: <InstagramIcon />,  // உங்க existing Instagram SVG
  },
  {
    label: "Twitter",
    href: "https://x.com/",
    icon: <TwitterIcon />,    // உங்க existing Twitter SVG
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
                        {socialLinks.map(({ label, icon, href }) => (
    <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
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
