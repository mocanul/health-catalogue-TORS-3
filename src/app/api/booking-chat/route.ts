import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";

type CreateMessageBody = {
  bookingId?: number;
  message?: string;
};

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  return token ? await validateSession(token) : null;
}

async function getAccessibleBooking(userId: number, role: string, bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      invites: {
        where: {
          sent_to: userId,
          status: "ACCEPTED",
        },
        select: { id: true },
      },
    },
  });

  if (!booking) {
    return null;
  }

  const isSupportUser =
    role === "TECHNICIAN" || role === "STAFF" || role === "ADMIN";
  const isStudentOwner = booking.created_by === userId;
  const isAcceptedInvitee = booking.invites.length > 0;

  if (!isSupportUser && !isStudentOwner && !isAcceptedInvitee) {
    return null;
  }

  return booking;
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

    const booking = await getAccessibleBooking(sessionUser.id, sessionUser.role, bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const messages = await prisma.bookingMessage.findMany({
      where: { booking_id: bookingId },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    });

    return NextResponse.json({
      messages: messages.map((message) => ({
        id: message.id,
        text: message.message,
        createdAt: message.created_at.toISOString(),
        senderId: message.sender.id,
        senderName:
          `${message.sender.first_name ?? ""} ${message.sender.last_name ?? ""}`.trim() ||
          message.sender.email,
        senderRole: message.sender.role,
      })),
      currentUserId: sessionUser.id,
      bookingOwnerId: booking.user.id,
      bookingOwnerName:
        `${booking.user.first_name ?? ""} ${booking.user.last_name ?? ""}`.trim() ||
        booking.user.email,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load booking chat." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const body = (await request.json()) as CreateMessageBody;
    const bookingId = Number(body.bookingId);
    const message = body.message?.trim();

    if (Number.isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking id." }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: "Write a message first." }, { status: 400 });
    }

    const booking = await getAccessibleBooking(sessionUser.id, sessionUser.role, bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const createdMessage = await prisma.bookingMessage.create({
      data: {
        booking_id: bookingId,
        sender_id: sessionUser.id,
        message,
      },
      include: {
        sender: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: {
        id: createdMessage.id,
        text: createdMessage.message,
        createdAt: createdMessage.created_at.toISOString(),
        senderId: createdMessage.sender.id,
        senderName:
          `${createdMessage.sender.first_name ?? ""} ${createdMessage.sender.last_name ?? ""}`.trim() ||
          createdMessage.sender.email,
        senderRole: createdMessage.sender.role,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send booking chat message." },
      { status: 500 },
    );
  }
}
