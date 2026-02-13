import crypto from "crypto"
import { prisma } from "@/lib/prisma"

//32 bytes session token, for better security
const sessionToken = 32

//generates session token using crypto
export function generateSessionToken(): string {
    return crypto.randomBytes(sessionToken).toString("hex")
}

//hashes token using sha-256, for further security
export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
}

//creates session in database, returns plain session token
export async function createSession(userId: string): Promise<string> {

    //create token
    const token = generateSessionToken()

    //hashtoken
    const tokenHash = hashToken(token)

    //set session expiry time to 1 hour
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60)

    //create session in database
    await prisma.session.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    })

    //return plain token, which will go in the cookie
    return token
}

//validate session, if exists in database, returning user_id with the linked session token
//identifying the user that owns the session
export async function validateSession(token: string) {

    //hash plain session token from cookie
    const tokenHash = hashToken(token)

    //find user_id where tokenHash
    const session = await prisma.session.findUnique({
        where: { tokenHash },
        include: { user: true },
    })

    //if session doesn't exist, is revoked, is expired, is innactive, return null
    if (!session || session.revoked || session.expiresAt < new Date() || !session.user.isActive) {
        return null
    }

    //return user
    return session.user
}

