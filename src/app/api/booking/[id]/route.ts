import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";
import { createAuditLog, getAuditActorName, getRoleLabel } from "@/lib/audit";

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return validateSession(token);
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    try {
        const { id } = await params;
        const bookingId = Number(id);

        if (!Number.isFinite(bookingId) || bookingId <= 0) {
            return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: { select: { first_name: true, last_name: true, email: true } },
                room: { select: { name: true } },
                bookingItems: { include: { equipment: true } },
            },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Only the owner, an accepted contributor, or an admin can view
        const isOwner = booking.created_by === user.id;
        const isAdmin = user.role === "ADMIN";
        const isContributor = await prisma.bookingInvite.findFirst({
            where: { booking_id: bookingId, sent_to: user.id, status: "ACCEPTED" },
        });

        if (!isOwner && !isAdmin && !isContributor) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(booking);

    } catch (error) {
        console.error("Get booking error:", error);
        return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    try {
        const { id } = await params;
        const bookingId = Number(id);

        if (!Number.isFinite(bookingId) || bookingId <= 0) {
            return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
        }

        const existing = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const isOwner = existing.created_by === user.id;
        const isAdmin = user.role === "ADMIN";
        const isContributor = await prisma.bookingInvite.findFirst({
            where: { booking_id: bookingId, sent_to: user.id, status: "ACCEPTED" },
        });

        if (!isOwner && !isAdmin && !isContributor) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { lesson, room_name, booking_date, start_time, end_time, other_requirement, hs_form_path, items, status } = body;

        let room_id = existing.room_id;
        if (room_name) {
            const room = await prisma.room.findFirst({
                where: { name: room_name },
            });
            if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
            room_id = room.id;
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (items && Array.isArray(items)) {
                await tx.bookingItem.deleteMany({
                    where: { booking_id: bookingId },
                });
            }

            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    room_id,
                    lesson: lesson ?? existing.lesson,
                    other_requirement: other_requirement ?? null,
                    booking_date: booking_date
                        ? new Date(`${booking_date}T00:00:00`)
                        : existing.booking_date,
                    start_time: start_time ?? existing.start_time,
                    end_time: end_time ?? existing.end_time,
                    status: status ?? existing.status,
                    hs_form_path: hs_form_path ?? existing.hs_form_path,
                    updated_at: new Date(),
                    ...(items && Array.isArray(items) && {
                        bookingItems: {
                            create: items.map((item: { id: number; quantity: number }) => ({
                                equipment_id: item.id,
                                quantity_requested: item.quantity,
                            })),
                        },
                    }),
                },
            });

            // Audit log is written here whenever a booking is updated, including student edits/resubmissions.
            await createAuditLog(
                {
                    actor: user,
                    actionType: "BOOKING_UPDATED",
                    actionDescription: `${getRoleLabel(user.role)} ${getAuditActorName(user)} updated booking #${updatedBooking.id}`,
                    targetType: "BOOKING",
                    targetId: updatedBooking.id,
                    targetName: `Booking #${updatedBooking.id}`,
                    relatedUserName:
                        isOwner
                            ? getAuditActorName(user)
                            : null,
                    oldValue: {
                        lesson: existing.lesson,
                        room_id: existing.room_id,
                        booking_date: existing.booking_date,
                        start_time: existing.start_time,
                        end_time: existing.end_time,
                        status: existing.status,
                        hs_form_path: existing.hs_form_path,
                    },
                    newValue: {
                        lesson: updatedBooking.lesson,
                        room_id: updatedBooking.room_id,
                        booking_date: updatedBooking.booking_date,
                        start_time: updatedBooking.start_time,
                        end_time: updatedBooking.end_time,
                        status: updatedBooking.status,
                        hs_form_path: updatedBooking.hs_form_path,
                    },
                },
                tx,
            );

            return updatedBooking;
        });

        return NextResponse.json({ success: true, booking_id: updated.id });

    } catch (error) {
        console.error("Booking update error:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }
}
