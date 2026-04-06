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

//create invite without booking id
export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { sent_to } = await req.json();

    const invite = await prisma.bookingInvite.create({
        data: {
            sent_by: user.id,
            sent_to,
            status: "PENDING"
        },
    });

    return NextResponse.json({ invite_id: invite.id });
}

//attach booking id to invites
export async function PATCH(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { booking_id, invite_ids } = await req.json();

    await prisma.bookingInvite.updateMany({
        where: {
            id: { in: invite_ids },
            sent_by: user.id,
        },
        data: { booking_id },
    });

    return NextResponse.json({ success: true });
}

//delete pending invites if no booking id exists
export async function DELETE(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const invite_ids = searchParams.get("ids")?.split(",").map(Number) ?? [];

    await prisma.bookingInvite.deleteMany({
        where: {
            id: { in: invite_ids },
            sent_by: user.id,
            booking_id: null,
        },
    });

    return NextResponse.json({ success: true });
}