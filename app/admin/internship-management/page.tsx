"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, CalendarDays, Edit, Mail, Trash2, Users, X } from "lucide-react";
import {
    InternshipPosition,
    useDeletePositionMutation,
    useGetPlacementsQuery,
    useGetPositionsQuery,
    useUpdatePositionMutation,
} from "@/lib/redux/slices/InternshipsSlice";
import { toast } from "sonner";

const PAGE_SIZE = 8;
type CapacityMetric = "total" | "occupied" | "available";

export default function AdminInternshipManagementPage() {
    const { data: positions = [], isLoading } = useGetPositionsQuery();
    const { data: placements = [] } = useGetPlacementsQuery();
    const [updatePosition, { isLoading: isUpdating }] = useUpdatePositionMutation();
    const [deletePosition] = useDeletePositionMutation();

    const [editId, setEditId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editSkills, setEditSkills] = useState("");
    const [editCapacity, setEditCapacity] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "FULL" | "CLOSED">("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [capacityDetails, setCapacityDetails] = useState<{ positionId: string; metric: CapacityMetric } | null>(null);

    const occupiedByPosition = useMemo(() => {
        const counts: Record<string, number> = {};
        placements.forEach((placement) => {
            const positionId = placement.application_details?.position;
            if (positionId && placement.confirmed) {
                counts[positionId] = (counts[positionId] || 0) + 1;
            }
        });
        return counts;
    }, [placements]);

    const placementsByPosition = useMemo(() => {
        const grouped: Record<string, typeof placements> = {};
        placements.forEach((placement) => {
            const positionId = placement.application_details?.position;
            if (positionId && placement.confirmed) {
                grouped[positionId] = [...(grouped[positionId] || []), placement];
            }
        });
        return grouped;
    }, [placements]);

    const enrichedPositions = useMemo(() => {
        return positions.map((position) => {
            const occupied = occupiedByPosition[position.id] || 0;
            const available = Math.max((position.capacity || 0) - occupied, 0);
            const isFull = occupied >= (position.capacity || 0) && (position.capacity || 0) > 0;
            const isClosed = position.is_active === false;
            return { ...position, occupied, available, isFull, isClosed };
        });
    }, [positions, occupiedByPosition]);

    const filteredPositions = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return enrichedPositions.filter((position) => {
            const organizationName = position.organization_details?.name || "";
            const matchesSearch = query
                ? position.title.toLowerCase().includes(query) ||
                  organizationName.toLowerCase().includes(query) ||
                  (position.required_skills || "").toLowerCase().includes(query)
                : true;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "OPEN" && !position.isClosed && !position.isFull) ||
                (statusFilter === "FULL" && position.isFull) ||
                (statusFilter === "CLOSED" && position.isClosed);

            return matchesSearch && matchesStatus;
        });
    }, [enrichedPositions, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredPositions.length / PAGE_SIZE));
    const paginatedPositions = filteredPositions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const totalCapacity = enrichedPositions.reduce((sum, position) => sum + (position.capacity || 0), 0);
    const totalOccupied = enrichedPositions.reduce((sum, position) => sum + position.occupied, 0);
    const totalAvailable = Math.max(totalCapacity - totalOccupied, 0);
    const openPositions = enrichedPositions.filter((position) => !position.isClosed && !position.isFull).length;
    const selectedPosition = capacityDetails
        ? enrichedPositions.find((position) => position.id === capacityDetails.positionId) || null
        : null;
    const selectedPlacements = selectedPosition ? placementsByPosition[selectedPosition.id] || [] : [];
    const selectedOccupancyPercent = selectedPosition && selectedPosition.capacity > 0
        ? Math.min(100, Math.round((selectedPosition.occupied / selectedPosition.capacity) * 100))
        : 0;

    const startEdit = (position: InternshipPosition) => {
        setEditId(position.id);
        setEditTitle(position.title || "");
        setEditDescription(position.description || "");
        setEditSkills(position.required_skills || "");
        setEditCapacity(String(position.capacity ?? ""));
    };

    const handleUpdate = async () => {
        if (!editId) return;
        try {
            await updatePosition({
                id: editId,
                data: {
                    title: editTitle,
                    description: editDescription,
                    required_skills: editSkills,
                    capacity: Number(editCapacity),
                },
            }).unwrap();
            toast.success("Position updated.");
            setEditId(null);
        } catch {
            toast.error("Failed to update position.");
        }
    };

    const handleToggleStatus = async (position: InternshipPosition) => {
        try {
            await updatePosition({ id: position.id, data: { is_active: !position.is_active } }).unwrap();
            toast.success(position.is_active === false ? "Position reopened." : "Position closed.");
        } catch {
            toast.error("Failed to update position status.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this internship position? This action cannot be undone.")) return;
        try {
            await deletePosition(id).unwrap();
            toast.success("Position deleted.");
        } catch {
            toast.error("Failed to delete position.");
        }
    };

    const statusBadge = (position: { isClosed: boolean; isFull: boolean }) => {
        if (position.isClosed) return "bg-slate-100 text-slate-700 border-slate-200";
        if (position.isFull) return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    };

    const statusLabel = (position: { isClosed: boolean; isFull: boolean }) => {
        if (position.isClosed) return "Closed";
        if (position.isFull) return "Full";
        return "Open";
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">HOD Operations</p>
                        <h1 className="mt-1 text-3xl font-bold text-slate-900">Internship Management</h1>
                        <p className="mt-1 text-sm text-slate-500">Monitor partner positions, placement capacity, and availability.</p>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    {[
                        { label: "Positions", value: positions.length, icon: BriefcaseBusiness },
                        { label: "Open Positions", value: openPositions, icon: Building2 },
                        { label: "Occupied Capacity", value: totalOccupied, icon: Users },
                        { label: "Available Capacity", value: totalAvailable, icon: BriefcaseBusiness },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">{label}</p>
                                <Icon className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Internship Positions</h2>
                                <p className="text-sm text-slate-500">Created by partner organizations and managed by coordinators/admins.</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <input
                                    value={searchTerm}
                                    onChange={(event) => {
                                        setSearchTerm(event.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-72"
                                    placeholder="Search by title, company, or skills"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(event) => {
                                        setStatusFilter(event.target.value as typeof statusFilter);
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                >
                                    <option value="ALL">All statuses</option>
                                    <option value="OPEN">Open</option>
                                    <option value="FULL">Full</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {isLoading && <p className="p-6 text-sm text-slate-500">Loading positions...</p>}
                    {!isLoading && filteredPositions.length === 0 && (
                        <div className="m-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            No internship positions match your filters.
                        </div>
                    )}

                    {!isLoading && filteredPositions.length > 0 && (
                        <>
                            <div className="divide-y divide-slate-100">
                                {paginatedPositions.map((position) => {
                                    const organizationName = position.organization_details?.name || "Organization not assigned";
                                    const occupancyPercent = position.capacity > 0 ? Math.min(100, Math.round((position.occupied / position.capacity) * 100)) : 0;

                                    return (
                                        <div key={position.id} className="p-5 hover:bg-slate-50">
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-base font-semibold text-slate-900">{position.title}</h3>
                                                        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusBadge(position)}`}>
                                                            {statusLabel(position)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                                                        <Building2 className="h-4 w-4 text-slate-400" />
                                                        {organizationName}
                                                    </p>
                                                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{position.description || "No description provided."}</p>
                                                    <p className="mt-2 text-xs text-slate-500">Skills: {position.required_skills || "Not specified"}</p>
                                                </div>

                                                <div className="w-full rounded-xl border border-slate-200 bg-white p-4 xl:w-80">
                                                    <div className="grid grid-cols-3 gap-3 text-center">
                                                        <CapacityButton
                                                            label="Total"
                                                            value={position.capacity}
                                                            tone="slate"
                                                            onClick={() => setCapacityDetails({ positionId: position.id, metric: "total" })}
                                                        />
                                                        <CapacityButton
                                                            label="Occupied"
                                                            value={position.occupied}
                                                            tone="amber"
                                                            onClick={() => setCapacityDetails({ positionId: position.id, metric: "occupied" })}
                                                        />
                                                        <CapacityButton
                                                            label="Available"
                                                            value={position.available}
                                                            tone="emerald"
                                                            onClick={() => setCapacityDetails({ positionId: position.id, metric: "available" })}
                                                        />
                                                    </div>
                                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${occupancyPercent}%` }} />
                                                    </div>
                                                    <p className="mt-2 text-center text-xs text-slate-500">{occupancyPercent}% occupied</p>
                                                </div>

                                                <div className="flex shrink-0 gap-2">
                                                    <button
                                                        onClick={() => startEdit(position)}
                                                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(position)}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                                    >
                                                        {position.is_active === false ? "Reopen" : "Close"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(position.id)}
                                                        className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredPositions.length)} of {filteredPositions.length} positions
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {editId && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">Edit Position</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <input
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Position title"
                            />
                            <input
                                value={editCapacity}
                                onChange={(event) => setEditCapacity(event.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Capacity"
                                type="number"
                            />
                            <textarea
                                value={editDescription}
                                onChange={(event) => setEditDescription(event.target.value)}
                                rows={3}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                                placeholder="Description"
                            />
                            <input
                                value={editSkills}
                                onChange={(event) => setEditSkills(event.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                                placeholder="Required skills"
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={() => setEditId(null)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {capacityDetails && selectedPosition && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Capacity Details</p>
                                    <h2 className="mt-1 text-xl font-bold text-slate-900">{selectedPosition.title}</h2>
                                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        {selectedPosition.organization_details?.name || "Organization not assigned"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setCapacityDetails(null)}
                                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                    aria-label="Close capacity details"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-5">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <DetailStat label="Total Capacity" value={selectedPosition.capacity} active={capacityDetails.metric === "total"} />
                                    <DetailStat label="Occupied" value={selectedPosition.occupied} active={capacityDetails.metric === "occupied"} tone="amber" />
                                    <DetailStat label="Available" value={selectedPosition.available} active={capacityDetails.metric === "available"} tone="emerald" />
                                </div>

                                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{selectedOccupancyPercent}% occupied</p>
                                            <p className="text-xs text-slate-500">
                                                Status: {statusLabel(selectedPosition)} | Available slots are calculated from confirmed placements.
                                            </p>
                                        </div>
                                        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(selectedPosition)}`}>
                                            {statusLabel(selectedPosition)}
                                        </span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${selectedOccupancyPercent}%` }} />
                                    </div>
                                </div>

                                {capacityDetails.metric === "total" && (
                                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                                        <InfoPanel title="Position Scope" lines={[
                                            `Capacity: ${selectedPosition.capacity} students`,
                                            `Occupied: ${selectedPosition.occupied} confirmed placements`,
                                            `Available: ${selectedPosition.available} remaining slots`,
                                        ]} />
                                        <InfoPanel title="Requirements" lines={[
                                            selectedPosition.required_skills ? `Skills: ${selectedPosition.required_skills}` : "Skills: Not specified",
                                            selectedPosition.location ? `Location: ${selectedPosition.location}` : "Location: Not specified",
                                            selectedPosition.start_date ? `Starts: ${selectedPosition.start_date}` : "Start date: Not specified",
                                        ]} />
                                    </div>
                                )}

                                {capacityDetails.metric === "occupied" && (
                                    <div className="mt-5">
                                        <h3 className="text-sm font-semibold text-slate-900">Assigned Students</h3>
                                        {selectedPlacements.length === 0 ? (
                                            <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                                                No confirmed students are assigned to this position yet.
                                            </div>
                                        ) : (
                                            <div className="mt-3 space-y-3">
                                                {selectedPlacements.map((placement) => (
                                                    <div key={placement.id} className="rounded-xl border border-slate-200 p-4">
                                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                            <div>
                                                                <p className="font-semibold text-slate-900">
                                                                    {placement.student_details?.user?.username || `Student ${placement.student_details?.id || placement.application}`}
                                                                </p>
                                                                <p className="mt-1 text-sm text-slate-500">
                                                                    Student ID: {placement.student_details?.student_id || "Not provided"}
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    Supervisor: {placement.supervisor_details?.user?.username || "Unassigned"}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1 text-sm text-slate-500">
                                                                {placement.student_details?.user?.email && (
                                                                    <p className="flex items-center gap-2">
                                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                                        {placement.student_details.user.email}
                                                                    </p>
                                                                )}
                                                                <p className="flex items-center gap-2">
                                                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                                                    {placement.start_date} to {placement.end_date}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {capacityDetails.metric === "available" && (
                                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                                        <h3 className="text-sm font-semibold text-emerald-900">Availability</h3>
                                        <p className="mt-2 text-sm text-emerald-800">
                                            This position currently has {selectedPosition.available} available {selectedPosition.available === 1 ? "slot" : "slots"}.
                                            {selectedPosition.isClosed
                                                ? " The position is closed, so students cannot be placed until it is reopened."
                                                : selectedPosition.isFull
                                                  ? " The position is full and cannot accept more confirmed placements."
                                                  : " It is open for additional qualified students."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CapacityButton({
    label,
    value,
    tone,
    onClick,
}: {
    label: string;
    value: number;
    tone: "slate" | "amber" | "emerald";
    onClick: () => void;
}) {
    const color = {
        slate: "text-slate-900 hover:border-slate-400 hover:bg-slate-50",
        amber: "text-amber-700 hover:border-amber-300 hover:bg-amber-50",
        emerald: "text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50",
    }[tone];

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg border border-transparent px-2 py-2 transition text-center ${color}`}
            aria-label={`View ${label.toLowerCase()} capacity details`}
        >
            <span className="block text-xs text-slate-500">{label}</span>
            <span className="mt-1 block text-lg font-bold">{value}</span>
        </button>
    );
}

function DetailStat({
    label,
    value,
    active,
    tone = "slate",
}: {
    label: string;
    value: number;
    active: boolean;
    tone?: "slate" | "amber" | "emerald";
}) {
    const activeClass = {
        slate: "border-slate-400 bg-slate-50 text-slate-900",
        amber: "border-amber-300 bg-amber-50 text-amber-800",
        emerald: "border-emerald-300 bg-emerald-50 text-emerald-800",
    }[tone];

    return (
        <div className={`rounded-xl border p-4 ${active ? activeClass : "border-slate-200 bg-white text-slate-900"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
    );
}

function InfoPanel({ title, lines }: { title: string; lines: string[] }) {
    return (
        <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <div className="mt-3 space-y-2">
                {lines.map((line) => (
                    <p key={line} className="text-sm text-slate-600">{line}</p>
                ))}
            </div>
        </div>
    );
}
