import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";
import { getRequestUser } from "@/lib/auth/requestUser";
import { createAuditLog, getAuditActorName } from "@/lib/audit";

type TaskRequestBody = {
    taskId?: number;
    status?: TaskStatus;
    equipmentPicked?: string;
    missingEquipment?: string;
    taskNotes?: string;
};

export async function PATCH(request: Request) {
    try {
        const user = await getRequestUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        if (!["STAFF", "TECHNICIAN", "ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = (await request.json()) as TaskRequestBody;
        const taskId = Number(body.taskId);

        if (Number.isNaN(taskId)) {
            return NextResponse.json({ error: "Invalid task id." }, { status: 400 });
        }

        const existingTask = await prisma.bookingTask.findUnique({
            where: { id: taskId },
            include: {
                booking: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!existingTask) {
            return NextResponse.json({ error: "Task not found." }, { status: 404 });
        }

        if (user.role === "STAFF" && existingTask.assigned_to !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const nextStatus = body.status ?? TaskStatus.PENDING;
        const nextEquipmentPicked = body.equipmentPicked?.trim() || null;
        const nextMissingEquipment = body.missingEquipment?.trim() || null;
        const nextTaskNotes = body.taskNotes?.trim() || null;
        const actorName = getAuditActorName(user);
        const studentName =
            `${existingTask.booking.user.first_name ?? ""} ${existingTask.booking.user.last_name ?? ""}`.trim() ||
            existingTask.booking.user.email;

        await prisma.$transaction(async (tx) => {
            await tx.bookingTask.update({
                where: { id: taskId },
                data: {
                    status: nextStatus,
                    equipment_picked: nextEquipmentPicked,
                    missing_equipment: nextMissingEquipment,
                    task_notes: nextTaskNotes,
                    updated_at: new Date(),
                },
            });

            // Audit log is written here whenever a task is edited or closed.
            await createAuditLog(
                {
                    actor: user,
                    actionType:
                        nextStatus === "COMPLETED" && existingTask.status !== "COMPLETED"
                            ? "TASK_CLOSED"
                            : "TASK_UPDATED",
                    actionDescription:
                        nextStatus === "COMPLETED" && existingTask.status !== "COMPLETED"
                            ? `${actorName} closed task #${taskId}`
                            : `${actorName} edited task #${taskId}`,
                    targetType: "TASK",
                    targetId: existingTask.id,
                    targetName: `${existingTask.task_type} task #${existingTask.id}`,
                    relatedUserName: studentName,
                    oldValue: {
                        status: existingTask.status,
                        equipment_picked: existingTask.equipment_picked,
                        missing_equipment: existingTask.missing_equipment,
                        task_notes: existingTask.task_notes,
                    },
                    newValue: {
                        status: nextStatus,
                        equipment_picked: nextEquipmentPicked,
                        missing_equipment: nextMissingEquipment,
                        task_notes: nextTaskNotes,
                    },
                },
                tx,
            );
        });

        revalidatePath("/dashboard/technician");
        revalidatePath("/dashboard/staff");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to update task." },
            { status: 500 },
        );
    }
}
