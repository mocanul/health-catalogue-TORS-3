import { NextRequest } from "next/server"

//mock database so the real database is not being used  
jest.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}))

//crate mock password setup token
jest.mock("@/lib/auth/passwordSetup", () => ({
    createPasswordSetupToken: jest.fn(),
}))

//mock email function, avoids sending a real email
jest.mock("@/lib/mail", () => ({
    sendForgotPasswordRequest: jest.fn(),
}))

const { prisma: mockPrisma } = jest.requireMock("@/lib/prisma") as {
    prisma: {
        user: {
            findUnique: jest.Mock
        }
    }
}

const { createPasswordSetupToken: mockCreatePasswordSetupToken } = jest.requireMock("@/lib/auth/passwordSetup") as {
    createPasswordSetupToken: jest.Mock
}

const { sendForgotPasswordRequest: mockSendForgotPasswordRequest } = jest.requireMock("@/lib/mail") as {
    sendForgotPasswordRequest: jest.Mock
}

import { POST } from "@/app/api/auth/forgot-pass/route"

describe("POST /api/auth/forgot-pass", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.APP_BASE_URL = "http://localhost:3000"
    })

    it("returns 400 when email is missing", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({}),
        } as unknown as NextRequest

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body).toEqual({ error: "Email is required" })
    })

    it("returns 404 when user is not found", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({ email: "missing@example.com" }),
        } as unknown as NextRequest

        mockPrisma.user.findUnique.mockResolvedValue(null)

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(404)
        expect(body).toEqual({ error: "User not found" })
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: "missing@example.com" },
            select: { id: true, first_name: true, last_name: true, email: true },
        })
    })

    it("returns 200 and sends setup email for valid user", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({ email: "user@example.com" }),
        } as unknown as NextRequest

        mockPrisma.user.findUnique.mockResolvedValue({
            id: "user_1",
            first_name: "Ada",
            last_name: "Lovelace",
            email: "user@example.com",
        })
        mockCreatePasswordSetupToken.mockResolvedValue({ rawToken: "raw token ?=#" })
        mockSendForgotPasswordRequest.mockResolvedValue(undefined)

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual({ userId: "user_1", email: "user@example.com" })

        expect(mockCreatePasswordSetupToken).toHaveBeenCalledWith("user_1", 30)
        expect(mockSendForgotPasswordRequest).toHaveBeenCalledWith({
            email: "user@example.com",
            firstName: "Ada",
            setupLink:
                "http://localhost:3000/login/first-login?token=raw%20token%20%3F%3D%23",
        })
    })

    it("returns 500 when an unexpected error occurs", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)

        const req = {
            json: jest.fn().mockResolvedValue({ email: "user@example.com" }),
        } as unknown as NextRequest

        mockPrisma.user.findUnique.mockRejectedValue(new Error("db failure"))

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(500)
        expect(body).toEqual({ error: "Internal server error" })

        consoleErrorSpy.mockRestore()
    })
})