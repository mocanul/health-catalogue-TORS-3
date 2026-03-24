import { GET } from "./route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        equipment: {
            findMany: jest.fn(),
        },
    },
}));

const mockFindMany = prisma.equipment.findMany as jest.Mock;

describe("GET /api/equipment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a list of active equipment ordered by name", async () => {
        const mockEquipment = [
            {
                id: 1,
                name: "Stethoscope",
                description: "A medical device",
                category: "Medical Equipment",
                quantity_available: 5,
                is_active: true,
                created_at: new Date().toISOString(),
                fixed_room_id: null,
            },
            {
                id: 2,
                name: "Syringe",
                description: null,
                category: "Medical Equipment",
                quantity_available: 10,
                is_active: true,
                created_at: new Date().toISOString(),
                fixed_room_id: null,
            },
        ];

        mockFindMany.mockResolvedValueOnce(mockEquipment);

        const response = await GET();
        const data = await response.json();

        expect(mockFindMany).toHaveBeenCalledWith({
            where: { is_active: true },
            orderBy: { name: "asc" },
        });
        expect(response.status).toBe(200);
        expect(data).toEqual(mockEquipment);
    });

    it("returns an empty array when no active equipment exists", async () => {
        mockFindMany.mockResolvedValueOnce([]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
    });

    it("returns 500 when the database throws an error", async () => {
        mockFindMany.mockRejectedValueOnce(new Error("Database connection failed"));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Failed to fetch equipment" });
    });
});