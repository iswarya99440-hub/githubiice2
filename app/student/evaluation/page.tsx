"use client";

import { useMemo } from "react";
import { Star, ClipboardList } from "lucide-react";
import { useGetEvaluationSummariesQuery, useGetEvaluationsQuery } from "@/lib/redux/slices/EvaluationsSlice";
import { formatDistanceToNow } from "date-fns";

export default function StudentEvaluationPage() {
    const { data: evaluations, isLoading } = useGetEvaluationsQuery();
    const { data: summaries } = useGetEvaluationSummariesQuery();

    const summary = summaries?.[0] || null;
    const finalGrade = summary?.final_score_out_of_20 ?? null;

    const latestEvaluations = useMemo(() => evaluations || [], [evaluations]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Evaluations</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {finalGrade !== null ? `Final evaluation grade: ${finalGrade}/20` : "Midterm and final marks will appear here once submitted"}
                        </p>
                    </div>
                    <Star className="h-6 w-6 text-yellow-500" />
                </div>

                {summary && (
                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <SummaryCard label="Midterm" value={summary.midterm_score !== null ? `${summary.midterm_score}/50` : "Pending"} />
                        <SummaryCard label="Final" value={summary.final_score !== null ? `${summary.final_score}/50` : "Pending"} />
                        <SummaryCard label="Total Marks" value={`${summary.total_score}/${summary.total_max_score}`} />
                        <SummaryCard label="Converted Grade" value={summary.is_complete ? `${summary.final_score_out_of_20}/20` : "Pending"} highlight />
                    </div>
                )}

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {isLoading && <p className="text-sm text-gray-500">Loading evaluations...</p>}
                    {!isLoading && (!evaluations || evaluations.length === 0) && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            Evaluations will appear here once submitted by your supervisor.
                        </div>
                    )}
                    {!isLoading && latestEvaluations.length > 0 && (
                        <div className="space-y-4">
                            {latestEvaluations.map((evaluation) => (
                                <div key={evaluation.id} className="rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{evaluation.evaluation_type} Evaluation</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Score: {evaluation.score}/{evaluation.max_score ?? 50}
                                                {evaluation.score_out_of_20_component !== undefined ? ` (${evaluation.score_out_of_20_component}/10 contribution)` : ""}
                                            </p>
                                            {evaluation.feedback && (
                                                <p className="mt-2 text-sm text-gray-600">{evaluation.feedback}</p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(evaluation.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {evaluation.ratings && evaluation.ratings.length > 0 && (
                                        <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                                <ClipboardList className="h-4 w-4" />
                                                Rubric Breakdown
                                            </div>
                                            <div className="space-y-2">
                                                {evaluation.ratings.map((rating) => (
                                                    <div key={rating.id} className="flex items-center justify-between text-sm text-gray-600">
                                                        <span>Criterion #{rating.criterion}</span>
                                                        <span className="font-medium text-gray-900">{rating.score}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`rounded-2xl border p-5 shadow-sm ${highlight ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${highlight ? "text-blue-700" : "text-gray-900"}`}>{value}</p>
        </div>
    );
}
