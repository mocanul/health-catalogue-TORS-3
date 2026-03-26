import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    //store logged in user_id
    const user = await validateSession(token);
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    //search user where is_active is true and role is STUDENT
    const users = await prisma.user.findMany({
        where: {
            AND: [
                { id: { not: user.id } },
                { is_active: true },
                { role: "STUDENT" },
            ],
        },

        //select matching data with the search query
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
        },
    });

    //filter out users that don t match query
    const filtered = users.filter((u) => {
        const ql = q.toLowerCase();
        return (
            u.first_name?.toLowerCase().startsWith(ql) ||
            u.last_name?.toLowerCase().startsWith(ql) ||
            u.email.toLowerCase().startsWith(ql)
        );
    });

    //console log for debugging
    console.log("Search query:", q);
    console.log("Results:", users);

    return NextResponse.json(filtered.slice(0, 10));
}