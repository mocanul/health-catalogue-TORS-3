import { NextRequest } from "next/server"

jest.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        loginAttempt: {
            create: jest.fn(),
        },
    },
}))

jest.mock("@/lib/auth/loginRateLimiter", () => ({
    checkLoginRateLimit: jest.fn(),
    normalizeEmail: jest.fn(),
}))

jest.mock("bcrypt", () => ({
    __esModule: true,
    default: {
        compare: jest.fn(),
    },
}))

jest.mock("@/lib/auth/session", () => ({
    createSession: jest.fn(),
}))

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}))

const { prisma: mockPrisma } = jest.requireMock("@/lib/prisma") as {
    prisma: {
        user: {
            findUnique: jest.Mock
        }
        loginAttempt: {
            create: jest.Mock
        }
    }
}

const { checkLoginRateLimit: mockCheckLoginRateLimit, normalizeEmail: mockNormalizeEmail } =
    jest.requireMock("@/lib/auth/loginRateLimiter") as {
        checkLoginRateLimit: jest.Mock
        normalizeEmail: jest.Mock
    }

const { default: mockBcrypt } = jest.requireMock("bcrypt") as {
    default: {
        compare: jest.Mock
    }
}

const { createSession: mockCreateSession } = jest.requireMock("@/lib/auth/session") as {
    createSession: jest.Mock
}

const { cookies: mockCookies } = jest.requireMock("next/headers") as {
    cookies: jest.Mock
}

import { POST } from "@/app/api/auth/login/route"

describe("POST /api/auth/login", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockNormalizeEmail.mockImplementation((email: string) => email.trim().toLowerCase())
        mockCheckLoginRateLimit.mockResolvedValue({ allowed: true })
    })

    it("returns 400 when request body is invalid", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({ email: "not-an-email", password: "" }),
            headers: {
                get: jest.fn().mockReturnValue(null),
            },
        } as unknown as NextRequest

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body).toEqual({ error: "Invalid request payload" })
        expect(mockCheckLoginRateLimit).not.toHaveBeenCalled()
    })

    it("returns 429 when rate limit is exceeded", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({ email: "User@Example.com", password: "pass" }),
            headers: {
                get: jest.fn().mockReturnValue(null),
            },
        } as unknown as NextRequest

        mockCheckLoginRateLimit.mockResolvedValue({ allowed: false, retryAfterSec: 90 })

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(429)
        expect(body).toEqual({ error: "Too many failed attempts. Try again later." })
        expect(res.headers.get("Retry-After")).toBe("90")
        expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
    })

    it("returns 401 and logs failed attempt when user does not exist", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({ email: "User@Example.com", password: "pass" }),
            headers: {
                get: jest.fn((name: string) => {
                    if (name === "x-forwarded-for") return "203.0.113.9, 10.0.0.1"
                    return null
                }),
            },
        } as unknown as NextRequest

        mockPrisma.user.findUnique.mockResolvedValue(null)

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(401)
        expect(body).toEqual({ error: "Invalid email or password" })
        expect(mockNormalizeEmail).toHaveBeenCalledWith("User@Example.com")
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: "user@example.com" },
        })
        expect(mockPrisma.loginAttempt.create).toHaveBeenCalledWith({
            data: {
                email: "user@example.com",
                ip_address: "203.0.113.9",
                success: false,
            },
        })
    })

    it("returns 401 and logs failed attempt when password is wrong", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({ email: "user@example.com", password: "wrong" }),
            headers: {
                get: jest.fn((name: string) => {
                    if (name === "x-real-ip") return "198.51.100.15"
                    return null
                }),
            },
        } as unknown as NextRequest

        mockPrisma.user.findUnique.mockResolvedValue({
            id: "user_1",
            email: "user@example.com",
            passwordHash: "stored-hash",
        })
        mockBcrypt.compare.mockResolvedValue(false)

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(401)
        expect(body).toEqual({ error: "Invalid email or password" })
        expect(mockBcrypt.compare).toHaveBeenCalledWith("wrong", "stored-hash")
        expect(mockPrisma.loginAttempt.create).toHaveBeenCalledWith({
            data: {
                email: "user@example.com",
                ip_address: "198.51.100.15",
                success: false,
            },
        })
    })

    it("returns 200, logs success, and sets session cookie when login succeeds", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({ email: "user@example.com", password: "correct" }),
            headers: {
                get: jest.fn().mockReturnValue(null),
            },
        } as unknown as NextRequest

        const cookieSet = jest.fn()
        mockCookies.mockResolvedValue({ set: cookieSet })

        mockPrisma.user.findUnique.mockResolvedValue({
            id: "user_1",
            email: "user@example.com",
            passwordHash: "stored-hash",
        })
        mockBcrypt.compare.mockResolvedValue(true)
        mockCreateSession.mockResolvedValue("raw-session-token")

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual({ message: "Login successful" })

        expect(mockPrisma.loginAttempt.create).toHaveBeenCalledWith({
            data: {
                email: "user@example.com",
                ip_address: "unknown",
                success: true,
            },
        })
        expect(mockCreateSession).toHaveBeenCalledWith("user_1")
        expect(cookieSet).toHaveBeenCalledWith(
            "session",
            "raw-session-token",
            expect.objectContaining({
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                maxAge: 3600,
            })
        )
    })

    it("returns 500 on unexpected errors", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)

        const req = {
            json: jest.fn().mockResolvedValue({ email: "user@example.com", password: "pass" }),
            headers: {
                get: jest.fn().mockReturnValue(null),
            },
        } as unknown as NextRequest

        mockCheckLoginRateLimit.mockRejectedValue(new Error("rate-limit-db-down"))

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(500)
        expect(body).toEqual({ error: "Internal server error" })

        consoleErrorSpy.mockRestore()
    })
})
