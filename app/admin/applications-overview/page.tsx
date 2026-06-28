"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import {
    ApplicationStatus,
    useBulkUpdateApplicationStatusMutation,
    useGetApplicationsQuery,
    useUpdateApplicationMutation,
} from "@/lib/redux/slices/InternshipsSlice";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const PAGE_SIZE = 8;

export default function AdminApplicationsOverviewPage() {
    const { data: applications = [], isLoading } = useGetApplicationsQuery();
    const [updateApplication] = useUpdateApplicationMutation();
    const [bulkUpdate] = useBulkUpdateApplicationStatusMutation();

    const [statusMap, setStatusMap] = useState<Record<string, ApplicationStatus | "">>({});
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const resolveStudentName = (app: (typeof applications)[number]) =>
        app.student_details?.user?.username ||
        app.student_details?.user?.email ||
        `Student ${app.student}`;

    const resolvePositionTitle = (app: (typeof applications)[number]) => {
        const title = app.position_details?.title || "Internship Position";
        const organization = app.position_details?.organization_details?.name;
        return organization ? `${title} at ${organization}` : title;
    };

    const filteredApplications = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return applications.filter((app) => {
            const searchable = [
                resolveStudentName(app),
                resolvePositionTitle(app),
                app.status,
                app.student_details?.program || "",
            ].join(" ").toLowerCase();
            const matchesSearch = query ? searchable.includes(query) : true;
            const matchesStatus = statusFilter === "ALL" ? true : app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applications, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
    const pageApplications = filteredApplications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const selectedIds = Object.entries(selected).filter(([, checked]) => checked).map(([id]) => id);
    const pendingCount = applications.filter((app) => app.status === "PENDING").length;
    const awaitingAdminCount = applications.filter((app) => app.status === "PARTNER_ACCEPTED").length;
    const approvedCount = applications.filter((app) => app.status === "APPROVED").length;
    const rejectedCount = applications.filter((app) => app.status === "REJECTED").length;

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

    const handleBulkUpdate = async (status: ApplicationStatus) => {
        if (selectedIds.length === 0) {
            toast.error("Select at least one application.");
            return;
        }
        try {
            await bulkUpdate({ ids: selectedIds, status }).unwrap();
            setSelected({});
            toast.success("Applications updated.");
        } catch {
            toast.error("Failed to update applications.");
        }
    };

    const handleExportPdf = () => {
        if (applications.length === 0) {
            toast.error("No applications to export.");
            return;
        }
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Applications Overview", 14, 16);
        doc.setFontSize(10);
        doc.text(`Exported ${new Date().toLocaleString()}`, 14, 22);

        autoTable(doc, {
            startY: 30,
            head: [["Student", "Program", "Position", "Status", "Submitted"]],
            body: applications.map((app) => [
                resolveStudentName(app),
                app.student_details?.program || "Not available",
                resolvePositionTitle(app),
                app.status,
                new Date(app.created_at).toLocaleDateString(),
            ]),
            styles: { fontSize: 8.5, cellPadding: 3 },
            headStyles: { fillColor: [15, 23, 42] },
        });

        doc.save("applications-overview.pdf");
        toast.success("PDF exported.");
    };

    const handleExportExcel = () => {
        if (applications.length === 0) {
            toast.error("No applications to export.");
            return;
        }
        const data = applications.map((app) => ({
            student: resolveStudentName(app),
            program: app.student_details?.program || "Not available",
            position: resolvePositionTitle(app),
            status: app.status,
            submitted_at: app.created_at,
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
        XLSX.writeFile(workbook, "applications-overview.xlsx");
        toast.success("Excel exported.");
    };

    const toggleSelectPage = (checked: boolean) => {
        setSelected((prev) => {
            const next = { ...prev };
            pageApplications.forEach((app) => {
                next[app.id] = checked;
            });
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">HOD Review</p>
                        <h1 className="mt-1 text-3xl font-bold text-slate-900">Applications Overview</h1>
                        <p className="mt-1 text-sm text-slate-500">Review internship applications with clear student and position context.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => handleBulkUpdate("APPROVED")} className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                            Bulk Approve
                        </button>
                        <button onClick={() => handleBulkUpdate("REJECTED")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                            Bulk Reject
                        </button>
                        <button onClick={handleExportPdf} className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-white">
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                        </button>
                        <button onClick={handleExportExcel} className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-white">
                            <Download className="mr-2 h-4 w-4" />
                            Excel
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-5">
                    {[
                        ["Total Applications", applications.length],
                        ["Pending", pendingCount],
                        ["Awaiting Admin", awaitingAdminCount],
                        ["Final Approved", approvedCount],
                        ["Rejected", rejectedCount],
                    ].map(([label, value]) => (
                        <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">{label}</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Application Queue</h2>
                                <p className="text-sm text-slate-500">{selectedIds.length} selected</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) => {
                                            setSearchTerm(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-500 sm:w-80"
                                        placeholder="Search student, company, position"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => {
                                        setStatusFilter(event.target.value as ApplicationStatus | "ALL");
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="PARTNER_ACCEPTED">Partner Accepted</option>
                                    <option value="APPROVED">Approve</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {isLoading && <p className="p-6 text-sm text-slate-500">Loading applications...</p>}
                    {!isLoading && filteredApplications.length === 0 && (
                        <div className="m-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            No applications match your filters.
                        </div>
                    )}
                    {!isLoading && filteredApplications.length > 0 && (
                        <>
                            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={pageApplications.length > 0 && pageApplications.every((app) => selected[app.id])}
                                        onChange={(event) => toggleSelectPage(event.target.checked)}
                                    />
                                    Select current page
                                </label>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {pageApplications.map((app) => (
                                    <div key={app.id} className="p-5 hover:bg-slate-50">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selected[app.id]}
                                                    onChange={(event) => setSelected((prev) => ({ ...prev, [app.id]: event.target.checked }))}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900">{resolveStudentName(app)}</p>
                                                    <p className="text-sm text-slate-500">{app.student_details?.program || "Program not available"}</p>
                                                    <p className="mt-2 text-sm font-medium text-slate-800">
                                                        <FileText className="mr-1 inline h-4 w-4 text-slate-400" />
                                                        {resolvePositionTitle(app)}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">Submitted {new Date(app.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{app.status}</span>
                                                <select
                                                    value={statusMap[app.id] || ""}
                                                    onChange={(event) => setStatusMap((prev) => ({ ...prev, [app.id]: event.target.value as ApplicationStatus | "" }))}
                                                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
                                                >
                                                    <option value="">Set status</option>
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PARTNER_ACCEPTED">Partner Accepted</option>
                                                    <option value="APPROVED">Approve</option>
                                                    <option value="REJECTED">Reject</option>
                                                </select>
                                                <button onClick={() => handleUpdateStatus(app.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredApplications.length)} of {filteredApplications.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:opacity-40">
                                        Previous
                                    </button>
                                    <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:opacity-40">
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
