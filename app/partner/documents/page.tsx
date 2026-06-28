"use client";

import { toast } from "sonner";
import { EmptyState, PartnerCard, PartnerPageShell } from "@/components/partner/PartnerUi";
import { useCreateDocumentMutation, useGetDocumentsQuery } from "@/lib/redux/slices/DocumentsSlice";

export default function PartnerDocumentsPage() {
    const { data: documents = [] } = useGetDocumentsQuery();
    const [createDocument] = useCreateDocumentMutation();

    const submitDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("name", file.name);
        formData.append("file", file);
        try {
            await createDocument(formData).unwrap();
            toast.success("Document uploaded.");
        } catch {
            toast.error("Could not upload document.");
        }
    };

    return (
        <PartnerPageShell>
            <PartnerCard>
                <h2 className="font-semibold text-slate-900">Agreements / Contracts & Shared Documents</h2>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    Upload signed agreements, contracts, templates, and shared internship documents
                    <input type="file" className="hidden" onChange={submitDocument} />
                </label>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {documents.length ? documents.map((document) => (
                        <a key={document.id} href={document.file} target="_blank" className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                            <p className="font-semibold text-slate-900">{document.name}</p>
                            <p className="text-xs text-slate-500">{new Date(document.uploaded_at).toLocaleString()}</p>
                        </a>
                    )) : <EmptyState message="No partner documents uploaded yet." />}
                </div>
            </PartnerCard>
        </PartnerPageShell>
    );
}
