import { NextRequest } from "next/server"

jest.mock("@/lib/prisma", () => ({
    prisma: {
        passwordSetupToken: {
            findFirst: jest.fn(),
            updateMany: jest.fn(),
        },
        user: {
            update: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}))

jest.mock("@/lib/auth/passwordSetup", () => ({
    hashToken: jest.fn(),
}))

jest.mock("@/lib/auth/hash", () => ({
    hashPassword: jest.fn(),
}))

const { prisma: mockPrisma } = jest.requireMock("@/lib/prisma") as {
    prisma: {
        passwordSetupToken: {
            findFirst: jest.Mock
            updateMany: jest.Mock
        }
        user: {
            update: jest.Mock
        }
        $transaction: jest.Mock
    }
}

const { hashToken: mockHashToken } = jest.requireMock("@/lib/auth/passwordSetup") as {
    hashToken: jest.Mock
}

const { hashPassword: mockHashPassword } = jest.requireMock("@/lib/auth/hash") as {
    hashPassword: jest.Mock
}

import { POST } from "@/app/api/auth/first-login/route"

describe("POST /api/auth/first-login", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("returns 400 when request body fails validation", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({ token: "abc", password: "short" }),
        } as unknown as NextRequest

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body.error).toBe("Invalid input")
        expect(Array.isArray(body.messages)).toBe(true)
        expect(mockHashToken).not.toHaveBeenCalled()
    })

    it("returns 400 when token is invalid or expired", async () => {
        const req = {
            json: jest
                .fn()
                .mockResolvedValue({ token: "raw-token", password: "ValidPass1!" }),
        } as unknown as NextRequest

        mockHashToken.mockReturnValue("hashed-token")
        mockPrisma.passwordSetupToken.findFirst.mockResolvedValue(null)

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(400)
        expect(body).toEqual({ error: "Token invalid or expired" })
        expect(mockPrisma.passwordSetupToken.findFirst).toHaveBeenCalledWith({
            where: {
                token_hash: "hashed-token",
                used_at: null,
                expires_at: { gt: expect.any(Date) },
            },
            select: { id: true, user_id: true },
        })
    })

    it("returns 200 and updates password when token is valid", async () => {
        const req = {
            json: jest
                .fn()
                .mockResolvedValue({ token: "raw-token", password: "ValidPass1!" }),
        } as unknown as NextRequest

        mockHashToken.mockReturnValue("hashed-token")
        mockPrisma.passwordSetupToken.findFirst.mockResolvedValue({
            id: "pst_1",
            user_id: "user_1",
        })
        mockHashPassword.mockResolvedValue("hashed-password")

        mockPrisma.user.update.mockReturnValue({ op: "update-user" })
        mockPrisma.passwordSetupToken.updateMany.mockReturnValue({ op: "invalidate-tokens" })
        mockPrisma.$transaction.mockResolvedValue([])

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual({ ok: true })
        expect(mockHashPassword).toHaveBeenCalledWith("ValidPass1!")
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: "user_1" },
            data: { passwordHash: "hashed-password" },
        })
        expect(mockPrisma.passwordSetupToken.updateMany).toHaveBeenCalledWith({
            where: { user_id: "user_1", used_at: null },
            data: { used_at: expect.any(Date) },
        })
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
    })

    it("returns 500 when an unexpected error occurs", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)
        const req = {
            json: jest
                .fn()
                .mockResolvedValue({ token: "raw-token", password: "ValidPass1!" }),
        } as unknown as NextRequest

        mockHashToken.mockReturnValue("hashed-token")
        mockPrisma.passwordSetupToken.findFirst.mockRejectedValue(new Error("db-failed"))

        const res = await POST(req)
        const body = await res.json()

        expect(res.status).toBe(500)
        expect(body).toEqual({ error: "Server error" })

        consoleErrorSpy.mockRestore()
    })
})
