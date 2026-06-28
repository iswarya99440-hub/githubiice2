"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PartnerCard, PartnerField, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useUpdateMyOrganizationMutation } from "@/lib/redux/slices/InternshipsSlice";

export default function PartnerSettingsPage() {
    const [updateOrganization] = useUpdateMyOrganizationMutation();
    const [settings, setSettings] = useState({ allow_email_notifications: true, default_report_deadline_days: "7" });

    const saveSettings = async () => {
        try {
            await updateOrganization({
                settings: {
                    ...settings,
                    default_report_deadline_days: Number(settings.default_report_deadline_days),
                },
            }).unwrap();
            toast.success("Settings saved.");
        } catch {
            toast.error("Could not save settings.");
        }
    };

    return (
        <PartnerPageShell>
            <PartnerCard>
                <h2 className="font-semibold text-slate-900">Organization Settings</h2>
                <div className="mt-4 max-w-xl space-y-4">
                    <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                        <span>Email notifications</span>
                        <input type="checkbox" checked={settings.allow_email_notifications} onChange={(event) => setSettings({ ...settings, allow_email_notifications: event.target.checked })} />
                    </label>
                    <PartnerField label="Default report deadline days" type="number" value={settings.default_report_deadline_days} onChange={(value) => setSettings({ ...settings, default_report_deadline_days: value })} />
                    <button onClick={saveSettings} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save Settings</button>
                </div>
            </PartnerCard>
        </PartnerPageShell>
    );
}
