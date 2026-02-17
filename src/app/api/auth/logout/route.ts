import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function POST() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value

        if (token) {
            const token_hash = hashToken(token)

            //make session revoked true
            await prisma.session.updateMany({
                where: { token_hash },
                data: { revoked: true },
            })
        }

        const res = NextResponse.json({ success: true })

        //clear cookie
        res.cookies.set("session", "", {
            path: "/",
            maxAge: 0,
        })

        return res
    } catch {
        return NextResponse.json(
            { error: "Logout failed" },
            { status: 500 }
        )
    }
}
