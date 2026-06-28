"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, GraduationCap, Mail, Phone } from "lucide-react";
import { ApplicationStatus, useGetApplicationsQuery, useUpdateApplicationMutation, useBulkUpdateApplicationStatusMutation } from "@/lib/redux/slices/InternshipsSlice";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function CoordinatorApplicationsPage() {
    const { data: applications = [], isLoading } = useGetApplicationsQuery();
    const [updateApplication] = useUpdateApplicationMutation();
    const [bulkUpdate] = useBulkUpdateApplicationStatusMutation();

    const [statusMap, setStatusMap] = useState<Record<string, ApplicationStatus | "">>({});
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const sortedApplications = useMemo(
        () => [...applications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [applications],
    );
    const totalPages = Math.max(1, Math.ceil(sortedApplications.length / pageSize));
    const pageApplications = sortedApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const pendingIds = sortedApplications.filter((app) => app.status === "PENDING").map((app) => app.id);
    const awaitingAdminIds = sortedApplications.filter((app) => app.status === "PARTNER_ACCEPTED").map((app) => app.id);
    const approvedCount = sortedApplications.filter((app) => app.status === "APPROVED").length;
    const rejectedCount = sortedApplications.filter((app) => app.status === "REJECTED").length;
    const awaitingAdminCount = awaitingAdminIds.length;

    const resolvePositionTitle = (app: { position: string; position_details?: { title?: string; organization_details?: { name?: string } } }) => {
        const title = app.position_details?.title || "Internship Position";
        const organization = app.position_details?.organization_details?.name;
        return organization ? `${title} at ${organization}` : title;
    };

    const resolveStudentName = (app: { student_details?: { user?: { username?: string; email?: string; first_name?: string; last_name?: string } }; student?: number }) => {
        const user = app.student_details?.user;
        return [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
            user?.username ||
            user?.email ||
            `Student ${app.student}`;
    };

    const handleUpdateStatus = async (id: string) => {
        const status = statusMap[id];
        if (!status) {
            toast.error("Select a status first.");
            return;
        }
        try {
            await updateApplication({ id, data: { status } }).unwrap();
            toast.success("Application updated.");
        } catch {
            toast.error("Failed to update application.");
        }
    };

    const selectedIds = Object.entries(selected)
        .filter(([, checked]) => checked)
        .map(([id]) => id);

    const handleBulkUpdate = async (status: ApplicationStatus) => {
        if (selectedIds.length === 0) {
            toast.error("Select at least one application.");
            return;
        }
        try {
            await bulkUpdate({ ids: selectedIds, status }).unwrap();
            toast.success("Applications updated.");
        } catch {
            toast.error("Failed to update applications.");
        }
    };

    const handleApproveAllPending = async () => {
        const idsToApprove = awaitingAdminIds.length > 0 ? awaitingAdminIds : pendingIds;
        if (idsToApprove.length === 0) {
            toast.error("There are no applications awaiting approval.");
            return;
        }
        try {
            await bulkUpdate({ ids: idsToApprove, status: "APPROVED" }).unwrap();
            setSelected({});
            toast.success(`${idsToApprove.length} application(s) approved with final confirmation.`);
        } catch {
            toast.error("Failed to approve applications.");
        }
    };

    const toggleSelectCurrentPage = (checked: boolean) => {
        setSelected((prev) => {
            const next = { ...prev };
            pageApplications.forEach((app) => {
                next[app.id] = checked;
            });
            return next;
        });
    };

    const handleExportPdf = () => {
        if (sortedApplications.length === 0) {
            toast.error("No applications to export.");
            return;
        }
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Applications List", 14, 16);
        doc.setFontSize(10);
        doc.text(`Exported ${new Date().toLocaleString()}`, 14, 22);

        autoTable(doc, {
            startY: 28,
            head: [["Student", "Student ID", "Program", "Position", "Status", "Created"]],
            body: sortedApplications.map((app) => [
                resolveStudentName(app),
                app.student_details?.student_id || "N/A",
                app.student_details?.program || "N/A",
                resolvePositionTitle(app),
                app.status,
                new Date(app.created_at).toLocaleDateString(),
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [37, 99, 235] },
        });

        doc.save("applications.pdf");
        toast.success("PDF exported.");
    };

    const handleExportExcel = () => {
        if (sortedApplications.length === 0) {
            toast.error("No applications to export.");
            return;
        }
        const data = sortedApplications.map((app) => ({
            id: app.id,
            student: resolveStudentName(app),
            student_id: app.student_details?.student_id || "",
            program: app.student_details?.program || "",
            email: app.student_details?.user?.email || "",
            position: resolvePositionTitle(app),
            status: app.status,
            created_at: app.created_at,
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
        XLSX.writeFile(workbook, "applications.xlsx");
        toast.success("Excel exported.");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                        <p className="mt-1 text-sm text-gray-500">Review and update internship applications</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleApproveAllPending}
                            className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Final Approve Awaiting
                        </button>
                        <button
                            onClick={() => handleBulkUpdate("APPROVED")}
                            className="inline-flex items-center rounded-lg border border-emerald-200 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                        >
                            Bulk Approve
                        </button>
                        <button
                            onClick={() => handleBulkUpdate("REJECTED")}
                            className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                            Bulk Reject
                        </button>
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

                <div className="mb-6 grid gap-4 md:grid-cols-5">
                    {[
                        ["Total applications", sortedApplications.length],
                        ["Pending", pendingIds.length],
                        ["Awaiting Admin", awaitingAdminCount],
                        ["Final Approve", approvedCount],
                        ["Rejected", rejectedCount],
                    ].map(([label, value]) => (
                        <div key={label as string} className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">{label}</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {isLoading && <p className="text-sm text-gray-500">Loading applications...</p>}
                    {!isLoading && sortedApplications.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No applications yet.
                        </div>
                    )}
                    {!isLoading && sortedApplications.length > 0 && (
                        <>
                        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedApplications.length)} of {sortedApplications.length}
                                </p>
                                <p className="text-xs text-gray-500">{selectedIds.length} selected on all pages</p>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={pageApplications.length > 0 && pageApplications.every((app) => selected[app.id])}
                                    onChange={(e) => toggleSelectCurrentPage(e.target.checked)}
                                />
                                Select current page
                            </label>
                        </div>

                        <div className="space-y-3">
                            {pageApplications.map((app) => (
                                <div key={app.id} className="rounded-xl border border-gray-200 p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <label className="mr-3 inline-flex items-center gap-2 text-xs text-gray-500">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selected[app.id]}
                                                    onChange={(e) =>
                                                        setSelected((prev) => ({ ...prev, [app.id]: e.target.checked }))
                                                    }
                                                />
                                                Select
                                            </label>
                                            <p className="text-sm font-medium text-gray-900">
                                                {resolveStudentName(app)}
                                            </p>
                                            <p className="text-xs text-gray-500">Position: {resolvePositionTitle(app)}</p>
                                            <p className="text-xs text-gray-500">Status: {app.status}</p>
                                            <p className="text-xs text-gray-400">Applied: {new Date(app.created_at).toLocaleString()}</p>
                                            <div className="mt-3 grid gap-2 text-xs text-gray-500 md:grid-cols-2">
                                                <span className="flex items-center gap-1">
                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                    {app.student_details?.program || "Program N/A"} | Student ID {app.student_details?.student_id || "N/A"}
                                                </span>
                                                <span>Year {app.student_details?.year_of_study || "N/A"} | Graduation {app.student_details?.graduation_date || "N/A"}</span>
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {app.student_details?.user?.email || "No email"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {app.student_details?.user?.phone || "No phone"}
                                                </span>
                                                <span className="md:col-span-2">Skills: {app.student_details?.skills || "No skills recorded"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={statusMap[app.id] || ""}
                                                onChange={(e) => setStatusMap((prev) => ({ ...prev, [app.id]: e.target.value as ApplicationStatus | "" }))}
                                                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                                            >
                                                <option value="">Set status</option>
                                                <option value="PENDING">Pending</option>
                                                <option value="PARTNER_ACCEPTED">Partner Accepted</option>
                                                <option value="APPROVED">Approve</option>
                                                <option value="REJECTED">Rejected</option>
                                            </select>
                                            <button
                                                onClick={() => handleUpdateStatus(app.id)}
                                                className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
