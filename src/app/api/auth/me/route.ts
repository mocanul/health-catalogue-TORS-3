import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { validateSession } from "@/lib/auth/session"

export async function GET() {
    try {
        //read session token from HttpOnly cookie
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value

        if (!token) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
        }

        //validate token against DB
        const user = await validateSession(token)

        if (!user) {
            //clear invalid or expired cookie
            const res = NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
            res.cookies.set("session", "", { path: "/", maxAge: 0 })
            return res
        }

        //return user info
        return NextResponse.json(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            { status: 200 }
        )
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
