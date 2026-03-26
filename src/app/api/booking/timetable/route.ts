//api for timetable
//used to find already booked times and avoid users book same room and time

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const user = await validateSession(token);
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const bookings = await prisma.booking.findMany({
        where: {
            status: {
                in: ["DRAFT", "SUBMITTED", "APPROVED"],
            },
        },
        select: {
            id: true,
            booking_date: true,
            start_time: true,
            end_time: true,
            room: {
                select: { name: true },
            },
            status: true,
        },
    });

    return NextResponse.json(
        bookings.map((b) => ({
            id: b.id,
            bookingDate: b.booking_date.toISOString().split("T")[0],
            startTime: b.start_time,
            endTime: b.end_time,
            roomName: b.room.name,
            status: b.status,
        }))
    );
}