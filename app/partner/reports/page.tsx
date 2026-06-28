"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PartnerCard, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useGetReportsQuery, useSetReportFeedbackMutation } from "@/lib/redux/slices/ReportsSlice";

export default function PartnerReportsPage() {
    const { data: reports = [] } = useGetReportsQuery();
    const [setReportFeedback] = useSetReportFeedbackMutation();
    const [feedback, setFeedback] = useState<Record<number, string>>({});

    const saveFeedback = async (id: number) => {
        try {
            await setReportFeedback({ id, feedback: feedback[id] ?? "" }).unwrap();
            toast.success("Report feedback saved.");
        } catch {
            toast.error("Could not save report feedback.");
        }
    };

    return (
        <PartnerPageShell>
            <PartnerCard>
                <h2 className="font-semibold text-slate-900">Student Reports</h2>
                <div className="mt-4 space-y-3">
                    {reports.length ? reports.map((report) => (
                        <div key={report.id} className="rounded-lg border border-slate-200 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900">{report.student_details?.user?.username}</p>
                                    <p className="text-sm text-slate-500">{report.type} report submitted {new Date(report.submitted_at).toLocaleDateString()}</p>
                                    <a href={report.file} target="_blank" className="mt-2 inline-flex text-sm font-semibold text-slate-900 underline">Open document</a>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{report.feedback ? "Reviewed" : "Needs feedback"}</span>
                            </div>
                            <textarea value={feedback[report.id] ?? report.feedback ?? ""} onChange={(event) => setFeedback({ ...feedback, [report.id]: event.target.value })} className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} />
                            <button onClick={() => saveFeedback(report.id)} className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Save Feedback</button>
                        </div>
                    )) : <EmptyState message="No reports are available for review yet." />}
                </div>
            </PartnerCard>
        </PartnerPageShell>
    );
}
