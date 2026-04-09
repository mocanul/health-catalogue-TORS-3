import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";
import { createAuditLog, getAuditActorName, getRoleLabel } from "@/lib/audit";

//get user ID
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

        const { lesson, room_name, booking_date, start_time, end_time, other_requirement, hs_form_path, items, status } = body;

        //find room by name
        const room = await prisma.room.findFirst({
            where: { name: room_name },
        });
        if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

        //create booking
        const booking = await prisma.$transaction(async (tx) => {
            const createdBooking = await tx.booking.create({
                data: {
                    created_by: user.id,
                    room_id: room.id,
                    lesson,
                    other_requirement: other_requirement ?? null,
                    booking_date: new Date(`${booking_date}T00:00:00Z`),
                    start_time,
                    end_time,
                    status: status ?? "DRAFT",
                    updated_at: new Date(),
                    hs_form_path: hs_form_path ?? null,
                    bookingItems: {
                        create: items.map((item: { id: number; quantity: number }) => ({
                            equipment_id: item.id,
                            quantity_requested: item.quantity,
                        })),
                    },
                },
            });

            // Audit log is written here whenever a booking is created, including student submissions.
            await createAuditLog(
                {
                    actor: user,
                    actionType: "BOOKING_CREATED",
                    actionDescription: `${getRoleLabel(user.role)} ${getAuditActorName(user)} created booking #${createdBooking.id}`,
                    targetType: "BOOKING",
                    targetId: createdBooking.id,
                    targetName: `${room.name} booking`,
                    relatedUserName: getAuditActorName(user),
                    oldValue: null,
                    newValue: {
                        lesson,
                        room_name,
                        booking_date,
                        start_time,
                        end_time,
                        status: status ?? "DRAFT",
                    },
                },
                tx,
            );

            return createdBooking;
        });

        return NextResponse.json({ success: true, booking_id: booking.id });

    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }
}
