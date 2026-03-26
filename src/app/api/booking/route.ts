import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return validateSession(token);
}

export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    try {
        const body = await req.json();

        const { lesson, room_name, booking_date, start_time, end_time, other_requirement, items } = body;

        // Find room by name
        const room = await prisma.room.findFirst({
            where: { name: room_name },
        });
        if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                created_by: user.id,
                room_id: room.id,
                lesson,
                other_requirement: other_requirement ?? null,
                booking_date: new Date(booking_date),
                start_time: start_time,
                end_time: end_time,
                status: "DRAFT",
                bookingItems: {
                    create: items.map((item: { id: number; quantity: number }) => ({
                        equipment_id: item.id,
                        quantity_requested: item.quantity,
                    })),
                },
            },
        });

        return NextResponse.json({ success: true, booking_id: booking.id });

    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }
}