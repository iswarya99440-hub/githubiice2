"use client";

import { useState } from "react";
import { Send, UserRound } from "lucide-react";
import { useGetAllMessagesQuery, useGetCommunicationUsersQuery, useSendMessageMutation } from "@/lib/redux/slices/CommunicationSlices";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function StudentMessagesPage() {
    const { data: messages, isLoading } = useGetAllMessagesQuery({});
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
    const { data: users, isLoading: isUsersLoading } = useGetCommunicationUsersQuery({});

    const [receiver, setReceiver] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");

    const handleSend = async () => {
        if (!receiver) {
            toast.error("Select a recipient.");
            return;
        }
        if (!subject.trim()) {
            toast.error("Subject is required.");
            return;
        }
        if (!content.trim()) {
            toast.error("Message is required.");
            return;
        }
        try {
            await sendMessage({
                receiver: Number(receiver),
                subject,
                message_content: content,
            }).unwrap();
            toast.success("Message sent.");
            setSubject("");
            setContent("");
        } catch {
            toast.error("Failed to send message.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                    <p className="mt-1 text-sm text-gray-500">Communicate with supervisors and coordinators</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Receiver</label>
                                <select
                                    value={receiver}
                                    onChange={(e) => setReceiver(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="">
                                        {isUsersLoading ? "Loading users..." : "Select a recipient"}
                                    </option>
                                    {users?.map((user) => {
                                        const name =
                                            user.full_name?.trim() ||
                                            [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
                                            user.username ||
                                            user.email;
                                        return (
                                            <option key={user.id} value={user.id}>
                                                {name} ({user.email})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={isSending}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isSending ? "Sending..." : "Send Message"}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                        {isLoading && <p className="mt-4 text-sm text-gray-500">Loading messages...</p>}
                        {!isLoading && (!messages || messages.length === 0) && (
                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                No messages yet.
                            </div>
                        )}
                        {!isLoading && messages && messages.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {messages.map((message) => (
                                    <div key={message.id} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                                                <div className="mt-2 grid gap-1 text-xs text-gray-500 sm:grid-cols-2">
                                                    <p className="flex items-center gap-1">
                                                        <UserRound className="h-3 w-3" />
                                                        From: {formatUser(message.sender_details)}{message.sender_details?.role ? ` (${message.sender_details.role})` : ""}
                                                    </p>
                                                    <p>To: {formatUser(message.receiver_details)}{message.receiver_details?.role ? ` (${message.receiver_details.role})` : ""}</p>
                                                </div>
                                                <p className="mt-2 text-xs text-gray-600">{message.message_content}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatUser(user?: { full_name?: string; username?: string; email?: string }) {
    return user?.full_name || user?.username || user?.email || "Unknown user";
}
