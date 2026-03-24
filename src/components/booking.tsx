"use client";

import { useState } from "react";
import SelectRoom from "@/components/modals/selectRoom";

type Room = {
    id: number;
    name: string;
    building: string | null;
};

export default function Booking() {
    const [isBooking, setIsBooking] = useState(false);
    const [roomModalOpen, setRoomModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [title, setTitle] = useState("");

    return (
        <div className="border-2 border-gray-100 border-r flex-1 flex items-center justify-center m-5">
            {!isBooking ? (
                <button
                    onClick={() => setIsBooking(true)}
                    className="flex items-center gap-2 bg-[#B80050] hover:bg-[#9a0044]
           text-white text-sm font-medium px-6 py-3 rounded-lg shadow-sm
           hover:shadow-md transition-all cursor-pointer"
                >
                    New Booking
                </button>
            ) : (
                <div className="w-full h-full p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-800">New Booking</h2>
                        <button
                            onClick={() => {
                                setIsBooking(false);
                                setSelectedRoom(null);
                                setTitle("");
                            }}
                            className="text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                            ✕ Cancel
                        </button>
                    </div>

                    <div className="flex flex-col gap-1 m-2">
                        <input
                            type="text"
                            placeholder="Enter a title for your booking..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                    </div>

                    <hr className="border-1 border-pink-400" />

                    <div className="flex flex-row m-2 gap-2">
                        {/* Select Room button — shows selected room name once chosen */}
                        <button
                            onClick={() => setRoomModalOpen(true)}
                            className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium px-6 py-3
                rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
                ${selectedRoom
                                    ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                    : "bg-[#B80050] hover:bg-[#9a0044] text-white"
                                }`}
                        >
                            {selectedRoom ? `Room: ${selectedRoom.name}` : "Select Room"}
                        </button>

                        <button
                            className="flex-1 flex items-center justify-center gap-2 bg-[#B80050] hover:bg-[#9a0044]
               text-white text-sm font-medium px-6 py-3 rounded-lg shadow-sm
               hover:shadow-md transition-all cursor-pointer"
                        >
                            Select date & time
                        </button>
                    </div>
                </div>
            )}

            {/* Room selection modal */}
            <SelectRoom
                open={roomModalOpen}
                onClose={() => setRoomModalOpen(false)}
                onSelect={(room) => setSelectedRoom(room)}
            />
        </div>
    );
}