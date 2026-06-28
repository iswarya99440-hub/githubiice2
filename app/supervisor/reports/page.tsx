"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileText, Download, MessageSquare } from "lucide-react";
import { useApproveReportMutation, useGetReportsQuery, useSetReportFeedbackMutation } from "@/lib/redux/slices/ReportsSlice";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useGetMyAuditLogsQuery } from "@/lib/redux/slices/AuditLogsSlice";

export default function SupervisorReportsPage() {
    const { data: reports, isLoading } = useGetReportsQuery();
    const [setFeedback, { isLoading: isSaving }] = useSetReportFeedbackMutation();
    const [approveReport, { isLoading: isApproving }] = useApproveReportMutation();
    const [feedbackMap, setFeedbackMap] = useState<Record<number, string>>({});
    const { data: auditLogs } = useGetMyAuditLogsQuery();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

    const normalizedReports = useMemo(() => {
        if (!reports) return [];
        return reports.map((report) => ({
            ...report,
            fileUrl: report.file
                ? report.file.startsWith("http")
                    ? report.file
                    : `${apiBase}${report.file.startsWith("/") ? "" : "/"}${report.file}`
                : null,
        }));
    }, [reports, apiBase]);

    const handleSaveFeedback = async (id: number) => {
        const feedback = feedbackMap[id] || "";
        if (!feedback.trim()) {
            toast.error("Feedback cannot be empty.");
            return;
        }
        try {
            await setFeedback({ id, feedback }).unwrap();
            toast.success("Feedback saved.");
        } catch {
            toast.error("Failed to save feedback.");
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await approveReport({ id, feedback: feedbackMap[id] }).unwrap();
            toast.success("Report approved and released to coordinators.");
        } catch {
            toast.error("Failed to approve report.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                        <p className="mt-1 text-sm text-gray-500">Review reports submitted by interns</p>
                    </div>
                    <FileText className="h-6 w-6 text-gray-400" />
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {isLoading && <p className="text-sm text-gray-500">Loading reports...</p>}
                    {!isLoading && normalizedReports.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No reports submitted yet.
                        </div>
                    )}
                    {!isLoading && normalizedReports.length > 0 && (
                        <div className="space-y-4">
                            {normalizedReports.map((report) => (
                                <div key={report.id} className="rounded-xl border border-gray-200 p-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{report.type} report</p>
                                            <p className="text-xs text-gray-500">
                                                Student: {report.student_details?.user?.username || `ID ${report.student}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Submitted {formatDistanceToNow(new Date(report.submitted_at), { addSuffix: true })}
                                            </p>
                                            {report.feedback && <p className="mt-2 text-xs text-gray-600">Current feedback: {report.feedback}</p>}
                                            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${report.supervisor_approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                                {report.supervisor_approved ? "Approved for coordinator review" : "Pending supervisor approval"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {report.fileUrl && (
                                                <a
                                                    href={report.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                        <label className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-600">
                                            <MessageSquare className="h-3 w-3" />
                                            Supervisor Feedback
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={feedbackMap[report.id] ?? report.feedback ?? ""}
                                            onChange={(e) => setFeedbackMap((prev) => ({ ...prev, [report.id]: e.target.value }))}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            placeholder="Add feedback for the intern"
                                        />
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                onClick={() => handleSaveFeedback(report.id)}
                                                disabled={isSaving}
                                                className="rounded-md border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                                            >
                                                Save Feedback
                                            </button>
                                            <button
                                                onClick={() => handleApprove(report.id)}
                                                disabled={isApproving || report.supervisor_approved}
                                                className="ml-2 inline-flex items-center rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                {report.supervisor_approved ? "Approved" : "Approve Report"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Feedback History</h2>
                    {!auditLogs || auditLogs.length === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                            No feedback history yet.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {auditLogs
                                .filter((log) => log.action === "REPORT_FEEDBACK_SET")
                                .slice(0, 6)
                                .map((log) => (
                                    <div key={log.id} className="rounded-xl border border-gray-200 p-3">
                                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
