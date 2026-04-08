"use client";

import { useState, useEffect } from "react";
import ErrorModal from "./modals/errorMessage";

type Room = {
    id: number;
    name: string;
    type: string | null;
};

type BookingItem = {
    id: number;
    name: string;
    fixed_room_id: number | null;
    quantity: number;
};

type SelectedBookingSlot = {
    bookingDate: string;
    roomName: string;
    startTime: string;
    endTime: string;
};

type Props = {
    selectedRoom?: Room | null;
    selectedSlot?: SelectedBookingSlot | null;
    isBooking?: boolean;
    onAddItem?: (item: BookingItem) => void;
};

type Equipment = {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    quantity_available: number;
    is_active: boolean;
    created_at: string;
    fixed_room_id: number | null;
    room: { name: string } | null;
};

type RecentBooking = {
    id: number;
    bookingDate: string;
    roomName: string;
    items: BookingItem[];
};

const TABS = [
    "General Equipment",
    "Airway & Theatre",
    "Imaging & Diagnostics",
    "Emergency & Rehab",
    "Specialist Care",
    "Recents",
    "Favourites",
] as const;

const TAB_CATEGORIES: Record<string, string[]> = {
    "General Equipment": ["Medical Equipment", "Wound Care"],
    "Airway & Theatre": ["Airway & Respiratory Care", "Theatre & Perioperative (ODP)"],
    "Imaging & Diagnostics": ["Imaging & Radiotherapy", "Monitoring & Diagnostics"],
    "Emergency & Rehab": ["Emergency & Pre-hospital (Paramedic)", "MSK", "Patient Manoeuvering"],
    "Specialist Care": ["Midwifery", "Mental Health", "Dietetics", "Nutrition & Anthropometry"],
    "Recents": [],
    "Favourites": [],
};

export default function Catalogue({ selectedRoom: _selectedRoom, selectedSlot, isBooking, onAddItem }: Props) {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

    useEffect(() => {
        fetch("/api/equipment/favourites")
            .then((res) => {
                if (!res.ok) return;
                return res.json();
            })
            .then((ids: number[]) => {
                if (ids) setFavourites(new Set(ids));
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        fetch("/api/equipment/recents")
            .then((res) => {
                if (!res.ok) return;
                return res.json();
            })
            .then((data: RecentBooking[]) => {
                if (data) setRecentBookings(data);
            })
            .catch(() => { });
    }, []);

    const filtered = equipment.filter((item) => {
        if (activeTab === "Favourites") return favourites.has(item.id);
        const matchesTab = TAB_CATEGORIES[activeTab]?.includes(item.category ?? "");
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const recentSearch = search.trim().toLowerCase();
    const filteredRecentBookings = recentBookings
        .map((booking) => ({
            ...booking,
            items: booking.items.filter((item) => item.name.toLowerCase().includes(recentSearch)),
        }))
        .filter((booking) => booking.items.length > 0 || recentSearch.length === 0);

    const toggleFavourite = async (id: number) => {
        setFavourites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); } else { next.add(id); }
            return next;
        });

        try {
            const res = await fetch("/api/equipment/favourites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipment_id: id }),
            });

            if (!res.ok) throw new Error();

            const { favourited } = await res.json();

            setFavourites((prev) => {
                const next = new Set(prev);
                if (favourited) { next.add(id); } else { next.delete(id); }
                return next;
            });
        } catch {
            setFavourites((prev) => {
                const next = new Set(prev);
                if (next.has(id)) { next.delete(id); } else { next.add(id); }
                return next;
            });
        }
    };

    const handleAddClick = (item: Equipment) => {
        const hasBookingSlot =
            selectedSlot &&
            selectedSlot.roomName &&
            selectedSlot.bookingDate &&
            selectedSlot.startTime &&
            selectedSlot.endTime;

        if (!hasBookingSlot) {
            setErrorMessage("Please select room, date and time before adding items to booking.");
            return;
        }

        if (item.fixed_room_id !== null) {
            const fixedRoomName = item.room?.name ?? "a specific room";
            if (selectedSlot.roomName !== fixedRoomName) {
                setErrorMessage(`This item can only be used in ${fixedRoomName}. Please select that room to book this item.`);
                return;
            }
        }

        onAddItem?.({
            id: item.id,
            name: item.name,
            quantity: 1,
            fixed_room_id: item.fixed_room_id,
        });
    };

    const handleAddRecentClick = (item: BookingItem) => {
        handleAddClick({
            id: item.id,
            name: item.name,
            description: null,
            category: null,
            quantity_available: 1,
            is_active: true,
            created_at: "",
            fixed_room_id: item.fixed_room_id,
            room: null,
        });
    };

    const formatRecentBookingDate = (value: string) =>
        new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(value));

    return (
        <div className="flex justify-center px-6 py-8 w-[75%]">
            <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">

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

                    <div className="flex items-center gap-2 ml-2 shrink-0">

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
                ) : activeTab === "Recents" ? (
                    <div className="max-h-170 overflow-y-auto px-4 py-4">
                        {filteredRecentBookings.length > 0 ? (
                            <div className="space-y-4">
                                {filteredRecentBookings.map((booking) => (
                                    <div key={booking.id} className="rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {formatRecentBookingDate(booking.bookingDate)}
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-gray-900">{booking.roomName}</p>
                                        </div>

                                        <div className="divide-y divide-gray-100">
                                            {booking.items.map((item) => (
                                                <div
                                                    key={`${booking.id}-${item.id}`}
                                                    className="flex items-center justify-between gap-4 px-4 py-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                        <p className="mt-1 text-xs text-gray-500">Quantity previously booked: {item.quantity}</p>
                                                    </div>

                                                    {isBooking ? (
                                                        <button
                                                            className="shrink-0 bg-[#B80050] hover:bg-[#9a0044] text-white text-xs font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                                                            onClick={() => handleAddRecentClick(item)}
                                                        >
                                                            Add Item
                                                        </button>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center text-gray-400 text-sm">
                                {search
                                    ? "No recent booking equipment matched your search."
                                    : "Your recent booking equipment will appear here."}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Header row */}
                        <div className="grid grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_170px] gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50 h-10 items-center">
                            <div />
                            <p className="text-xs font-medium text-gra y-500">Item</p>
                            <p className="text-xs font-medium text-gray-500">Category</p>
                            <p className="text-xs font-medium text-gray-500">Availability</p>
                            <p className="text-xs font-medium text-gray-500">Fixed room</p>
                            <div />
                        </div>

                        <div className="divide-y divide-gray-100 max-h-170 overflow-y-auto">
                            {filtered.length > 0 ? (
                                filtered.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_170px] gap-4 items-center px-4 py-3 rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all bg-white h-14"
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

                                        {/* Fixed Room */}
                                        {item.room ? (
                                            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full truncate w-fit">
                                                {item.room.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">Any room</span>
                                        )}
                                        {/* Add item to basket button TODO: to be changed to only show whilst booking mode is active */}
                                        <div className="w-42.5 flex justify-end">
                                            {isBooking ? (
                                                <button
                                                    className="bg-[#B80050] hover:bg-[#9a0044] text-white text-xs font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                                                    onClick={() => handleAddClick(item)}
                                                >
                                                    Add Item
                                                </button>
                                            ) : (
                                                <div className="w-22.25" />
                                            )}
                                        </div>
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
            <ErrorModal
                open={errorMessage !== null}
                title="Booking details required"
                message={errorMessage ?? ""}
                buttonText="OK"
                onClose={() => setErrorMessage(null)}
            />
        </div>
    );
}
