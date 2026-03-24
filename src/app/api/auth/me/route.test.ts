jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}))

jest.mock("@/lib/auth/session", () => ({
    validateSession: jest.fn(),
}))

const { cookies: mockCookies } = jest.requireMock("next/headers") as {
    cookies: jest.Mock
}

const { validateSession: mockValidateSession } = jest.requireMock("@/lib/auth/session") as {
    validateSession: jest.Mock
}

import { GET } from "@/app/api/auth/me/route"

describe("GET /api/auth/me", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("returns 401 when session cookie is missing", async () => {
        mockCookies.mockResolvedValue({
            get: jest.fn().mockReturnValue(undefined),
        })

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(401)
        expect(body).toEqual({ error: "Unauthenticated" })
        expect(mockValidateSession).not.toHaveBeenCalled()
    })

    it("returns 401 and clears cookie when session is invalid", async () => {
        mockCookies.mockResolvedValue({
            get: jest.fn().mockReturnValue({ value: "invalid-token" }),
        })
        mockValidateSession.mockResolvedValue(null)

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(401)
        expect(body).toEqual({ error: "Unauthenticated" })
        expect(mockValidateSession).toHaveBeenCalledWith("invalid-token")
        expect(res.headers.get("set-cookie")).toContain("session=")
        expect(res.headers.get("set-cookie")).toContain("Max-Age=0")
    })

    it("returns 200 with user info when session is valid", async () => {
        mockCookies.mockResolvedValue({
            get: jest.fn().mockReturnValue({ value: "valid-token" }),
        })
        mockValidateSession.mockResolvedValue({
            id: "user_1",
            email: "user@example.com",
            role: "student",
        })

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body).toEqual({
            id: "user_1",
            email: "user@example.com",
            role: "student",
        })
    })

    it("returns 500 when an unexpected error occurs", async () => {
        mockCookies.mockRejectedValue(new Error("cookie-store-failed"))

        const res = await GET()
        const body = await res.json()

        expect(res.status).toBe(500)
        expect(body).toEqual({ error: "Internal server error" })
    })
})
