"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PartnerCard, PartnerField, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useGetAllMessagesQuery, useGetCommunicationUsersQuery, useSendMessageMutation } from "@/lib/redux/slices/CommunicationSlices";

export default function PartnerMessagesPage() {
    const { data: messages = [] } = useGetAllMessagesQuery({});
    const { data: users = [] } = useGetCommunicationUsersQuery({});
    const [sendMessage] = useSendMessageMutation();
    const [form, setForm] = useState({ receiver: "", subject: "", message_content: "" });

    const submitMessage = async () => {
        if (!form.receiver || !form.subject || !form.message_content) {
            toast.error("Select a recipient and complete the message.");
            return;
        }
        try {
            await sendMessage({
                receiver: Number(form.receiver),
                subject: form.subject,
                message_content: form.message_content,
                message_type: "general",
                priority: "medium",
            }).unwrap();
            setForm({ receiver: "", subject: "", message_content: "" });
            toast.success("Message sent.");
        } catch {
            toast.error("Could not send message.");
        }
    };

    return (
        <PartnerPageShell>
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">New Message</h2>
                    <div className="mt-4 space-y-3">
                        <select value={form.receiver} onChange={(event) => setForm({ ...form, receiver: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option value="">Select recipient</option>
                            {users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.username} - {user.email}</option>)}
                        </select>
                        <PartnerField label="Subject" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} />
                        <textarea placeholder="Message" value={form.message_content} onChange={(event) => setForm({ ...form, message_content: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={5} />
                        <button onClick={submitMessage} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Send Message</button>
                    </div>
                </PartnerCard>

                <PartnerCard>
                    <h2 className="font-semibold text-slate-900">Messages</h2>
                    <div className="mt-4 space-y-3">
                        {messages.length ? messages.map((message) => (
                            <div key={message.id} className="rounded-lg border border-slate-200 p-4">
                                <p className="font-semibold text-slate-900">{message.subject || "No subject"}</p>
                                <p className="text-sm text-slate-500">From {message.sender_details?.full_name || message.sender_details?.username}</p>
                                <p className="mt-2 text-sm text-slate-600">{message.message_content}</p>
                            </div>
                        )) : <EmptyState message="No messages yet." />}
                    </div>
                </PartnerCard>
            </div>
        </PartnerPageShell>
    );
}
