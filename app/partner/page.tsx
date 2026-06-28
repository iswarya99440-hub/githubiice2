"use client";

import { EmptyState, PartnerCard, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useGetPartnerDashboardQuery } from "@/lib/redux/slices/InternshipsSlice";

export default function PartnerDashboardPage() {
    const { data: dashboard, isLoading } = useGetPartnerDashboardQuery();

    if (isLoading) {
        return <div className="p-6 text-sm text-slate-500">Loading partner dashboard...</div>;
    }

    return (
        <PartnerPageShell>
            <div className="grid gap-4 md:grid-cols-4">
                {[
                    ["Open positions", dashboard?.metrics.positions || 0],
                    ["Incoming applications", dashboard?.metrics.pending_applications || 0],
                    ["Assigned students", dashboard?.metrics.assigned_students || 0],
                    ["Pending report feedback", dashboard?.metrics.reports_pending_feedback || 0],
                ].map(([label, value]) => (
                    <PartnerCard key={label as string}>
                        <p className="text-sm text-slate-500">{label}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                    </PartnerCard>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Recent Applications</h2>
                    <div className="mt-4 space-y-3">
                        {dashboard?.recent_applications.length ? dashboard.recent_applications.map((application) => (
                            <div key={application.id} className="rounded-lg border border-slate-200 p-3">
                                <p className="font-medium text-slate-900">{application.student_details?.user?.username}</p>
                                <p className="text-sm text-slate-500">{application.position_details?.title}</p>
                                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{application.status}</span>
                            </div>
                        )) : <EmptyState message="No recent applications yet." />}
                    </div>
                </PartnerCard>

                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Placement Statistics</h2>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-emerald-50 p-4">
                            <p className="text-sm text-emerald-700">Confirmed</p>
                            <p className="text-2xl font-bold text-emerald-900">{dashboard?.placement_statistics.confirmed || 0}</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-4">
                            <p className="text-sm text-amber-700">Awaiting confirmation</p>
                            <p className="text-2xl font-bold text-amber-900">{dashboard?.placement_statistics.unconfirmed || 0}</p>
                        </div>
                    </div>
                </PartnerCard>
            </div>
        </PartnerPageShell>
    );
}
