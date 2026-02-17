"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

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
};

//role options for accounts
//excluding admin
const roleOptions = [
    { value: "TECHNICIAN", label: "Technician" },
    { value: "STAFF", label: "Lecturer" },
    { value: "STUDENT", label: "Student" },
];

export default function EditUserModal({ open, onClose, user, onSaved }: Props) {
    //user inputs
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(roleOptions[0].value);

    //client states
    const [saving, setSaving] = useState(false); //changes save button to saving state, preventing double saving
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
    }, [open, user]);

    const emailLooksValid = useMemo(() => {
        //simple client validation (server must still validate)
        /*
        *TODO: Add zod validation
        *
        */
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
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 id="edit-user-title" className="text-base font-semibold">
                        Edit user
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="px-4 py-4">
                    {/* first and last name */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                First name
                            </label>
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                placeholder="First name"
                                autoComplete="given-name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Last name
                            </label>
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                placeholder="name@shu.ac.uk"
                                autoComplete="email"
                                inputMode="email"
                            />
                            {!emailLooksValid && email.trim().length > 3 && (
                                <p className="mt-1 text-xs text-red-600">Email looks invalid.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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

                    <div className="mt-5 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
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
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                        Editing user ID: <span className="font-medium">{user.id}</span>
                    </p>
                </form>
            </div>
        </div>
    );
}
