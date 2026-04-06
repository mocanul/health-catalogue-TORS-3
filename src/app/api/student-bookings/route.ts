import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";

type BookingItemInput = {
    equipmentId?: number;
    quantity?: number;
};

type UpdateStudentBookingBody = {
    bookingId?: number;
    roomId?: number;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
    lesson?: string;
    otherRequirements?: string;
    equipmentItems?: BookingItemInput[];
};

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;
        const sessionUser = token ? await validateSession(token) : null;

        if (!sessionUser || sessionUser.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
        }

        const body = (await request.json()) as UpdateStudentBookingBody;
        const bookingId = Number(body.bookingId);

        if (Number.isNaN(bookingId)) {
            return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
        }

        const { roomId, bookingDate, startTime, endTime } = body;

        if (!roomId || !bookingDate || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required booking fields." }, { status: 400 });
        }

        if (endTime <= startTime) {
            return NextResponse.json({ error: "End time must be after the start time." }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking || booking.created_by !== sessionUser.id) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        const requestedItems = (body.equipmentItems ?? [])
            .map((item) => ({
                equipmentId: Number(item.equipmentId),
                quantity: Number(item.quantity),
            }))
            .filter((item) => !Number.isNaN(item.equipmentId) && !Number.isNaN(item.quantity) && item.quantity > 0);

        await prisma.$transaction(async (transaction) => {
            await transaction.booking.update({
                where: { id: bookingId },
                data: {
                    room_id: roomId,
                    booking_date: new Date(bookingDate),
                    start_time: startTime,
                    end_time: endTime,
                    lesson: body.lesson?.trim() || null,
                    description: body.otherRequirements?.trim() || null,
                    status: BookingStatus.SUBMITTED,
                    review_notes: null,
                    updated_at: new Date(),
                },
            });

            await transaction.bookingTask.deleteMany({
                where: { booking_id: bookingId },
            });

            await transaction.bookingItem.deleteMany({
                where: { booking_id: bookingId },
            });

            if (requestedItems.length > 0) {
                await transaction.bookingItem.createMany({
                    data: requestedItems.map((item) => ({
                        booking_id: bookingId,
                        equipment_id: item.equipmentId,
                        quantity_requested: item.quantity,
                    })),
                });
            }
        });

        revalidatePath("/dashboard/student/bookings");
        revalidatePath("/dashboard/technician");
        revalidatePath("/dashboard/staff");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to update booking." },
            { status: 500 },
        );
    }
}
