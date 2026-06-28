"use client";

import { useState } from "react";
import { useGetProgressLogsQuery, useApproveProgressLogMutation, useRejectProgressLogMutation } from "@/lib/redux/slices/TrackingSlice";
import { format } from "date-fns";
import { toast } from "sonner";
import { useGetMyAuditLogsQuery } from "@/lib/redux/slices/AuditLogsSlice";

export default function SupervisorProgressMonitoringPage() {
    const { data: logs, isLoading } = useGetProgressLogsQuery();
    const [approveLog] = useApproveProgressLogMutation();
    const [rejectLog] = useRejectProgressLogMutation();
    const { data: auditLogs } = useGetMyAuditLogsQuery();

    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

    const handleApprove = async (id: number) => {
        try {
            setSelectedLogId(id);
            await approveLog(id).unwrap();
            toast.success("Log approved.");
        } catch {
            toast.error("Failed to approve log.");
        } finally {
            setSelectedLogId(null);
        }
    };

    const handleReject = async (id: number) => {
        try {
            setSelectedLogId(id);
            await rejectLog(id).unwrap();
            toast.success("Log marked as not approved.");
        } catch {
            toast.error("Failed to update log.");
        } finally {
            setSelectedLogId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Progress Monitoring</h1>
                    <p className="mt-1 text-sm text-gray-500">Review intern activity logs and approve them</p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {isLoading && <p className="text-sm text-gray-500">Loading logs...</p>}
                    {!isLoading && (!logs || logs.length === 0) && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No progress logs submitted yet.
                        </div>
                    )}
                    {!isLoading && logs && logs.length > 0 && (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="rounded-xl border border-gray-200 p-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{log.summary}</p>
                                            <p className="text-xs text-gray-500">
                                                Student: {log.student_details?.user?.username || `ID ${log.student}`}
                                            </p>
                                            <p className="text-xs text-gray-500">Date: {format(new Date(log.date), "MMM dd, yyyy")}</p>
                                            <p className="text-xs text-gray-500">Hours: {log.hours_completed}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`rounded-full px-3 py-1 text-xs ${log.approved ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                                {log.approved ? "Approved" : "Pending"}
                                            </span>
                                            <button
                                                onClick={() => handleApprove(log.id)}
                                                disabled={selectedLogId === log.id}
                                                className="rounded-md bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-60"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(log.id)}
                                                disabled={selectedLogId === log.id}
                                                className="rounded-md bg-amber-500 px-3 py-1 text-xs text-white hover:bg-amber-600 disabled:opacity-60"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Approval History</h2>
                    {!auditLogs || auditLogs.length === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                            No approval history yet.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {auditLogs.slice(0, 6).map((log) => (
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
