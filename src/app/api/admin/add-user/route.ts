import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { hashPassword } from "@/lib/auth/hash"
import { Prisma } from "@prisma/client"
import crypto from "crypto"

//shape of user account 
const userSchema = z.object({
    firstName: z.string().trim().min(1).max(255),
    lastName: z.string().trim().min(1).max(255),
    email: z.string().trim().email().max(255),
    role: z.enum(["ADMIN", "TECHNICIAN", "STAFF", "STUDENT"]),
    password: z.string().min(8).max(200),
})

function generateTemporaryPassword(length = 16): string {
    return crypto.randomBytes(length)
        .toString("base64url")
        .slice(0, length)
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const data = userSchema.parse(body)

        //create random password and hash
        //user will get to choose their own password later
        const password = generateTemporaryPassword();
        const passwordHash = await hashPassword(password)

        //create user
        const user = await prisma.user.create({
            data: {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email.toLowerCase(),
                role: data.role,
                passwordHash,
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
                is_active: true,
                created_at: true,
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", issues: err.issues },
                { status: 400 }
            )
        }

        //if email already exists in database
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 409 }
            )
        }

        console.error("Create account error:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
