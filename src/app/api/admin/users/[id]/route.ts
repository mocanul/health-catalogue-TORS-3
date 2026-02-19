// app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";

const PatchSchema = z.object({
    first_name: z.string().trim().max(255).optional(),
    last_name: z.string().trim().min(1).max(255).optional(),
    email: z.string().trim().email().max(255).optional(),
    role: z.enum(["ADMIN", "TECHNICIAN", "STAFF", "STUDENT"]).optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserToApi(u: any) {
    return {
        id: String(u.id),
        first_name: u.firstName ?? null,
        last_name: u.lastName ?? null,
        email: u.email,
        role: u.role,
    };
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        //get sesion cookie and validate session
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        }

        const sessionUser = await validateSession(token);
        if (!sessionUser) {
            const res = NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
            res.cookies.set("session", "", { path: "/", maxAge: 0 });
            return res;
        }

        //only allow admin to make changes to users
        if (sessionUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        //get user id
        const { id } = await context.params;
        const userId = Number(id);
        if (!Number.isFinite(userId)) {
            return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
        }

        //validate
        const raw = await req.json();
        const parsed = PatchSchema.safeParse(raw);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid payload", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { first_name, last_name, email, role } = parsed.data;

        //update user in database
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(first_name !== undefined ? { first_name: first_name } : {}),
                ...(last_name !== undefined ? { last_name: last_name } : {}),
                ...(email !== undefined ? { email } : {}),
                ...(role !== undefined ? { role } : {}),
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
            },
        });

        return NextResponse.json(mapUserToApi(updated), { status: 200 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        //user not found error
        if (err?.code === "P2025") {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        //unique email already exists in database
        if (err?.code === "P2002") {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        console.error("PATCH /api/admin/users/[id] failed:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        //get session cookie and validate session
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        }

        const sessionUser = await validateSession(token);
        if (!sessionUser) {
            const res = NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
            res.cookies.set("session", "", { path: "/", maxAge: 0 });
            return res;
        }

        //only allow admin to delete users
        if (sessionUser.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        //get user id
        const { id } = await context.params;
        const userId = Number(id);
        if (!Number.isFinite(userId)) {
            return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
        }

        //prevent admin from deleting themselves
        if (sessionUser.id === userId) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
        }

        //delete user from database
        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ success: true }, { status: 200 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        //user not found error
        if (err?.code === "P2025") {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.error("DELETE /api/admin/users/[id] failed:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
