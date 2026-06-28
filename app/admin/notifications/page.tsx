"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCircle2, Plus } from "lucide-react";
import {
    useCreateNotificationMutation,
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
} from "@/lib/redux/slices/NotificationsSlice";
import { useGetAllUsersQuery } from "@/lib/redux/slices/AuthSlice";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
    const { data: notifications, isLoading } = useGetNotificationsQuery();
    const { data: users } = useGetAllUsersQuery({});
    const [markRead] = useMarkNotificationReadMutation();
    const [createNotification, { isLoading: isCreating }] = useCreateNotificationMutation();

    const [showCreate, setShowCreate] = useState(false);
    const [userId, setUserId] = useState("");
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const userOptions = useMemo(() => Array.isArray(users) ? users : [], [users]);

    const unreadCount = useMemo(() => {
        if (!notifications) return 0;
        return notifications.filter((n) => !n.is_read).length;
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        if (!notifications) return [];
        if (!searchTerm) return notifications;
        const term = searchTerm.toLowerCase();
        return notifications.filter((n) =>
            n.message.toLowerCase().includes(term) ||
            String(n.user).toLowerCase().includes(term)
        );
    }, [notifications, searchTerm]);

    const handleCreate = async () => {
        if (!userId) {
            toast.error("Select a recipient.");
            return;
        }
        if (!message.trim()) {
            toast.error("Message is required.");
            return;
        }
        try {
            await createNotification({ user: Number(userId), message }).unwrap();
            toast.success("Notification sent.");
            setMessage("");
            setUserId("");
            setShowCreate(false);
        } catch {
            toast.error("Failed to send notification.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="mt-1 text-sm text-gray-500">{unreadCount} unread notifications</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Notification
                    </button>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:max-w-sm"
                            placeholder="Search by message or user ID"
                        />
                        <span className="text-xs text-gray-500">
                            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    {isLoading && <p className="text-sm text-gray-500">Loading notifications...</p>}
                    {!isLoading && filteredNotifications.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No notifications yet.
                        </div>
                    )}
                    {!isLoading && filteredNotifications.length > 0 && (
                        <div className="space-y-4">
                            {filteredNotifications.map((n) => (
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
                                        <p className="mt-1 text-xs text-gray-400">User ID: {n.user}</p>
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

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Send Notification</h2>
                            <button onClick={() => setShowCreate(false)} className="rounded-lg p-2 hover:bg-gray-100">
                                <Bell className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Recipient</label>
                                <select
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Select user</option>
                                    {userOptions.map((u: any) => (
                                        <option key={u.id} value={u.id}>
                                            {u.username} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isCreating}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isCreating ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
