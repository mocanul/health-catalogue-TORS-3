import { PrismaClient, BookingDocumentType, BookingStatus, TaskType } from "@prisma/client";

const prisma = new PrismaClient();

function timeValue(hour: number, minute = 0) {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

async function main() {
    const [students, staffMembers, rooms, equipment] = await Promise.all([
        prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { id: "asc" }, take: 3 }),
        prisma.user.findMany({ where: { role: "STAFF" }, orderBy: { id: "asc" }, take: 2 }),
        prisma.room.findMany({ orderBy: { id: "asc" }, take: 4 }),
        prisma.equipment.findMany({ orderBy: { id: "asc" }, take: 6 }),
    ]);

    if (students.length < 2 || staffMembers.length < 1 || rooms.length < 4 || equipment.length < 6) {
        throw new Error("Not enough users, rooms, or equipment exist to seed technician dashboard data.");
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const bookingDates = [1, 2, 3].map((offset) => {
        const nextDate = new Date(today);
        nextDate.setUTCDate(nextDate.getUTCDate() + offset);
        return nextDate;
    });

    await prisma.bookingTask.deleteMany();
    await prisma.bookingDocument.deleteMany();
    await prisma.bookingItem.deleteMany({
        where: { booking: { description: { startsWith: "[tech-seed]" } } },
    });
    await prisma.booking.deleteMany({
        where: { description: { startsWith: "[tech-seed]" } },
    });

    await prisma.booking.create({
        data: {
            created_by: students[0].id,
            room_id: rooms[1].id,
            lesson: "Respiratory simulation",
            description: "[tech-seed] Other: Need projector support and extra extension leads.",
            booking_date: bookingDates[0],
            start_time: timeValue(10),
            end_time: timeValue(13),
            status: BookingStatus.SUBMITTED,
            updated_at: new Date(),
            bookingItems: {
                create: [
                    { equipment_id: equipment[0].id, quantity_requested: 1 },
                    { equipment_id: equipment[1].id, quantity_requested: 2 },
                ],
            },
            bookingDocuments: {
                create: [
                    {
                        file_name: "Safety and Risk Assessment.pdf",
                        file_path: "/student-forms/standard-activity-risk-assessment-template.pdf",
                        document_type: BookingDocumentType.SAFETY_RISK_ASSESSMENT,
                    },
                ],
            },
        },
    });

    await prisma.booking.create({
        data: {
            created_by: students[1].id,
            room_id: rooms[2].id,
            lesson: "Assessment practice",
            description: "[tech-seed] Other: Requires extra floor mats for the session.",
            booking_date: bookingDates[1],
            start_time: timeValue(14),
            end_time: timeValue(17),
            status: BookingStatus.SUBMITTED,
            updated_at: new Date(),
            bookingItems: {
                create: [
                    { equipment_id: equipment[2].id, quantity_requested: 1 },
                    { equipment_id: equipment[3].id, quantity_requested: 3 },
                ],
            },
            bookingDocuments: {
                create: [
                    {
                        file_name: "Uploaded S&R Assessment.pdf",
                        file_path: "/student-forms/standard-activity-risk-assessment-template.pdf",
                        document_type: BookingDocumentType.SAFETY_RISK_ASSESSMENT,
                    },
                ],
            },
        },
    });

    const approvedBooking = await prisma.booking.create({
        data: {
            created_by: students[0].id,
            room_id: rooms[3].id,
            lesson: "Ward simulation",
            description: "[tech-seed] Other: Simulation manikin requested with bedside monitor.",
            booking_date: bookingDates[2],
            start_time: timeValue(9),
            end_time: timeValue(12),
            status: BookingStatus.APPROVED,
            updated_at: new Date(),
            bookingItems: {
                create: [
                    { equipment_id: equipment[4].id, quantity_requested: 1 },
                    { equipment_id: equipment[5].id, quantity_requested: 1 },
                ],
            },
            bookingDocuments: {
                create: [
                    {
                        file_name: "Safety and Risk Assessment.pdf",
                        file_path: "/student-forms/standard-activity-risk-assessment-template.pdf",
                        document_type: BookingDocumentType.SAFETY_RISK_ASSESSMENT,
                    },
                ],
            },
        },
    });

    await prisma.bookingTask.createMany({
        data: [
            {
                booking_id: approvedBooking.id,
                assigned_to: staffMembers[0].id,
                task_type: TaskType.SETUP,
                updated_at: new Date(),
            },
            {
                booking_id: approvedBooking.id,
                assigned_to: staffMembers[0].id,
                task_type: TaskType.STRIPDOWN,
                updated_at: new Date(),
            },
        ],
    });

    console.log("Created technician dashboard seed data.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
