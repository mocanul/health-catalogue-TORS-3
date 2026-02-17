import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkLoginRateLimit, normalizeEmail } from "@/lib/auth/loginRateLimiter";
import { z } from "zod";
import bcrypt from "bcrypt";
import { createSession } from "@/lib/auth/session";
import { cookies } from "next/headers";


const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

//get client IP
function getClientIp(req: NextRequest): string {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();

    const xri = req.headers.get("x-real-ip");
    if (xri) return xri;

    return "unknown";
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = LoginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request payload" },
                { status: 400 }
            );
        }

        const email = normalizeEmail(parsed.data.email);
        const password = parsed.data.password;
        const ip_address = getClientIp(req);

        //before verifying password, check rate limit
        const rateLimit = await checkLoginRateLimit(email);

        if (!rateLimit.allowed) {
            const res = NextResponse.json(
                { error: "Too many failed attempts. Try again later." },
                { status: 429 }
            );

            res.headers.set("Retry-After", String(rateLimit.retryAfterSec));
            return res; //do not log attempt if user is still locked
        }

        //fetch user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            //log failed attempt
            await prisma.loginAttempt.create({
                data: {
                    email,
                    ip_address,
                    success: false,
                },
            });

            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        //verify password
        const passwordMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatch) {
            //log failed attempt
            await prisma.loginAttempt.create({
                data: {
                    email,
                    ip_address,
                    success: false,
                },
            });

            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        //login is successful
        await prisma.loginAttempt.create({
            data: {
                email,
                ip_address,
                success: true,
            },
        });

        //create session with raw token
        const token = await createSession(user.id);

        //set HttpOnly cookie
        const cookieStore = await cookies();

        cookieStore.set("session", token, {
            //prevents JS access and ensures cookie is only sent over HTTPS
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",

            //security layer
            sameSite: "lax",

            //path is set to the root so is available to the entire application
            //cookie expires in an hour
            path: "/",
            maxAge: 60 * 60,
        });

        return NextResponse.json(
            { message: "Login successful" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
