//fetches all equipment to then be displayed on the catalogue

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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