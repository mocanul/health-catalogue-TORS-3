"use client";

import { useEffect, useState } from "react";
import Timetable from "./modals/timetable";

type Room = {
    id: number;
    name: string;
    type: string | null;
};

type BookingItem = {
    id: number;
    name: string;
    quantity: number;
};

type BookingData = {
    id: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    roomName: string;
    status: string;
};

type SelectedBookingSlot = {
    bookingDate: string;
    roomName: string;
    startTime: string;
    endTime: string;
};

type Props = {
    selectedRoom: Room | null;
    onRoomSelect: (room: Room) => void;
    bookingItems: BookingItem[];
    onRemoveItem: (id: number) => void;
    clearItems: () => void;
};

export default function Booking({
    bookingItems,
    onRemoveItem,
    clearItems,
}: Props) {
    const [isBooking, setIsBooking] = useState(false);
    const [title, setTitle] = useState("");
    const [timeTableOpen, setTimeTableOpen] = useState(false);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<BookingData[]>([]);

    const [selectedSlot, setSelectedSlot] = useState<SelectedBookingSlot | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [roomsRes] = await Promise.all([
                    fetch("/api/booking/rooms"),
                ]);

                if (!roomsRes.ok) {
                    throw new Error("Failed to fetch rooms");
                }

                const roomsData: Room[] = await roomsRes.json();

                setRooms(roomsData);
            } catch (error) {
                console.error("Failed to load timetable data:", error);
            }
        }

        fetchData();
    }, []);

    return (
        <>
            <div className="border-2 border-gray-100 border-r flex-1 flex items-center justify-center m-8 min-w-0 overflow-hidden">
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
                    <div className="w-full h-full flex flex-col min-w-0">
                        <h2 className="w-full text-sm font-semibold text-white bg-[#B80050] text-center py-3 shrink-0">
                            Booking
                        </h2>

                        <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
                            <input
                                type="text"
                                placeholder="What lesson are you booking for?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />

                            <hr className="border border-gray-200" />

                            <div className="flex flex-row gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTimeTableOpen(true)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#B80050] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#9a0044] hover:shadow-md cursor-pointer"
                                >
                                    {selectedSlot
                                        ? `${selectedSlot.roomName} | ${selectedSlot.bookingDate} | ${selectedSlot.startTime} - ${selectedSlot.endTime}`
                                        : "Pick room, date and time"}
                                </button>
                            </div>

                            <hr className="border border-gray-200" />

                            <div className="flex flex-col gap-2 overflow-y-auto h-48 max-h-48 pr-1">
                                {bookingItems.length > 0 ? (
                                    bookingItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 hover:border-gray-200 transition-all min-w-0"
                                        >
                                            <p className="text-xs font-medium text-gray-800 truncate flex-1 min-w-0">
                                                {item.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mx-3 shrink-0">
                                                <p className="text-xs text-gray-700">Q:</p>
                                                <span className="text-xs w-4 text-center text-gray-700">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(item.id)}
                                                className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer text-xs shrink-0"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-300 italic text-center py-4">
                                        No items added yet
                                    </p>
                                )}
                            </div>

                            <hr className="border border-gray-200" />

                            <textarea
                                placeholder="Other specific requirements"
                                className="w-full px-3 py-2 text-xs border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                                rows={3}
                            />

                            <hr className="border border-gray-200" />

                            <div className="flex flex-row gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer bg-[#B80050] hover:bg-[#9a0044] text-white">
                                    Attach H&amp;S Form
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer bg-[#B80050] hover:bg-[#9a0044] text-white">
                                    Invite Contributor
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-row gap-2 p-4 border-t border-gray-200 shrink-0">
                            <button
                                onClick={() => {
                                    setIsBooking(false);
                                    setTitle("");
                                    clearItems();
                                }}
                                className="flex-1 flex items-center justify-center text-xs font-medium px-4 py-2.5
                                rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50
                                transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 flex items-center justify-center text-xs font-medium px-4 py-2.5
                                rounded-lg border border-[#B80050] text-[#B80050] hover:bg-pink-50
                                transition-all cursor-pointer">
                                Draft
                            </button>
                            <button className="flex-1 flex items-center justify-center text-xs font-medium px-4 py-2.5
                                rounded-lg bg-[#B80050] hover:bg-[#9a0044] text-white shadow-sm
                                hover:shadow-md transition-all cursor-pointer">
                                Finalise
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Timetable
                open={timeTableOpen}
                onClose={() => setTimeTableOpen(false)}
                rooms={rooms}
                bookings={bookings}
                initialDate={new Date().toISOString().split("T")[0]}
                onSelectionChange={setSelectedSlot}
            />
        </>
    );
}