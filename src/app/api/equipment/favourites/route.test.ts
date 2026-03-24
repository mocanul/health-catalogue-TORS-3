import { GET, POST } from "./route";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";
import { cookies } from "next/headers";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
    prisma: {
        favourite: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock("@/lib/auth/session", () => ({
    validateSession: jest.fn(),
}));

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}));

const mockFindMany = prisma.favourite.findMany as jest.Mock;
const mockFindUnique = prisma.favourite.findUnique as jest.Mock;
const mockCreate = prisma.favourite.create as jest.Mock;
const mockDelete = prisma.favourite.delete as jest.Mock;
const mockValidateSession = validateSession as jest.Mock;
const mockCookies = cookies as jest.Mock;

const mockUser = { id: 1, email: "test@test.com", role: "STUDENT" };

// Helper to mock an authenticated user
function mockAuthenticated() {
    mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: "valid-token" }),
    });
    mockValidateSession.mockResolvedValue(mockUser);
}

// Helper to mock an unauthenticated user
function mockUnauthenticated() {
    mockCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
    });
    mockValidateSession.mockResolvedValue(null);
}

describe("GET /api/equipment/favourites", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns 401 when user is not logged in", async () => {
        mockUnauthenticated();

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: "Unauthorised" });
    });

    it("returns list of favourited equipment IDs for logged in user", async () => {
        mockAuthenticated();
        mockFindMany.mockResolvedValueOnce([
            { equipment_id: 3 },
            { equipment_id: 7 },
        ]);

        const response = await GET();
        const data = await response.json();

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { user_id: mockUser.id },
            select: { equipment_id: true },
        });
        expect(response.status).toBe(200);
        expect(data).toEqual([3, 7]);
    });

    it("returns empty array when user has no favourites", async () => {
        mockAuthenticated();
        mockFindMany.mockResolvedValueOnce([]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
    });
});

describe("POST /api/favourites", () => {
    beforeEach(() => jest.clearAllMocks());

    const makeRequest = (body: object) =>
        new Request("http://localhost/api/favourites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

    it("returns 401 when user is not logged in", async () => {
        mockUnauthenticated();

        const response = await POST(makeRequest({ equipment_id: 1 }));
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: "Unauthorised" });
    });

    it("removes favourite and returns favourited: false when item is already favourited", async () => {
        mockAuthenticated();
        mockFindUnique.mockResolvedValueOnce({ user_id: 1, equipment_id: 5 });
        mockDelete.mockResolvedValueOnce({});

        const response = await POST(makeRequest({ equipment_id: 5 }));
        const data = await response.json();

        expect(mockDelete).toHaveBeenCalledWith({
            where: {
                user_id_equipment_id: {
                    user_id: mockUser.id,
                    equipment_id: 5,
                },
            },
        });
        expect(response.status).toBe(200);
        expect(data).toEqual({ favourited: false });
    });

    it("adds favourite and returns favourited: true when item is not yet favourited", async () => {
        mockAuthenticated();
        mockFindUnique.mockResolvedValueOnce(null);
        mockCreate.mockResolvedValueOnce({ user_id: 1, equipment_id: 5 });

        const response = await POST(makeRequest({ equipment_id: 5 }));
        const data = await response.json();

        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                user_id: mockUser.id,
                equipment_id: 5,
            },
        });
        expect(response.status).toBe(200);
        expect(data).toEqual({ favourited: true });
    });
});