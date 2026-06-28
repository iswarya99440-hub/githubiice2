'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const navItems = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Services', href: '#services', id: 'services' },
    { label: 'Modules', href: '#modules', id: 'modules' },
    { label: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 16);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const sections = navItems
            .map((item) => document.getElementById(item.id))
            .filter((section): section is HTMLElement => Boolean(section));

        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleEntry?.target?.id) {
                    setActiveSection(visibleEntry.target.id);
                }
            },
            {
                rootMargin: '-35% 0px -45% 0px',
                threshold: [0.2, 0.4, 0.65],
            },
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    const handleNavClick = (targetId: string) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        setActiveSection(targetId);
        setMenuOpen(false);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const headerClassName = useMemo(
        () =>
            `sticky top-0 z-50 w-full transition-all duration-300 ${
                isScrolled ? 'backdrop-blur-xl' : 'backdrop-blur-md'
            }`,
        [isScrolled],
    );

    return (
        <header className={headerClassName}>
            <div
                className="relative overflow-hidden border-b border-sky-400/15"
                style={{
                    background: isScrolled
                        ? 'linear-gradient(180deg, rgba(3,10,24,0.92) 0%, rgba(7,18,36,0.88) 100%)'
                        : 'linear-gradient(90deg, rgba(5,13,26,0.95) 0%, rgba(7,18,36,0.92) 38%, rgba(10,26,53,0.92) 72%, rgba(13,32,64,0.92) 100%)',
                    boxShadow: isScrolled ? '0 10px 30px rgba(2,6,23,0.28)' : '0 1px 40px rgba(37,99,235,0.08)',
                }}
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
                <div className="pointer-events-none absolute -top-16 right-[12%] h-36 w-80 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -top-10 right-[28%] h-24 w-48 rounded-full bg-cyan-300/10 blur-2xl" />

                <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-10">
                    <button
                        type="button"
                        onClick={() => handleNavClick('home')}
                        className="flex items-center gap-3 text-left"
                        aria-label="Scroll to top"
                    >
                        <div
                            className="rounded-2xl p-1 shadow-lg ring-1 ring-sky-300/20"
                            style={{
                                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                                boxShadow: '0 0 18px rgba(37,99,235,0.38)',
                            }}
                        >
                            <Image
                                src="/logo.png"
                                alt="Internaship logo"
                                height={42}
                                width={42}
                                className="block rounded-xl"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-slate-400/85">
                                Online Internship Placement
                            </span>
                            <span className="text-[1.05rem] font-semibold leading-tight tracking-tight text-slate-50">
                                Tracking Platform
                            </span>
                        </div>
                    </button>

                    <nav className="hidden items-center gap-2 md:flex">
                        {navItems.map(({ label, href, id }) => {
                            const isActive = activeSection === id;
                            return (
                                <a
                                    key={id}
                                    href={href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick(id);
                                    }}
                                    className={`group relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.18)]'
                                            : 'text-slate-300/85 hover:bg-white/5 hover:text-sky-200'
                                    }`}
                                >
                                    {label}
                                    <span
                                        className={`absolute inset-x-4 -bottom-[2px] h-[2px] rounded-full bg-gradient-to-r from-sky-400 to-blue-400 transition-all duration-300 ${
                                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`}
                                    />
                                </a>
                            );
                        })}
                    </nav>

                    <div className="hidden items-center gap-3 md:flex">
                        <Link
                            href="/auth"
                            className="rounded-full border border-sky-400/35 px-5 py-2 text-sm font-medium text-sky-200 transition-all duration-200 hover:border-sky-300 hover:bg-sky-400/10 hover:text-white"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                            style={{
                                background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                                boxShadow: '0 10px 28px rgba(37,99,235,0.28)',
                            }}
                        >
                            Get Started
                        </Link>
                    </div>

                    <button
                        className="inline-flex rounded-xl border border-sky-400/20 bg-white/5 p-2 text-slate-300 transition-colors hover:text-sky-200 md:hidden"
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            {menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="border-b border-sky-400/10 bg-[#071224]/96 px-6 pb-5 pt-4 shadow-2xl backdrop-blur-xl md:hidden">
                    <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                        {navItems.map(({ label, href, id }) => {
                            const isActive = activeSection === id;
                            return (
                                <a
                                    key={id}
                                    href={href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick(id);
                                    }}
                                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-sky-400/10 text-white'
                                            : 'text-slate-300/85 hover:bg-white/5 hover:text-sky-200'
                                    }`}
                                >
                                    {label}
                                </a>
                            );
                        })}
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <Link
                                href="/auth"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-xl border border-sky-400/30 px-4 py-2.5 text-center text-sm font-medium text-sky-200 transition-colors hover:bg-sky-400/10"
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/signup"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                                    boxShadow: '0 10px 24px rgba(37,99,235,0.24)',
                                }}
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
