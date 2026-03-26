//fetches all equipment to then be displayed on the catalogue

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const equipment = await prisma.equipment.findMany({
            where: { is_active: true },
            orderBy: { name: "asc" },
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

        const createdEquipment = await prisma.equipment.create({
            data: {
                name,
                description: description || null,
                category: category || null,
                cost,
                quantity_available: quantity,
                is_active: true,
            },
        });

        return NextResponse.json(createdEquipment, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Failed to create equipment" },
            { status: 500 },
        );
    }
}
