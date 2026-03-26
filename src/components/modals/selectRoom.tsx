"use client";

import { useEffect, useState } from "react";

type Room = {
    id: number;
    name: string;
    type: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSelect: (room: Room) => void;
};

export default function SelectRoom({ open, onClose, onSelect }: Props) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>("All");
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    //fetch rooms from database
    useEffect(() => {
        if (!open) return;
        fetch("/api/booking/rooms")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .finally(() => setLoading(false));
    }, [open]);

    if (!open) return null;

    const types = ["All", ...Array.from(new Set(rooms.map((r) => r.type).filter((t): t is string => t !== null)))];

    const filteredRooms = rooms.filter((r) =>
        selectedType === "All" ? true : r.type === selectedType
    );

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* modal */}
            <div
                className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 flex flex-col gap-4 h-120"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-semibold text-gray-800">Select a Room</h2>
                    <button
                        onClick={onClose}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* dropdown for room type */}
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white cursor-pointer shrink-0"
                >
                    {types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                <hr className="border-t border-gray-100 shrink-0" />

                {/* scrollable room grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                    {loading ? (
                        <p className="text-xs text-gray-400 text-center py-4">Loading rooms...</p>
                    ) : filteredRooms.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {filteredRooms.map((room) => (
                                <button
                                    key={room.id}
                                    onClick={() => setSelectedRoom(room)}
                                    className={`px-4 py-3 text-sm rounded-lg border transition-all cursor-pointer ${selectedRoom?.id === room.id
                                        ? "bg-[#B80050] text-white border-[#B80050]"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-[#B80050] hover:text-[#B80050]"
                                        }`}
                                >
                                    {room.name}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No rooms found.</p>
                    )}
                </div>

                {/* confirm button */}
                <button
                    disabled={!selectedRoom}
                    onClick={() => {
                        if (selectedRoom) {
                            onSelect(selectedRoom);
                            onClose();
                        }
                    }}
                    className="w-full bg-[#B80050] hover:bg-[#9a0044] disabled:opacity-40 disabled:cursor-not-allowed
                    text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    Confirm Room
                </button>
            </div>
        </div>
    );
}