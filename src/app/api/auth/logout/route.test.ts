jest.mock("@/lib/prisma", () => ({
    prisma: {
        session: {
            updateMany: jest.fn(),
        },
    },
}))

jest.mock("@/lib/auth/session", () => ({
    hashToken: jest.fn(),
}))

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}))

const { prisma: mockPrisma } = jest.requireMock("@/lib/prisma") as {
    prisma: {
        session: {
            updateMany: jest.Mock
        }
    }
}

const { hashToken: mockHashToken } = jest.requireMock("@/lib/auth/session") as {
    hashToken: jest.Mock
}

const { cookies: mockCookies } = jest.requireMock("next/headers") as {
    cookies: jest.Mock
}

import { POST } from "@/app/api/auth/logout/route"

describe("POST /api/auth/logout", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("revokes session and clears cookie when session token exists", async () => {
        mockCookies.mockResolvedValue({
            get: jest.fn().mockReturnValue({ value: "raw-session-token" }),
        })
        mockHashToken.mockReturnValue("hashed-session-token")
        mockPrisma.session.updateMany.mockResolvedValue({ count: 1 })

        const res = await POST()
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual({ success: true })
        expect(mockHashToken).toHaveBeenCalledWith("raw-session-token")
        expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
            where: { token_hash: "hashed-session-token" },
            data: { revoked: true },
        })
        expect(res.cookies.get("session")?.value).toBe("")
    })

    it("still clears cookie when session token does not exist", async () => {
        mockCookies.mockResolvedValue({
            get: jest.fn().mockReturnValue(undefined),
        })

        const res = await POST()
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual({ success: true })
        expect(mockHashToken).not.toHaveBeenCalled()
        expect(mockPrisma.session.updateMany).not.toHaveBeenCalled()
        expect(res.cookies.get("session")?.value).toBe("")
    })

    it("returns 500 when logout operation throws", async () => {
        mockCookies.mockRejectedValue(new Error("cookie-store-failure"))

        const res = await POST()
        const body = await res.json()

        expect(res.status).toBe(500)
        expect(body).toEqual({ error: "Logout failed" })
    })
})
