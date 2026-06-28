"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
    Briefcase,
    CheckCircle2,
    Clock,
    FileText,
    MessageSquare,
    Star,
    TrendingUp,
} from "lucide-react";
import { useGetMyDetailsMutation } from "@/lib/redux/slices/AuthSlice";
import { useGetPlacementsQuery } from "@/lib/redux/slices/InternshipsSlice";
import { useGetProgressLogsQuery } from "@/lib/redux/slices/TrackingSlice";
import { useGetEvaluationSummariesQuery, useGetEvaluationsQuery } from "@/lib/redux/slices/EvaluationsSlice";
import { useGetReportsQuery } from "@/lib/redux/slices/ReportsSlice";
import { useGetNotificationsQuery } from "@/lib/redux/slices/NotificationsSlice";
import { useGetApplicationsQuery } from "@/lib/redux/slices/InternshipsSlice";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";

export default function StudentDashboard() {
    const [getMyDetails, { data: userDetails }] = useGetMyDetailsMutation();
    const { data: placements } = useGetPlacementsQuery();
    const { data: progressLogs } = useGetProgressLogsQuery();
    const { data: evaluations } = useGetEvaluationsQuery();
    const { data: evaluationSummaries } = useGetEvaluationSummariesQuery();
    const { data: reports } = useGetReportsQuery();
    const { data: notifications } = useGetNotificationsQuery();
    const { data: applications } = useGetApplicationsQuery();

    useEffect(() => {
        getMyDetails({});
    }, [getMyDetails]);

    const currentPlacement = useMemo(() => {
        if (!placements || placements.length === 0) return null;
        return placements.find((p) => p.confirmed) || placements[0];
    }, [placements]);

    const hoursCompleted = useMemo(() => {
        if (!progressLogs) return 0;
        return progressLogs.reduce((sum, log) => sum + parseFloat(log.hours_completed || "0"), 0);
    }, [progressLogs]);

    const finalEvaluationScore = useMemo(() => {
        const summary = evaluationSummaries?.[0];
        return summary?.final_score_out_of_20 ?? null;
    }, [evaluationSummaries]);

    const unreadNotifications = useMemo(() => {
        if (!notifications) return 0;
        return notifications.filter((n) => !n.is_read).length;
    }, [notifications]);

    const placementSubtext = currentPlacement
        ? `${currentPlacement.application_details?.position_details?.title || "Internship placement"}${
              currentPlacement.supervisor_details?.user?.username ? ` with ${currentPlacement.supervisor_details.user.username}` : ""
          }`
        : "Awaiting placement";

    const recentActivity = useMemo(() => {
        const items: Array<{
            id: string;
            type: "report" | "evaluation" | "progress" | "notification";
            title: string;
            description: string;
            timestamp: Date;
        }> = [];

        reports?.slice(0, 5).forEach((r) => {
            items.push({
                id: `report-${r.id}`,
                type: "report",
                title: `${r.type} report submitted`,
                description: r.feedback ? r.feedback : "Report submitted",
                timestamp: new Date(r.submitted_at),
            });
        });

        evaluations?.slice(0, 5).forEach((e) => {
            items.push({
                id: `evaluation-${e.id}`,
                type: "evaluation",
                title: `${e.evaluation_type} evaluation received`,
                description: e.feedback || "Evaluation received",
                timestamp: new Date(e.created_at),
            });
        });

        progressLogs?.slice(0, 5).forEach((p) => {
            items.push({
                id: `progress-${p.id}`,
                type: "progress",
                title: "Progress log recorded",
                description: p.summary,
                timestamp: new Date(p.date),
            });
        });

        notifications?.slice(0, 5).forEach((n) => {
            items.push({
                id: `notification-${n.id}`,
                type: "notification",
                title: "Notification",
                description: n.message,
                timestamp: new Date(n.created_at),
            });
        });

        return items
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 8);
    }, [reports, evaluations, progressLogs, notifications]);

    const statCards = [
        {
            title: "Current Placement",
            value: currentPlacement ? "Assigned" : "Not assigned",
            subtext: placementSubtext,
            icon: Briefcase,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Hours Completed",
            value: hoursCompleted.toFixed(1),
            subtext: "Total logged hours",
            icon: Clock,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Reports Submitted",
            value: reports ? reports.length : 0,
            subtext: "All report types",
            icon: FileText,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Final Grade",
            value: finalEvaluationScore !== null ? `${finalEvaluationScore}/20` : "N/A",
            subtext: "Final converted grade",
            icon: Star,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
    ];

    const hoursByDate = useMemo(() => {
        if (!progressLogs) return [];
        const grouped: Record<string, number> = {};
        progressLogs.forEach((log) => {
            const dateKey = format(new Date(log.date), "MMM dd");
            grouped[dateKey] = (grouped[dateKey] || 0) + parseFloat(log.hours_completed || "0");
        });
        return Object.entries(grouped).map(([date, hours]) => ({ date, hours }));
    }, [progressLogs]);

    const evaluationTrend = useMemo(() => {
        if (!evaluations) return [];
        return evaluations
            .slice()
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((e) => ({
                date: format(new Date(e.created_at), "MMM dd"),
                score: e.score || 0,
            }));
    }, [evaluations]);

    const applicationStatusData = useMemo(() => {
        if (!applications) return [];
        const grouped: Record<string, number> = {};
        applications.forEach((app) => {
            grouped[app.status] = (grouped[app.status] || 0) + 1;
        });
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [applications]);

    const pieColors = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#6366f1"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back{userDetails?.username ? `, ${userDetails.username}` : ""}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
                            <p className="mt-2 text-gray-600">
                                Here is a quick overview of your internship progress and upcoming work.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <TrendingUp className="h-5 w-5" />
                                <span>Applications: {applications ? applications.length : 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.title}
                                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                        <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
                                        <p className="mt-1 text-xs text-gray-500">{stat.subtext}</p>
                                    </div>
                                    <div className={`rounded-xl ${stat.bgColor} p-3`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Hours Logged</h2>
                                <Link className="text-sm text-blue-600 hover:text-blue-700" href="/student/progress-tracking">
                                    Manage logs
                                </Link>
                            </div>
                            {hoursByDate.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                    No hours logged yet.
                                </div>
                            ) : (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={hoursByDate}>
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                                <Link className="text-sm text-blue-600 hover:text-blue-700" href="/student/notifications">
                                    View all
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentActivity.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                        No recent activity yet. Start by submitting a report or logging hours.
                                    </div>
                                )}
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
                                                {activity.type === "report" && <FileText className="h-4 w-4" />}
                                                {activity.type === "evaluation" && <Star className="h-4 w-4" />}
                                                {activity.type === "progress" && <CheckCircle2 className="h-4 w-4" />}
                                                {activity.type === "notification" && <MessageSquare className="h-4 w-4" />}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                                    <p className="mt-1 text-xs text-gray-500">{activity.description}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                                <MessageSquare className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4 text-center">
                                <p className="text-3xl font-semibold text-gray-900">{unreadNotifications}</p>
                                <p className="mt-1 text-sm text-gray-500">Unread notifications</p>
                                <Link
                                    href="/student/notifications"
                                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                >
                                    View notifications
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                            </div>
                            {applicationStatusData.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                    No applications yet.
                                </div>
                            ) : (
                                <div className="h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie dataKey="value" data={applicationStatusData} innerRadius={40} outerRadius={70} paddingAngle={5}>
                                                {applicationStatusData.map((entry, index) => (
                                                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            <div className="mt-4 space-y-1 text-xs text-gray-500">
                                {applicationStatusData.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="inline-block h-2 w-2 rounded-full"
                                                style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                            />
                                            {item.name}
                                        </span>
                                        <span>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Evaluation Trend</h2>
                            <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                        {evaluationTrend.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                No evaluations yet.
                            </div>
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={evaluationTrend}>
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="score" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
