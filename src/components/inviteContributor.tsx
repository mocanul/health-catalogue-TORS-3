"use client";

import { useState } from "react";

type Contributor = {
    id: number;
    first_name: string;
    last_name: string;
    invite_id?: number;
};

type Props = {
    selectedContributors: Contributor[];
    onAdd: (user: Contributor) => void;
    onRemove: (id: number) => void;
    onClear: () => void;
};

export default function ContributorSearch({ selectedContributors, onAdd, onRemove, onClear }: Props) {
    const [contributorSearch, setContributorSearch] = useState("");
    const [contributorResults, setContributorResults] = useState<Contributor[]>([]);
    const [searching, setSearching] = useState(false);
    const [inviting, setInviting] = useState(false);

    const searchContributors = async (query: string) => {
        setContributorSearch(query);
        if (query.length < 2) {
            setContributorResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(`/api/booking/contributor/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setContributorResults(data);
        } catch {
            setContributorResults([]);
        } finally {
            setSearching(false);
        }
    };

    // Just adds to array — no API call yet
    const handleSelect = (user: Contributor) => {
        if (selectedContributors.find((c) => c.id === user.id)) return;
        onAdd(user);
        setContributorSearch("");
        setContributorResults([]);
    };

    // Sends invites for all selected contributors when Invite is clicked
    const handleInviteAll = async () => {
        setInviting(true);
        try {
            for (const user of selectedContributors) {
                if (user.invite_id) continue;
                const res = await fetch("/api/booking/contributor/invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sent_to: user.id }),
                });
                if (!res.ok) continue;
                const { invite_id } = await res.json();
                onAdd({ ...user, invite_id });
            }
            onClear();
        } catch {
            console.error("Failed to send invites");
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 border border-gray-200 rounded-lg p-3">

            {selectedContributors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedContributors.map((c) => (
                        <span
                            key={c.id}
                            className="flex items-center gap-1 bg-pink-50 text-pink-700 border border-pink-200 text-xs px-2 py-0.5 rounded-full"
                        >
                            {c.first_name} {c.last_name}
                            <button
                                onClick={() => onRemove(c.id)}
                                className="hover:text-red-500 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={contributorSearch}
                        onChange={(e) => searchContributors(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />

                    {(contributorResults.length > 0 || searching) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 max-h-36 overflow-y-auto">
                            {searching ? (
                                <p className="text-xs text-gray-400 text-center py-3">Searching...</p>
                            ) : (
                                contributorResults
                                    .filter((u) => !selectedContributors.find((c) => c.id === u.id))
                                    .map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleSelect(user)}
                                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors cursor-pointer"
                                        >
                                            {user.first_name} {user.last_name}
                                        </button>
                                    ))
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleInviteAll}
                    disabled={selectedContributors.length === 0 || inviting}
                    className="shrink-0 bg-[#B80050] hover:bg-[#9a0044] disabled:opacity-40 disabled:cursor-not-allowed
                    text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                    {inviting ? "Inviting..." : "Invite"}
                </button>
            </div>
        </div>
    );
}