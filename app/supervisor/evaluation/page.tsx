"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { useGetEvaluationsQuery, useCreateEvaluationMutation } from "@/lib/redux/slices/EvaluationsSlice";
import { useGetPlacementsQuery } from "@/lib/redux/slices/InternshipsSlice";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type AssignedStudentOption = {
    profileId: number;
    label: string;
};

export default function SupervisorEvaluationPage() {
    const { data: evaluations, isLoading } = useGetEvaluationsQuery();
    const { data: placements } = useGetPlacementsQuery();
    const [createEvaluation, { isLoading: isSubmitting }] = useCreateEvaluationMutation();

    const [studentId, setStudentId] = useState("");
    const [type, setType] = useState<"MIDTERM" | "FINAL">("MIDTERM");
    const [score, setScore] = useState("50");
    const [feedback, setFeedback] = useState("");

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

    const handleSubmit = async () => {
        if (!studentId) {
            toast.error("Select a student.");
            return;
        }
        const numericScore = Number(score);
        if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 50) {
            toast.error("Score must be between 0 and 50.");
            return;
        }
        try {
            await createEvaluation({
                student: Number(studentId),
                evaluation_type: type,
                score: numericScore,
                feedback,
            }).unwrap();
            toast.success("Evaluation submitted.");
            setStudentId("");
            setScore("50");
            setFeedback("");
        } catch (error: any) {
            const studentError = error?.data?.student?.[0];
            const scoreError = error?.data?.score?.[0];
            const nonFieldError = error?.data?.non_field_errors?.[0];
            toast.error(scoreError || studentError || nonFieldError || "Failed to submit evaluation.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Evaluations</h1>
                        <p className="mt-1 text-sm text-gray-500">Create and review intern evaluations</p>
                    </div>
                    <ClipboardCheck className="h-6 w-6 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">New Evaluation</h2>
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
                                    <p className="mt-2 text-xs text-amber-600">No assigned interns found for evaluation yet.</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Evaluation Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as "MIDTERM" | "FINAL")}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="MIDTERM">Midterm</option>
                                    <option value="FINAL">Final</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Score /50</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={50}
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">Midterm contributes 50 marks and final contributes 50 marks.</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Feedback</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || assignedStudents.length === 0}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Evaluation"}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Evaluations</h2>
                        {isLoading && <p className="mt-4 text-sm text-gray-500">Loading evaluations...</p>}
                        {!isLoading && (!evaluations || evaluations.length === 0) && (
                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                No evaluations yet.
                            </div>
                        )}
                        {!isLoading && evaluations && evaluations.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {evaluations.map((evaluation) => (
                                    <div key={evaluation.id} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {evaluation.student_details?.user?.username || `Student ID: ${evaluation.student}`}
                                                </p>
                                                <p className="text-xs text-gray-500">Type: {evaluation.evaluation_type}</p>
                                                <p className="text-xs text-gray-500">
                                                    Score: {evaluation.score}/{evaluation.max_score ?? 50}
                                                    {evaluation.score_out_of_20_component !== undefined ? ` (${evaluation.score_out_of_20_component}/10 contribution)` : ""}
                                                </p>
                                                {evaluation.feedback && (
                                                    <p className="mt-2 text-xs text-gray-600">{evaluation.feedback}</p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(evaluation.created_at), { addSuffix: true })}
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
