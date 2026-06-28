"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, Eye, Filter, Loader2 } from "lucide-react";
import { useGetAuditLogsQuery } from "@/lib/redux/slices/AuditLogsSlice";
import { formatDistanceToNow } from "date-fns";

export default function AdminAuditLogsPage() {
    const { data: auditLogs = [], isLoading, isError } = useGetAuditLogsQuery();
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLogs = useMemo(() => {
        let data = filter === "all" ? auditLogs : auditLogs.filter((log) => log.action === filter);
        if (!searchTerm) return data;
        const term = searchTerm.toLowerCase();
        return data.filter((log) =>
            (log.user || "").toLowerCase().includes(term) ||
            (log.target_user || "").toLowerCase().includes(term) ||
            log.action.toLowerCase().includes(term)
        );
    }, [auditLogs, filter, searchTerm]);

    const actionOptions = useMemo(() => {
        const unique = new Set(auditLogs.map((log) => log.action));
        return Array.from(unique);
    }, [auditLogs]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading activity logs...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-red-100 max-w-md">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load logs</h3>
                    <p className="text-gray-500 mb-4">There was an error fetching the activity logs. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
                            <p className="text-sm text-gray-500 mt-1">Track system activities and user actions</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:max-w-sm"
                                placeholder="Search by user, action, or target"
                            />
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="all">All Actions</option>
                                    {actionOptions.map((action) => (
                                        <option key={action} value={action}>
                                            {action}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{log.user || "System"}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.target_user || "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip_address || "—"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            <button className="text-gray-600 hover:text-gray-700" title="Details">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="text-gray-400 mb-4">
                                            <Filter className="h-12 w-12 mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                                        <p className="text-gray-500">Try adjusting your filter criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
