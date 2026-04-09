import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";
import { BookingStatus } from "@prisma/client";

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return validateSession(token);
}

export async function GET() {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const bookings = await prisma.booking.findMany({
        where: {
            created_by: user.id,
            status: {
                in: [BookingStatus.APPROVED, BookingStatus.COMPLETED],
            },
            bookingItems: {
                some: {},
            },
        },
        include: {
            room: {
                select: {
                    name: true,
                },
            },
            bookingItems: {
                include: {
                    equipment: {
                        select: {
                            id: true,
                            name: true,
                            fixed_room_id: true,
                        },
                    },
                },
            },
        },
        orderBy: [
            { booking_date: "desc" },
            { start_time: "desc" },
        ],
        take: 12,
    });

    return NextResponse.json(
        bookings.map((booking) => ({
            id: booking.id,
            bookingDate: booking.booking_date.toISOString(),
            roomName: booking.room?.name ?? "Unknown room",
            items: booking.bookingItems.map((item) => ({
                id: item.equipment.id,
                bookingItemId: item.id,
                name: item.equipment.name,
                quantity: item.quantity_requested,
                fixed_room_id: item.equipment.fixed_room_id,
            })),
        })),
    );
}
