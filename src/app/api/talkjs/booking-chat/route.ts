import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";
import {
    getTalkJsAppId,
    talkJsApiFetch,
    toTalkJsConversationId,
    toTalkJsUserId,
} from "@/lib/talkjs";

type BookingChatRequestBody = {
    bookingId?: number;
};

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;
        const sessionUser = token ? await validateSession(token) : null;

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
        }

        const body = (await request.json()) as BookingChatRequestBody;
        const bookingId = Number(body.bookingId);

        if (Number.isNaN(bookingId)) {
            return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                room: true,
            },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        const isStudentOwner =
            sessionUser.role === "STUDENT" && booking.created_by === sessionUser.id;
        const isSupportUser =
            sessionUser.role === "TECHNICIAN" ||
            sessionUser.role === "STAFF" ||
            sessionUser.role === "ADMIN";

        if (!isStudentOwner && !isSupportUser) {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        const supportUsers = await prisma.user.findMany({
            where: {
                is_active: true,
                role: {
                    in: ["TECHNICIAN", "STAFF", "ADMIN"],
                },
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
            },
        });

        const participants = [
            {
                id: booking.user.id,
                first_name: booking.user.first_name,
                last_name: booking.user.last_name,
                email: booking.user.email,
                role: booking.user.role,
            },
            ...supportUsers,
        ];

        const uniqueParticipants = Array.from(
            new Map(participants.map((participant) => [participant.id, participant])).values(),
        );

        const appId = getTalkJsAppId();
        const conversationId = toTalkJsConversationId(booking.id);
        const dateLabel = new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(booking.booking_date);

        await Promise.all(
            uniqueParticipants.map((participant) =>
                talkJsApiFetch(`/v1/${appId}/users/${toTalkJsUserId(participant.id)}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        name:
                            `${participant.first_name ?? ""} ${participant.last_name ?? ""}`.trim() ||
                            participant.email,
                        email: [participant.email],
                        role: "default",
                        custom: {
                            torsRole: participant.role,
                        },
                    }),
                }),
            ),
        );

        await talkJsApiFetch(`/v1/${appId}/conversations/${conversationId}`, {
            method: "PUT",
            body: JSON.stringify({
                subject: `${booking.room.name} - ${dateLabel}`,
                custom: {
                    bookingId: String(booking.id),
                    roomName: booking.room.name,
                    bookingDate: booking.booking_date.toISOString().slice(0, 10),
                },
                participants: uniqueParticipants.map((participant) =>
                    toTalkJsUserId(participant.id),
                ),
            }),
        });

        await Promise.all(
            uniqueParticipants.map((participant) =>
                talkJsApiFetch(
                    `/v1/${appId}/conversations/${conversationId}/participants/${toTalkJsUserId(participant.id)}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            access: "ReadWrite",
                            notify: true,
                        }),
                    },
                ),
            ),
        );

        return NextResponse.json({
            appId,
            conversationId,
            currentUserId: toTalkJsUserId(sessionUser.id),
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to prepare booking chat." },
            { status: 500 },
        );
    }
}

