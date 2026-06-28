"use client";

import {
    BarChart3,
    Bell,
    BriefcaseBusiness,
    Building2,
    ClipboardCheck,
    FolderOpen,
    FileText,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Users,
    UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const sections = [
    {
        label: "Main",
        items: [{ title: "Dashboard", url: "/partner", icon: LayoutDashboard }],
    },
    {
        label: "Management",
        items: [
            { title: "Internship Positions", url: "/partner/positions", icon: BriefcaseBusiness },
            { title: "Applications / Students", url: "/partner/applications", icon: Users },
            { title: "Supervisors", url: "/partner/supervisors", icon: UserCheck },
        ],
    },
    {
        label: "Operations",
        items: [
            { title: "Intern Management", url: "/partner/interns", icon: ClipboardCheck },
            { title: "Reports Review", url: "/partner/reports", icon: FileText },
            { title: "Evaluations", url: "/partner/evaluations", icon: BarChart3 },
            { title: "Documents", url: "/partner/documents", icon: FolderOpen },
        ],
    },
    {
        label: "Communication",
        items: [
            { title: "Messages", url: "/partner/messages", icon: MessageSquare },
            { title: "Notifications", url: "/partner/notifications", icon: Bell },
        ],
    },
    {
        label: "System",
        items: [
            { title: "Profile", url: "/partner/profile", icon: Building2 },
            { title: "Settings", url: "/partner/settings", icon: Settings },
        ],
    },
];

export default function PartnerSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-slate-200 bg-white md:flex md:flex-col">
            <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Partner Portal</p>
                        <p className="text-xs text-slate-500">Host organization workspace</p>
                    </div>
                </div>
            </div>

            <div className="border-b border-slate-200 px-6 py-4">
                <p className="truncate text-sm font-semibold text-slate-900">{session?.user?.name || "Partner Organization"}</p>
                <p className="truncate text-xs text-slate-500">{session?.user?.email}</p>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
                {sections.map((section) => (
                    <div key={section.label} className="mb-5">
                        <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{section.label}</p>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <Link
                                        key={item.url}
                                        href={item.url}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-slate-900 text-white"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                    >
                                        <item.icon size={17} />
                                        <span>{item.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-slate-200 p-4">
                <button
                    onClick={() => signOut({ callbackUrl: "/auth" })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                    <LogOut size={17} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
