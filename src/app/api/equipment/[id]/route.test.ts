import { PATCH, DELETE } from "./route";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/auth/requestUser";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        equipment: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

jest.mock("@/lib/auth/requestUser", () => ({
    getRequestUser: jest.fn(),
}));

jest.mock("@/lib/audit", () => ({
    createAuditLog: jest.fn(),
    getAuditActorName: jest.fn().mockReturnValue("John Doe"),
    getRoleLabel: jest.fn().mockReturnValue("Admin"),
}));

const mockFindUnique = prisma.equipment.findUnique as jest.Mock;
const mockTransaction = prisma.$transaction as jest.Mock;
const mockGetRequestUser = getRequestUser as jest.Mock;

const mockAdminUser = { id: "user-1", role: "ADMIN", name: "John Doe" };
const mockTechUser = { id: "user-2", role: "TECHNICIAN", name: "Jane Doe" };

const makeContext = (id: string) => ({
    params: Promise.resolve({ id }),
});

const makeRequest = (body: object) =>
    new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
    });

const existingEquipment = {
    id: 1,
    name: "Stethoscope",
    description: "A medical device",
    category: "Medical",
    cost: 50,
    quantity_available: 5,
    is_active: true,
};

// ─── PATCH ────────────────────────────────────────────────────────────────────

describe("PATCH /api/equipment/[id]", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.mockImplementation((cb) => cb({ equipment: { update: jest.fn() }, auditLog: { create: jest.fn() } }));
    });

    it("returns 401 when user is not authenticated", async () => {
        mockGetRequestUser.mockResolvedValueOnce(null);

        const response = await PATCH(makeRequest({}), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: "Unauthorised" });
    });

    it("returns 403 when user role is not TECHNICIAN or ADMIN", async () => {
        mockGetRequestUser.mockResolvedValueOnce({ ...mockAdminUser, role: "USER" });

        const response = await PATCH(makeRequest({}), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data).toEqual({ error: "Forbidden" });
    });

    it("returns 400 when equipment id is not a number", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);

        const response = await PATCH(makeRequest({}), makeContext("abc"));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: "Invalid equipment id." });
    });

    it("returns 400 when name is missing", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);

        const response = await PATCH(makeRequest({ cost: 10, quantity_available: 5 }), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: "Item name is required." });
    });

    it("returns 400 when cost is negative", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);

        const response = await PATCH(makeRequest({ name: "Test", cost: -1, quantity_available: 5 }), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: "Cost must be 0 or more." });
    });

    it("returns 400 when quantity is negative", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);

        const response = await PATCH(makeRequest({ name: "Test", cost: 10, quantity_available: -1 }), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: "Quantity must be 0 or more." });
    });

    it("returns 404 when equipment does not exist", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);
        mockFindUnique.mockResolvedValueOnce(null);

        const response = await PATCH(
            makeRequest({ name: "Test", cost: 10, quantity_available: 5 }),
            makeContext("99"),
        );
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: "Equipment not found." });
    });

    it("successfully updates equipment and returns it", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);
        mockFindUnique.mockResolvedValueOnce(existingEquipment);

        const updatedEquipment = { ...existingEquipment, name: "Updated Stethoscope" };
        mockTransaction.mockResolvedValueOnce(updatedEquipment);

        const response = await PATCH(
            makeRequest({ name: "Updated Stethoscope", cost: 50, quantity_available: 5 }),
            makeContext("1"),
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.name).toBe("Updated Stethoscope");
    });

    it("works when called by a TECHNICIAN", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockTechUser);
        mockFindUnique.mockResolvedValueOnce(existingEquipment);

        const updatedEquipment = { ...existingEquipment, name: "Updated" };
        mockTransaction.mockResolvedValueOnce(updatedEquipment);

        const response = await PATCH(
            makeRequest({ name: "Updated", cost: 50, quantity_available: 5 }),
            makeContext("1"),
        );

        expect(response.status).toBe(200);
    });

    it("returns 500 when an unexpected error occurs", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);
        mockFindUnique.mockRejectedValueOnce(new Error("DB error"));

        const response = await PATCH(
            makeRequest({ name: "Test", cost: 10, quantity_available: 5 }),
            makeContext("1"),
        );
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Failed to update equipment." });
    });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe("DELETE /api/equipment/[id]", () => {
    const makeDeleteRequest = () => new Request("http://localhost", { method: "DELETE" });

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.mockImplementation((cb) => cb({ equipment: { update: jest.fn() }, auditLog: { create: jest.fn() } }));
    });

    it("returns 401 when user is not authenticated", async () => {
        mockGetRequestUser.mockResolvedValueOnce(null);

        const response = await DELETE(makeDeleteRequest(), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: "Unauthorised" });
    });

    it("returns 403 when user role is not TECHNICIAN or ADMIN", async () => {
        mockGetRequestUser.mockResolvedValueOnce({ ...mockAdminUser, role: "USER" });

        const response = await DELETE(makeDeleteRequest(), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data).toEqual({ error: "Forbidden" });
    });

    it("returns 400 when equipment id is not a number", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);

        const response = await DELETE(makeDeleteRequest(), makeContext("abc"));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({ error: "Invalid equipment id." });
    });

    it("returns 404 when equipment does not exist", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);
        mockFindUnique.mockResolvedValueOnce(null);

        const response = await DELETE(makeDeleteRequest(), makeContext("99"));
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ error: "Equipment not found." });
    });

    it("soft deletes equipment and returns success", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);
        mockFindUnique.mockResolvedValueOnce(existingEquipment);
        mockTransaction.mockResolvedValueOnce(undefined);

        const response = await DELETE(makeDeleteRequest(), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({ success: true });
    });

    it("returns 500 when an unexpected error occurs", async () => {
        mockGetRequestUser.mockResolvedValueOnce(mockAdminUser);
        mockFindUnique.mockRejectedValueOnce(new Error("DB error"));

        const response = await DELETE(makeDeleteRequest(), makeContext("1"));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Failed to delete equipment." });
    });
});