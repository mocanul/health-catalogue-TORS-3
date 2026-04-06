import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import StudentBookingsManager from "@/components/studentBookingsManager";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";
import { BookingStatus } from "@prisma/client";

const visibleStudentStatuses = [
    BookingStatus.SUBMITTED,
    BookingStatus.APPROVED,
    BookingStatus.REJECTED,
];

export default async function StudentBookingsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const sessionUser = token ? await validateSession(token) : null;

    const [bookings, rooms] = sessionUser
        ? await Promise.all([
            prisma.booking.findMany({
                where: {
                    created_by: sessionUser.id,
                    status: { in: visibleStudentStatuses },
                },
                include: {
                    room: true,
                    bookingItems: {
                        include: {
                            equipment: true,
                        },
                    },
                },
                orderBy: [
                    { booking_date: "desc" },
                    { start_time: "desc" },
                ],
            }),
            prisma.room.findMany({
                orderBy: {
                    name: "asc",
                },
                select: {
                    id: true,
                    name: true,
                },
            }),
        ])
        : [[], []];

    const bookingCards = bookings.map((booking) => ({
        id: booking.id,
        roomId: booking.room_id,
        roomName: booking.room.name,
        bookingDate: booking.booking_date.toISOString().slice(0, 10),
        startTime: booking.start_time.slice(0, 5),
        endTime: booking.end_time.slice(0, 5),
        lesson: booking.lesson || "",
        otherRequirements: booking.description || "",
        status: booking.status as "SUBMITTED" | "APPROVED" | "REJECTED",
        reviewNotes: booking.review_notes,
        equipmentItems: booking.bookingItems.map((item) => ({
            id: item.id,
            equipmentId: item.equipment_id,
            name: item.equipment.name,
            quantity: item.quantity_requested,
        })),
    }));

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                showLogout={true}
                links={[
                    { href: "/dashboard/student", label: "Home" },
                    { href: "/dashboard/student/bookings", label: "Bookings", primary: true },
                    { href: "/dashboard/student/catalogue", label: "Catalogue" },
                ]}
            />

            <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(184,0,80,0.12),transparent_28%),linear-gradient(180deg,#fdf7fa_0%,#f3f4f6_45%,#eef1f4_100%)] px-6 py-10">
                <section className="mx-auto flex max-w-6xl flex-col gap-8">
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                        <span className="inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-900">
                            Student view
                        </span>
                        <h1 className="mt-4 text-3xl font-bold text-gray-900">
                            Your bookings
                        </h1>
                        <p className="mt-3 max-w-3xl text-gray-600">
                            Track the latest technician decision on each booking and edit any booking when you need to resubmit changes for review.
                        </p>
                    </div>

                    <StudentBookingsManager bookings={bookingCards} rooms={rooms} />
                </section>
            </main>
        </div>
    );
}
