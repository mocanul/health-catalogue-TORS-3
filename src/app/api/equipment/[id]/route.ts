import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        const updatedEquipment = await prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                name,
                description: description || null,
                category: category || null,
                cost,
                quantity_available: quantity,
            },
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
        const { id } = await context.params;
        const equipmentId = Number(id);

        if (Number.isNaN(equipmentId)) {
            return NextResponse.json({ error: "Invalid equipment id." }, { status: 400 });
        }

        await prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                is_active: false,
            },
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
