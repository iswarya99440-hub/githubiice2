"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { EmptyState, PartnerCard, PartnerField, PartnerPageShell } from "@/components/partner/PartnerUi";
import {
    useCreatePartnerSupervisorMutation,
    useGetMyOrganizationQuery,
    useGetPartnerSupervisorsQuery,
} from "@/lib/redux/slices/InternshipsSlice";

export default function PartnerSupervisorsPage() {
    const { status } = useSession();
    const skipQueries = status !== "authenticated";
    const { data: supervisors = [] } = useGetPartnerSupervisorsQuery(undefined, { skip: skipQueries });
    const { data: organization } = useGetMyOrganizationQuery(undefined, { skip: skipQueries });
    const [createSupervisor, { isLoading }] = useCreatePartnerSupervisorMutation();
    const [form, setForm] = useState({
        username: "",
        email: "",
        position: "Internship Supervisor",
        phone: "",
    });
    const hasOrganization = Boolean(organization?.id);

    const submitSupervisor = async () => {
        if (!hasOrganization) {
            toast.error("Create your organization profile before adding supervisors.");
            return;
        }

        if (!form.username.trim() || !form.email.trim() || !form.position.trim()) {
            toast.error("Supervisor name, email, and position are required.");
            return;
        }

        try {
            const response = await createSupervisor(form).unwrap();
            if (response.email_sent) {
                toast.success("Supervisor added. Login credentials were emailed.");
            } else {
                toast.warning("Supervisor added, but the credential email failed. Check backend email settings.");
            }
            setForm({ username: "", email: "", position: "Internship Supervisor", phone: "" });
        } catch (error: any) {
            const message = error?.data?.detail || "Could not add supervisor.";
            toast.error(message);
            console.error("Create supervisor error", error);
        }
    };

    return (
        <PartnerPageShell>
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <PartnerCard>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Supervisor onboarding</p>
                        <h2 className="mt-1 text-lg font-semibold text-slate-900">Add Supervisor</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Create a supervisor account for {organization?.name || "your organization"}. The supervisor will receive login credentials by email.
                        </p>
                    </div>

                    <div className="mt-5 space-y-4">
                        <PartnerField label="Full name" value={form.username} onChange={(value) => setForm({ ...form, username: value })} placeholder="e.g. Dr. Alice Ndayisaba" />
                        <PartnerField label="Email address" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="supervisor@organization.com" />
                        <PartnerField label="Position / title" value={form.position} onChange={(value) => setForm({ ...form, position: value })} placeholder="Clinical Supervisor" />
                        <PartnerField label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} placeholder="+250..." />

                        <div className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                            The account will be linked to <span className="font-semibold text-slate-900">{organization?.name || "this partner organization"}</span>, activated immediately, and emailed a temporary password.
                        </div>

                        {!hasOrganization && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                Your partner organization profile has not been created yet. Complete it in{" "}
                                <Link href="/partner/profile" className="font-semibold underline underline-offset-2">
                                    Partner Profile
                                </Link>{" "}
                                before adding supervisors.
                            </div>
                        )}

                        <button
                            onClick={submitSupervisor}
                            disabled={isLoading || !hasOrganization}
                            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {isLoading ? "Creating supervisor..." : "Create Supervisor & Email Credentials"}
                        </button>
                    </div>
                </PartnerCard>

                <PartnerCard>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">My Supervisors</h2>
                            <p className="mt-1 text-sm text-slate-500">Supervisors assigned to your organization and available for intern allocation.</p>
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                            {supervisors.length} total
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {supervisors.length ? supervisors.map((supervisor) => (
                            <div key={supervisor.id} className="rounded-lg border border-slate-200 p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{supervisor.user?.username}</p>
                                        <p className="text-sm text-slate-500">{supervisor.user?.email}</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-700">{supervisor.position || "Supervisor"}</p>
                                <p className="text-xs text-slate-500">{supervisor.organization}</p>
                            </div>
                        )) : <EmptyState message="No supervisors are linked to this organization yet." />}
                    </div>
                </PartnerCard>
            </div>
        </PartnerPageShell>
    );
}
