import crypto from "crypto"
import { prisma } from "@/lib/prisma"

//generate token
export function generateRawToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString("base64url")
}

//hash token
export function hashToken(raw: string) {
    return crypto.createHash("sha256").update(raw).digest("hex")
}

//password token function
export async function createPasswordSetupToken(user_id: number, ttlMinutes = 30) {
    const rawToken = generateRawToken()
    const token_hash = hashToken(rawToken)
    const expires_at = new Date(Date.now() + ttlMinutes * 60 * 1000)

    //push password setup token record to database
    await prisma.passwordSetupToken.create({
        data: {
            user_id,
            token_hash,
            expires_at,
        },
    })

    return { rawToken, expires_at }
}
