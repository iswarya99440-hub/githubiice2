"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PartnerCard, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useCreateEvaluationMutation, useGetEvaluationSummariesQuery, useGetEvaluationsQuery } from "@/lib/redux/slices/EvaluationsSlice";
import { useGetPlacementsQuery } from "@/lib/redux/slices/InternshipsSlice";

export default function PartnerEvaluationsPage() {
    const { data: placements = [] } = useGetPlacementsQuery();
    const { data: evaluations = [] } = useGetEvaluationsQuery();
    const { data: summaries = [] } = useGetEvaluationSummariesQuery();
    const [createEvaluation] = useCreateEvaluationMutation();
    const assignedStudents = useMemo(() => placements.map((placement) => placement.student_details).filter(Boolean), [placements]);
    const [form, setForm] = useState({ student: "", evaluation_type: "MIDTERM", score: "50", feedback: "" });

    const submitEvaluation = async () => {
        if (!form.student) {
            toast.error("Select a student first.");
            return;
        }
        const score = Number(form.score);
        if (Number.isNaN(score) || score < 0 || score > 50) {
            toast.error("Score must be between 0 and 50.");
            return;
        }
        try {
            await createEvaluation({
                student: Number(form.student),
                evaluation_type: form.evaluation_type as "MIDTERM" | "FINAL",
                score,
                feedback: form.feedback,
            }).unwrap();
            toast.success("Evaluation submitted.");
            setForm((current) => ({ ...current, score: "50", feedback: "" }));
        } catch (error: any) {
            const scoreError = error?.data?.score?.[0];
            toast.error(scoreError || "Could not submit evaluation.");
        }
    };

    return (
        <PartnerPageShell>
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Submit Evaluation</h2>
                    <p className="mt-1 text-sm text-slate-500">Midterm is marked out of 50 and final is marked out of 50.</p>
                    <div className="mt-4 space-y-3">
                        <select value={form.student} onChange={(event) => setForm({ ...form, student: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option value="">Select student</option>
                            {assignedStudents.map((student) => student && <option key={student.id} value={student.id}>{student.user?.username}</option>)}
                        </select>
                        <select value={form.evaluation_type} onChange={(event) => setForm({ ...form, evaluation_type: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option value="MIDTERM">Mid-term</option>
                            <option value="FINAL">Final</option>
                        </select>
                        <label className="block">
                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Score /50</span>
                            <input
                                type="number"
                                min={0}
                                max={50}
                                value={form.score}
                                onChange={(event) => setForm({ ...form, score: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                            />
                        </label>
                        <textarea placeholder="Feedback" value={form.feedback} onChange={(event) => setForm({ ...form, feedback: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={4} />
                        <button onClick={submitEvaluation} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Submit Evaluation</button>
                    </div>
                </PartnerCard>

                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Evaluation Summary</h2>
                    <div className="mt-4 space-y-3">
                        {summaries.length ? summaries.map((summary) => (
                            <div key={summary.student.id} className="rounded-lg border border-slate-200 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{summary.student.user?.username || summary.student.student_id}</p>
                                        <p className="text-sm text-slate-500">
                                            Midterm {summary.midterm_score ?? "-"}/50 | Final {summary.final_score ?? "-"}/50
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                        {summary.is_complete ? `${summary.final_score_out_of_20}/20` : "Pending"}
                                    </span>
                                </div>
                            </div>
                        )) : <EmptyState message="No evaluation summaries yet." />}
                    </div>
                </PartnerCard>
            </div>

            <PartnerCard>
                <h2 className="font-semibold text-slate-900">Feedback History</h2>
                    <div className="mt-4 space-y-3">
                        {evaluations.length ? evaluations.map((evaluation) => (
                            <div key={evaluation.id} className="rounded-lg border border-slate-200 p-4">
                                <p className="font-semibold text-slate-900">{evaluation.student_details?.user?.username}</p>
                                <p className="text-sm text-slate-500">{evaluation.evaluation_type} - Score {evaluation.score}/{evaluation.max_score ?? 50}</p>
                                <p className="mt-2 text-sm text-slate-600">{evaluation.feedback}</p>
                            </div>
                        )) : <EmptyState message="No evaluations have been submitted yet." />}
                    </div>
            </PartnerCard>
        </PartnerPageShell>
    );
}
