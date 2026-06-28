"use client";

import { useGetUsersByRoleQuery } from "@/lib/redux/slices/AuthSlice";

export default function CoordinatorSupervisorsPage() {
    const { data: supervisors, isLoading } = useGetUsersByRoleQuery("Supervisor");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Supervisors</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage supervisor accounts</p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {isLoading && <p className="text-sm text-gray-500">Loading supervisors...</p>}
                    {!isLoading && (!supervisors || supervisors.length === 0) && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No supervisors found.
                        </div>
                    )}
                    {!isLoading && supervisors && supervisors.length > 0 && (
                        <div className="space-y-3">
                            {supervisors.map((sup: any) => (
                                <div key={sup.id} className="rounded-xl border border-gray-200 p-4">
                                    <p className="text-sm font-medium text-gray-900">{sup.username}</p>
                                    <p className="text-xs text-gray-500">{sup.email}</p>
                                    <p className="text-xs text-gray-500">Status: {sup.status}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
