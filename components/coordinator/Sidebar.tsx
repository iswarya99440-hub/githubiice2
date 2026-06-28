"use client";

import {
    LogOut,
    Settings,
    Menu,
    X,
    LayoutDashboard,
    FileInput,
    MapPinned,
    Building2,
    GraduationCap,
    UserCheck,
    ClipboardCheck,
    BarChart3,
    MessageSquare,
    Bell,
    HelpCircle,
    ChevronRight,
    ListTodo,
    ShieldAlert,
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
            { title: "Dashboard", url: "/coordinator", icon: LayoutDashboard },
            { title: "Applications", url: "/coordinator/applications", icon: FileInput },
            { title: "Placement Management", url: "/coordinator/placement-management", icon: MapPinned },
            { title: "Partners & Institutions", url: "/coordinator/partners-institutions", icon: Building2 },
        ],
    },
    {
        label: "People",
        items: [
            { title: "Students", url: "/coordinator/students", icon: GraduationCap },
            { title: "Supervisors", url: "/coordinator/supervisors", icon: UserCheck },
        ],
    },
    {
        label: "Reports & Analytics",
        items: [
            { title: "Reports & Evaluations", url: "/coordinator/reports", icon: ClipboardCheck },
        ],
    },
    {
        label: "Communication",
        items: [
            { title: "Messages", url: "/coordinator/messages", icon: MessageSquare },
            { title: "Notifications", url: "/coordinator/notifications", icon: Bell },
        ],
    },
    {
        label: "Help & Support",
        items: [
            { title: "System Settings", url: "/coordinator/system-settings", icon: Settings },
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
                        You&apos;ll need to sign in again to access your coordinator dashboard.
                    </p>
                    <div className="flex gap-3">
                        <button
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 transition-all"
                            style={{ border: "1.5px solid #e2eaf8" }}
                            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4")}
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
export default function CoordinatorSidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const pathname = usePathname() || "/coordinator";
    const { data: session } = useSession();

    const user = session?.user;
    const initials = user
        ? `${user.name?.split(" ")[0]?.[0] ?? ""}${user.name?.split(" ")[1]?.[0] ?? ""}`.toUpperCase()
        : "CO";

    const performLogout = () => signOut({ callbackUrl: "/auth" });

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

                .co-sidebar { font-family: 'DM Sans', sans-serif; }
                .co-sidebar .sora { font-family: 'Sora', sans-serif; }

                /* Dot grid — teal tint */
                .co-dotgrid {
                    position: absolute; inset: 0; pointer-events: none;
                    opacity: 0.07;
                    background-image: radial-gradient(circle, #2dd4bf 1px, transparent 1px);
                    background-size: 20px 20px;
                }

                /* Glow orbs — teal/emerald */
                .co-orb-1 {
                    position: absolute; width: 240px; height: 240px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(20,184,166,0.22) 0%, transparent 70%);
                    top: -70px; left: -70px; pointer-events: none;
                }
                .co-orb-2 {
                    position: absolute; width: 170px; height: 170px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);
                    bottom: 90px; right: -40px; pointer-events: none;
                }

                /* Nav item */
                .co-nav-item {
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
                .co-nav-item:hover {
                    background: rgba(255,255,255,0.08);
                    color: white;
                    transform: translateX(2px);
                }
                .co-nav-item.active {
                    background: rgba(45,212,191,0.12);
                    color: white;
                    font-weight: 600;
                    box-shadow: inset 0 0 0 1px rgba(45,212,191,0.2);
                }
                .co-nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 20%; bottom: 20%;
                    width: 3px;
                    border-radius: 0 3px 3px 0;
                    background: linear-gradient(180deg, #5eead4, #14b8a6);
                }

                /* Section label */
                .co-section-label {
                    font-size: 0.65rem; font-weight: 700;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    color: rgba(255,255,255,0.26);
                    padding: 0 14px;
                    margin-bottom: 4px; margin-top: 16px;
                    font-family: 'Sora', sans-serif;
                }

                /* Avatar — teal/emerald gradient */
                .co-avatar {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: linear-gradient(135deg, #0d9488, #2dd4bf);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.8rem; font-weight: 700; color: white;
                    flex-shrink: 0; font-family: 'Sora', sans-serif;
                    box-shadow: 0 0 0 2px rgba(45,212,191,0.45), 0 4px 12px rgba(20,184,166,0.3);
                }

                /* Role badge */
                .co-role-badge {
                    display: inline-flex; align-items: center; gap: 4px;
                    padding: 2px 8px; border-radius: 999px;
                    font-size: 0.65rem; font-weight: 600;
                    background: rgba(45,212,191,0.14);
                    color: #5eead4;
                    border: 1px solid rgba(45,212,191,0.22);
                }

                /* Stat chip accent */
                .co-stat-chip {
                    flex: 1; display: flex; flex-direction: column;
                    align-items: center; padding: 10px 4px; border-radius: 12px; gap: 2px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(45,212,191,0.1);
                }

                /* Logout */
                .co-btn-logout {
                    display: flex; align-items: center; gap: 10px;
                    width: 100%; padding: 10px 14px; border-radius: 12px;
                    font-size: 0.875rem; font-weight: 600;
                    border: none; cursor: pointer;
                    color: #fca5a5;
                    background: rgba(239,68,68,0.1);
                    transition: background 0.2s, color 0.2s, transform 0.15s;
                    font-family: 'DM Sans', sans-serif;
                }
                .co-btn-logout:hover {
                    background: rgba(239,68,68,0.2);
                    color: #f87171;
                    transform: translateX(2px);
                }

                /* Action card */
                .co-action-card {
                    margin: 0 12px 16px;
                    padding: 14px; border-radius: 14px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(45,212,191,0.16);
                    backdrop-filter: blur(6px);
                }

                /* Scrollbar */
                .co-scroll::-webkit-scrollbar { width: 3px; }
                .co-scroll::-webkit-scrollbar-track { background: transparent; }
                .co-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
            `}</style>

            {/* Mobile toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-[1001] p-2.5 rounded-xl text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#0d9488,#14b8a6)" }}
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
                    co-sidebar fixed inset-y-0 left-0 z-[999] w-[260px]
                    flex flex-col h-screen shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
                style={{ background: "linear-gradient(160deg, #071218 0%, #091a1f 55%, #0b2030 100%)" }}
            >
                <div className="co-dotgrid" />
                <div className="co-orb-1" />
                <div className="co-orb-2" />

                {/* ── Brand ── */}
                <div
                    className="relative z-10 flex items-center gap-3 px-5 py-5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: "transparent",
                        }}
                    >
                    </div>
                    <div>
                        <div className="sora text-sm font-bold text-white leading-tight">
                            Coordinator Portal
                        </div>
                    </div>
                </div>

                {/* ── User profile card ── */}
                <div
                    className="relative z-10 mx-3 mt-4 mb-1 px-4 py-3 rounded-2xl flex items-center gap-3"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(45,212,191,0.14)",
                    }}
                >
                    <div className="co-avatar">{initials}</div>
                    <div className="flex-1 min-w-0">
                        <div className="sora text-sm font-semibold text-white truncate mb-1">
                            {user?.name ?? "Coordinator"}
                        </div>
                        <span className="co-role-badge">
                            <ShieldAlert size={9} />
                            Coordinator
                        </span>
                    </div>
                    <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.22)", flexShrink: 0 }} />
                </div>

                {/* ── Quick-stat chips ── */}
                <div className="relative z-10 mx-3 mt-2 mb-1 flex gap-2">
                    {[
                        { label: "Applications", value: "—", icon: FileInput },
                        { label: "Placements", value: "—", icon: MapPinned },
                        { label: "Partners", value: "—", icon: Building2 },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="co-stat-chip">
                            <Icon size={12} style={{ color: "#5eead4" }} />
                            <span className="text-sm font-bold text-white sora">{value}</span>
                            <span className="text-[9px] text-center leading-tight" style={{ color: "rgba(255,255,255,0.35)" }}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Nav sections ── */}
                <div className="co-scroll relative z-10 flex-1 overflow-y-auto px-3 pb-2">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            <div className="co-section-label">{section.label}</div>
                            {section.items.map((item) => {
                                const isActive =
                                    pathname === item.url ||
                                    (item.url !== "/coordinator" && pathname.startsWith(item.url));
                                return (
                                    <Link
                                        key={item.url}
                                        href={item.url}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`co-nav-item ${isActive ? "active" : ""}`}
                                    >
                                        <item.icon
                                            size={17}
                                            className="flex-shrink-0"
                                            style={{ color: isActive ? "#5eead4" : "rgba(255,255,255,0.42)" }}
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
                    <button className="co-btn-logout" onClick={() => setConfirmOpen(true)}>
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
