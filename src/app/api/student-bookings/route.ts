import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";
import { createAuditLog, getAuditActorName, getRoleLabel } from "@/lib/audit";

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
            include: {
                room: {
                    select: {
                        name: true,
                    },
                },
            },
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
            const updatedBooking = await transaction.booking.update({
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

            const updatedRoom = await transaction.room.findUnique({
                where: { id: roomId },
                select: { name: true },
            });

            // Audit log is written here whenever a student edits and resubmits a booking.
            await createAuditLog(
                {
                    actor: sessionUser,
                    actionType: "BOOKING_RESUBMITTED",
                    actionDescription: `${getRoleLabel(sessionUser.role)} ${getAuditActorName(sessionUser)} resubmitted booking #${bookingId}`,
                    targetType: "BOOKING",
                    targetId: bookingId,
                    targetName: updatedRoom?.name
                        ? `${updatedRoom.name} booking`
                        : `Booking #${bookingId}`,
                    relatedUserName: getAuditActorName(sessionUser),
                    oldValue: {
                        room_id: booking.room_id,
                        room_name: booking.room?.name ?? null,
                        booking_date: booking.booking_date,
                        start_time: booking.start_time,
                        end_time: booking.end_time,
                        lesson: booking.lesson,
                        status: booking.status,
                        review_notes: booking.review_notes,
                    },
                    newValue: {
                        room_id: updatedBooking.room_id,
                        room_name: updatedRoom?.name ?? null,
                        booking_date: updatedBooking.booking_date,
                        start_time: updatedBooking.start_time,
                        end_time: updatedBooking.end_time,
                        lesson: updatedBooking.lesson,
                        status: updatedBooking.status,
                    },
                },
                transaction,
            );
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



