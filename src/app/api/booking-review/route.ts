import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookingStatus, TaskType } from "@prisma/client";

type ReviewRequestBody = {
    bookingId?: number;
    action?: "approve" | "decline";
    note?: string;
    setupAssigneeId?: number | null;
    stripdownAssigneeId?: number | null;
};

export async function PATCH(request: Request) {
    try {
        const body = (await request.json()) as ReviewRequestBody;
        const bookingId = Number(body.bookingId);

        if (Number.isNaN(bookingId)) {
            return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
        }

        if (body.action !== "approve" && body.action !== "decline") {
            return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
        }

        if (body.action === "decline") {
            const declineNote = body.note?.trim();

            if (!declineNote) {
                return NextResponse.json(
                    { error: "A decline note is required." },
                    { status: 400 },
                );
            }

            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: BookingStatus.REJECTED,
                    review_notes: declineNote,
                    updated_at: new Date(),
                },
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
