"use client";

import { useEffect, useState, useRef } from "react";
import Timetable from "./modals/timetable";
import ContributorSearch from "./inviteContributor";

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

type Contributor = {
    id: number;
    first_name: string;
    last_name: string;
};

type Props = {
    selectedRoom: Room | null;
    onRoomSelect: (room: Room) => void;
    bookingItems: BookingItem[];
    onRemoveItem: (id: number) => void;
    clearItems: () => void;
    selectedSlot: SelectedBookingSlot | null;
    isBooking: boolean;
    setIsBooking: (value: boolean) => void;
    onSelectedSlotChange: (slot: SelectedBookingSlot | null) => void;
};

export default function Booking({
    bookingItems,
    onRemoveItem,
    clearItems,
    selectedSlot,
    isBooking,
    setIsBooking,
    onSelectedSlotChange,
}: Props) {
    const [title, setTitle] = useState("");
    const [timeTableOpen, setTimeTableOpen] = useState(false);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<BookingData[]>([]);

    const [hsFile, setHsFile] = useState<File | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const hsInputRef = useRef<HTMLInputElement>(null);

    const [showContributorSearch, setShowContributorSearch] = useState(false);
    const [selectedContributors, setSelectedContributors] = useState<Contributor[]>([]);

    const [otherRequirement, setOtherRequirement] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const roomsRes = await fetch("/api/booking/rooms");

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

    useEffect(() => {
        async function fetchData() {
            try {
                const [roomsRes, bookingsRes] = await Promise.all([
                    fetch("/api/booking/rooms"),
                    fetch("/api/booking/timetable"),
                ]);

                if (!roomsRes.ok || !bookingsRes.ok) throw new Error("Failed to fetch data");

                const roomsData: Room[] = await roomsRes.json();
                const bookingsData: BookingData[] = await bookingsRes.json();

                setRooms(roomsData);
                setBookings(bookingsData);
            } catch (error) {
                console.error("Failed to load timetable data:", error);
            }
        }

        fetchData();
    }, []);

    const handleDraft = async () => {
        setSubmitting(true);
        setSubmitError(null);

        try {
            let hs_form_path = null;

            if (hsFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", hsFile);
                const uploadRes = await fetch("/api/booking/upload", {
                    method: "POST",
                    body: uploadFormData,
                });
                if (!uploadRes.ok) throw new Error("Failed to upload file");
                const uploadData = await uploadRes.json();
                hs_form_path = uploadData.url;
            }

            const res = await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lesson: title,
                    room_name: selectedSlot?.roomName,
                    booking_date: selectedSlot?.bookingDate,
                    start_time: selectedSlot?.startTime,
                    end_time: selectedSlot?.endTime,
                    other_requirement: otherRequirement,
                    hs_form_path,
                    items: bookingItems.map((item) => ({
                        id: item.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            if (!res.ok) throw new Error("Failed to create booking");

            setIsBooking(false);
            setTitle("");
            setOtherRequirement("");
            setHsFile(null);
            onSelectedSlotChange(null);
            clearItems();

        } catch {
            setSubmitError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

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
                                value={otherRequirement}
                                onChange={(e) => setOtherRequirement(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                                rows={3}
                            />

                            <hr className="border border-gray-200" />

                            <div className="flex flex-row gap-2">
                                <input
                                    ref={hsInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => setHsFile(e.target.files?.[0] ?? null)}
                                />

                                <button
                                    onClick={() => hsInputRef.current?.click()}
                                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5
            rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
            ${hsFile
                                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                            : "bg-[#B80050] hover:bg-[#9a0044] text-white"
                                        }`}
                                >
                                    {hsFile ? `✓ ${hsFile.name.length > 15 ? hsFile.name.substring(0, 15) + "..." : hsFile.name}` : "Attach H&S Form"}
                                </button>

                                <button
                                    onClick={() => setShowContributorSearch((prev) => !prev)}
                                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5
    rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
    bg-[#B80050] hover:bg-[#9a0044] text-white"
                                >
                                    Invite Contributor
                                </button>

                            </div>
                            {showContributorSearch && (
                                <ContributorSearch
                                    selectedContributors={selectedContributors}
                                    onAdd={(user) => setSelectedContributors((prev) => [...prev, user])}
                                    onRemove={(id) => setSelectedContributors((prev) => prev.filter((c) => c.id !== id))}
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-2 p-4 border-t border-gray-200 shrink-0">
                            {submitError && (
                                <p className="text-xs text-red-500 text-center">{submitError}</p>
                            )}

                            {submitting ? (
                                // Loading state replaces all buttons
                                <div className="flex items-center justify-center gap-2 py-2">
                                    <svg className="animate-spin w-4 h-4 text-[#B80050]" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <p className="text-xs text-gray-400">Saving draft...</p>
                                </div>
                            ) : (
                                <div className="flex flex-row gap-2">
                                    <button
                                        onClick={() => {
                                            setIsBooking(false);
                                            setTitle("");
                                            setHsFile(null);
                                            setSubmitError(null);
                                            setOtherRequirement("");
                                            onSelectedSlotChange(null);
                                            clearItems();
                                        }}
                                        className="flex-1 flex items-center justify-center text-xs font-medium px-4 py-2.5
                rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50
                transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleDraft}
                                        className="flex-1 flex items-center justify-center text-xs font-medium px-4 py-2.5
                rounded-lg border border-[#B80050] text-[#B80050] hover:bg-pink-50
                transition-all cursor-pointer"
                                    >
                                        Draft
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (!hsFile) {
                                                setSubmitError("Please attach a H&S form before finalising.");
                                                return;
                                            }
                                            setSubmitError(null);
                                        }}
                                        className="flex-1 flex items-center justify-center text-xs font-medium px-4 py-2.5
                rounded-lg bg-[#B80050] hover:bg-[#9a0044] text-white shadow-sm
                hover:shadow-md transition-all cursor-pointer"
                                    >
                                        Finalise
                                    </button>
                                </div>
                            )}
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
                onSelectionChange={onSelectedSlotChange}
            />
        </>
    );
}