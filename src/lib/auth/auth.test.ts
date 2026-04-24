import { hashPassword, verifyPassword } from "@/lib/auth/hash";
import { checkLoginRateLimit, normalizeEmail } from "@/lib/auth/loginRateLimiter";
import { createPasswordSetupToken, generateRawToken, hashToken as hashSetupToken } from "@/lib/auth/passwordSetup";
import { getRequestUser, requirePageUser } from "@/lib/auth/requestUser";
import { validateSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("bcrypt", () => ({
    hash: jest.fn().mockResolvedValue("hashed-password"),
    compare: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
    prisma: {
        loginAttempt: { findMany: jest.fn() },
        passwordSetupToken: { create: jest.fn() },
        session: { create: jest.fn(), findUnique: jest.fn() },
    },
}));

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    redirect: jest.fn().mockImplementation(() => { throw new Error("redirect"); }),
}));

jest.mock("@/lib/auth/session", () => {
    const actual = jest.requireActual("@/lib/auth/session");
    return {
        generateSessionToken: actual.generateSessionToken,
        hashToken: actual.hashToken,
        createSession: actual.createSession,
        validateSession: jest.fn(),
    };
});

const mockBcryptHash = bcrypt.hash as jest.Mock;
const mockBcryptCompare = bcrypt.compare as jest.Mock;
const mockFindManyAttempts = prisma.loginAttempt.findMany as jest.Mock;
const mockPasswordSetupCreate = prisma.passwordSetupToken.create as jest.Mock;
const mockSessionFindUnique = prisma.session.findUnique as jest.Mock;
const mockSessionCreate = prisma.session.create as jest.Mock;
const mockCookies = cookies as jest.Mock;
const mockValidateSession = validateSession as jest.Mock;

const mockCookieStore = (token: string | undefined) => ({
    get: jest.fn().mockReturnValue(token ? { value: token } : undefined),
});

const mockUser = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    role: UserRole.STAFF,
    is_active: true,
    created_at: new Date(),
    passwordHash: "hashed",
};

// ─── hash.ts ──────────────────────────────────────────────────────────────────

describe("hashPassword", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns a hashed password string", async () => {
        const result = await hashPassword("mypassword");
        expect(result).toBe("hashed-password");
        expect(mockBcryptHash).toHaveBeenCalledWith("mypassword", 12);
    });
});

describe("verifyPassword", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns true when password matches hash", async () => {
        mockBcryptCompare.mockResolvedValueOnce(true);
        expect(await verifyPassword("mypassword", "hashed-password")).toBe(true);
    });

    it("returns false when password does not match hash", async () => {
        mockBcryptCompare.mockResolvedValueOnce(false);
        expect(await verifyPassword("wrongpassword", "hashed-password")).toBe(false);
    });
});

// ─── loginRateLimiter.ts ──────────────────────────────────────────────────────

describe("normalizeEmail", () => {
    it("lowercases and trims the email", () => {
        expect(normalizeEmail("  JOHN@EXAMPLE.COM  ")).toBe("john@example.com");
    });
});

describe("checkLoginRateLimit", () => {
    beforeEach(() => jest.clearAllMocks());

    it("allows login when fewer than 5 failed attempts exist", async () => {
        mockFindManyAttempts.mockResolvedValueOnce([
            { attempted_at: new Date() },
            { attempted_at: new Date() },
        ]);
        expect(await checkLoginRateLimit("user@example.com")).toEqual({ allowed: true });
    });

    it("allows login when 5 attempts exist but lock window has passed", async () => {
        const oldTime = new Date(Date.now() - 10 * 60_000);
        mockFindManyAttempts.mockResolvedValueOnce([
            { attempted_at: new Date() },
            { attempted_at: new Date() },
            { attempted_at: new Date() },
            { attempted_at: new Date() },
            { attempted_at: oldTime },
        ]);
        expect(await checkLoginRateLimit("user@example.com")).toEqual({ allowed: true });
    });

    it("blocks login when 5 attempts exist within the lock window", async () => {
        const recentTime = new Date(Date.now() - 2 * 60_000);
        mockFindManyAttempts.mockResolvedValueOnce([
            { attempted_at: new Date() },
            { attempted_at: new Date() },
            { attempted_at: new Date() },
            { attempted_at: new Date() },
            { attempted_at: recentTime },
        ]);

        const result = await checkLoginRateLimit("user@example.com");
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
            expect(result.retryAfterSec).toBeGreaterThan(0);
            expect(result.retryAfterSec).toBeLessThanOrEqual(3 * 60);
        }
    });

    it("queries with correct filters", async () => {
        mockFindManyAttempts.mockResolvedValueOnce([]);
        await checkLoginRateLimit("user@example.com");
        expect(mockFindManyAttempts).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { email: "user@example.com", success: false },
                take: 5,
            }),
        );
    });
});

// ─── passwordSetup.ts ─────────────────────────────────────────────────────────

describe("generateRawToken", () => {
    it("returns a non-empty string", () => {
        const token = generateRawToken();
        expect(typeof token).toBe("string");
        expect(token.length).toBeGreaterThan(0);
    });

    it("returns different tokens on each call", () => {
        expect(generateRawToken()).not.toBe(generateRawToken());
    });
});

describe("hashToken (passwordSetup)", () => {
    it("returns a consistent sha-256 hex hash", () => {
        expect(hashSetupToken("abc")).toBe(hashSetupToken("abc"));
        expect(hashSetupToken("abc")).toHaveLength(64);
    });

    it("returns different hashes for different inputs", () => {
        expect(hashSetupToken("abc")).not.toBe(hashSetupToken("xyz"));
    });
});

describe("createPasswordSetupToken", () => {
    beforeEach(() => jest.clearAllMocks());

    it("creates a token record in the database and returns rawToken and expires_at", async () => {
        mockPasswordSetupCreate.mockResolvedValueOnce({});

        const result = await createPasswordSetupToken(1, 30);

        expect(result.rawToken).toBeDefined();
        expect(result.expires_at).toBeInstanceOf(Date);
        expect(mockPasswordSetupCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    user_id: 1,
                    token_hash: expect.any(String),
                    expires_at: expect.any(Date),
                }),
            }),
        );
    });

    it("sets expiry approximately ttlMinutes from now", async () => {
        mockPasswordSetupCreate.mockResolvedValueOnce({});

        const before = Date.now();
        const { expires_at } = await createPasswordSetupToken(1, 30);
        const after = Date.now();

        expect(expires_at.getTime()).toBeGreaterThanOrEqual(before + 30 * 60 * 1000);
        expect(expires_at.getTime()).toBeLessThanOrEqual(after + 30 * 60 * 1000);
    });
});

// ─── session.ts ───────────────────────────────────────────────────────────────

describe("generateSessionToken", () => {
    it("returns a hex string of correct length", () => {
        const { generateSessionToken } = jest.requireActual("@/lib/auth/session");
        const token = generateSessionToken();
        expect(typeof token).toBe("string");
        expect(token).toMatch(/^[a-f0-9]+$/);
        expect(token).toHaveLength(64);
    });

    it("returns unique tokens on each call", () => {
        const { generateSessionToken } = jest.requireActual("@/lib/auth/session");
        expect(generateSessionToken()).not.toBe(generateSessionToken());
    });
});

describe("hashToken (session)", () => {
    it("returns consistent sha-256 hex hash", () => {
        const { hashToken } = jest.requireActual("@/lib/auth/session");
        expect(hashToken("test")).toBe(hashToken("test"));
        expect(hashToken("test")).toHaveLength(64);
    });
});

describe("createSession", () => {
    beforeEach(() => jest.clearAllMocks());

    it("creates a session in the database and returns the plain token", async () => {
        mockSessionCreate.mockResolvedValueOnce({});
        const { createSession } = jest.requireActual("@/lib/auth/session");

        const token = await createSession(1);

        expect(typeof token).toBe("string");
        expect(token.length).toBeGreaterThan(0);
        expect(mockSessionCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    user_id: 1,
                    token_hash: expect.any(String),
                    expires_at: expect.any(Date),
                }),
            }),
        );
    });

    it("sets session expiry to approximately 1 hour from now", async () => {
        mockSessionCreate.mockResolvedValueOnce({});
        const { createSession } = jest.requireActual("@/lib/auth/session");

        const before = Date.now();
        await createSession(1);
        const after = Date.now();

        const { data } = mockSessionCreate.mock.calls[0][0];
        expect(data.expires_at.getTime()).toBeGreaterThanOrEqual(before + 60 * 60 * 1000);
        expect(data.expires_at.getTime()).toBeLessThanOrEqual(after + 60 * 60 * 1000);
    });
});

describe("validateSession", () => {
    beforeEach(() => jest.clearAllMocks());

    const activeUser = { id: 1, is_active: true, role: "STAFF" };

    it("returns the user when session is valid", async () => {
        mockSessionFindUnique.mockResolvedValueOnce({
            revoked: false,
            expires_at: new Date(Date.now() + 60_000),
            user: activeUser,
        });
        const { validateSession: realValidateSession } = jest.requireActual("@/lib/auth/session");
        expect(await realValidateSession("valid-token")).toEqual(activeUser);
    });

    it("returns null when session does not exist", async () => {
        mockSessionFindUnique.mockResolvedValueOnce(null);
        const { validateSession: realValidateSession } = jest.requireActual("@/lib/auth/session");
        expect(await realValidateSession("bad-token")).toBeNull();
    });

    it("returns null when session is revoked", async () => {
        mockSessionFindUnique.mockResolvedValueOnce({
            revoked: true,
            expires_at: new Date(Date.now() + 60_000),
            user: activeUser,
        });
        const { validateSession: realValidateSession } = jest.requireActual("@/lib/auth/session");
        expect(await realValidateSession("revoked-token")).toBeNull();
    });

    it("returns null when session is expired", async () => {
        mockSessionFindUnique.mockResolvedValueOnce({
            revoked: false,
            expires_at: new Date(Date.now() - 60_000),
            user: activeUser,
        });
        const { validateSession: realValidateSession } = jest.requireActual("@/lib/auth/session");
        expect(await realValidateSession("expired-token")).toBeNull();
    });

    it("returns null when user is inactive", async () => {
        mockSessionFindUnique.mockResolvedValueOnce({
            revoked: false,
            expires_at: new Date(Date.now() + 60_000),
            user: { ...activeUser, is_active: false },
        });
        const { validateSession: realValidateSession } = jest.requireActual("@/lib/auth/session");
        expect(await realValidateSession("inactive-token")).toBeNull();
    });
});

// ─── requestUser.ts ───────────────────────────────────────────────────────────

describe("getRequestUser", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns null when no session cookie is present", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore(undefined));
        expect(await getRequestUser()).toBeNull();
    });

    it("returns null when session token is invalid", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("bad-token"));
        mockValidateSession.mockResolvedValueOnce(null);
        expect(await getRequestUser()).toBeNull();
    });

    it("returns the user when session is valid", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("valid-token"));
        mockValidateSession.mockResolvedValueOnce(mockUser);
        expect(await getRequestUser()).toEqual(mockUser);
    });
});

describe("requirePageUser", () => {
    beforeEach(() => jest.clearAllMocks());

    it("redirects to /login when no user is found", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore(undefined));
        await expect(requirePageUser()).rejects.toThrow("redirect");
    });

    it("redirects to /login when user role is not in allowedRoles", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("valid-token"));
        mockValidateSession.mockResolvedValueOnce({ ...mockUser, role: UserRole.STUDENT });
        await expect(requirePageUser([UserRole.ADMIN, UserRole.TECHNICIAN])).rejects.toThrow("redirect");
    });

    it("returns the user when role is allowed", async () => {
        const adminUser = { ...mockUser, role: UserRole.ADMIN };
        mockCookies.mockResolvedValueOnce(mockCookieStore("valid-token"));
        mockValidateSession.mockResolvedValueOnce(adminUser);
        const result = await requirePageUser([UserRole.ADMIN]);
        expect(result).toEqual(adminUser);
    });

    it("returns the user when no role restriction is set", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("valid-token"));
        mockValidateSession.mockResolvedValueOnce(mockUser);
        const result = await requirePageUser();
        expect(result).toEqual(mockUser);
    });
});