"use client";

import { useMemo, useState } from "react";
import { Clock, PlusCircle } from "lucide-react";
import { useGetProgressLogsQuery, useCreateProgressLogMutation } from "@/lib/redux/slices/TrackingSlice";
import { format } from "date-fns";
import { toast } from "sonner";

export default function StudentProgressTrackingPage() {
    const { data: logs, isLoading } = useGetProgressLogsQuery();
    const [createLog, { isLoading: isSaving }] = useCreateProgressLogMutation();

    const [date, setDate] = useState("");
    const [hours, setHours] = useState("");
    const [summary, setSummary] = useState("");

    const totalHours = useMemo(() => {
        if (!logs) return 0;
        return logs.reduce((sum, log) => sum + parseFloat(log.hours_completed || "0"), 0);
    }, [logs]);

    const handleSubmit = async () => {
        if (!date) {
            toast.error("Please select a date.");
            return;
        }
        if (!hours || Number(hours) <= 0) {
            toast.error("Please enter valid hours.");
            return;
        }
        if (!summary.trim()) {
            toast.error("Summary is required.");
            return;
        }
        try {
            await createLog({ date, hours_completed: hours, summary }).unwrap();
            toast.success("Progress log added.");
            setDate("");
            setHours("");
            setSummary("");
        } catch {
            toast.error("Failed to add log.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
                        <p className="mt-1 text-sm text-gray-500">Total hours logged: {totalHours.toFixed(1)}</p>
                    </div>
                    <Clock className="h-6 w-6 text-gray-400" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Log Hours</h2>
                        <div className="mt-4 space-y-4">
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
                                <label className="text-sm font-medium text-gray-700">Hours Completed</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Summary</label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {isSaving ? "Saving..." : "Add Log"}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Logs</h2>
                        {isLoading && <p className="mt-4 text-sm text-gray-500">Loading logs...</p>}
                        {!isLoading && (!logs || logs.length === 0) && (
                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                No logs yet. Add your first entry.
                            </div>
                        )}
                        {!isLoading && logs && logs.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-start justify-between rounded-xl border border-gray-200 p-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{log.summary}</p>
                                            <p className="mt-1 text-xs text-gray-500">{format(new Date(log.date), "MMM dd, yyyy")}</p>
                                        </div>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                                            {log.hours_completed} hrs
                                        </span>
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
