"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarDays, Mail, MapPin, Phone, Search, UserRound, Users } from "lucide-react";
import { useGetPlacementsQuery } from "@/lib/redux/slices/InternshipsSlice";

const PAGE_SIZE = 8;

export default function SupervisorAssignedInternsPage() {
    const { data: placements, isLoading } = useGetPlacementsQuery();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "PENDING">("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredPlacements = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return (placements || []).filter((placement) => {
            const student = placement.student_details;
            const user = student?.user;
            const position = placement.application_details?.position_details;
            const organization = position?.organization_details;
            const searchable = [
                getDisplayName(user),
                user?.email,
                user?.phone,
                student?.student_id,
                student?.program,
                position?.title,
                position?.location,
                organization?.name,
            ].filter(Boolean).join(" ").toLowerCase();

            const matchesSearch = query ? searchable.includes(query) : true;
            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "CONFIRMED" && placement.confirmed) ||
                (statusFilter === "PENDING" && !placement.confirmed);

            return matchesSearch && matchesStatus;
        });
    }, [placements, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredPlacements.length / PAGE_SIZE));
    const paginatedPlacements = filteredPlacements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const confirmedCount = (placements || []).filter((placement) => placement.confirmed).length;
    const pendingCount = (placements || []).filter((placement) => !placement.confirmed).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Supervisor Operations</p>
                        <h1 className="mt-1 text-3xl font-bold text-gray-900">Assigned Interns</h1>
                        <p className="mt-1 text-sm text-gray-500">Review intern placements, positions, and contact information.</p>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <SummaryCard label="Total Interns" value={placements?.length || 0} icon={Users} color="blue" />
                    <SummaryCard label="Confirmed" value={confirmedCount} icon={UserRound} color="green" />
                    <SummaryCard label="Pending" value={pendingCount} icon={CalendarDays} color="amber" />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Intern Directory</h2>
                                <p className="text-sm text-gray-500">Position and contact details are pulled from confirmed placement records.</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <label className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) => {
                                            setSearchTerm(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-80"
                                        placeholder="Search student, position, company, contact"
                                    />
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => {
                                        setStatusFilter(event.target.value as typeof statusFilter);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="ALL">All statuses</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PENDING">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {isLoading && <p className="p-6 text-sm text-gray-500">Loading placements...</p>}
                    {!isLoading && (!placements || placements.length === 0) && (
                        <div className="m-5 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No interns assigned yet.
                        </div>
                    )}
                    {!isLoading && placements && placements.length > 0 && filteredPlacements.length === 0 && (
                        <div className="m-5 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No interns match your current search or status filter.
                        </div>
                    )}
                    {!isLoading && paginatedPlacements.length > 0 && (
                        <>
                            <div className="divide-y divide-gray-100">
                                {paginatedPlacements.map((placement) => {
                                    const student = placement.student_details;
                                    const user = student?.user;
                                    const position = placement.application_details?.position_details;
                                    const organization = position?.organization_details;
                                    const studentName = getDisplayName(user) || `Placement #${placement.id}`;

                                    return (
                                        <div key={placement.id} className="p-5 transition hover:bg-gray-50">
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-base font-semibold text-gray-900">{studentName}</h3>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${placement.confirmed ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                                            {placement.confirmed ? "Confirmed" : "Pending"}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                                                        <p>Student ID: <span className="font-medium text-gray-900">{student?.student_id || "N/A"}</span></p>
                                                        <p>Program: <span className="font-medium text-gray-900">{student?.program || "N/A"}</span></p>
                                                        <p>Year: <span className="font-medium text-gray-900">{student?.year_of_study || "N/A"}</span></p>
                                                        <p>Graduation: <span className="font-medium text-gray-900">{student?.graduation_date || "N/A"}</span></p>
                                                    </div>
                                                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="rounded-lg bg-white p-2 text-blue-600">
                                                                <BriefcaseBusiness className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">{position?.title || "Position not assigned"}</p>
                                                                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                                    {organization?.name || "Organization not assigned"}
                                                                    {position?.location ? ` | ${position.location}` : ""}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-500">Skills: {position?.required_skills || "Not specified"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full rounded-xl border border-gray-200 bg-white p-4 xl:w-80">
                                                    <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
                                                    <div className="mt-3 space-y-3 text-sm text-gray-600">
                                                        <p className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-gray-400" />
                                                            <span className="break-all">{user?.email || "No email provided"}</span>
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                            {user?.phone || "No phone provided"}
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                            <CalendarDays className="h-4 w-4 text-gray-400" />
                                                            {placement.start_date} to {placement.end_date}
                                                        </p>
                                                    </div>
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {user?.email && (
                                                            <a
                                                                href={`mailto:${user.email}`}
                                                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Email
                                                            </a>
                                                        )}
                                                        {user?.phone && (
                                                            <a
                                                                href={`tel:${user.phone}`}
                                                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Call
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-3 border-t border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredPlacements.length)} of {filteredPlacements.length} interns
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function getDisplayName(user?: { username?: string; first_name?: string; last_name?: string; email?: string }) {
    if (!user) return "";
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    return fullName || user.username || user.email || "";
}

function SummaryCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number;
    icon: typeof Users;
    color: "blue" | "green" | "amber";
}) {
    const styles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600",
    }[color];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-xl p-3 ${styles}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
