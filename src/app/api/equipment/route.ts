import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const equipment = await prisma.equipment.findMany({
            where: { is_active: true },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(equipment);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch equipment" },
            { status: 500 }
        );
    }
}