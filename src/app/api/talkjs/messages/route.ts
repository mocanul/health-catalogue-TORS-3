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

type BookingChatMessageRequestBody = {
    bookingId?: number;
    text?: string;
};

type SessionUser = Awaited<ReturnType<typeof validateSession>>;

async function getSessionUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    return token ? await validateSession(token) : null;
}

async function getChatContext(sessionUser: NonNullable<SessionUser>, bookingId: number) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            user: true,
        },
    });

    if (!booking) {
        return { error: NextResponse.json({ error: "Booking not found." }, { status: 404 }) };
    }

    const isStudentOwner =
        sessionUser.role === "STUDENT" && booking.created_by === sessionUser.id;
    const isSupportUser =
        sessionUser.role === "TECHNICIAN" || sessionUser.role === "STAFF";

    if (!isStudentOwner && !isSupportUser) {
        return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
    }

    const supportUsers = await prisma.user.findMany({
        where: {
            is_active: true,
            role: {
                in: ["TECHNICIAN", "STAFF"],
            },
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
        },
    });

    const participantNameLookup = new Map<string, string>();

    participantNameLookup.set(
        toTalkJsUserId(booking.user.id),
        `${booking.user.first_name ?? ""} ${booking.user.last_name ?? ""}`.trim() || booking.user.email,
    );

    for (const supportUser of supportUsers) {
        participantNameLookup.set(
            toTalkJsUserId(supportUser.id),
            `${supportUser.first_name ?? ""} ${supportUser.last_name ?? ""}`.trim() || supportUser.email,
        );
    }

    return {
        booking,
        conversationId: toTalkJsConversationId(booking.id),
        participantNameLookup,
    };
}

export async function GET(request: Request) {
    try {
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const bookingId = Number(searchParams.get("bookingId"));

        if (Number.isNaN(bookingId)) {
            return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
        }

        const context = await getChatContext(sessionUser, bookingId);

        if ("error" in context) {
            return context.error;
        }

        const appId = getTalkJsAppId();
        const response = await talkJsApiFetch(
            `/v1/${appId}/conversations/${context.conversationId}/messages`,
        ) as { data?: Array<{ id: string; senderId: string | null; type: string; text: string; createdAt: number }> };

        const messages = (response.data ?? [])
            .map((message) => ({
                id: message.id,
                senderId: message.senderId,
                type: message.type,
                text: message.text,
                createdAt: message.createdAt,
                senderName: message.senderId
                    ? context.participantNameLookup.get(message.senderId) || "Support team"
                    : "System",
            }))
            .sort((left, right) => left.createdAt - right.createdAt);

        return NextResponse.json({
            currentUserId: toTalkJsUserId(sessionUser.id),
            messages,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to load booking chat." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
        }

        const body = (await request.json()) as BookingChatMessageRequestBody;
        const bookingId = Number(body.bookingId);
        const text = body.text?.trim() || "";

        if (Number.isNaN(bookingId)) {
            return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
        }

        if (!text) {
            return NextResponse.json({ error: "Write a message before sending." }, { status: 400 });
        }

        const context = await getChatContext(sessionUser, bookingId);

        if ("error" in context) {
            return context.error;
        }

        const appId = getTalkJsAppId();
        await talkJsApiFetch(`/v1/${appId}/conversations/${context.conversationId}/messages`, {
            method: "POST",
            body: JSON.stringify([
                {
                    text,
                    sender: toTalkJsUserId(sessionUser.id),
                    type: "UserMessage",
                    idempotencyKey: `${sessionUser.id}-${Date.now()}`,
                },
            ]),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to send booking chat message." }, { status: 500 });
    }
}
