"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type TimetableRoom = {
    id: number;
    name: string;
};

type TimetableBooking = {
    id: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    roomName: string;
    status: string;
};

type TimetableSelection = {
    bookingDate: string;
    roomName: string;
    startTime: string;
    endTime: string;
};

type TimetableProps = {
    rooms: TimetableRoom[];
    bookings: TimetableBooking[];
    initialDate: string;
    numberOfDays?: number;
    onSelectionChange?: (selection: TimetableSelection | null) => void;
};

const openingHour = 8;
const closingHour = 22;

// The grid is built from hourly start times, so 4pm is the final slot for a 4pm-5pm booking.
const timeSlots = Array.from({ length: closingHour - openingHour }, (_, index) => {
    const hour = openingHour + index;

    return {
        value: `${String(hour).padStart(2, "0")}:00`,
        label: new Intl.DateTimeFormat("en-GB", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(new Date(2000, 0, 1, hour)),
    };
});

function addDays(date: Date, amount: number) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + amount);
    return nextDate;
}

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatTimeLabel(time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    return new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(2000, 0, 1, hours, minutes));
}

function isBookedForSlot(
    booking: TimetableBooking,
    bookingDate: string,
    roomName: string,
    slotValue: string,
) {
    return (
        booking.bookingDate === bookingDate &&
        booking.roomName === roomName &&
        slotValue >= booking.startTime &&
        slotValue < booking.endTime
    );
}

export default function Timetable({
    rooms,
    bookings,
    initialDate,
    numberOfDays = 14,
    onSelectionChange,
}: TimetableProps) {
    const dateOptions = useMemo(() => {
        const startDate = new Date(`${initialDate}T00:00:00`);

        return Array.from({ length: numberOfDays }, (_, index) => {
            const date = addDays(startDate, index);

            return {
                value: getDateKey(date),
                label: formatDisplayDate(date),
            };
        });
    }, [initialDate, numberOfDays]);

    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedRange, setSelectedRange] = useState<{
        roomName: string;
        startSlotIndex: number;
        endSlotIndex: number;
    } | null>(null);

    const selectedDate = dateOptions[selectedDateIndex];

    const handlePreviousDate = () => {
        if (selectedDateIndex > 0) {
            setSelectedDateIndex(selectedDateIndex - 1);
            setSelectedRange(null);
            onSelectionChange?.(null);
        }
    };

    const handleNextDate = () => {
        if (selectedDateIndex < dateOptions.length - 1) {
            setSelectedDateIndex(selectedDateIndex + 1);
            setSelectedRange(null);
            onSelectionChange?.(null);
        }
    };

    function getActiveBooking(roomName: string, slotValue: string) {
        return bookings.find((booking) =>
            isBookedForSlot(booking, selectedDate.value, roomName, slotValue),
        );
    }

    function slotHasBooking(roomName: string, slotIndex: number) {
        return Boolean(getActiveBooking(roomName, timeSlots[slotIndex].value));
    }

    function updateSelection(roomName: string, startSlotIndex: number, endSlotIndex: number) {
        const nextSelection = {
            roomName,
            startSlotIndex,
            endSlotIndex,
        };

        setSelectedRange(nextSelection);

        // This keeps the timetable reusable inside the separate booking flow later.
        onSelectionChange?.({
            bookingDate: selectedDate.value,
            roomName,
            startTime: timeSlots[startSlotIndex].value,
            endTime:
                endSlotIndex + 1 < timeSlots.length
                    ? timeSlots[endSlotIndex + 1].value
                    : `${String(closingHour).padStart(2, "0")}:00`,
        });
    }

    function handleSlotClick(roomName: string, slotIndex: number) {
        if (slotHasBooking(roomName, slotIndex)) {
            return;
        }

        if (!selectedRange || selectedRange.roomName !== roomName) {
            updateSelection(roomName, slotIndex, slotIndex);
            return;
        }

        const nextStart = Math.min(selectedRange.startSlotIndex, slotIndex);
        const nextEnd = Math.max(selectedRange.startSlotIndex, slotIndex);

        for (let index = nextStart; index <= nextEnd; index += 1) {
            if (slotHasBooking(roomName, index)) {
                return;
            }
        }

        updateSelection(roomName, nextStart, nextEnd);
    }

    function isSelected(roomName: string, slotIndex: number) {
        return (
            selectedRange?.roomName === roomName &&
            slotIndex >= selectedRange.startSlotIndex &&
            slotIndex <= selectedRange.endSlotIndex
        );
    }

    return (
        <section className="mx-auto max-w-400 space-y-6 rounded-2xl bg-white p-6 shadow-lg">
            <div className="space-y-3">
                <Link
                    href="/dashboard/student"
                    className="inline-flex w-fit rounded-md bg-pink-950 px-4 py-2 font-semibold text-white transition hover:bg-pink-900"
                >
                    Back to dashboard
                </Link>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
                    <p className="text-gray-600">
                        Pick a date, then select an available room and time range for the booking form.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-start gap-4">
                <button
                    type="button"
                    onClick={handlePreviousDate}
                    disabled={selectedDateIndex === 0}
                    className="rounded-md bg-[#B80050] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {"<"}
                </button>

                <div className="rounded-full bg-pink-200 px-6 py-3 text-left">
                    <p className="text-base font-semibold text-gray-900">{selectedDate.label}</p>
                </div>

                <button
                    type="button"
                    onClick={handleNextDate}
                    disabled={selectedDateIndex === dateOptions.length - 1}
                    className="rounded-md bg-[#B80050] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {">"}
                </button>
            </div>

            <div className="rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-[#B80050]">
                Students can only move forward from today&apos;s date. Existing bookings are shown in red.
            </div>

            {selectedRange && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    Selected booking: {selectedRange.roomName}, {selectedDate.label},{" "}
                    {formatTimeLabel(timeSlots[selectedRange.startSlotIndex].value)} to{" "}
                    {formatTimeLabel(
                        selectedRange.endSlotIndex + 1 < timeSlots.length
                            ? timeSlots[selectedRange.endSlotIndex + 1].value
                            : `${String(closingHour).padStart(2, "0")}:00`,
                    )}
                </div>
            )}

            <div className="max-h-162.5 overflow-x-auto overflow-y-auto rounded-lg border border-gray-300">
                <table className="min-w-max border-collapse text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            <th className="sticky left-0 z-20 border border-gray-400 bg-gray-200 p-3 text-left">
                                Room
                            </th>
                            {timeSlots.map((slot) => (
                                <th
                                    key={slot.value}
                                    className="border border-gray-400 bg-gray-200 p-3 text-center"
                                >
                                    {slot.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.id}>
                                <td className="sticky left-0 z-10 border border-gray-400 bg-white p-3 font-medium">
                                    {room.name}
                                </td>

                                {timeSlots.map((slot, slotIndex) => {
                                    const activeBooking = getActiveBooking(room.name, slot.value);
                                    const selected = isSelected(room.name, slotIndex);

                                    return (
                                        <td
                                            key={`${room.id}-${slot.value}`}
                                            onClick={() => handleSlotClick(room.name, slotIndex)}
                                            className={`h-16 min-w-30 border border-gray-400 p-2 text-center transition ${activeBooking
                                                    ? "cursor-not-allowed bg-red-500 font-medium text-white"
                                                    : selected
                                                        ? "cursor-pointer bg-blue-500 font-medium text-white"
                                                        : "cursor-pointer bg-white hover:bg-pink-50"
                                                }`}
                                        >
                                            {activeBooking ? "Booked" : ""}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
