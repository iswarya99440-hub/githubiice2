"use client";

import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import {
    useGetAttendanceRecordsQuery,
    useCreateAttendanceRecordMutation,
} from "@/lib/redux/slices/AttendanceSlice";
import { useGetPlacementsQuery } from "@/lib/redux/slices/InternshipsSlice";
import { format } from "date-fns";
import { toast } from "sonner";

type AssignedStudentOption = {
    profileId: number;
    label: string;
};

export default function SupervisorAttendanceTrackingPage() {
    const { data: records, isLoading } = useGetAttendanceRecordsQuery();
    const { data: placements } = useGetPlacementsQuery();
    const [createRecord, { isLoading: isSaving }] = useCreateAttendanceRecordMutation();

    const [studentId, setStudentId] = useState("");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState<"PRESENT" | "ABSENT" | "LATE" | "EXCUSED">("PRESENT");
    const [notes, setNotes] = useState("");

    const assignedStudents = useMemo<AssignedStudentOption[]>(() => {
        const seen = new Set<number>();
        return (placements || []).flatMap((placement) => {
            const student = placement.student_details;
            if (!student?.id || seen.has(student.id)) {
                return [];
            }
            seen.add(student.id);
            const username = student.user?.username || student.user?.email || `Student ${student.id}`;
            return [{
                profileId: student.id,
                label: `${username} (${student.student_id || `Profile #${student.id}`})`,
            }];
        });
    }, [placements]);

    const handleCreate = async () => {
        if (!studentId) {
            toast.error("Select a student.");
            return;
        }
        if (!date) {
            toast.error("Date is required.");
            return;
        }
        try {
            await createRecord({
                student: Number(studentId),
                date,
                status,
                notes,
            }).unwrap();
            toast.success("Attendance saved.");
            setStudentId("");
            setDate("");
            setStatus("PRESENT");
            setNotes("");
        } catch (error: any) {
            const studentError = error?.data?.student?.[0];
            const nonFieldError = error?.data?.non_field_errors?.[0];
            toast.error(studentError || nonFieldError || "Failed to save attendance.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
                        <p className="mt-1 text-sm text-gray-500">Record and review intern attendance</p>
                    </div>
                    <CalendarCheck className="h-6 w-6 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">New Attendance</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Assigned Student</label>
                                <select
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Select assigned student</option>
                                    {assignedStudents.map((student) => (
                                        <option key={student.profileId} value={student.profileId}>
                                            {student.label}
                                        </option>
                                    ))}
                                </select>
                                {assignedStudents.length === 0 && (
                                    <p className="mt-2 text-xs text-amber-600">No assigned interns found for attendance entry yet.</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED")}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="LATE">Late</option>
                                    <option value="EXCUSED">Excused</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <button
                                onClick={handleCreate}
                                disabled={isSaving || assignedStudents.length === 0}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isSaving ? "Saving..." : "Save Attendance"}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
                        {isLoading && <p className="mt-4 text-sm text-gray-500">Loading records...</p>}
                        {!isLoading && (!records || records.length === 0) && (
                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                No attendance records yet.
                            </div>
                        )}
                        {!isLoading && records && records.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {records.map((record) => (
                                    <div key={record.id} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {record.student_details?.user?.username || `Student ID ${record.student}`}
                                                </p>
                                                <p className="text-xs text-gray-500">Date: {format(new Date(record.date), "MMM dd, yyyy")}</p>
                                                {record.notes && <p className="mt-2 text-xs text-gray-600">{record.notes}</p>}
                                            </div>
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                                                {record.status}
                                            </span>
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
