import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";
import { BookingStatus } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        booking: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}));

jest.mock("@/lib/auth/session", () => ({
    validateSession: jest.fn(),
}));

const mockFindMany = prisma.booking.findMany as jest.Mock;
const mockCookies = cookies as jest.Mock;
const mockValidateSession = validateSession as jest.Mock;

const mockUser = { id: "user-1", role: "USER" };

const mockCookieStore = (token: string | undefined) => ({
    get: jest.fn().mockReturnValue(token ? { value: token } : undefined),
});

describe("GET /api/bookings/history", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when no session cookie is present", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore(undefined));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: "Unauthorised" });
    });

    it("returns 401 when session token is invalid", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("bad-token"));
        mockValidateSession.mockResolvedValueOnce(null);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ error: "Unauthorised" });
    });

    it("returns mapped bookings for an authenticated user", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("valid-token"));
        mockValidateSession.mockResolvedValueOnce(mockUser);

        const mockBookings = [
            {
                id: "booking-1",
                booking_date: new Date("2025-01-01"),
                start_time: new Date("2025-01-01T09:00:00"),
                room: { name: "Room A" },
                bookingItems: [
                    {
                        id: "item-1",
                        quantity_requested: 2,
                        equipment: {
                            id: "eq-1",
                            name: "Stethoscope",
                            fixed_room_id: null,
                        },
                    },
                ],
            },
        ];

        mockFindMany.mockResolvedValueOnce(mockBookings);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([
            {
                id: "booking-1",
                bookingDate: new Date("2025-01-01").toISOString(),
                roomName: "Room A",
                items: [
                    {
                        id: "eq-1",
                        bookingItemId: "item-1",
                        name: "Stethoscope",
                        quantity: 2,
                        fixed_room_id: null,
                    },
                ],
            },
        ]);
    });

    it("falls back to 'Unknown room' when room is null", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("valid-token"));
        mockValidateSession.mockResolvedValueOnce(mockUser);

        mockFindMany.mockResolvedValueOnce([
            {
                id: "booking-2",
                booking_date: new Date("2025-02-01"),
                start_time: new Date("2025-02-01T10:00:00"),
                room: null,
                bookingItems: [],
            },
        ]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data[0].roomName).toBe("Unknown room");
    });

    it("returns an empty array when user has no matching bookings", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("valid-token"));
        mockValidateSession.mockResolvedValueOnce(mockUser);
        mockFindMany.mockResolvedValueOnce([]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
    });

    it("queries with correct filters and limits", async () => {
        mockCookies.mockResolvedValueOnce(mockCookieStore("valid-token"));
        mockValidateSession.mockResolvedValueOnce(mockUser);
        mockFindMany.mockResolvedValueOnce([]);

        await GET();

        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    created_by: mockUser.id,
                    status: { in: [BookingStatus.APPROVED, BookingStatus.COMPLETED] },
                    bookingItems: { some: {} },
                },
                take: 12,
                orderBy: [{ booking_date: "desc" }, { start_time: "desc" }],
            }),
        );
    });
});