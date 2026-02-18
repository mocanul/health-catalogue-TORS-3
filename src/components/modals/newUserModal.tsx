"use client";

import { useState, useEffect } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function AddUser({ open, onClose }: Props) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset fields when modal opens
    useEffect(() => {
        if (open) {
            setFirstName("");
            setLastName("");
            setEmail("");
            setRole("STUDENT");
            setError(null);
        }
    }, [open]);

    if (!open) return null;

    async function handleSubmit() {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/api/admin/add-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    role,
                    password: "temporary",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create user");
                return;
            }

            //reset fields when opening modal
            setFirstName("");
            setLastName("");
            setEmail("");
            setRole("STUDENT");

            onClose();
        } catch {
            setError("Server error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="relative z-10 w-105 h-70 bg-white rounded-xl shadow-lg border flex flex-col">

                <div className="px-5 py-4 border-b bg-pink-50 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Add New User</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-3">

                        <div>
                            <label className="block text-xs font-medium mb-1">First Name</label>
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">Last Name</label>
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400"
                            />
                        </div>

                        <div className="col-span-2 grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400 bg-white"
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="TECHNICIAN">Technician</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    {error && (
                        <p className="text-red-600 text-sm mt-2">{error}</p>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 text-sm border rounded-md"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-3 py-1.5 text-sm bg-[#B80050] text-white rounded-md hover:bg-pink-900 transition disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
