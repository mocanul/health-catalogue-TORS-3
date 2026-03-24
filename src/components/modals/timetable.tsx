"use client";

import Link from "next/link";
import { useState } from "react";

// Days students can switch between.
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// One-hour timetable slots from 9am to 5pm.
const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
];

// Room names taken from the Rooms sheet in the spreadsheet.
const rooms = [
    "F100",
    "F200",
    "F201",
    "F203",
    "F204",
    "F208",
    "F407",
    "F310",
    "F335",
    "F338",
    "F401",
    "F434",
    "F437",
    "Collegiate Wing",
    "F332",
    "F336",
    "F340",
    "F341",
    "F343",
    "F313",
    "F408",
    "F514",
    "F515",
    "F516",
];

type Booking = {
    id: number;
    day: string;
    room: string;
    startTime: string;
    endTime: string;
    title: string;
};

// Mock bookings for the student view.
// Later, replace this array with Prisma data and keep the rendering logic the same.
const bookings: Booking[] = [
    {
        id: 1,
        day: "Monday",
        room: "F100",
        startTime: "9:00 AM",
        endTime: "11:00 AM",
        title: "Room booked",
    },
    {
        id: 2,
        day: "Monday",
        room: "F335",
        startTime: "1:00 PM",
        endTime: "3:00 PM",
        title: "Room booked",
    },
    {
        id: 3,
        day: "Tuesday",
        room: "F313",
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        title: "Room booked",
    },
];

function isRoomBooked(
    bookingDay: string,
    bookingRoom: string,
    bookingStart: string,
    bookingEnd: string,
    selectedDay: string,
    selectedRoom: string,
    selectedTime: string,
) {
    if (bookingDay !== selectedDay || bookingRoom !== selectedRoom) {
        return false;
    }

    const startIndex = timeSlots.indexOf(bookingStart);
    const endIndex = timeSlots.indexOf(bookingEnd);
    const slotIndex = timeSlots.indexOf(selectedTime);

    return (
        startIndex !== -1 &&
        endIndex !== -1 &&
        slotIndex >= startIndex &&
        slotIndex < endIndex
    );
}

export default function Timetable() {
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    const selectedDay = days[selectedDayIndex];

    const handlePreviousDay = () => {
        if (selectedDayIndex > 0) {
            setSelectedDayIndex(selectedDayIndex - 1);
        }
    };

    const handleNextDay = () => {
        if (selectedDayIndex < days.length - 1) {
            setSelectedDayIndex(selectedDayIndex + 1);
        }
    };

    return (
        <section className="mx-auto max-w-[1600px] space-y-6 rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
                    <p className="text-gray-600">
                        View room bookings by day and time slot.
                    </p>
                </div>

                <Link
                    href="/dashboard/student"
                    className="inline-flex w-fit rounded-md bg-pink-950 px-4 py-2 font-semibold text-white transition hover:bg-pink-900"
                >
                    Back to dashboard
                </Link>
            </div>

            <div className="flex items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={handlePreviousDay}
                    disabled={selectedDayIndex === 0}
                    className="rounded-md bg-[#B80050] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {"<"}
                </button>

                <div className="rounded-full bg-pink-200 px-8 py-3 text-center">
                    <p className="text-lg font-semibold text-gray-900">{selectedDay}</p>
                </div>

                <button
                    type="button"
                    onClick={handleNextDay}
                    disabled={selectedDayIndex === days.length - 1}
                    className="rounded-md bg-[#B80050] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {">"}
                </button>
            </div>

            <div className="max-h-[650px] overflow-x-auto overflow-y-auto rounded-lg border border-gray-300">
                <table className="min-w-max border-collapse text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            <th className="sticky left-0 border border-gray-400 bg-gray-200 p-3 text-left">
                                Time
                            </th>
                            {rooms.map((room) => (
                                <th
                                    key={room}
                                    className="border border-gray-400 bg-gray-200 p-3 text-center"
                                >
                                    {room}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {timeSlots.map((time) => (
                            <tr key={time}>
                                <td className="sticky left-0 border border-gray-400 bg-white p-3 font-medium">
                                    {time}
                                </td>

                                {rooms.map((room) => {
                                    const activeBooking = bookings.find((booking) =>
                                        isRoomBooked(
                                            booking.day,
                                            booking.room,
                                            booking.startTime,
                                            booking.endTime,
                                            selectedDay,
                                            room,
                                            time,
                                        ),
                                    );

                                    return (
                                        <td
                                            key={`${time}-${room}`}
                                            className={`h-16 min-w-[140px] border border-gray-400 p-2 text-center ${activeBooking ? "bg-red-500 font-medium text-white" : "bg-white"
                                                }`}
                                        >
                                            {activeBooking ? activeBooking.title : ""}
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
