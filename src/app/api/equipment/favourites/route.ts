import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return validateSession(token);
}

//fetch all favourites for the logged in user
export async function GET() {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const favourites = await prisma.favourite.findMany({
        where: { user_id: user.id },
        select: { equipment_id: true },
    });

    return NextResponse.json(favourites.map((f) => f.equipment_id));
}

//toggle favourite items
export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { equipment_id } = await req.json();

    //check if items is already favourited by user
    const existing = await prisma.favourite.findUnique({
        where: {
            user_id_equipment_id: {
                user_id: user.id,
                equipment_id,
            },
        },
    });

    //if exists, delete row
    if (existing) {
        await prisma.favourite.delete({
            where: {
                user_id_equipment_id: {
                    user_id: user.id,
                    equipment_id,
                },
            },
        });
        return NextResponse.json({ favourited: false });

        //if doesn't, create row with user_id and item_id
    } else {
        await prisma.favourite.create({
            data: { user_id: user.id, equipment_id },
        });
        return NextResponse.json({ favourited: true });
    }
}