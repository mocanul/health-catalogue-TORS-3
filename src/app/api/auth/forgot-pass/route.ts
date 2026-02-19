import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import { createPasswordSetupToken } from "@/lib/auth/passwordSetup";
import { sendForgotPasswordRequest } from "@/lib/mail";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, first_name: true, last_name: true, email: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const { rawToken } = await createPasswordSetupToken(user.id, 30)

        //base url link from .env file
        const baseUrl = process.env.APP_BASE_URL

        //form complete url using raw token created in the password setup function
        const link = `${baseUrl}/login/first-login?token=${encodeURIComponent(rawToken)}`

        await sendForgotPasswordRequest({
            email: user.email,
            firstName: user.first_name ?? "User",
            setupLink: link,
        })

        return NextResponse.json({ userId: user.id, email: user.email }, { status: 200 })
    } catch (error) {
        console.error("Error fetching user:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}