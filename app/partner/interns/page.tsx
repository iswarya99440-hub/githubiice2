"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PartnerCard, PartnerField, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useCreateAttendanceRecordMutation, useGetAttendanceRecordsQuery } from "@/lib/redux/slices/AttendanceSlice";
import { useGetEvaluationsQuery } from "@/lib/redux/slices/EvaluationsSlice";
import { useGetPlacementsQuery } from "@/lib/redux/slices/InternshipsSlice";

export default function PartnerInternsPage() {
    const { data: placements = [] } = useGetPlacementsQuery();
    const { data: attendance = [] } = useGetAttendanceRecordsQuery();
    const { data: evaluations = [] } = useGetEvaluationsQuery();
    const [createAttendance] = useCreateAttendanceRecordMutation();
    const assignedStudents = useMemo(() => placements.map((placement) => placement.student_details).filter(Boolean), [placements]);
    const [form, setForm] = useState({ student: "", date: "", status: "PRESENT", notes: "" });

    const submitAttendance = async () => {
        if (!form.student || !form.date) {
            toast.error("Select a student and date first.");
            return;
        }
        try {
            await createAttendance({
                student: Number(form.student),
                date: form.date,
                status: form.status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
                notes: form.notes,
            }).unwrap();
            toast.success("Attendance recorded.");
        } catch {
            toast.error("Could not record attendance.");
        }
    };

    return (
        <PartnerPageShell>
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Assigned Students</h2>
                    <div className="mt-4 space-y-3">
                        {placements.length ? placements.map((placement) => (
                            <div key={placement.id} className="rounded-lg border border-slate-200 p-4">
                                <p className="font-semibold text-slate-900">{placement.student_details?.user?.username}</p>
                                <p className="text-sm text-slate-500">{placement.student_details?.program}</p>
                                <p className="text-sm text-slate-500">Supervisor: {placement.supervisor_details?.user?.username || "Unassigned"}</p>
                                <p className="mt-2 text-xs font-semibold text-slate-500">{placement.start_date} to {placement.end_date}</p>
                            </div>
                        )) : <EmptyState message="No assigned students yet." />}
                    </div>
                </PartnerCard>

                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Attendance Overview</h2>
                    <div className="mt-4 space-y-3">
                        <select value={form.student} onChange={(event) => setForm({ ...form, student: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option value="">Select student</option>
                            {assignedStudents.map((student) => student && <option key={student.id} value={student.id}>{student.user?.username}</option>)}
                        </select>
                        <PartnerField label="Date" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
                        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            {["PRESENT", "ABSENT", "LATE", "EXCUSED"].map((status) => <option key={status}>{status}</option>)}
                        </select>
                        <textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} />
                        <button onClick={submitAttendance} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Attendance</button>
                    </div>
                </PartnerCard>
            </div>

            <PartnerCard>
                <h2 className="font-semibold text-slate-900">Performance Monitoring</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {assignedStudents.length ? assignedStudents.map((student) => {
                        const latestEvaluation = evaluations.find((item) => item.student === student?.id);
                        const attendanceCount = attendance.filter((item) => item.student === student?.id).length;
                        return student && (
                            <div key={student.id} className="rounded-lg border border-slate-200 p-4">
                                <p className="font-semibold text-slate-900">{student.user?.username}</p>
                                <p className="text-sm text-slate-500">
                                    Latest score: {latestEvaluation ? `${latestEvaluation.score}/${latestEvaluation.max_score ?? 50}` : "No evaluation"}
                                </p>
                                <p className="text-sm text-slate-500">Attendance records: {attendanceCount}</p>
                            </div>
                        );
                    }) : <EmptyState message="No student performance records yet." />}
                </div>
            </PartnerCard>
        </PartnerPageShell>
    );
}
