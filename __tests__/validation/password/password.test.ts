import { PasswordSchema } from "@/app/api/auth/first-login/route"

describe("Account setup password validation", () => {
    const validToken = "test-token"

    it("accepts a valid password", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "Validpass123!",
        })

        expect(result.success).toBe(true)
    })

    it("rejects passwords shorter than 8 chars", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "Pass12!",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "Password must be at least 8 characters"
            )
        }
    })

    it("rejects passwords longer than 50 chars", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: `Aa1!${"a".repeat(47)}`,
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "Password must not exceed 50 characters"
            )
        }
    })

    it("requires at least one uppercase letter", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "validpass1!",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "Password must contain at least one uppercase letter"
            )
        }
    })

    it("requires at least one lowercase letter", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "VALIDPASS1!",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "Password must contain at least one lowercase letter"
            )
        }
    })

    it("requires at least one number", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "ValidPass!",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "Password must contain at least one number"
            )
        }
    })

    it("requires at least one special character", () => {
        const result = PasswordSchema.safeParse({
            token: validToken,
            password: "ValidPass1",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "Password must contain at least one special character"
            )
        }
    })
})
