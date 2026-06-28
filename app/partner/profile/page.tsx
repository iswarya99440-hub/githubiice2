"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PartnerCard, PartnerField, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useGetMyOrganizationQuery, useUpdateMyOrganizationMutation } from "@/lib/redux/slices/InternshipsSlice";

export default function PartnerProfilePage() {
    const { data: organization } = useGetMyOrganizationQuery();
    const [updateOrganization] = useUpdateMyOrganizationMutation();
    const [form, setForm] = useState({
        name: "",
        address: "",
        contact_email: "",
        contact_phone: "",
        industry: "",
        website: "",
        description: "",
        capacity: "",
    });

    useEffect(() => {
        if (!organization) return;
        setForm({
            name: organization.name || "",
            address: organization.address || "",
            contact_email: organization.contact_email || "",
            contact_phone: organization.contact_phone || "",
            industry: organization.industry || "",
            website: organization.website || "",
            description: organization.description || "",
            capacity: String(organization.capacity || ""),
        });
    }, [organization]);

    const saveProfile = async () => {
        try {
            await updateOrganization({ ...form, capacity: Number(form.capacity || 0) }).unwrap();
            toast.success(organization ? "Organization profile saved." : "Organization profile created.");
        } catch (error: any) {
            toast.error(error?.data?.detail || "Could not save organization profile.");
        }
    };

    return (
        <PartnerPageShell>
            <PartnerCard>
                <h2 className="text-lg font-semibold text-slate-900">Organization Profile</h2>
                <p className="mt-1 text-sm text-slate-500">View profile information and edit official partner details.</p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <PartnerField label="Organization name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                    <PartnerField label="Contact email" value={form.contact_email} onChange={(value) => setForm({ ...form, contact_email: value })} />
                    <PartnerField label="Phone" value={form.contact_phone} onChange={(value) => setForm({ ...form, contact_phone: value })} />
                    <PartnerField label="Industry" value={form.industry} onChange={(value) => setForm({ ...form, industry: value })} />
                    <PartnerField label="Website" value={form.website} onChange={(value) => setForm({ ...form, website: value })} />
                    <PartnerField label="Intern capacity" type="number" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} />
                </div>

                <label className="mt-4 block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Address</span>
                    <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500" rows={3} />
                </label>
                <label className="mt-4 block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description</span>
                    <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500" rows={4} />
                </label>

                <button onClick={saveProfile} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Profile</button>
            </PartnerCard>
        </PartnerPageShell>
    );
}
