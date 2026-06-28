"use client";

import React, { useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, X, ChevronDown, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import {
    useCreateUserMutation,
    useDeleteUserMutation,
    useGetAllUsersQuery,
    useToggleUserActiveMutation,
    useUpdateUserMutation,
} from "@/lib/redux/slices/AuthSlice";
import { toast } from "sonner";

const roles = ["All Roles", "Admin", "Coordinator", "Supervisor", "Student", "Partner"];

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    is_active?: boolean;
}

interface NewUser {
    username: string;
    email: string;
    role: string;
    status: string;
}

const normalizeUsers = (data: unknown): User[] => {
    if (!Array.isArray(data)) return [];
    return data.map((userRaw) => {
        const user = userRaw as Record<string, unknown>;
        const status = typeof user.status === "string"
            ? user.status
            : user.is_active === true
                ? "Active"
                : "Inactive";
        return {
            id: user.id as number,
            username: String(user.username || ""),
            email: String(user.email || ""),
            role: String(user.role || ""),
            status,
            is_active: Boolean(user.is_active),
        };
    });
};

export default function UserManagementDashboard() {
    const { data: usersData, isLoading, isError, refetch } = useGetAllUsersQuery({});
    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [toggleUserActive, { isLoading: isToggling }] = useToggleUserActiveMutation();

    const users = useMemo(() => normalizeUsers(usersData), [usersData]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("All Roles");
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const usersPerPage = 8;

    const [newUser, setNewUser] = useState<NewUser>({
        username: "",
        email: "",
        role: "Student",
        status: "Active",
    });

    const filteredUsers = useMemo(() => {
        let filtered = [...users];

        if (searchQuery) {
            filtered = filtered.filter((user) =>
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedRole !== "All Roles") {
            filtered = filtered.filter((user) => user.role === selectedRole);
        }

        return filtered;
    }, [users, searchQuery, selectedRole]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const handleAddUser = async () => {
        if (!newUser.username.trim() || !newUser.email.trim()) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            await createUser({
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
            }).unwrap();

            toast.success("User created. Login credentials sent by email.");
            setShowAddUserModal(false);
            setNewUser({
                username: "",
                email: "",
                role: "Student",
                status: "Active",
            });
            refetch();
        } catch (error) {
            toast.error("Failed to create user.");
            console.error("Create user error", error);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(userId).unwrap();
                toast.success("User deleted successfully");
                refetch();
            } catch (error) {
                toast.error("Failed to delete user.");
                console.error("Delete user error", error);
            }
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            await updateUser({
                id: editingUser.id,
                data: {
                    username: editingUser.username,
                    email: editingUser.email,
                    role: editingUser.role,
                },
            }).unwrap();
            toast.success("User updated successfully");
            setShowEditModal(false);
            setEditingUser(null);
            refetch();
        } catch (error) {
            toast.error("Failed to update user.");
            console.error("Update user error", error);
        }
    };

    const handleToggleUserStatus = async (userId: number) => {
        try {
            await toggleUserActive(userId).unwrap();
            await refetch();
            toast.success("User status updated");
        } catch (error) {
            toast.error("Failed to update user status.");
            console.error("Toggle user error", error);
        }
    };

    const getStatusBadge = (status: string): string => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all duration-200";
        return status === "Active"
            ? `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`
            : `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`;
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    if (isError) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Error loading users</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                        <p className="text-sm text-gray-500">Manage system access for students, supervisors, and coordinators</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name or email"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="bg-indigo-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-800 transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Add User
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="relative">
                        <button
                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                            className="flex items-center justify-between w-52 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        >
                            <span className="text-gray-700">{selectedRole}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {showRoleDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setShowRoleDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                            selectedRole === role ? "bg-indigo-50 text-indigo-900" : "text-gray-700"
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                </div>
            </div>

            <div className="px-4 pb-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-6 py-4">
                        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                            <div className="col-span-3">User</div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2">Role</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Actions</div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{user.username}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-3">
                                            <a href={`mailto:${user.email}`} className="text-sm text-blue-600 hover:text-blue-800 underline">
                                                {user.email}
                                            </a>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-900">{user.role}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span
                                                className={getStatusBadge(user.status || "Inactive")}
                                                onClick={() => handleToggleUserStatus(user.id)}
                                                title="Click to toggle status"
                                            >
                                                {user.status || "Inactive"}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setShowEditModal(true);
                                                    }}
                                                    disabled={isUpdating}
                                                    className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
                                                    title="Edit user"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={isDeleting}
                                                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleUserStatus(user.id)}
                                                    disabled={isToggling}
                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                                                    title="Toggle user status"
                                                >
                                                    {isToggling ? "Toggling..." : "Toggle Status"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-500">No users found matching your criteria</div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                <button
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            currentPage === pageNum ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
                            <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Enter full name"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Enter email address"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Coordinator">Coordinator</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Partner">Partner Organization</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={newUser.status}
                                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={isCreating}
                                className="flex-1 px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50"
                            >
                                {isCreating ? "Creating..." : "Add User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Enter full name"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Enter email address"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Coordinator">Coordinator</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Partner">Partner Organization</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50"
                            >
                                {isUpdating ? "Updating..." : "Update User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRoleDropdown && (
                <div className="fixed inset-0 z-5" onClick={() => setShowRoleDropdown(false)}></div>
            )}
        </div>
    );
}
