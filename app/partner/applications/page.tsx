"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { EmptyState, PartnerCard, PartnerField, PartnerPageShell } from "@/components/partner/PartnerUi";
import {
    useAcceptApplicationMutation,
    useAssignPlacementSupervisorMutation,
    useGetApplicationsQuery,
    useGetPartnerSupervisorsQuery,
    useRejectApplicationMutation,
} from "@/lib/redux/slices/InternshipsSlice";

export default function PartnerApplicationsPage() {
    const { status } = useSession();
    const skipQueries = status !== "authenticated";
    const { data: applications = [] } = useGetApplicationsQuery(undefined, { skip: skipQueries });
    const { data: supervisors = [] } = useGetPartnerSupervisorsQuery(undefined, { skip: skipQueries });
    const [acceptApplication] = useAcceptApplicationMutation();
    const [rejectApplication] = useRejectApplicationMutation();
    const [assignSupervisor] = useAssignPlacementSupervisorMutation();
    const [assignment, setAssignment] = useState({ application: "", supervisor: "", start_date: "", end_date: "" });

    const submitAssignment = async () => {
        if (!assignment.application || !assignment.supervisor || !assignment.start_date || !assignment.end_date) {
            toast.error("Select an application, supervisor, start date, and end date.");
            return;
        }
        try {
            await assignSupervisor({
                application: assignment.application,
                supervisor: Number(assignment.supervisor),
                start_date: assignment.start_date,
                end_date: assignment.end_date,
            }).unwrap();
            toast.success("Supervisor assigned and placement confirmed.");
        } catch {
            toast.error("Could not assign supervisor.");
        }
    };

    const statusLabel = (status: string) => {
        if (status === "PARTNER_ACCEPTED") return "Accepted - Awaiting HOD Confirmation";
        if (status === "APPROVED") return "Approved by HOD";
        if (status === "REJECTED") return "Rejected";
        return "Pending Partner Review";
    };

    return (
        <PartnerPageShell>
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Incoming Applications</h2>
                    <div className="mt-4 space-y-3">
                        {applications.length ? applications.map((application) => (
                            <div key={application.id} className="rounded-lg border border-slate-200 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{application.student_details?.user?.username}</p>
                                        <p className="text-sm text-slate-500">{application.position_details?.title}</p>
                                        <p className="mt-2 text-sm text-slate-600">{application.cover_letter}</p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{statusLabel(application.status)}</span>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => acceptApplication(application.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Accept</button>
                                    <button onClick={() => rejectApplication(application.id)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">Reject</button>
                                </div>
                            </div>
                        )) : <EmptyState message="No applications have been submitted to your organization yet." />}
                    </div>
                </PartnerCard>

                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Assign Supervisor</h2>
                    <div className="mt-4 space-y-3">
                        <select value={assignment.application} onChange={(event) => setAssignment({ ...assignment, application: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option value="">Select accepted application</option>
                                {applications.filter((item) => item.status === "PARTNER_ACCEPTED" || item.status === "APPROVED").map((item) => (
                                <option key={item.id} value={item.id}>{item.student_details?.user?.username} - {item.position_details?.title}</option>
                            ))}
                        </select>
                        <select value={assignment.supervisor} onChange={(event) => setAssignment({ ...assignment, supervisor: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option value="">Select supervisor</option>
                            {supervisors.map((supervisor) => (
                                <option key={supervisor.id} value={supervisor.id}>{supervisor.user?.username} - {supervisor.position}</option>
                            ))}
                        </select>
                        <PartnerField label="Start date" type="date" value={assignment.start_date} onChange={(value) => setAssignment({ ...assignment, start_date: value })} />
                        <PartnerField label="End date" type="date" value={assignment.end_date} onChange={(value) => setAssignment({ ...assignment, end_date: value })} />
                        <button onClick={submitAssignment} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Confirm Assignment</button>
                    </div>
                </PartnerCard>
            </div>
        </PartnerPageShell>
    );
}
