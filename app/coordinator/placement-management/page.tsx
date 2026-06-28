"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, Building2, CalendarDays, Mail, UserRound } from "lucide-react";
import { useGetApplicationsQuery, useCreatePlacementMutation, useGetPlacementsQuery, useUpdatePlacementMutation } from "@/lib/redux/slices/InternshipsSlice";
import { useGetUsersByRoleQuery } from "@/lib/redux/slices/AuthSlice";
import { toast } from "sonner";

type SupervisorOption = {
    id: number;
    username: string;
    email: string;
    supervisor_profile_id?: number | null;
};

export default function CoordinatorPlacementManagementPage() {
    const { data: applications } = useGetApplicationsQuery();
    const { data: placements } = useGetPlacementsQuery();
    const { data: supervisors } = useGetUsersByRoleQuery("Supervisor");
    const [createPlacement, { isLoading: isSaving }] = useCreatePlacementMutation();
    const [updatePlacement] = useUpdatePlacementMutation();

    const [step, setStep] = useState(1);
    const [applicationId, setApplicationId] = useState("");
    const [supervisorId, setSupervisorId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const supervisorOptions: SupervisorOption[] = (supervisors || []) as SupervisorOption[];
    const selectedApplication = useMemo(
        () => applications?.find((app) => app.id === applicationId) || null,
        [applications, applicationId],
    );

    const suggestedSupervisorId = (() => {
        const availableSupervisors = supervisorOptions.filter((sup) => sup.supervisor_profile_id);
        if (availableSupervisors.length === 0) return "";
        if (!placements) return String(availableSupervisors[0].supervisor_profile_id);
        const counts: Record<number, number> = {};
        placements.forEach((p) => {
            if (p.supervisor) counts[p.supervisor] = (counts[p.supervisor] || 0) + 1;
        });
        let best = availableSupervisors[0].supervisor_profile_id as number;
        let bestCount = counts[best] || 0;
        availableSupervisors.forEach((sup) => {
            const profileId = sup.supervisor_profile_id as number;
            const c = counts[profileId] || 0;
            if (c < bestCount) {
                best = profileId;
                bestCount = c;
            }
        });
        return String(best);
    })();

    const handleNext = () => {
        if (step === 1 && !applicationId) {
            toast.error("Select an application first.");
            return;
        }
        if (step === 2 && (!startDate || !endDate)) {
            toast.error("Set start and end dates.");
            return;
        }
        setStep((prev) => Math.min(3, prev + 1));
    };

    const handleCreate = async () => {
        if (!applicationId || !startDate || !endDate) {
            toast.error("Application and dates are required.");
            return;
        }
        if (supervisorId) {
            const selectedSupervisor = supervisorOptions.find(
                (sup) => String(sup.supervisor_profile_id) === supervisorId,
            );
            if (!selectedSupervisor?.supervisor_profile_id) {
                toast.error("Selected supervisor does not have a supervisor profile yet.");
                return;
            }
        }
        try {
            await createPlacement({
                application: applicationId,
                supervisor: supervisorId ? Number(supervisorId) : null,
                start_date: startDate,
                end_date: endDate,
                confirmed: true,
            }).unwrap();
            toast.success("Placement created.");
            setApplicationId("");
            setSupervisorId("");
            setStartDate("");
            setEndDate("");
            setStep(1);
        } catch (error: any) {
            const supervisorError = error?.data?.supervisor?.[0];
            toast.error(supervisorError || "Failed to create placement.");
        }
    };

    const handleConfirmToggle = async (id: string, confirmed: boolean) => {
        try {
            await updatePlacement({ id, data: { confirmed: !confirmed } }).unwrap();
            toast.success("Placement updated.");
        } catch {
            toast.error("Failed to update placement.");
        }
    };

    const resolveStudentName = (student?: { user?: { username?: string; email?: string; first_name?: string; last_name?: string } }) => {
        const user = student?.user;
        if (!user) return "Student not available";
        return [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.username || user.email || "Student";
    };

    const resolvePositionLabel = (app?: { position_details?: { title?: string; organization_details?: { name?: string } } }) => {
        const title = app?.position_details?.title || "Internship Position";
        const organization = app?.position_details?.organization_details?.name || "Organization not assigned";
        return `${title} at ${organization}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Placement Workflow</h1>
                    <p className="mt-1 text-sm text-gray-500">Assign approved applications, set dates, and choose a supervisor</p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
                        <div className={`rounded-full px-3 py-1 ${step >= 1 ? "bg-blue-50 text-blue-600" : "bg-gray-100"}`}>
                            1. Application
                        </div>
                        <div className={`rounded-full px-3 py-1 ${step >= 2 ? "bg-blue-50 text-blue-600" : "bg-gray-100"}`}>
                            2. Dates
                        </div>
                        <div className={`rounded-full px-3 py-1 ${step >= 3 ? "bg-blue-50 text-blue-600" : "bg-gray-100"}`}>
                            3. Supervisor
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-700">Select Application</label>
                            <select
                                value={applicationId}
                                onChange={(e) => setApplicationId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="">Choose application</option>
                                {applications?.map((app) => (
                                    <option key={app.id} value={app.id}>
                                        {resolveStudentName(app.student_details)} - {resolvePositionLabel(app)}
                                    </option>
                                ))}
                            </select>
                            {selectedApplication && (
                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                    <p className="text-sm font-semibold text-blue-950">Selected Application</p>
                                    <div className="mt-3 grid gap-2 text-sm text-blue-900 md:grid-cols-2">
                                        <p>Student: <span className="font-semibold">{resolveStudentName(selectedApplication.student_details)}</span></p>
                                        <p>Status: <span className="font-semibold">{selectedApplication.status}</span></p>
                                        <p className="md:col-span-2">Position: <span className="font-semibold">{resolvePositionLabel(selectedApplication)}</span></p>
                                        <p>Program: <span className="font-semibold">{selectedApplication.student_details?.program || "N/A"}</span></p>
                                        <p>Student ID: <span className="font-semibold">{selectedApplication.student_details?.student_id || "N/A"}</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-700">Assign Supervisor (optional)</label>
                            <select
                                value={supervisorId}
                                onChange={(e) => setSupervisorId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="">Select supervisor</option>
                                {supervisorOptions.map((sup) => (
                                    <option
                                        key={sup.id}
                                        value={sup.supervisor_profile_id ?? ""}
                                        disabled={!sup.supervisor_profile_id}
                                    >
                                        {sup.username} ({sup.email}){!sup.supervisor_profile_id ? " - profile missing" : ""}
                                    </option>
                                ))}
                            </select>
                            {suggestedSupervisorId && (
                                <button
                                    type="button"
                                    onClick={() => setSupervisorId(suggestedSupervisorId)}
                                    className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                                >
                                    Use suggested supervisor
                                </button>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Back
                        </button>
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleCreate}
                                disabled={isSaving}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {isSaving ? "Saving..." : "Create Placement"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Placements</h2>
                    {!placements || placements.length === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                            No placements created yet.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {placements.map((placement) => {
                                const app = placement.application_details;
                                const student = placement.student_details;
                                const position = app?.position_details;
                                const organization = position?.organization_details;
                                return (
                                <div key={placement.id} className="rounded-xl border border-gray-200 p-4">
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-base font-semibold text-gray-900">
                                                    {resolveStudentName(student)}
                                                </p>
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${placement.confirmed ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700"}`}>
                                                    {placement.confirmed ? "Confirmed" : "Pending"}
                                                </span>
                                            </div>
                                            <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                                                <p className="flex items-center gap-2">
                                                    <UserRound className="h-4 w-4 text-gray-400" />
                                                    Student ID: <span className="font-medium text-gray-900">{student?.student_id || "N/A"}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="break-all">{student?.user?.email || "No email provided"}</span>
                                                </p>
                                                <p className="flex items-center gap-2 md:col-span-2">
                                                    <BriefcaseBusiness className="h-4 w-4 text-gray-400" />
                                                    {position?.title || "Position not assigned"}
                                                </p>
                                                <p className="flex items-center gap-2 md:col-span-2">
                                                    <Building2 className="h-4 w-4 text-gray-400" />
                                                    {organization?.name || "Organization not assigned"}
                                                    {position?.location ? ` | ${position.location}` : ""}
                                                </p>
                                                <p className="flex items-center gap-2 md:col-span-2">
                                                    <CalendarDays className="h-4 w-4 text-gray-400" />
                                                    {placement.start_date} to {placement.end_date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 xl:w-80">
                                            <p className="text-sm font-semibold text-gray-900">Supervisor</p>
                                            <p className="mt-2 text-sm text-gray-700">
                                                {placement.supervisor_details?.user?.username || "Unassigned"}
                                            </p>
                                            <p className="text-xs text-gray-500">{placement.supervisor_details?.user?.email || "No supervisor email"}</p>
                                            <p className="text-xs text-gray-500">{placement.supervisor_details?.user?.phone || "No supervisor phone"}</p>
                                            <button
                                                onClick={() => handleConfirmToggle(placement.id, placement.confirmed)}
                                                className={`mt-4 w-full rounded-md px-3 py-2 text-xs font-semibold ${placement.confirmed ? "bg-emerald-600 text-white" : "bg-yellow-500 text-white"}`}
                                            >
                                                {placement.confirmed ? "Confirmed" : "Confirm Placement"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
