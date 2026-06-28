"use client";

import { useMemo } from "react";
import {
    Activity,
    Users,
    Briefcase,
    CheckCircle2,
    FileText,
    ClipboardList,
    Bell,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useGetAllUsersQuery } from "@/lib/redux/slices/AuthSlice";
import { useGetApplicationsQuery, useGetPlacementsQuery } from "@/lib/redux/slices/InternshipsSlice";
import { useGetReportsQuery } from "@/lib/redux/slices/ReportsSlice";
import { useGetEvaluationsQuery } from "@/lib/redux/slices/EvaluationsSlice";
import { useGetNotificationsQuery } from "@/lib/redux/slices/NotificationsSlice";
import { useGetAuditLogsQuery } from "@/lib/redux/slices/AuditLogsSlice";

export default function AdminDashboard() {
    const { data: users } = useGetAllUsersQuery({});
    const { data: applications } = useGetApplicationsQuery();
    const { data: placements } = useGetPlacementsQuery();
    const { data: reports } = useGetReportsQuery();
    const { data: evaluations } = useGetEvaluationsQuery();
    const { data: notifications } = useGetNotificationsQuery();
    const { data: auditLogs } = useGetAuditLogsQuery();

    const stats = useMemo(() => {
        const totalUsers = Array.isArray(users) ? users.length : 0;
        const activeUsers = Array.isArray(users) ? users.filter((u) => u.status === "Active").length : 0;
        const totalApplications = applications?.length || 0;
        const totalPlacements = placements?.length || 0;
        const totalReports = reports?.length || 0;
        const totalEvaluations = evaluations?.length || 0;
        const unreadNotifications = notifications?.filter((n) => !n.is_read).length || 0;

        return {
            totalUsers,
            activeUsers,
            totalApplications,
            totalPlacements,
            totalReports,
            totalEvaluations,
            unreadNotifications,
        };
    }, [users, applications, placements, reports, evaluations, notifications]);

    const recentActivities = useMemo(() => {
        if (!auditLogs) return [];
        return [...auditLogs]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 6);
    }, [auditLogs]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">HOD Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">System health, usage, and recent activity</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                                <p className="text-xs text-gray-500">Active: {stats.activeUsers}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Applications</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                                <p className="text-xs text-gray-500">Total submissions</p>
                            </div>
                            <ClipboardList className="h-8 w-8 text-emerald-500" />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Placements</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalPlacements}</p>
                                <p className="text-xs text-gray-500">Total placements</p>
                            </div>
                            <Briefcase className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Unread Alerts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</p>
                                <p className="text-xs text-gray-500">Notifications</p>
                            </div>
                            <Bell className="h-8 w-8 text-amber-500" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
                            <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                        <p className="text-sm text-gray-500">Submitted reports</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Evaluations</h2>
                            <CheckCircle2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{stats.totalEvaluations}</p>
                        <p className="text-sm text-gray-500">Completed evaluations</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
                            <Activity className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="mt-3 text-sm text-gray-500">All services operational</p>
                        <p className="mt-1 text-xs text-emerald-600">Last audit log update {auditLogs?.[0] ? formatDistanceToNow(new Date(auditLogs[0].timestamp), { addSuffix: true }) : "—"}</p>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        <span className="text-xs text-gray-500">Latest audit logs</span>
                    </div>
                    {recentActivities.length === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                            No activity yet.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {recentActivities.map((log) => (
                                <div key={log.id} className="flex items-start justify-between rounded-xl border border-gray-200 p-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                        <p className="text-xs text-gray-500">{log.user || "System"}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
