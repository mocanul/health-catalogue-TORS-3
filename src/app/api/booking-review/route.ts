import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookingStatus, TaskType } from "@prisma/client";
import { getRequestUser } from "@/lib/auth/requestUser";
import { createAuditLog, getAuditActorName, getRoleLabel } from "@/lib/audit";

type ReviewRequestBody = {
    bookingId?: number;
    action?: "approve" | "decline";
    note?: string;
    setupAssigneeId?: number | null;
    stripdownAssigneeId?: number | null;
};

export async function PATCH(request: Request) {
    try {
        const user = await getRequestUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        if (!["TECHNICIAN", "ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = (await request.json()) as ReviewRequestBody;
        const bookingId = Number(body.bookingId);

        if (Number.isNaN(bookingId)) {
            return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
        }

        if (body.action !== "approve" && body.action !== "decline") {
            return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                room: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        const actorName = getAuditActorName(user);
        const studentName =
            `${booking.user.first_name ?? ""} ${booking.user.last_name ?? ""}`.trim() ||
            booking.user.email;

        if (body.action === "decline") {
            const declineNote = body.note?.trim();

            if (!declineNote) {
                return NextResponse.json(
                    { error: "A decline note is required." },
                    { status: 400 },
                );
            }

            await prisma.$transaction(async (tx) => {
                await tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: BookingStatus.REJECTED,
                        review_notes: declineNote,
                        updated_at: new Date(),
                    },
                });

                // Audit log is written here when a booking is denied.
                await createAuditLog(
                    {
                        actor: user,
                        actionType: "BOOKING_DENIED",
                        actionDescription: `${getRoleLabel(user.role)} ${actorName} denied booking for ${studentName}`,
                        targetType: "BOOKING",
                        targetId: booking.id,
                        targetName: `${booking.room.name} booking`,
                        relatedUserName: studentName,
                        oldValue: {
                            status: booking.status,
                            review_notes: booking.review_notes,
                        },
                        newValue: {
                            status: BookingStatus.REJECTED,
                            review_notes: declineNote,
                        },
                    },
                    tx,
                );
            });
        }

        if (body.action === "approve") {
            const taskRows = [
                body.setupAssigneeId
                    ? {
                        assigned_to: body.setupAssigneeId,
                        task_type: TaskType.SETUP,
                        updated_at: new Date(),
                    }
                    : null,
                body.stripdownAssigneeId
                    ? {
                        assigned_to: body.stripdownAssigneeId,
                        task_type: TaskType.STRIPDOWN,
                        updated_at: new Date(),
                    }
                    : null,
            ].filter((task): task is {
                assigned_to: number;
                task_type: TaskType;
                updated_at: Date;
            } => task !== null);

            await prisma.$transaction(async (transaction) => {
                await transaction.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: BookingStatus.APPROVED,
                        review_notes: null,
                        updated_at: new Date(),
                    },
                });

                await transaction.bookingTask.deleteMany({
                    where: { booking_id: bookingId },
                });

                if (taskRows.length > 0) {
                    await transaction.bookingTask.createMany({
                        data: taskRows.map((taskRow) => ({
                            booking_id: bookingId,
                            assigned_to: taskRow.assigned_to,
                            task_type: taskRow.task_type,
                            updated_at: taskRow.updated_at,
                        })),
                    });
                }

                // Audit log is written here when a booking is approved.
                await createAuditLog(
                    {
                        actor: user,
                        actionType: "BOOKING_APPROVED",
                        actionDescription: `${getRoleLabel(user.role)} ${actorName} approved booking for ${studentName}`,
                        targetType: "BOOKING",
                        targetId: booking.id,
                        targetName: `${booking.room.name} booking`,
                        relatedUserName: studentName,
                        oldValue: {
                            status: booking.status,
                            review_notes: booking.review_notes,
                        },
                        newValue: {
                            status: BookingStatus.APPROVED,
                            setupAssigneeId: body.setupAssigneeId ?? null,
                            stripdownAssigneeId: body.stripdownAssigneeId ?? null,
                        },
                    },
                    transaction,
                );
            });
        }

        revalidatePath("/dashboard/technician");
        revalidatePath("/dashboard/staff");
        revalidatePath("/dashboard/student/timetable");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to review booking." },
            { status: 500 },
        );
    }
}
