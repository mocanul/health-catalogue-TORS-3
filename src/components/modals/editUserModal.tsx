"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    user: User | null; // selected user
    onSaved?: (updated: User) => void; // optional: update UI without refetch
};

const ROLE_OPTIONS = [
    { value: "ADMIN", label: "Admin" },
    { value: "TECHNICIAN", label: "Technician" },
    { value: "LECTURER", label: "Lecturer" },
    { value: "STUDENT", label: "Student" },
];

export default function EditUserModal({ open, onClose, user, onSaved }: Props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(ROLE_OPTIONS[0].value);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canRender = open && user;

    // Prefill whenever the selected user changes / modal opens
    useEffect(() => {
        if (!open || !user) return;
        setFirstName(user.first_name ?? "");
        setLastName(user.last_name ?? "");
        setEmail(user.email ?? "");
        setRole(user.role ?? ROLE_OPTIONS[0].value);
        setError(null);
    }, [open, user]);

    // Close on ESC
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    const emailLooksValid = useMemo(() => {
        // simple client validation (server must still validate)
        return /^\S+@\S+\.\S+$/.test(email.trim());
    }, [email]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);

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

            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                const msg =
                    payload?.error ||
                    payload?.message ||
                    "Failed to update user. Check server logs.";
                throw new Error(msg);
            }

            // Expecting the updated user back
            const updated: User = payload;
            onSaved?.(updated);
            onClose();
        } catch {
            setError("Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

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
                    {/* First + Last name */}
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

                    {/* Email + Role (role smaller, on right) */}
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
                                {ROLE_OPTIONS.map((r) => (
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
