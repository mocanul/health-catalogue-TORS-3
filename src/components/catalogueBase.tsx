"use client";

import { useState, useEffect } from "react";

type Equipment = {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    quantity_available: number;
    is_active: boolean;
    created_at: string;
    fixed_room_id: number | null;
};

const TABS = [
    "General Equipment",
    "Airway & Theatre",
    "Imaging & Diagnostics",
    "Emergency & Rehab",
    "Specialist Care",
    "Favourites",
] as const;

const TAB_CATEGORIES: Record<string, string[]> = {
    "General Equipment": ["Medical Equipment", "Wound Care"],
    "Airway & Theatre": ["Airway & Respiratory Care", "Theatre & Perioperative (ODP)"],
    "Imaging & Diagnostics": ["Imaging & Radiotherapy", "Monitoring & Diagnostics"],
    "Emergency & Rehab": ["Emergency & Pre-hospital (Paramedic)", "MSK", "Patient Manoeuvering"],
    "Specialist Care": ["Midwifery", "Mental Health", "Dietetics", "Nutrition & Anthropometry"],
    "Favourites": [],
};

export default function Catalogue() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("General Equipment");
    const [search, setSearch] = useState("");
    const [favourites, setFavourites] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetch("/api/equipment")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch equipment");
                return res.json();
            })
            .then((data) => setEquipment(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = equipment.filter((item) => {
        if (activeTab === "Favourites") return favourites.has(item.id);
        const matchesTab = TAB_CATEGORIES[activeTab]?.includes(item.category ?? "");
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const toggleFavourite = (id: number) => {
        setFavourites((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="flex justify-center px-6 py-8">
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">

                {/* Tab Bar */}
                <div className="border-b border-gray-200 px-4 flex items-center justify-between">
                    <div className="flex items-center overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${activeTab === tab
                                    ? "border-[#B80050] text-[#B80050] font-semibold"
                                    : "border-transparent text-gray-500 hover:text-gray-800"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Right controls TODO: Filtering functions */}
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                        <button className="px-2.5 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">
                            Filter by
                        </button>

                        {/* Search box */}
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-2.5 py-1 text-xs outline-none w-28"
                            />
                            <div className="px-2 text-gray-400">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Loading equipment...</div>
                ) : error ? (
                    <div className="py-16 text-center text-red-400 text-sm">{error}</div>
                ) : (
                    <>
                        {/* Header row */}
                        <div className="grid grid-cols-[2rem_3.5rem_2fr_1fr_1fr_1fr] gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50">
                            <div />
                            <div />
                            <p className="text-xs font-medium text-gray-500">Item</p>
                            <p className="text-xs font-medium text-gray-500">Category</p>
                            <p className="text-xs font-medium text-gray-500">Availability</p>
                            <div />
                        </div>

                        <div className="divide-y divide-gray-100 max-h-130 overflow-y-auto">
                            {filtered.length > 0 ? (
                                filtered.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-[2rem_3.5rem_2fr_1fr_1fr_1fr] gap-4 items-center px-4 py-3 rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all bg-white"
                                    >
                                        {/* Favourite Star */}
                                        <button
                                            onClick={() => toggleFavourite(item.id)}
                                            className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                                        >
                                            <svg
                                                width="16" height="16" viewBox="0 0 24 24"
                                                fill={favourites.has(item.id) ? "#facc15" : "none"}
                                                stroke={favourites.has(item.id) ? "#facc15" : "currentColor"}
                                                strokeWidth="1.5"
                                            >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        </button>

                                        {/* Image */}
                                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                            </svg>
                                        </div>

                                        {/* Name */}
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>

                                        {/* Category */}
                                        <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full truncate w-fit">
                                            {item.category ?? "—"}
                                        </span>

                                        {/* Item availability */}
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${item.quantity_available > 0
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-red-50 text-red-500 border border-red-200"
                                            }`}>
                                            {item.quantity_available > 0 ? "Available" : "Unavailable"}
                                        </span>

                                        {/* Add item to basket button TODO: to be changed to only show whilst booking mode is active */}
                                        <button className="bg-[#B80050] hover:bg-[#9a0044] text-white text-xs font-medium px-4 py-1.5 rounded transition-colors cursor-pointer justify-self-end">
                                            Add Item
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 text-center text-gray-400 text-sm">
                                    {activeTab === "Favourites"
                                        ? "Star an item to add it here."
                                        : "No items found."}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}