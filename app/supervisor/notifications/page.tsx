"use client";

import { useMemo } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "@/lib/redux/slices/NotificationsSlice";
import { formatDistanceToNow } from "date-fns";

export default function SupervisorNotificationsPage() {
    const { data: notifications, isLoading } = useGetNotificationsQuery();
    const [markRead] = useMarkNotificationReadMutation();

    const unreadCount = useMemo(() => {
        if (!notifications) return 0;
        return notifications.filter((n) => !n.is_read).length;
    }, [notifications]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="mt-1 text-sm text-gray-500">{unreadCount} unread notifications</p>
                    </div>
                    <Bell className="h-6 w-6 text-gray-400" />
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {isLoading && <p className="text-sm text-gray-500">Loading notifications...</p>}
                    {!isLoading && (!notifications || notifications.length === 0) && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No notifications yet.
                        </div>
                    )}
                    {!isLoading && notifications && notifications.length > 0 && (
                        <div className="space-y-4">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`flex items-start justify-between rounded-xl border p-4 ${
                                        n.is_read ? "border-gray-200 bg-white" : "border-blue-200 bg-blue-50"
                                    }`}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{n.message}</p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!n.is_read && (
                                        <button
                                            onClick={() => markRead(n.id)}
                                            className="inline-flex items-center rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                                        >
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
