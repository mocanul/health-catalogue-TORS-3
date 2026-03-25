import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                type: true,
                side_rooms: true,
            },
        });
        return NextResponse.json(rooms);
    } catch {
        return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
    }
}