"use client";

import {
    LogOut,
    Settings,
    Menu,
    X,
    LayoutDashboard,
    MapPin,
    Briefcase,
    TrendingUp,
    FileText,
    ClipboardCheck,
    FolderOpen,
    MessageSquare,
    Bell,
    HelpCircle,
    ChevronRight,
    GraduationCap,
    BookOpen,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

// ── Nav config ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
    {
        label: "Main",
        items: [
            { title: "Dashboard", url: "/student", icon: LayoutDashboard },
            { title: "Internship Applications", url: "/student/applications", icon: BookOpen },
            { title: "Placement", url: "/student/placement", icon: MapPin },
            { title: "My Internship", url: "/student/my-internship", icon: Briefcase },
            { title: "Progress Tracking", url: "/student/progress-tracking", icon: TrendingUp },
        ],
    },
    {
        label: "Academic",
        items: [
            { title: "Reports", url: "/student/reports", icon: FileText },
            { title: "Evaluation", url: "/student/evaluation", icon: ClipboardCheck },
            { title: "Documents", url: "/student/documents", icon: FolderOpen },
        ],
    },
    {
        label: "Communication",
        items: [
            { title: "Messages", url: "/student/messages", icon: MessageSquare },
            { title: "Notifications", url: "/student/notifications", icon: Bell },
        ],
    },
    {
        label: "Help & Support",
        items: [
            { title: "Help & Support", url: "/student/help-support", icon: HelpCircle },
            { title: "System Settings", url: "/student/system-settings", icon: Settings },
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
                    <h3 className="text-lg font-bold text-slate-800 text-center mb-1" style={{ fontFamily: "'Sora',sans-serif" }}>
                        Sign Out?
                    </h3>
                    <p className="text-slate-500 text-center text-sm leading-relaxed mb-6">
                        You&apos;ll need to sign in again to access your student dashboard.
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

export default function StudentSidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const pathname = usePathname() || "/student";
    const router = useRouter();
    const { data: session } = useSession();

    const user = session?.user;
    const initials = user
        ? `${user.name?.split(" ")[0]?.[0] ?? ""}${user.name?.split(" ")[1]?.[0] ?? ""}`.toUpperCase()
        : "ST";

    const handleLogout = () => setConfirmOpen(true);
    const performLogout = () => {
        signOut({ callbackUrl: "/auth" });
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

                .sidebar-root { font-family: 'DM Sans', sans-serif; }
                .sidebar-root .sora { font-family: 'Sora', sans-serif; }

                /* Dot grid background */
                .sidebar-dotgrid {
                    position: absolute; inset: 0; pointer-events: none;
                    opacity: 0.07;
                    background-image: radial-gradient(circle, #60a5fa 1px, transparent 1px);
                    background-size: 20px 20px;
                }

                /* Glow orbs */
                .sidebar-orb-1 {
                    position: absolute; width: 220px; height: 220px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%);
                    top: -60px; left: -60px; pointer-events: none;
                }
                .sidebar-orb-2 {
                    position: absolute; width: 160px; height: 160px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(99,179,237,0.1) 0%, transparent 70%);
                    bottom: 80px; right: -40px; pointer-events: none;
                }

                /* Nav item hover */
                .nav-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 14px;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.18s, color 0.18s, transform 0.15s;
                    text-decoration: none;
                    position: relative;
                    color: rgba(255,255,255,0.65);
                }
                .nav-item:hover {
                    background: rgba(255,255,255,0.08);
                    color: white;
                    transform: translateX(2px);
                }
                .nav-item.active {
                    background: rgba(255,255,255,0.13);
                    color: white;
                    font-weight: 600;
                    box-shadow: inset 0 0 0 1px rgba(99,179,237,0.2);
                }
                .nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 20%; bottom: 20%;
                    width: 3px;
                    border-radius: 0 3px 3px 0;
                    background: linear-gradient(180deg, #60a5fa, #3b82f6);
                }

                /* Section label */
                .section-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.28);
                    padding: 0 14px;
                    margin-bottom: 4px;
                    margin-top: 16px;
                    font-family: 'Sora', sans-serif;
                }

                /* Avatar ring */
                .avatar-ring {
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #2563eb, #60a5fa);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.8rem; font-weight: 700; color: white;
                    flex-shrink: 0;
                    font-family: 'Sora', sans-serif;
                    box-shadow: 0 0 0 2px rgba(99,179,237,0.4), 0 4px 12px rgba(37,99,235,0.3);
                }

                /* Logout button */
                .btn-logout {
                    display: flex; align-items: center; gap: 10px;
                    width: 100%; padding: 10px 14px;
                    border-radius: 12px;
                    font-size: 0.875rem; font-weight: 600;
                    border: none; cursor: pointer;
                    color: #fca5a5;
                    background: rgba(239,68,68,0.1);
                    transition: background 0.2s, color 0.2s, transform 0.15s;
                    font-family: 'DM Sans', sans-serif;
                }
                .btn-logout:hover {
                    background: rgba(239,68,68,0.2);
                    color: #f87171;
                    transform: translateX(2px);
                }

                /* Upgrade card */
                .upgrade-card {
                    margin: 0 12px 16px;
                    padding: 14px;
                    border-radius: 14px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(99,179,237,0.15);
                    backdrop-filter: blur(6px);
                }

                /* Scrollbar */
                .sidebar-scroll::-webkit-scrollbar { width: 3px; }
                .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-12px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .slide-in { animation: slideIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
            `}</style>

            {/* Mobile toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 left-4 z-[1001] p-2.5 rounded-xl text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)" }}
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
                    sidebar-root fixed inset-y-0 left-0 z-[999] w-[260px]
                    flex flex-col h-screen
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                    shadow-2xl
                `}
                style={{ background: "linear-gradient(160deg, #090f1a 0%, #0b1525 55%, #0d1f3a 100%)" }}
            >
                <div className="sidebar-dotgrid" />
                <div className="sidebar-orb-1" />
                <div className="sidebar-orb-2" />

                {/* ── Brand header ── */}
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
                        <div className="sora text-sm font-bold text-white leading-tight">Student Portal</div>
                    </div>
                </div>

                {/* ── User profile card ── */}
                <div
                    className="relative z-10 mx-3 mt-4 mb-1 px-4 py-3 rounded-2xl flex items-center gap-3"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(99,179,237,0.12)",
                    }}
                >
                    <div className="avatar-ring">{initials}</div>
                    <div className="flex-1 min-w-0">
                        <div className="sora text-sm font-semibold text-white truncate">
                            {user?.name ?? "Student"}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <GraduationCap size={11} className="text-blue-400 flex-shrink-0" />
                            <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                                {(user as any)?.student_id ?? "Student"}
                            </span>
                        </div>
                    </div>
                    <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                </div>

                {/* ── Nav sections ── */}
                <div className="sidebar-scroll relative z-10 flex-1 overflow-y-auto px-3 pb-2">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.label}>
                            <div className="section-label">{section.label}</div>
                            {section.items.map((item) => {
                                const isActive = pathname === item.url ||
                                    (item.url !== "/student" && pathname.startsWith(item.url));
                                return (
                                    <Link
                                        key={item.url}
                                        href={item.url}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`nav-item ${isActive ? "active" : ""}`}
                                    >
                                        <item.icon
                                            size={17}
                                            className="flex-shrink-0"
                                            style={{ color: isActive ? "#60a5fa" : "rgba(255,255,255,0.45)" }}
                                        />
                                        <span>{item.title}</span>
                                        {isActive && (
                                            <ChevronRight
                                                size={13}
                                                className="ml-auto flex-shrink-0"
                                                style={{ color: "rgba(255,255,255,0.3)" }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>
                {/* ── Logout ── */}
                <div className="relative z-10 px-3 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                    <button className="btn-logout" onClick={handleLogout}>
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
