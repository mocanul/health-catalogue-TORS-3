import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

type TaskRequestBody = {
    taskId?: number;
    status?: TaskStatus;
    equipmentPicked?: string;
    missingEquipment?: string;
    taskNotes?: string;
};

export async function PATCH(request: Request) {
    try {
        const body = (await request.json()) as TaskRequestBody;
        const taskId = Number(body.taskId);

        if (Number.isNaN(taskId)) {
            return NextResponse.json({ error: "Invalid task id." }, { status: 400 });
        }

        await prisma.bookingTask.update({
            where: { id: taskId },
            data: {
                status: body.status ?? TaskStatus.PENDING,
                equipment_picked: body.equipmentPicked?.trim() || null,
                missing_equipment: body.missingEquipment?.trim() || null,
                task_notes: body.taskNotes?.trim() || null,
                updated_at: new Date(),
            },
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
