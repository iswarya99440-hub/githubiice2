"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import {
    useGetAllMessagesQuery,
    useGetCommunicationUsersQuery,
    useSendMessageMutation,
} from "@/lib/redux/slices/CommunicationSlices";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function AdminMessagesPage() {
    const { data: messages, isLoading } = useGetAllMessagesQuery({});
    const { data: users } = useGetCommunicationUsersQuery({});
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

    const [receiver, setReceiver] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const userOptions = useMemo(() => users || [], [users]);
    const filteredMessages = useMemo(() => {
        if (!messages) return [];
        if (!searchTerm) return messages;
        const term = searchTerm.toLowerCase();
        return messages.filter((message) =>
            message.subject.toLowerCase().includes(term) ||
            message.message_content.toLowerCase().includes(term) ||
            String(message.receiver).toLowerCase().includes(term)
        );
    }, [messages, searchTerm]);

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
                message_type: "SYSTEM",
                priority: "NORMAL",
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
                    <p className="mt-1 text-sm text-gray-500">Communicate with staff and stakeholders</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Recipient</label>
                                <select
                                    value={receiver}
                                    onChange={(e) => setReceiver(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Select a user</option>
                                    {userOptions.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name || user.username} ({user.email})
                                        </option>
                                    ))}
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
                                    rows={5}
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
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:max-w-sm"
                                placeholder="Search by subject, content, or receiver"
                            />
                            <span className="text-xs text-gray-500">
                                {filteredMessages.length} message{filteredMessages.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                        {isLoading && <p className="mt-4 text-sm text-gray-500">Loading messages...</p>}
                        {!isLoading && filteredMessages.length === 0 && (
                            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                No messages yet.
                            </div>
                        )}
                        {!isLoading && filteredMessages.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {filteredMessages.map((message) => (
                                    <div key={message.id} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                                                <p className="mt-1 text-xs text-gray-500">{message.message_content}</p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    To: {message.receiver_details?.full_name || message.receiver}
                                                </p>
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
