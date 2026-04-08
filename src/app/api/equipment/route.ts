//fetches all equipment to then be displayed on the catalogue

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/requestUser";
import { createAuditLog, getAuditActorName, getRoleLabel } from "@/lib/audit";

export async function GET() {
    try {
        const equipment = await prisma.equipment.findMany({
            where: { is_active: true },
            orderBy: { name: "asc" },
            include: {
                room: {
                    select: { name: true },
                },
            },
        });
        return NextResponse.json(equipment);
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch equipment" },
            { status: 500 }
        );
    }
}

type CreateEquipmentBody = {
    name?: string;
    description?: string | null;
    category?: string | null;
    cost?: number;
    quantity_available?: number;
};

export async function POST(request: Request) {
    try {
        const user = await getRequestUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
        }

        if (!["TECHNICIAN", "ADMIN"].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = (await request.json()) as CreateEquipmentBody;
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

        const createdEquipment = await prisma.$transaction(async (tx) => {
            const equipment = await tx.equipment.create({
                data: {
                    name,
                    description: description || null,
                    category: category || null,
                    cost,
                    quantity_available: quantity,
                    is_active: true,
                },
            });

            // Audit log is written here when a catalogue item is created.
            await createAuditLog(
                {
                    actor: user,
                    actionType: "CATALOGUE_CREATED",
                    actionDescription: `${getRoleLabel(user.role)} ${getAuditActorName(user)} added catalogue item '${equipment.name}'`,
                    targetType: "CATALOGUE_ITEM",
                    targetId: equipment.id,
                    targetName: equipment.name,
                    newValue: {
                        name: equipment.name,
                        description: equipment.description,
                        category: equipment.category,
                        cost: equipment.cost,
                        quantity_available: equipment.quantity_available,
                    },
                },
                tx,
            );

            return equipment;
        });

        return NextResponse.json(createdEquipment, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Failed to create equipment" },
            { status: 500 },
        );
    }
}
