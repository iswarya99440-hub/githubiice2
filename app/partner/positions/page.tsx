"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PartnerCard, PartnerField, PartnerPageShell } from "@/components/partner/PartnerUi";
import { Building2, CalendarDays, Mail, Phone, Users, X } from "lucide-react";
import { InternshipPosition, Placement, useCreatePositionMutation, useGetPlacementsQuery, useGetPositionsQuery, useUpdatePositionMutation } from "@/lib/redux/slices/InternshipsSlice";

export default function PartnerPositionsPage() {
    const { data: positions = [] } = useGetPositionsQuery();
    const { data: placements = [] } = useGetPlacementsQuery();
    const [createPosition] = useCreatePositionMutation();
    const [updatePosition] = useUpdatePositionMutation();
    const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        required_skills: "",
        requirements: "",
        location: "",
        capacity: "",
        start_date: "",
        end_date: "",
    });

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

    const selectedPosition = selectedPositionId ? positions.find((position) => position.id === selectedPositionId) || null : null;
    const selectedPlacements = selectedPosition ? placementsByPosition[selectedPosition.id] || [] : [];

    const savePosition = async () => {
        if (!form.title || !form.description || !form.capacity) {
            toast.error("Title, description, and capacity are required.");
            return;
        }
        try {
            await createPosition({
                ...form,
                capacity: Number(form.capacity || 1),
                start_date: form.start_date || null,
                end_date: form.end_date || null,
                is_active: true,
            }).unwrap();
            setForm({ title: "", description: "", required_skills: "", requirements: "", location: "", capacity: "", start_date: "", end_date: "" });
            toast.success("Internship position created.");
        } catch {
            toast.error("Could not create position. Make sure your organization profile exists first.");
        }
    };

    return (
        <PartnerPageShell>
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Create Position</h2>
                    <div className="mt-4 space-y-3">
                        <PartnerField label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
                        <PartnerField label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} />
                        <PartnerField label="Capacity" type="number" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} />
                        <PartnerField label="Start date" type="date" value={form.start_date} onChange={(value) => setForm({ ...form, start_date: value })} />
                        <PartnerField label="End date" type="date" value={form.end_date} onChange={(value) => setForm({ ...form, end_date: value })} />
                        <textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} />
                        <textarea placeholder="Required skills" value={form.required_skills} onChange={(event) => setForm({ ...form, required_skills: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={2} />
                        <textarea placeholder="Requirements" value={form.requirements} onChange={(event) => setForm({ ...form, requirements: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={2} />
                        <button onClick={savePosition} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Create Position</button>
                    </div>
                </PartnerCard>

                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">My Positions</h2>
                    <div className="mt-4 divide-y divide-slate-100">
                        {positions.length ? positions.map((position) => {
                            const assignedCount = position.occupied_capacity ?? placementsByPosition[position.id]?.length ?? 0;
                            const available = position.available_capacity ?? Math.max((position.capacity || 0) - assignedCount, 0);
                            return (
                            <div
                                key={position.id}
                                onDoubleClick={() => setSelectedPositionId(position.id)}
                                className="cursor-pointer py-4 transition hover:bg-slate-50"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{position.title}</p>
                                        <p className="text-sm text-slate-500">{position.location || "No location"} - Capacity {position.capacity}</p>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Assigned {assignedCount}</span>
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">Available {available}</span>
                                            <span className={`rounded-full px-3 py-1 font-semibold ${position.is_active === false || position.is_full ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                                                {position.is_active === false ? "Closed" : position.is_full ? "Full" : "Open"}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600">{position.required_skills}</p>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPositionId(position.id)}
                                            className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-800"
                                        >
                                            View details and assigned students
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => updatePosition({ id: position.id, data: { is_active: !position.is_active } })}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                    >
                                        {position.is_active ? "Close" : "Reopen"}
                                    </button>
                                </div>
                            </div>
                        )}) : <EmptyState message="No internship positions created yet." />}
                    </div>
                </PartnerCard>
            </div>

            {selectedPosition && (
                <PositionDetailsModal
                    position={selectedPosition}
                    assignedPlacements={selectedPlacements}
                    onClose={() => setSelectedPositionId(null)}
                />
            )}
        </PartnerPageShell>
    );
}

function PositionDetailsModal({
    position,
    assignedPlacements,
    onClose,
}: {
    position: InternshipPosition;
    assignedPlacements: Placement[];
    onClose: () => void;
}) {
    const assignedCount = position.occupied_capacity ?? assignedPlacements?.length ?? 0;
    const available = position.available_capacity ?? Math.max((position.capacity || 0) - assignedCount, 0);
    const occupancyPercent = position.capacity > 0 ? Math.min(100, Math.round((assignedCount / position.capacity) * 100)) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Position Details</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">{position.title}</h2>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            {position.organization_details?.name || "Your organization"}
                            {position.location ? ` | ${position.location}` : ""}
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Close position details">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="grid gap-3 md:grid-cols-3">
                        <DetailStat label="Capacity" value={position.capacity} />
                        <DetailStat label="Assigned Students" value={assignedCount} />
                        <DetailStat label="Available Slots" value={available} />
                    </div>
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-900">{occupancyPercent}% occupied</span>
                            <span className="text-slate-500">{position.is_active === false ? "Closed" : position.is_full ? "Full" : "Open"}</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                            <div className="h-full rounded-full bg-slate-900" style={{ width: `${occupancyPercent}%` }} />
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <InfoBlock title="Description" text={position.description || "No description provided."} />
                        <InfoBlock title="Requirements" text={position.requirements || position.required_skills || "Requirements not provided."} />
                    </div>

                    <div className="mt-6">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Users className="h-4 w-4" />
                            Students Assigned to this Position
                        </h3>
                        {!assignedPlacements || assignedPlacements.length === 0 ? (
                            <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                                No students have been assigned to this position yet.
                            </div>
                        ) : (
                            <div className="mt-3 space-y-3">
                                {assignedPlacements.map((placement) => (
                                    <div key={placement.id} className="rounded-lg border border-slate-200 p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900">{placement.student_details?.user?.username || placement.student_details?.user?.email || "Student"}</p>
                                                <p className="text-sm text-slate-500">Student ID: {placement.student_details?.student_id || "N/A"}</p>
                                                <p className="text-sm text-slate-500">Program: {placement.student_details?.program || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1 text-sm text-slate-500">
                                                <p className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-slate-400" />
                                                    {placement.student_details?.user?.email || "No email"}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-slate-400" />
                                                    {placement.student_details?.user?.phone || "No phone"}
                                                </p>
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
                </div>
            </div>
        </div>
    );
}

function DetailStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
    return (
        <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
        </div>
    );
}
