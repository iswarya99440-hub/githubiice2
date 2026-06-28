"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, CalendarDays, CheckCircle2, Mail, Phone, Search, UserCheck } from "lucide-react";
import { useGetPlacementsQuery, useUpdatePlacementMutation } from "@/lib/redux/slices/InternshipsSlice";
import { toast } from "sonner";

const PAGE_SIZE = 8;

export default function AdminPlacementsOverviewPage() {
    const { data: placements = [], isLoading } = useGetPlacementsQuery();
    const [updatePlacement] = useUpdatePlacementMutation();
    const [confirming, setConfirming] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "PENDING">("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const resolveStudentName = (placement: (typeof placements)[number]) =>
        placement.student_details?.user?.username ||
        placement.student_details?.user?.email ||
        "Student not available";

    const resolvePositionTitle = (placement: (typeof placements)[number]) =>
        placement.application_details?.position_details?.title || "Internship Position";

    const resolveOrganizationName = (placement: (typeof placements)[number]) =>
        placement.application_details?.position_details?.organization_details?.name || "Organization not available";

    const resolveSupervisorName = (placement: (typeof placements)[number]) =>
        placement.supervisor_details?.user?.username ||
        placement.supervisor_details?.user?.email ||
        "Unassigned";

    const filteredPlacements = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return placements.filter((placement) => {
            const searchable = [
                resolveStudentName(placement),
                resolvePositionTitle(placement),
                resolveOrganizationName(placement),
                resolveSupervisorName(placement),
                placement.student_details?.program || "",
            ].join(" ").toLowerCase();
            const matchesSearch = query ? searchable.includes(query) : true;
            const matchesStatus =
                statusFilter === "ALL"
                    ? true
                    : statusFilter === "CONFIRMED"
                    ? placement.confirmed
                    : !placement.confirmed;
            return matchesSearch && matchesStatus;
        });
    }, [placements, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredPlacements.length / PAGE_SIZE));
    const pagePlacements = filteredPlacements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const confirmedCount = placements.filter((placement) => placement.confirmed).length;
    const pendingCount = placements.length - confirmedCount;

    const handleToggleConfirm = async (id: string, confirmed: boolean) => {
        try {
            setConfirming(id);
            await updatePlacement({ id, data: { confirmed } }).unwrap();
            toast.success("Placement updated.");
        } catch {
            toast.error("Failed to update placement.");
        } finally {
            setConfirming(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">HOD Review</p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">Placements Overview</h1>
                    <p className="mt-1 text-sm text-slate-500">Track confirmed and pending internship placements with clear organization and position details.</p>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    {[
                        { label: "Total Placements", value: placements.length, icon: BriefcaseBusiness },
                        { label: "Confirmed", value: confirmedCount, icon: CheckCircle2 },
                        { label: "Pending", value: pendingCount, icon: CalendarDays },
                        { label: "Supervised", value: placements.filter((placement) => placement.supervisor).length, icon: UserCheck },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">{label}</p>
                                <Icon className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Placement Records</h2>
                                <p className="text-sm text-slate-500">Student, company, position, supervisor, and placement period.</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) => {
                                            setSearchTerm(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-500 sm:w-80"
                                        placeholder="Search student, company, position"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => {
                                        setStatusFilter(event.target.value as typeof statusFilter);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PENDING">Pending</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {isLoading && <p className="p-6 text-sm text-slate-500">Loading placements...</p>}
                    {!isLoading && filteredPlacements.length === 0 && (
                        <div className="m-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            No placements match your filters.
                        </div>
                    )}

                    {!isLoading && filteredPlacements.length > 0 && (
                        <>
                            <div className="divide-y divide-slate-100">
                                {pagePlacements.map((placement) => (
                                    <div key={placement.id} className="p-5 hover:bg-slate-50">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">{resolveStudentName(placement)}</h3>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${placement.confirmed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        {placement.confirmed ? "Confirmed" : "Pending"}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">{placement.student_details?.program || "Program not available"}</p>
                                                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                                                    <Building2 className="h-4 w-4 text-slate-400" />
                                                    {resolvePositionTitle(placement)} at {resolveOrganizationName(placement)}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-600">Supervisor: {resolveSupervisorName(placement)}</p>
                                                <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                        {placement.supervisor_details?.user?.email || "Supervisor email not available"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        {placement.supervisor_details?.user?.phone || "Supervisor phone not available"}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Dates: {new Date(placement.start_date).toLocaleDateString()} - {new Date(placement.end_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleConfirm(placement.id, !placement.confirmed)}
                                                disabled={confirming === placement.id}
                                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                            >
                                                {confirming === placement.id ? "Updating..." : placement.confirmed ? "Mark Pending" : "Confirm Placement"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredPlacements.length)} of {filteredPlacements.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:opacity-40">
                                        Previous
                                    </button>
                                    <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:opacity-40">
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
