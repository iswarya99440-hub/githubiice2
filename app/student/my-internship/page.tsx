"use client";

import { useMemo } from "react";
import { Briefcase, Calendar, Clock, Mail, Phone } from "lucide-react";
import { useGetPlacementsQuery } from "@/lib/redux/slices/InternshipsSlice";
import { useGetProgressLogsQuery } from "@/lib/redux/slices/TrackingSlice";
import { format } from "date-fns";

export default function MyInternshipPage() {
    const { data: placements } = useGetPlacementsQuery();
    const { data: progressLogs } = useGetProgressLogsQuery();

    const placement = useMemo(() => {
        if (!placements) return null;
        return placements.find((p) => p.confirmed) || placements[0] || null;
    }, [placements]);

    const totalHours = useMemo(() => {
        if (!progressLogs) return 0;
        return progressLogs.reduce((sum, log) => sum + parseFloat(log.hours_completed || "0"), 0);
    }, [progressLogs]);

    const supervisorName =
        placement?.supervisor_details?.user?.username ||
        placement?.supervisor_details?.user?.email ||
        null;
    const supervisorEmail = placement?.supervisor_details?.user?.email || null;
    const supervisorPhone = placement?.supervisor_details?.user?.phone || null;
    const position = placement?.application_details?.position_details;
    const organization = position?.organization_details;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Internship</h1>
                    <p className="mt-1 text-sm text-gray-500">Overview of your active placement and progress</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Briefcase className="h-6 w-6 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Placement Summary</h2>
                        </div>
                        {!placement && (
                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                No placement assigned yet.
                            </div>
                        )}
                        {placement && (
                            <div className="mt-4 space-y-3 text-sm text-gray-600">
                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Host Company</p>
                                    <p className="mt-1 text-lg font-bold text-gray-900">{organization?.name || "Company pending confirmation"}</p>
                                    <p className="mt-1 text-sm text-gray-600">{organization?.address || "Address not available"}</p>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned Position</p>
                                    <p className="mt-1 text-base font-semibold text-gray-900">{position?.title || "Position pending confirmation"}</p>
                                    <p className="mt-1 text-xs text-gray-500">{position?.required_skills ? `Required skills: ${position.required_skills}` : "Requirements not available"}</p>
                                </div>
                                <div>Program: {placement.student_details?.program || "Not available"}</div>
                                <div>Status: {placement.confirmed ? "Confirmed" : "Pending confirmation"}</div>
                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Supervisor Contact Information</p>
                                    <p className="mt-1 font-medium text-gray-900">{supervisorName || "Pending assignment"}</p>
                                    <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                        <p className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {supervisorEmail || "Email not available"}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {supervisorPhone || "Phone not available"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(placement.start_date), "MMM dd, yyyy")} - {format(new Date(placement.end_date), "MMM dd, yyyy")}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Clock className="h-6 w-6 text-green-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Progress Summary</h2>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            Total hours logged: <span className="font-semibold text-gray-900">{totalHours.toFixed(1)}</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Keep logging your daily activities to stay on track.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
