"use server";

import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ViewBookingButton from "@/components/modals/viewBookingButton";
import AcceptDeclineButtons from "./modals/acceptDeclineButtons";
import BookingChatButton from "@/components/bookingChatButton";

function formatDateLabel(date: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatStatusLabel(status: string) {
    return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

function getStatusClasses(status: string) {
    if (status === "APPROVED") {
        return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === "REJECTED") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    if (status === "SUBMITTED") {
        return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-700";
}

export default async function Bookings() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
        redirect("/login");
    }

    const user = await validateSession(sessionToken);

    if (!user) {
        redirect("/login");
    }

    const userId = user.id;
    const userRole = user.role;

    const ownBookings = await prisma.booking.findMany({
        where: userRole === "STUDENT" ? { created_by: userId } : {},
        include: {
            user: { select: { first_name: true, last_name: true, email: true } },
            room: { select: { name: true } },
            bookingItems: { include: { equipment: true } },
        },
        orderBy: [{ booking_date: "asc" }, { start_time: "asc" }],
    });

    const acceptedInviteBookings = await prisma.booking.findMany({
        where: {
            invites: {
                some: {
                    sent_to: userId,
                    status: "ACCEPTED",
                },
            },
        },
        include: {
            user: { select: { first_name: true, last_name: true, email: true } },
            room: { select: { name: true } },
            bookingItems: { include: { equipment: true } },
        },
        orderBy: [{ booking_date: "asc" }, { start_time: "asc" }],
    });

    const allBookings = [
        ...ownBookings,
        ...acceptedInviteBookings.filter((booking) => !ownBookings.some((ownBooking) => ownBooking.id === booking.id)),
    ];

    const pendingInvites = await prisma.bookingInvite.findMany({
        where: {
            sent_to: userId,
            status: "PENDING",
        },
        include: {
            booking: {
                include: {
                    user: { select: { first_name: true, last_name: true, email: true } },
                    room: { select: { name: true } },
                    bookingItems: { include: { equipment: true } },
                },
            },
        },
    });

    return (
        <main className="min-h-screen bg-gray-100 px-6 py-10">
            <section className="mx-auto flex max-w-6xl flex-col gap-8">
                <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
                    <div className="border-b border-gray-200 bg-[#4d0626] px-6 py-5 text-white">
                        <h2 className="text-2xl font-bold">Bookings</h2>
                        <p className="mt-2 text-sm text-pink-100">
                            Review your own bookings and any accepted contributor bookings here.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-pink-50">
                                <tr className="border-b border-pink-100 text-xs uppercase tracking-wide text-slate-600">
                                    <th className="px-4 py-4 text-left font-semibold">Name</th>
                                    <th className="px-4 py-4 text-left font-semibold">Email</th>
                                    <th className="px-4 py-4 text-left font-semibold">Room</th>
                                    <th className="px-4 py-4 text-left font-semibold">Booking date</th>
                                    <th className="px-4 py-4 text-left font-semibold">Start time</th>
                                    <th className="px-4 py-4 text-left font-semibold">End time</th>
                                    <th className="px-4 py-4 text-left font-semibold">Status</th>
                                    <th className="px-4 py-4 text-center font-semibold">Actions</th>
                                    <th className="px-4 py-4 text-center font-semibold">Chat</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                                {allBookings.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-pink-50/30">
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            <div className="font-semibold">
                                                {`${item.user?.first_name ?? ""} ${item.user?.last_name ?? ""}`.trim() || "Unknown user"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{item.user?.email}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{item.room?.name}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{formatDateLabel(item.booking_date)}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{item.start_time}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{item.end_time}</td>
                                        <td className="px-4 py-4 text-sm">
                                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(item.status)}`}>
                                                {formatStatusLabel(item.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <ViewBookingButton booking={item} role={userRole} />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <BookingChatButton
                                                bookingId={item.id}
                                                heading={`Booking chat for ${item.room?.name ?? "booking"}`}
                                                subheading="Message the technician team here about this booking."
                                                buttonLabel="Open chat"
                                                buttonClassName="rounded-md bg-[#B80050] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#970041]"
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {pendingInvites.map((invite) => invite.booking ? (
                                    <tr key={`invite-${invite.id}`} className="bg-amber-50/30 transition hover:bg-amber-50/50">
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            <div className="font-semibold">
                                                {`${invite.booking.user?.first_name ?? ""} ${invite.booking.user?.last_name ?? ""}`.trim() || "Unknown user"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{invite.booking.user?.email}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{invite.booking.room?.name}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{formatDateLabel(invite.booking.booking_date)}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{invite.booking.start_time}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{invite.booking.end_time}</td>
                                        <td className="px-4 py-4 text-sm">
                                            <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                                                Invite
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <AcceptDeclineButtons inviteId={invite.id} />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                disabled
                                                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                                            >
                                                Open chat
                                            </button>
                                        </td>
                                    </tr>
                                ) : null)}

                                {allBookings.length === 0 && pendingInvites.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        </main>
    );
}
