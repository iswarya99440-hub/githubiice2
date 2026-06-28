"use client";

import {
    LogOut,
    Settings,
    Menu,
    X,
    LayoutDashboard,
    Users,
    ClipboardList,
    Activity,
    FileBarChart,
    CalendarCheck,
    MessageSquare,
    Bell,
    HelpCircle,
    ChevronRight,
    Briefcase,
    ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

// ── Nav config ──────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
    {
        label: "Main",
        items: [
            { title: "Dashboard", url: "/supervisor", icon: LayoutDashboard },
            { title: "Assigned Interns", url: "/supervisor/assigned-interns", icon: Users },
            { title: "Evaluations", url: "/supervisor/evaluation", icon: ClipboardList },
            { title: "Progress Monitoring", url: "/supervisor/progress-monitoring", icon: Activity },
        ],
    },
    {
        label: "Reports & Attendance",
        items: [
            { title: "Reports", url: "/supervisor/reports", icon: FileBarChart },
            { title: "Attendance Tracking", url: "/supervisor/attendance-tracking", icon: CalendarCheck },
        ],
    },
    {
        label: "Communication",
        items: [
            { title: "Messages", url: "/supervisor/messages", icon: MessageSquare },
            { title: "Notifications", url: "/supervisor/notifications", icon: Bell },
        ],
    },
    {
        label: "Help & Support",
        items: [
            { title: "System Settings", url: "/supervisor/system-settings", icon: Settings },
        ],
    },
];

// ── Confirm Dialog ──────────────────────────────────────────────────────────
function ConfirmDialog({
    open,
    setOpen,
    confirmFunc,
}: {
    open: boolean;
    setOpen: (v: boolean) => void;
    confirmFunc: () => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
                <div className="p-6">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: "linear-gradient(135deg,#fee2e2,#fecaca)" }}
                    >
                        <LogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <h3
                        className="text-lg font-bold text-slate-800 text-center mb-1"
                        style={{ fontFamily: "'Sora',sans-serif" }}
                    >
                        Sign Out?
                    </h3>
                    <p className="text-slate-500 text-center text-sm leading-relaxed mb-6">
                        You&apos;ll need to sign in again to access your supervisor dashboard.
                    </p>
                    <div className="flex gap-3">
                        <button
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 transition-all"
                            style={{ border: "1.5px solid #e2eaf8" }}
                            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#f8faff")}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)" }}
                            onClick={() => { confirmFunc(); setOpen(false); }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Sidebar ────────────────────────────────────────────────────────────
export default function SupervisorSidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const pathname = usePathname() || "/supervisor";
    const { data: session } = useSession();

    const user = session?.user;
    const initials = user
        ? `${user.name?.split(" ")[0]?.[0] ?? ""}${user.name?.split(" ")[1]?.[0] ?? ""}`.toUpperCase()
        : "SV";

    const performLogout = () => signOut({ callbackUrl: "/auth" });

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

                .sv-sidebar { font-family: 'DM Sans', sans-serif; }
                .sv-sidebar .sora { font-family: 'Sora', sans-serif; }

                /* Dot grid */
                .sv-dotgrid {
                    position: absolute; inset: 0; pointer-events: none;
                    opacity: 0.065;
                    background-image: radial-gradient(circle, #818cf8 1px, transparent 1px);
                    background-size: 20px 20px;
                }

                /* Glow orbs — indigo tint to differentiate from student sidebar */
                .sv-orb-1 {
                    position: absolute; width: 240px; height: 240px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(79,70,229,0.22) 0%, transparent 70%);
                    top: -70px; left: -70px; pointer-events: none;
                }
                .sv-orb-2 {
                    position: absolute; width: 170px; height: 170px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%);
                    bottom: 90px; right: -40px; pointer-events: none;
                }

                /* Nav item */
                .sv-nav-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 14px;
                    border-radius: 12px;
                    font-size: 0.875rem; font-weight: 500;
                    cursor: pointer;
                    transition: background 0.18s, color 0.18s, transform 0.15s;
                    text-decoration: none;
                    position: relative;
                    color: rgba(255,255,255,0.62);
                }
                .sv-nav-item:hover {
                    background: rgba(255,255,255,0.08);
                    color: white;
                    transform: translateX(2px);
                }
                .sv-nav-item.active {
                    background: rgba(129,140,248,0.14);
                    color: white;
                    font-weight: 600;
                    box-shadow: inset 0 0 0 1px rgba(129,140,248,0.22);
                }
                .sv-nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 20%; bottom: 20%;
                    width: 3px;
                    border-radius: 0 3px 3px 0;
                    background: linear-gradient(180deg, #a5b4fc, #6366f1);
                }

                /* Section label */
                .sv-section-label {
                    font-size: 0.65rem; font-weight: 700;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    color: rgba(255,255,255,0.26);
                    padding: 0 14px;
                    margin-bottom: 4px; margin-top: 16px;
                    font-family: 'Sora', sans-serif;
                }

                /* Avatar — indigo gradient */
                .sv-avatar {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: linear-gradient(135deg, #4f46e5, #818cf8);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.8rem; font-weight: 700; color: white;
                    flex-shrink: 0; font-family: 'Sora', sans-serif;
                    box-shadow: 0 0 0 2px rgba(129,140,248,0.45), 0 4px 12px rgba(79,70,229,0.3);
                }

                /* Role badge */
                .sv-role-badge {
                    display: inline-flex; align-items: center; gap: 4px;
                    padding: 2px 8px; border-radius: 999px;
                    font-size: 0.65rem; font-weight: 600;
                    background: rgba(129,140,248,0.18);
                    color: #a5b4fc;
                    border: 1px solid rgba(129,140,248,0.25);
                }

                /* Logout */
                .sv-btn-logout {
                    display: flex; align-items: center; gap: 10px;
                    width: 100%; padding: 10px 14px; border-radius: 12px;
                    font-size: 0.875rem; font-weight: 600;
                    border: none; cursor: pointer;
                    color: #fca5a5;
                    background: rgba(239,68,68,0.1);
                    transition: background 0.2s, color 0.2s, transform 0.15s;
                    font-family: 'DM Sans', sans-serif;
                }
                .sv-btn-logout:hover {
                    background: rgba(239,68,68,0.2);
                    color: #f87171;
                    transform: translateX(2px);
                }

                /* Info card */
                .sv-info-card {
                    margin: 0 12px 16px;
                    padding: 14px; border-radius: 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(129,140,248,0.16);
                    backdrop-filter: blur(6px);
                }

                /* Scrollbar */
                .sv-scroll::-webkit-scrollbar { width: 3px; }
                .sv-scroll::-webkit-scrollbar-track { background: transparent; }
                .sv-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
            `}</style>

            {/* Mobile toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-[1001] p-2.5 rounded-xl text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)" }}
                aria-label="Toggle Menu"
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-[998] backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    sv-sidebar fixed inset-y-0 left-0 z-[999] w-[260px]
                    flex flex-col h-screen shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
                style={{ background: "linear-gradient(160deg, #0a0f1e 0%, #0c1228 55%, #0f1840 100%)" }}
            >
                <div className="sv-dotgrid" />
                <div className="sv-orb-1" />
                <div className="sv-orb-2" />

                {/* ── Brand ── */}
                <div
                    className="relative z-10 flex items-center gap-3 px-5 py-5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                </div>

                {/* ── User profile card ── */}
                <div
                    className="relative z-10 mx-3 mt-4 mb-1 px-4 py-3 rounded-2xl flex items-center gap-3"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(129,140,248,0.14)",
                    }}
                >
                    <div className="sv-avatar">{initials}</div>
                    <div className="flex-1 min-w-0">
                        <div className="sora text-sm font-semibold text-white truncate mb-1">
                            {user?.name ?? "Supervisor"}
                        </div>
                        <span className="sv-role-badge">
                            <ShieldCheck size={9} />
                            Supervisor
                        </span>
                    </div>
                    <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.22)", flexShrink: 0 }} />
                </div>

                {/* ── Intern quick-stat chip ── */}
                <div className="relative z-10 mx-3 mt-2 mb-1 flex gap-2">
                    {[
                        { label: "Interns", value: "—", icon: Users },
                        { label: "Pending Evals", value: "—", icon: ClipboardList },
                    ].map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex-1 flex flex-col items-center py-2.5 rounded-xl gap-0.5"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(129,140,248,0.1)" }}
                        >
                            <Icon size={13} style={{ color: "#a5b4fc" }} />
                            <span className="text-sm font-bold text-white sora">{value}</span>
                            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* ── Nav sections ── */}
                <div className="sv-scroll relative z-10 flex-1 overflow-y-auto px-3 pb-2">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            <div className="sv-section-label">{section.label}</div>
                            {section.items.map((item) => {
                                const isActive =
                                    pathname === item.url ||
                                    (item.url !== "/supervisor" && pathname.startsWith(item.url));
                                return (
                                    <Link
                                        key={item.url}
                                        href={item.url}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`sv-nav-item ${isActive ? "active" : ""}`}
                                    >
                                        <item.icon
                                            size={17}
                                            className="flex-shrink-0"
                                            style={{ color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.42)" }}
                                        />
                                        <span>{item.title}</span>
                                        {isActive && (
                                            <ChevronRight
                                                size={13}
                                                className="ml-auto flex-shrink-0"
                                                style={{ color: "rgba(255,255,255,0.28)" }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* ── Logout ── */}
                <div
                    className="relative z-10 px-3 pb-5"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}
                >
                    <button className="sv-btn-logout" onClick={() => setConfirmOpen(true)}>
                        <LogOut size={16} className="flex-shrink-0" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                confirmFunc={performLogout}
            />
        </>
    );
}
