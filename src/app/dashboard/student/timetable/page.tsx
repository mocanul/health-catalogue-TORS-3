import Navbar from "@/components/Navbar";
import Timetable from "@/components/modals/timetable";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTimeKey(date: Date) {
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

export default async function TimetablePage() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestVisibleDate = new Date(today);
    latestVisibleDate.setDate(latestVisibleDate.getDate() + 13);

    const [rooms, bookings] = await Promise.all([
        prisma.room.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
            },
        }),
        prisma.booking.findMany({
            where: {
                booking_date: {
                    gte: today,
                    lte: latestVisibleDate,
                },
                status: {
                    notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
                },
            },
            orderBy: [
                { booking_date: "asc" },
                { start_time: "asc" },
            ],
            select: {
                id: true,
                booking_date: true,
                start_time: true,
                end_time: true,
                status: true,
                room: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
    ]);

    const timetableBookings = bookings.map((booking) => ({
        id: booking.id,
        bookingDate: getDateKey(booking.booking_date),
        startTime: getTimeKey(booking.start_time),
        endTime: getTimeKey(booking.end_time),
        roomName: booking.room.name,
        status: booking.status,
    }));

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                showLogout={true}
                links={[
                    { href: "/dashboard/student", label: "Home" },
                    { href: "/dashboard/student/catalogue", label: "Catalogue" },
                ]}
            />

            <main className="min-h-screen bg-gray-100 p-6">
                <Timetable
                    rooms={rooms}
                    bookings={timetableBookings}
                    initialDate={getDateKey(today)}
                />
            </main>
        </div>
    );
}
