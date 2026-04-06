import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const user = await validateSession(token);
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    const status = body?.status as string | undefined;
    const inviteId = Number(resolvedParams.id);

    if (!Number.isFinite(inviteId) || inviteId <= 0) {
        return NextResponse.json({ error: "Invalid invite id" }, { status: 400 });
    }

    const allowedStatus = ["ACCEPTED", "REJECTED"] as const;
    type AllowedStatus = typeof allowedStatus[number];

    if (!status || !allowedStatus.includes(status as AllowedStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const newStatus = status as AllowedStatus;

    const invite = await prisma.bookingInvite.findUnique({ where: { id: inviteId } });
    if (!invite) {
        return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.sent_to !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invite.status !== "PENDING") {
        return NextResponse.json({ error: "Invite already responded" }, { status: 400 });
    }

    await prisma.bookingInvite.update({
        where: { id: inviteId },
        data: {
            status: newStatus,
            accepted_at: newStatus === "ACCEPTED" ? new Date() : null,
        },
    });

    return NextResponse.json({ success: true });
}