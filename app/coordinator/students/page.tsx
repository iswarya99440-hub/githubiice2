"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Mail, Phone, Search, UserRound } from "lucide-react";
import { useGetUsersByRoleQuery } from "@/lib/redux/slices/AuthSlice";

const PAGE_SIZE = 8;

export default function CoordinatorStudentsPage() {
    const { data: students, isLoading } = useGetUsersByRoleQuery("Student");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredStudents = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return ((students || []) as any[]).filter((student) => {
            const profile = student.student_profile;
            const fullName = getDisplayName(student);
            const searchable = [
                fullName,
                student.email,
                student.phone,
                student.status,
                profile?.student_id,
                profile?.program,
                profile?.year_of_study,
                profile?.graduation_date,
                profile?.skills,
            ].filter(Boolean).join(" ").toLowerCase();
            return query ? searchable.includes(query) : true;
        });
    }, [students, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const activeCount = ((students || []) as any[]).filter((student) => student.status === "Active" || student.is_active).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Coordinator Portal</p>
                        <h1 className="mt-1 text-3xl font-bold text-gray-900">Students</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage registered students with academic and contact details.</p>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <SummaryCard label="Total Students" value={(students || []).length} icon={GraduationCap} color="blue" />
                    <SummaryCard label="Active Accounts" value={activeCount} icon={UserRound} color="green" />
                    <SummaryCard label="Filtered Results" value={filteredStudents.length} icon={Search} color="slate" />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Student Directory</h2>
                                <p className="text-sm text-gray-500">Search by name, student ID, program, skills, email, or phone.</p>
                            </div>
                            <label className="relative">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(event) => {
                                        setSearchTerm(event.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-96"
                                    placeholder="Search students"
                                />
                            </label>
                        </div>
                    </div>

                    {isLoading && <p className="p-6 text-sm text-gray-500">Loading students...</p>}
                    {!isLoading && (!students || students.length === 0) && (
                        <div className="m-5 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No students found.
                        </div>
                    )}
                    {!isLoading && students && students.length > 0 && filteredStudents.length === 0 && (
                        <div className="m-5 rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No students match your search.
                        </div>
                    )}
                    {!isLoading && paginatedStudents.length > 0 && (
                        <>
                        <div className="divide-y divide-gray-100">
                            {paginatedStudents.map((student: any) => {
                                const profile = student.student_profile;
                                return (
                                <div key={student.id} className="p-5 transition hover:bg-gray-50">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-semibold text-gray-900">{getDisplayName(student)}</h3>
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${student.status === "Active" || student.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                    {student.status || (student.is_active ? "Active" : "Inactive")}
                                                </span>
                                            </div>
                                            <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                                                <p>Student ID: <span className="font-medium text-gray-900">{profile?.student_id || "N/A"}</span></p>
                                                <p>Program: <span className="font-medium text-gray-900">{profile?.program || "N/A"}</span></p>
                                                <p>Year of Study: <span className="font-medium text-gray-900">{profile?.year_of_study || "N/A"}</span></p>
                                                <p>Graduation: <span className="font-medium text-gray-900">{profile?.graduation_date || "N/A"}</span></p>
                                            </div>
                                            <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
                                                Skills: {profile?.skills || "No skills recorded yet."}
                                            </p>
                                        </div>
                                        <div className="w-full rounded-xl border border-gray-200 p-4 lg:w-80">
                                            <h4 className="text-sm font-semibold text-gray-900">Contact Information</h4>
                                            <div className="mt-3 space-y-2 text-sm text-gray-600">
                                                <p className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="break-all">{student.email || "No email provided"}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    {student.phone || "No phone provided"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                        <div className="flex flex-col gap-3 border-t border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} students
                            </p>
                            <div className="flex items-center gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 disabled:opacity-40">
                                    Previous
                                </button>
                                <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 disabled:opacity-40">
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

function getDisplayName(user: any) {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
    return fullName || user?.username || user?.email || "Student";
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof GraduationCap; color: "blue" | "green" | "slate" }) {
    const styles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        slate: "bg-slate-100 text-slate-600",
    }[color];
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-xl p-3 ${styles}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
