"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import ConfirmActionMessage from "./confirmActionMessage";

//shape of user returned from API
//should be aligned with the Prisma select()
type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
};

type Props = {
    open: boolean; //controls modal visibility (True = open, False = closed)
    onClose: () => void;
    user: User | null; //stores the currently selected user from users table
    onSaved?: (updated: User) => void; //update UI without refresh
    onDeleted?: (userId: string) => void; //removes user from UI when deleted
};

//role options for accounts
//excluding admin
const roleOptions = [
    { value: "TECHNICIAN", label: "Technician" },
    { value: "STAFF", label: "Staff" },
    { value: "STUDENT", label: "Student" },
];

export default function EditUserModal({ open, onClose, user, onSaved, onDeleted }: Props) {
    //user inputs
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(roleOptions[0].value);

    //client states
    const [isEditMode, setIsEditMode] = useState(false); //toggle between view and edit mode
    const [saving, setSaving] = useState(false); //changes save button to saving state, preventing double saving
    const [isDeleting, setIsDeleting] = useState(false); //changes delete button to deleting state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); //shows delete confirmation dialog
    const [error, setError] = useState<string | null>(null);

    //only render modal when Open == true and User exists
    const canRender = open && user;

    //prefill when modal opens with selected user information
    useEffect(() => {
        if (!open || !user) return;
        setFirstName(user.first_name ?? "");
        setLastName(user.last_name ?? "");
        setEmail(user.email ?? "");
        setRole(user.role ?? roleOptions[0].value);
        setError(null);
        setIsEditMode(false); //reset to view mode when modal opens
    }, [open, user]);

    const emailLooksValid = useMemo(() => {
        return /^\S+@\S+\.\S+$/.test(email.trim());
    }, [email]);


    //function for when submitting form
    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);

        //calling user/[id] api 
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.trim(),
                    role,
                }),
            });

            //parse JSON
            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                const msg =
                    payload?.error ||
                    payload?.message ||
                    "Failed to update user. Check server logs.";
                throw new Error(msg);
            }

            //expects updated user from backend so parent table can update without refetch
            const updated: User = payload;
            onSaved?.(updated);
            onClose();
        } catch {
            setError("Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    //function for deleting user
    function handleDelete() {
        if (!user) return;
        setShowDeleteConfirm(true);
    }

    //function for confirming delete after user acknowledges warning
    async function confirmDelete() {
        if (!user) return;

        setIsDeleting(true);
        setError(null);

        //calling user/[id] api with DELETE method
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            //parse JSON
            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                const msg =
                    payload?.error ||
                    payload?.message ||
                    "Failed to delete user. Check server logs.";
                throw new Error(msg);
            }

            onSaved?.(user);
            onDeleted?.(user.id);
            onClose();
        } catch {
            setError("Something went wrong.");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    }

    //prevent render when closed
    if (!canRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <button
                aria-label="Close edit user modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
            />

            {/* modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-user-title"
                className="relative z-10 w-105 max-w-[92vw] rounded-lg bg-white shadow-xl"
            >
                <div className="flex items-center justify-between border-b px-4 py-3 bg-pink-50">
                    <h2 id="edit-user-title" className="text-base font-semibold">
                        Edit user
                    </h2>

                    <div className="flex items-center gap-2">
                        {!isEditMode && (
                            <button
                                type="button"
                                onClick={() => setIsEditMode(true)}
                                className="rounded-md bg-[#B80050] px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-900"
                            >
                                Edit
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md p-2 hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSave} className="px-4 py-4">
                    {/* first and last name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                First name
                            </label>
                            <input
                                disabled={!isEditMode}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="First name"
                                autoComplete="given-name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Last name
                            </label>
                            <input
                                disabled={!isEditMode}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Last name"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-[1fr_140px] gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                disabled={!isEditMode}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="name@shu.ac.uk"
                                autoComplete="email"
                                inputMode="email"
                            />
                            {!emailLooksValid && email.trim().length > 3 && isEditMode && (
                                <p className="mt-1 text-xs text-red-600">Email looks invalid.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                disabled={!isEditMode}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                {roleOptions.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            disabled={isDeleting || saving}
                        >
                            {isDeleting ? "Deleting..." : "Delete user"}
                        </button>

                        <div className="flex items-center gap-2">
                            {isEditMode && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditMode(false)}
                                        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="rounded-md bg-[#B80050] px-4 py-2 text-sm font-medium text-white hover:bg-pink-900 disabled:opacity-60"
                                        disabled={saving || !emailLooksValid}
                                    >
                                        {saving ? "Saving..." : "Save changes"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                        Editing user ID: <span className="font-medium">{user.id}</span>
                    </p>
                </form>

                <ConfirmActionMessage
                    open={showDeleteConfirm}
                    title="Delete User"
                    message={`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`}
                    actionType="delete"
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    isDangerous={true}
                    isLoading={isDeleting}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            </div>
        </div>
    );
}
