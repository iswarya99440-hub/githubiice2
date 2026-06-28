"use client";

import { Bell, Building2, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
    "/partner": "Dashboard",
    "/partner/positions": "Internship Positions",
    "/partner/applications": "Applications / Assigned Students",
    "/partner/supervisors": "Supervisors",
    "/partner/interns": "Intern Management",
    "/partner/reports": "Reports Review",
    "/partner/evaluations": "Evaluations & Feedback",
    "/partner/documents": "Documents",
    "/partner/messages": "Communication",
    "/partner/notifications": "Notifications",
    "/partner/profile": "Organization Profile",
    "/partner/settings": "Organization Settings",
};

export default function PartnerNavbar() {
    const pathname = usePathname() || "/partner";

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Partner Organization</p>
                    <h1 className="text-xl font-bold text-slate-900">{titles[pathname] || "Partner Portal"}</h1>
                </div>
                <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                    <Search size={16} className="text-slate-400" />
                    <input className="w-full bg-transparent text-sm outline-none" placeholder="Search students, positions, reports..." />
                </div>
                <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Notifications">
                        <Bell size={18} />
                    </button>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                        <Building2 size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
}
