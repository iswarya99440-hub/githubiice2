"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Plus, Trash2, Upload } from "lucide-react";
import { useGetDocumentsQuery, useCreateDocumentMutation, useDeleteDocumentMutation } from "@/lib/redux/slices/DocumentsSlice";
import { toast } from "sonner";

export default function StudentDocumentsPage() {
    const { data: documents, isLoading } = useGetDocumentsQuery();
    const [createDocument, { isLoading: isUploading }] = useCreateDocumentMutation();
    const [deleteDocument] = useDeleteDocumentMutation();

    const [showUpload, setShowUpload] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState("");

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

    const normalizedDocs = useMemo(() => {
        if (!documents) return [];
        return documents.map((doc) => ({
            ...doc,
            fileUrl: doc.file.startsWith("http") ? doc.file : `${apiBase}${doc.file.startsWith("/") ? "" : "/"}${doc.file}`,
        }));
    }, [documents, apiBase]);

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", name || file.name);
            await createDocument(formData).unwrap();
            toast.success("Document uploaded.");
            setShowUpload(false);
            setFile(null);
            setName("");
        } catch {
            toast.error("Failed to upload document.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
                        <p className="mt-1 text-sm text-gray-500">Upload and manage your internship documents</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Document
                    </button>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {isLoading && <p className="text-sm text-gray-500">Loading documents...</p>}
                    {!isLoading && normalizedDocs.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                            No documents uploaded yet.
                        </div>
                    )}
                    {!isLoading && normalizedDocs.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Uploaded</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {normalizedDocs.map((doc) => (
                                        <tr key={doc.id} className="bg-white">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <div className="flex justify-end gap-2">
                                                    <a
                                                        href={doc.fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Download className="mr-1 h-3 w-3" />
                                                        Download
                                                    </a>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await deleteDocument(doc.id).unwrap();
                                                                toast.success("Document deleted.");
                                                            } catch {
                                                                toast.error("Failed to delete document.");
                                                            }
                                                        }}
                                                        className="inline-flex items-center rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-1 h-3 w-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
                            <button onClick={() => setShowUpload(false)} className="rounded-lg p-2 hover:bg-gray-100">
                                <Upload className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Document Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="e.g. Weekly report"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowUpload(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isUploading ? "Uploading..." : "Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
