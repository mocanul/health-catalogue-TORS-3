import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";

//get user Id
async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return validateSession(token);
}

// create invite without the booking ID
export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { sent_to } = await req.json();

    const invite = await prisma.bookingInvite.create({
        data: {
            sent_by: user.id,
            sent_to,
            booking_id: null,
        },
    });

    return NextResponse.json({ invite_id: invite.id });
}

//attach pending invite to booking_id
export async function PATCH(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { booking_id, invite_ids } = await req.json();

    await prisma.bookingInvite.updateMany({
        where: {
            id: { in: invite_ids },
            sent_by: user.id,
            booking_id: null,
        },
        data: { booking_id },
    });

    return NextResponse.json({ success: true });
}

//delete pending invites without the booking id
export async function DELETE(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { invite_ids } = await req.json();

    await prisma.bookingInvite.deleteMany({
        where: {
            id: { in: invite_ids },
            sent_by: user.id,
            booking_id: null,
        },
    });

    return NextResponse.json({ success: true });
}