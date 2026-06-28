"use client";

import { useState } from "react";
import {
    useGetOrganizationsQuery,
    useCreateOrganizationMutation,
    useUpdateOrganizationMutation,
    useDeleteOrganizationMutation,
    useGetPositionsQuery,
    useCreatePositionMutation,
    useUpdatePositionMutation,
    useDeletePositionMutation,
} from "@/lib/redux/slices/InternshipsSlice";
import { useCreateUserMutation } from "@/lib/redux/slices/AuthSlice";
import { toast } from "sonner";

export default function AdminInstitutionsPartnersPage() {
    const { data: organizations, isLoading } = useGetOrganizationsQuery();
    const { data: positions } = useGetPositionsQuery();
    const [createOrganization, { isLoading: isSavingOrg }] = useCreateOrganizationMutation();
    const [createPartnerUser, { isLoading: isCreatingPartnerUser }] = useCreateUserMutation();
    const [updateOrganization, { isLoading: isUpdatingOrg }] = useUpdateOrganizationMutation();
    const [deleteOrganization] = useDeleteOrganizationMutation();
    const [createPosition, { isLoading: isSavingPos }] = useCreatePositionMutation();
    const [updatePosition, { isLoading: isUpdatingPos }] = useUpdatePositionMutation();
    const [deletePosition] = useDeletePositionMutation();

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [editOrgId, setEditOrgId] = useState<string | null>(null);
    const [editOrgName, setEditOrgName] = useState("");
    const [editOrgAddress, setEditOrgAddress] = useState("");
    const [editOrgEmail, setEditOrgEmail] = useState("");

    const [posTitle, setPosTitle] = useState("");
    const [posOrg, setPosOrg] = useState("");
    const [posDescription, setPosDescription] = useState("");
    const [posSkills, setPosSkills] = useState("");
    const [posCapacity, setPosCapacity] = useState("");
    const [editId, setEditId] = useState<string | null>(null);

    const [editTitle, setEditTitle] = useState("");
    const [editOrg, setEditOrg] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editSkills, setEditSkills] = useState("");
    const [editCapacity, setEditCapacity] = useState("");
    const [orgSearch, setOrgSearch] = useState("");
    const [posSearch, setPosSearch] = useState("");

    const handleCreate = async () => {
        if (!name || !address || !contactEmail) {
            toast.error("All fields are required.");
            return;
        }
        try {
            const partnerUser = await createPartnerUser({
                username: name,
                email: contactEmail,
                role: "Partner",
                status: "Active",
            }).unwrap();

            await createOrganization({
                name,
                address,
                contact_email: contactEmail,
                partner_user: partnerUser?.user_id,
            }).unwrap();
            if (partnerUser?.email_sent === false) {
                toast.warning("Partner organization added, but credential email failed. Check email settings.");
            } else {
                toast.success("Partner organization added. Login credentials sent by email.");
            }
            setName("");
            setAddress("");
            setContactEmail("");
        } catch {
            toast.error("Failed to add partner organization or send credentials.");
        }
    };

    const startOrgEdit = (org: any) => {
        setEditOrgId(org.id);
        setEditOrgName(org.name || "");
        setEditOrgAddress(org.address || "");
        setEditOrgEmail(org.contact_email || "");
    };

    const handleUpdateOrg = async () => {
        if (!editOrgId) return;
        try {
            await updateOrganization({
                id: editOrgId,
                data: { name: editOrgName, address: editOrgAddress, contact_email: editOrgEmail },
            }).unwrap();
            toast.success("Organization updated.");
            setEditOrgId(null);
        } catch {
            toast.error("Failed to update organization.");
        }
    };

    const handleDeleteOrg = async (id: string) => {
        try {
            await deleteOrganization(id).unwrap();
            toast.success("Organization deleted.");
        } catch {
            toast.error("Failed to delete organization.");
        }
    };

    const handleCreatePosition = async () => {
        if (!posTitle || !posOrg || !posDescription || !posCapacity) {
            toast.error("Title, organization, description, and capacity are required.");
            return;
        }
        try {
            await createPosition({
                title: posTitle,
                organization: posOrg,
                description: posDescription,
                required_skills: posSkills,
                capacity: Number(posCapacity),
            }).unwrap();
            toast.success("Internship position created.");
            setPosTitle("");
            setPosOrg("");
            setPosDescription("");
            setPosSkills("");
            setPosCapacity("");
        } catch {
            toast.error("Failed to create position.");
        }
    };

    const startEdit = (pos: any) => {
        setEditId(pos.id);
        setEditTitle(pos.title || "");
        setEditOrg(pos.organization || "");
        setEditDescription(pos.description || "");
        setEditSkills(pos.required_skills || "");
        setEditCapacity(String(pos.capacity ?? ""));
    };

    const handleUpdatePosition = async () => {
        if (!editId) return;
        try {
            await updatePosition({
                id: editId,
                data: {
                    title: editTitle,
                    organization: editOrg,
                    description: editDescription,
                    required_skills: editSkills,
                    capacity: Number(editCapacity),
                },
            }).unwrap();
            toast.success("Position updated.");
            setEditId(null);
        } catch {
            toast.error("Failed to update position.");
        }
    };

    const handleDeletePosition = async (id: string) => {
        try {
            await deletePosition(id).unwrap();
            toast.success("Position deleted.");
        } catch {
            toast.error("Failed to delete position.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Institutions & Partners</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage partner hospitals and internship positions</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">Add Institution</h2>
                            <div className="mt-4 space-y-4">
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Institution name"
                                />
                                <input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Address"
                                />
                                <input
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Contact email"
                                />
                                <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
                                    A Partner Organization login account will be created and credentials will be emailed to this address.
                                </p>
                                <button
                                    onClick={handleCreate}
                                    disabled={isSavingOrg || isCreatingPartnerUser}
                                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {isSavingOrg || isCreatingPartnerUser ? "Saving..." : "Add Partner Institution"}
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">Create Position</h2>
                            <div className="mt-4 space-y-4">
                                <input
                                    value={posTitle}
                                    onChange={(e) => setPosTitle(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Position title"
                                />
                                <select
                                    value={posOrg}
                                    onChange={(e) => setPosOrg(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Select organization</option>
                                    {organizations?.map((org) => (
                                        <option key={org.id} value={org.id}>
                                            {org.name}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    value={posDescription}
                                    onChange={(e) => setPosDescription(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Position description"
                                />
                                <input
                                    value={posSkills}
                                    onChange={(e) => setPosSkills(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Required skills (comma separated)"
                                />
                                <input
                                    value={posCapacity}
                                    onChange={(e) => setPosCapacity(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    placeholder="Capacity"
                                />
                                <button
                                    onClick={handleCreatePosition}
                                    disabled={isSavingPos}
                                    className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {isSavingPos ? "Saving..." : "Create Position"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">Institutions</h2>
                            <div className="mt-3">
                                <input
                                    value={orgSearch}
                                    onChange={(e) => setOrgSearch(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Search institutions"
                                />
                            </div>
                            {isLoading && <p className="mt-4 text-sm text-gray-500">Loading institutions...</p>}
                            {!isLoading && (!organizations || organizations.length === 0) && (
                                <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                    No institutions yet.
                                </div>
                            )}
                            {!isLoading && organizations && organizations.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {organizations
                                        .filter((org) =>
                                            orgSearch
                                                ? org.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
                                                  org.contact_email.toLowerCase().includes(orgSearch.toLowerCase())
                                                : true
                                        )
                                        .map((org) => (
                                        <div key={org.id} className="rounded-xl border border-gray-200 p-4">
                                            <p className="text-sm font-medium text-gray-900">{org.name}</p>
                                            <p className="text-xs text-gray-500">{org.address}</p>
                                            <p className="text-xs text-gray-500">{org.contact_email}</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <button
                                                    onClick={() => startOrgEdit(org)}
                                                    className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrg(org.id)}
                                                    className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {editOrgId && (
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900">Edit Institution</h2>
                                <div className="mt-4 space-y-4">
                                    <input
                                        value={editOrgName}
                                        onChange={(e) => setEditOrgName(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Institution name"
                                    />
                                    <input
                                        value={editOrgAddress}
                                        onChange={(e) => setEditOrgAddress(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Address"
                                    />
                                    <input
                                        value={editOrgEmail}
                                        onChange={(e) => setEditOrgEmail(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Contact email"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleUpdateOrg}
                                            disabled={isUpdatingOrg}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditOrgId(null)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">Internship Positions</h2>
                            <div className="mt-3">
                                <input
                                    value={posSearch}
                                    onChange={(e) => setPosSearch(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Search positions"
                                />
                            </div>
                            {!positions || positions.length === 0 ? (
                                <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                    No positions yet.
                                </div>
                            ) : (
                                <div className="mt-4 space-y-3">
                                    {positions
                                        .filter((pos) =>
                                            posSearch
                                                ? pos.title.toLowerCase().includes(posSearch.toLowerCase()) ||
                                                  pos.required_skills.toLowerCase().includes(posSearch.toLowerCase())
                                                : true
                                        )
                                        .map((pos) => (
                                        <div key={pos.id} className="rounded-xl border border-gray-200 p-4">
                                            <p className="text-sm font-medium text-gray-900">{pos.title}</p>
                                            <p className="text-xs text-gray-500">Organization: {pos.organization}</p>
                                            <p className="text-xs text-gray-500">Capacity: {pos.capacity}</p>
                                            <p className="text-xs text-gray-500">Skills: {pos.required_skills}</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <button
                                                    onClick={() => startEdit(pos)}
                                                    className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePosition(pos.id)}
                                                    className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {editId && (
                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900">Edit Position</h2>
                                <div className="mt-4 space-y-4">
                                    <input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Position title"
                                    />
                                    <select
                                        value={editOrg}
                                        onChange={(e) => setEditOrg(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    >
                                        <option value="">Select organization</option>
                                        {organizations?.map((org) => (
                                            <option key={org.id} value={org.id}>
                                                {org.name}
                                            </option>
                                        ))}
                                    </select>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Description"
                                    />
                                    <input
                                        value={editSkills}
                                        onChange={(e) => setEditSkills(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Required skills"
                                    />
                                    <input
                                        value={editCapacity}
                                        onChange={(e) => setEditCapacity(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        placeholder="Capacity"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleUpdatePosition}
                                            disabled={isUpdatingPos}
                                            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditId(null)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
