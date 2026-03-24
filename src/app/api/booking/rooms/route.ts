import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json(rooms);
    } catch {
        return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
    }
}