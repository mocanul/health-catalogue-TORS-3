"use client";

import { useState } from "react";
import SelectRoom from "@/components/modals/selectRoom";
import SelectDateTime from "@/components/modals/selectDateTime";

type Room = {
    id: number;
    name: string;
    type: string | null;
};


export default function Booking() {
    const [isBooking, setIsBooking] = useState(false);
    const [roomModalOpen, setRoomModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [title, setTitle] = useState("");

    const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
    const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);

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
                <div className="w-full h-full flex flex-col">

                    {/* header of booking panel*/}
                    <h2 className="w-full text-sm font-semibold text-white bg-[#B80050] text-center py-3 shrink-0">
                        Booking
                    </h2>


                    <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
                        {/* input lesson for booking*/}
                        <input
                            type="text"
                            placeholder="What lesson are you booking for?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                        <hr className="border border-gray-200" />

                        <div className="flex flex-row gap-2">

                            {/* select room button*/}
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

                            {/* select date&time button*/}
                            <button
                                onClick={() => setDateTimeModalOpen(true)}
                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium px-6 py-3
                        rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
                        ${selectedDate
                                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                        : "bg-[#B80050] hover:bg-[#9a0044] text-white"
                                    }`}
                            >
                                {selectedDate ? `${selectedDate} ${selectedStartTime}–${selectedEndTime}` : "Select Date & Time"}
                            </button>
                        </div>
                        <hr className="border border-gray-200" />

                        <div className="flex flex-col gap-2">
                            {/* scrollable list of items added to booking*/}
                            <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
                                {[
                                    { id: 1, name: "Stethoscope", quantity: 1 },
                                    { id: 2, name: "Syringe", quantity: 2 },
                                    { id: 3, name: "Blood Pressure Monitor", quantity: 1 },
                                    { id: 4, name: "Syringe", quantity: 2 },
                                    { id: 5, name: "Blood Pressure Monitor", quantity: 1 },
                                ].map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 hover:border-gray-200 transition-all"
                                    >
                                        <p className="text-xs font-medium text-gray-800 truncate flex-1">{item.name}</p>
                                        <div className="flex items-center gap-1.5 mx-3">
                                            <p className="text-xs text-gray-700">Q:</p>
                                            <span className="text-xs w-1 text-center text-gray-700">{item.quantity}</span>
                                        </div>
                                        <button className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer text-xs shrink-0">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <hr className="border border-gray-200" />

                        {/* other text box for specific requirements*/}
                        <textarea
                            placeholder="Other specific requirements"
                            className="w-full px-3 py-2 text-xs border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                            rows={3}
                        />

                        <hr className="border border-gray-200" />

                        <div className="flex flex-row gap-2">

                            {/* attach health and safety form button*/}
                            <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5
                        rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
                        bg-[#B80050] hover:bg-[#9a0044] text-white">
                                Attach H&S Form
                            </button>

                            {/* invite contributor to booking button*/}
                            <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5
                        rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
                        bg-[#B80050] hover:bg-[#9a0044] text-white">
                                Invite Contributor
                            </button>
                        </div>
                    </div>

                    {/* bottom buttons (Cancel, Draft and Finalise) */}
                    <div className="flex flex-row gap-2 p-4 border-t border-gray-200 shrink-0">
                        <button
                            onClick={() => {
                                setIsBooking(false);
                                setSelectedRoom(null);
                                setTitle("");
                                setSelectedDate(null);
                                setSelectedStartTime(null);
                                setSelectedEndTime(null);
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

            {/* attach health and safety form button*/}
            <SelectRoom
                open={roomModalOpen}
                onClose={() => setRoomModalOpen(false)}
                onSelect={(room) => setSelectedRoom(room)}
            />

            {/* pick date time modal*/}
            <SelectDateTime
                open={dateTimeModalOpen}
                onClose={() => setDateTimeModalOpen(false)}
                onSelect={(date, start, end) => {
                    setSelectedDate(date);
                    setSelectedStartTime(start);
                    setSelectedEndTime(end);
                }}
            />
        </div>
    );
}