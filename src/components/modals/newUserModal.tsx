"use client";

import { useState, useEffect } from "react";

type Issue = {
    message: string
    path?: (string | number)[]
}

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
    onSaved?: (user: User) => void;
};

export default function AddUser({ open, onClose, onSaved }: Props) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | string[] | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    // Reset fields when modal opens
    useEffect(() => {
        if (open) {
            setFirstName("");
            setLastName("");
            setEmail("");
            setRole("STUDENT");
            setError(null);
            setFieldErrors({});
        }
    }, [open]);

    if (!open) return null;

    async function handleSubmit() {
        try {
            setLoading(true);
            setError(null);
            setFieldErrors({});

            // Client-side validation: ensure required fields are not empty
            const localFieldErrors: Record<string, string[]> = {}
            if (!firstName.trim()) localFieldErrors.firstName = ["First name is required."]
            if (!lastName.trim()) localFieldErrors.lastName = ["Last name is required."]
            if (!email.trim()) localFieldErrors.email = ["Email is required."]

            if (Object.keys(localFieldErrors).length > 0) {
                setFieldErrors(localFieldErrors)
                setLoading(false)
                return
            }

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
                // Map issues to specific fields when possible
                if (data?.issues) {
                    const mapped: Record<string, string[]> = {}
                        ; (data.issues as Issue[]).forEach((iss) => {
                            const key = iss.path && iss.path[0] ? String(iss.path[0]) : '_'
                            if (!mapped[key]) mapped[key] = []
                            mapped[key].push(iss.message)
                        })

                    // If mapped to fields, show them; otherwise show top-level messages
                    const topLevel = mapped['_']
                    delete mapped['_']
                    if (Object.keys(mapped).length > 0) {
                        setFieldErrors(mapped)
                        return
                    }

                    if (topLevel) {
                        setError(topLevel)
                        return
                    }
                }

                if (data?.messages) {
                    setError(data.messages)
                    return
                }

                setError(data.error || "Failed to create user")
                return;
            }

            //reset fields when opening modal
            setFirstName("");
            setLastName("");
            setEmail("");
            setRole("STUDENT");
            setFieldErrors({});

            if (onSaved) {
                onSaved(data);
            }

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

            <div className="relative z-10 w-96 max-h-[80vh] bg-white rounded-xl shadow-lg border flex flex-col">

                <div className="px-5 py-4 border-b bg-pink-50 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Add New User</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="p-5 flex-1 overflow-auto">
                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="block text-xs font-medium mb-1">First Name</label>
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={`w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400 ${fieldErrors.firstName ? 'border-red-500 focus:ring-red-300' : ''}`}
                            />
                            <div className="mt-1 h-4">
                                {fieldErrors.firstName && (
                                    <p className="text-xs text-red-600">{fieldErrors.firstName[0]}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">Last Name</label>
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={`w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400 ${fieldErrors.lastName ? 'border-red-500 focus:ring-red-300' : ''}`}
                            />
                            <div className="mt-1 h-4">
                                {fieldErrors.lastName && (
                                    <p className="text-xs text-red-600">{fieldErrors.lastName[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2 grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400 ${fieldErrors.email ? 'border-red-500 focus:ring-red-300' : ''}`}
                                />
                                <div className="mt-1 h-4">
                                    {fieldErrors.email && (
                                        <p className="text-xs text-red-600">{fieldErrors.email[0]}</p>
                                    )}
                                </div>
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

                </div>

                {error && (
                    <div className="absolute left-5 right-5 bottom-20 z-30">
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 max-h-36 overflow-auto shadow">
                            {Array.isArray(error) ? (
                                <ul className="list-disc pl-5 space-y-1">
                                    {error.map((m, i) => (
                                        <li key={i}>{m}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{error}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="px-5 py-3 border-t flex justify-end gap-2">
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
    );
}
