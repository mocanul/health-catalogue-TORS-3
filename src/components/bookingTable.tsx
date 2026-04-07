"use server"

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import ViewBookingButton from "@/components/modals/viewBookingButton";
import AcceptDeclineButtons from "./modals/acceptDeclineButtons";

export default async function Bookings() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) redirect("/login")

    const user = await validateSession(sessionToken)
    if (!user) redirect("/login")

    const user_id = user.id
    const user_role = user.role

    // Fetch own bookings
    const ownBookings = await prisma.booking.findMany({
        where: user_role === "STUDENT" ? { created_by: user_id } : {},
        include: {
            user: { select: { first_name: true, last_name: true, email: true } },
            room: { select: { name: true } },
            bookingItems: { include: { equipment: true } }
        },
        orderBy: [{ booking_date: "asc" }, { start_time: "asc" }]
    });

    const acceptedInviteBookings = await prisma.booking.findMany({
        where: {
            invites: {
                some: {
                    sent_to: user_id,
                    status: "ACCEPTED",
                }
            }
        },
        include: {
            user: { select: { first_name: true, last_name: true, email: true } },
            room: { select: { name: true } },
            bookingItems: { include: { equipment: true } }
        },
        orderBy: [{ booking_date: "asc" }, { start_time: "asc" }]
    });

    // Merge, avoiding duplicates (edge case: owner who also has an invite)
    const allBookings = [
        ...ownBookings,
        ...acceptedInviteBookings.filter(b => !ownBookings.some(o => o.id === b.id))
    ];

    // Fetch pending invites for this user
    const pendingInvites = await prisma.bookingInvite.findMany({
        where: {
            sent_to: user_id,
            status: "PENDING",
        },
        include: {
            booking: {
                include: {
                    user: { select: { first_name: true, last_name: true, email: true } },
                    room: { select: { name: true } },
                    bookingItems: { include: { equipment: true } }
                }
            },
            sender: { select: { first_name: true, last_name: true } }
        }
    });

    return (
        <main>
            <div className="flex justify-center mt-10 px-4">
                <div className="w-full max-w-6xl rounded-lg shadow-md flex flex-col overflow-hidden">
                    <div className="bg-pink-100 px-3 sm:px-4 py-3 border-b">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-base sm:text-lg">Bookings</h3>
                        </div>
                    </div>

                    <div className="w-full max-h-120 overflow-x-auto overflow-y-auto">
                        <table className="w-full border">
                            <thead className="sticky top-0 bg-pink-50">
                                <tr className="border-b pb-3">
                                    <th className="p-3 text-center">First Name</th>
                                    <th className="p-3 text-center">Last Name</th>
                                    <th className="p-3 text-center">Email</th>
                                    <th className="p-3 text-center">Room</th>
                                    <th className="p-3 text-center">Booking Date</th>
                                    <th className="p-3 text-center">Start Time</th>
                                    <th className="p-3 text-center">End Time</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {/* Own bookings */}
                                {allBookings.map(item => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-3 text-center">{item.user?.first_name}</td>
                                        <td className="p-3 text-center">{item.user?.last_name}</td>
                                        <td className="p-3 text-center">{item.user?.email}</td>
                                        <td className="p-3 text-center">{item.room?.name}</td>
                                        <td className="p-3 text-center">{item.booking_date.toDateString()}</td>
                                        <td className="p-3 text-center">{item.start_time.toString()}</td>
                                        <td className="p-3 text-center">{item.end_time.toString()}</td>
                                        <td className="p-3 text-center">{item.status}</td>
                                        <td className="p-3 text-center">
                                            <ViewBookingButton booking={item} role={user_role} />
                                        </td>
                                    </tr>
                                ))}

                                {/* Pending invites */}
                                {pendingInvites.map(invite => (
                                    <tr key={`invite-${invite.id}`} className="border-b bg-pink-50/40">
                                        <td className="p-3 text-center">{invite.booking?.user?.first_name}</td>
                                        <td className="p-3 text-center">{invite.booking?.user?.last_name}</td>
                                        <td className="p-3 text-center">{invite.booking?.user?.email}</td>
                                        <td className="p-3 text-center">{invite.booking?.room?.name}</td>
                                        <td className="p-3 text-center">{invite.booking?.booking_date.toDateString()}</td>
                                        <td className="p-3 text-center">{invite.booking?.start_time.toString()}</td>
                                        <td className="p-3 text-center">{invite.booking?.end_time.toString()}</td>
                                        <td className="p-3 text-center">
                                            <span className=" bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full">
                                                INVITE
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <AcceptDeclineButtons inviteId={invite.id} />
                                        </td>
                                    </tr>
                                ))}

                                {allBookings.length === 0 && pendingInvites.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="p-6 text-center text-gray-400 text-sm">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}