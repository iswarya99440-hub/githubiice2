"use client";

import { EmptyState, PartnerCard, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "@/lib/redux/slices/NotificationsSlice";

export default function PartnerNotificationsPage() {
    const { data: notifications = [] } = useGetNotificationsQuery();
    const [markNotificationRead] = useMarkNotificationReadMutation();

    return (
        <PartnerPageShell>
            <PartnerCard>
                <h2 className="font-semibold text-slate-900">Notifications</h2>
                <div className="mt-4 space-y-3">
                    {notifications.length ? notifications.map((notification) => (
                        <div key={notification.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{notification.message}</p>
                                <p className="text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
                            </div>
                            {!notification.is_read && (
                                <button onClick={() => markNotificationRead(notification.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Mark read</button>
                            )}
                        </div>
                    )) : <EmptyState message="No notifications yet." />}
                </div>
            </PartnerCard>
        </PartnerPageShell>
    );
}
