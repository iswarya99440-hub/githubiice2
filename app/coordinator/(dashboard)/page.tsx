"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Briefcase, FileText, Users, TrendingUp, Download } from "lucide-react";
import {
    useGetApplicationsQuery,
    useGetApplicationStatisticsQuery,
    useGetPlacementsQuery,
} from "@/lib/redux/slices/InternshipsSlice";
import { useGetReportsQuery } from "@/lib/redux/slices/ReportsSlice";
import { useGetEvaluationsQuery } from "@/lib/redux/slices/EvaluationsSlice";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function CoordinatorDashboard() {
    const { data: applications } = useGetApplicationsQuery();
    const { data: applicationStats } = useGetApplicationStatisticsQuery();
    const { data: placements } = useGetPlacementsQuery();
    const { data: reports } = useGetReportsQuery();
    const { data: evaluations } = useGetEvaluationsQuery();

    const statCards = [
        { label: "Applications", value: applications?.length ?? 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Placements", value: placements?.length ?? 0, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Reports", value: reports?.length ?? 0, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Evaluations", value: evaluations?.length ?? 0, icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-50" },
    ];

    const pieData = useMemo(() => {
        if (!applicationStats?.by_status) return [];
        return applicationStats.by_status.map((item) => ({ name: item.status, value: item.count }));
    }, [applicationStats]);

    const pieColors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

    const handleExportPdf = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("Coordinator Analytics Summary", 14, 16);
            doc.setFontSize(10);
            doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);

            autoTable(doc, {
                startY: 28,
                head: [["Metric", "Value"]],
                body: statCards.map((s) => [s.label, String(s.value)]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [37, 99, 235] },
            });

            doc.save("coordinator-analytics.pdf");
            toast.success("PDF exported.");
        } catch {
            toast.error("Failed to export PDF.");
        }
    };

    const handleExportExcel = () => {
        try {
            const data = statCards.map((s) => ({ metric: s.label, value: s.value }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
            XLSX.writeFile(workbook, "coordinator-analytics.xlsx");
            toast.success("Excel exported.");
        } catch {
            toast.error("Failed to export Excel.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Coordinator Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">Overview of applications, placements, and evaluations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportPdf}
                            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </button>
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                        <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`rounded-xl ${stat.bg} p-3`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
                            <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        {pieData.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                No applications yet.
                            </div>
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                                            {pieData.map((entry, index) => (
                                                <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/coordinator/applications-management" className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 hover:bg-gray-50">
                                Review Applications
                            </Link>
                            <Link href="/coordinator/placement-management" className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 hover:bg-gray-50">
                                Manage Placements
                            </Link>
                            <Link href="/coordinator/reports" className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 hover:bg-gray-50">
                                Review Reports
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
