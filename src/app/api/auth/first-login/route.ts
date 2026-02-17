import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { hashToken } from "@/lib/auth/passwordSetup"
import { hashPassword } from "@/lib/auth/hash"

//validation schema
const Schema = z.object({
    token: z.string(),

    //TODO: Add more secure password constraints
    password: z.string().min(8).max(50),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const parsed = Schema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 })
        }

        //hash raw password setup token
        const token_hash = hashToken(parsed.data.token)

        //find matching token
        const record = await prisma.passwordSetupToken.findFirst({
            where: {
                token_hash,
                used_at: null,
                expires_at: { gt: new Date() },
            },

            //select user id that matches with the token
            //allowing to update the correct user's password
            select: { id: true, user_id: true },
        })

        //if no token has been found throw error
        if (!record) {
            return NextResponse.json({ error: "Token invalid or expired" }, { status: 400 })
        }

        //hash new password
        const passwordHash = await hashPassword(parsed.data.password)

        //update user password using transaction
        await prisma.$transaction([
            prisma.user.update({
                where: { id: record.user_id },
                data: { passwordHash },
            }),

            //invalidate token by updating used_at to (now)
            //invalidate any other possible token the user might have
            prisma.passwordSetupToken.updateMany({
                where: { user_id: record.user_id, used_at: null },
                data: { used_at: new Date() },
            }),
        ])

        //return success respone or catch any unexpected error
        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
