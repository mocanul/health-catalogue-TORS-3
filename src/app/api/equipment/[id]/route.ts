import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/auth/requestUser";
import { createAuditLog, getAuditActorName, getRoleLabel } from "@/lib/audit";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type UpdateEquipmentBody = {
    name?: string;
    description?: string | null;
    category?: string | null;
    cost?: number;
    quantity_available?: number;
};

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const user = await getRequestUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        if (!["TECHNICIAN", "ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;
        const equipmentId = Number(id);

        if (Number.isNaN(equipmentId)) {
            return NextResponse.json({ error: "Invalid equipment id." }, { status: 400 });
        }

        const body = (await request.json()) as UpdateEquipmentBody;
        const name = body.name?.trim();
        const description = body.description?.trim() ?? "";
        const category = body.category?.trim() ?? "";
        const cost = Number(body.cost ?? 0);
        const quantity = Number(body.quantity_available);

        if (!name) {
            return NextResponse.json({ error: "Item name is required." }, { status: 400 });
        }

        if (Number.isNaN(cost) || cost < 0) {
            return NextResponse.json(
                { error: "Cost must be 0 or more." },
                { status: 400 },
            );
        }

        if (Number.isNaN(quantity) || quantity < 0) {
            return NextResponse.json(
                { error: "Quantity must be 0 or more." },
                { status: 400 },
            );
        }

        const existingEquipment = await prisma.equipment.findUnique({
            where: { id: equipmentId },
        });

        if (!existingEquipment) {
            return NextResponse.json({ error: "Equipment not found." }, { status: 404 });
        }

        const updatedEquipment = await prisma.$transaction(async (tx) => {
            const equipment = await tx.equipment.update({
                where: { id: equipmentId },
                data: {
                    name,
                    description: description || null,
                    category: category || null,
                    cost,
                    quantity_available: quantity,
                },
            });

            const actorName = getAuditActorName(user);
            const quantityChanged = existingEquipment.quantity_available !== equipment.quantity_available;
            const actionDescription = quantityChanged
                ? `${getRoleLabel(user.role)} ${actorName} updated stock for catalogue item '${equipment.name}'`
                : `${getRoleLabel(user.role)} ${actorName} updated catalogue item '${equipment.name}'`;

            // Audit log is written here when a catalogue item is updated.
            await createAuditLog(
                {
                    actor: user,
                    actionType: quantityChanged ? "CATALOGUE_STOCK_UPDATED" : "CATALOGUE_UPDATED",
                    actionDescription,
                    targetType: "CATALOGUE_ITEM",
                    targetId: equipment.id,
                    targetName: equipment.name,
                    oldValue: {
                        name: existingEquipment.name,
                        description: existingEquipment.description,
                        category: existingEquipment.category,
                        cost: existingEquipment.cost,
                        quantity_available: existingEquipment.quantity_available,
                        is_active: existingEquipment.is_active,
                    },
                    newValue: {
                        name: equipment.name,
                        description: equipment.description,
                        category: equipment.category,
                        cost: equipment.cost,
                        quantity_available: equipment.quantity_available,
                        is_active: equipment.is_active,
                    },
                },
                tx,
            );

            return equipment;
        });

        return NextResponse.json(updatedEquipment);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to update equipment." },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const user = await getRequestUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        if (!["TECHNICIAN", "ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await context.params;
        const equipmentId = Number(id);

        if (Number.isNaN(equipmentId)) {
            return NextResponse.json({ error: "Invalid equipment id." }, { status: 400 });
        }

        const existingEquipment = await prisma.equipment.findUnique({
            where: { id: equipmentId },
        });

        if (!existingEquipment) {
            return NextResponse.json({ error: "Equipment not found." }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.equipment.update({
                where: { id: equipmentId },
                data: {
                    is_active: false,
                },
            });

            // Audit log is written here when a catalogue item is deleted.
            await createAuditLog(
                {
                    actor: user,
                    actionType: "CATALOGUE_DELETED",
                    actionDescription: `${getRoleLabel(user.role)} ${getAuditActorName(user)} deleted catalogue item '${existingEquipment.name}'`,
                    targetType: "CATALOGUE_ITEM",
                    targetId: existingEquipment.id,
                    targetName: existingEquipment.name,
                    oldValue: {
                        name: existingEquipment.name,
                        description: existingEquipment.description,
                        category: existingEquipment.category,
                        cost: existingEquipment.cost,
                        quantity_available: existingEquipment.quantity_available,
                        is_active: existingEquipment.is_active,
                    },
                    newValue: {
                        is_active: false,
                    },
                },
                tx,
            );
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to delete equipment." },
            { status: 500 },
        );
    }
}
