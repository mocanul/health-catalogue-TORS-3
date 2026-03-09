import { PasswordSchema } from "@/app/api/auth/first-login/route"

describe("Account setup password validation", () => {
    const validToken = "test-token"

    it("accepts a valid password", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "ValidPass123!",
        })

        expect(result.success).toBe(true)
    })

    it("rejects passwords shorter than 8 chars", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "Pass12!",
        })

        expect(result.success).toBe(false)
    })

    it("rejects passwords longer than 50 chars", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: `Aa1!${"a".repeat(47)}`,
        })

        expect(result.success).toBe(false)
    })

    it("requires at least one uppercase letter", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "validpass1!",
        })

        expect(result.success).toBe(false)
    })

    it("requires at least one lowercase letter", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "VALIDPASS1!",
        })

        expect(result.success).toBe(false)
    })

    it("requires at least one number", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "ValidPass!",
        })

        expect(result.success).toBe(false)
    })

    it("requires at least one special character", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "ValidPass1",
        })

        expect(result.success).toBe(false)
    })
})
