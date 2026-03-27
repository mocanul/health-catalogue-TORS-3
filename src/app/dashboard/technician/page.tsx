export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import DocumentResourcePanel from "@/components/documentResourcePanel";
import TechnicianBookingBoard from "@/components/technicianBookingBoard";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

function formatDateLabel(date: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function normaliseTimeValue(time: string) {
    return time.length === 5 ? `${time}:00` : time;
}

function formatClockTime(time: string) {
    const [hours, minutes] = normaliseTimeValue(time).split(":").map(Number);

    return new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(2000, 0, 1, hours, minutes));
}

function formatTimeLabel(startTime: string, endTime: string) {
    return `${formatClockTime(startTime)} to ${formatClockTime(endTime)}`;
}

function formatDurationLabel(startTime: string, endTime: string) {
    const [startHours, startMinutes] = normaliseTimeValue(startTime).split(":").map(Number);
    const [endHours, endMinutes] = normaliseTimeValue(endTime).split(":").map(Number);
    const milliseconds =
        new Date(2000, 0, 1, endHours, endMinutes).getTime() -
        new Date(2000, 0, 1, startHours, startMinutes).getTime();
    const hours = milliseconds / (1000 * 60 * 60);

    return `${hours} hour${hours === 1 ? "" : "s"}`;
}

function getBookingTitle(roomName: string, bookingDate: Date) {
    return `${roomName} - ${new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(bookingDate)}`;
}

const coshhResources = [
    {
        title: "COSHH Data Sheet",
        viewHref: "/staff-documents/torsshhncs26-coshh-ra-baseline-massage-milk.pdf",
        downloadHref: "/staff-documents/torsshhncs26-coshh-ra-baseline-massage-milk.pdf",
    },
];

const importantFormResources = [
    {
        title: "Setup Guide",
        viewHref: "/staff-documents/setup-guide.pdf",
        downloadHref: "/staff-documents/setup-guide.pdf",
    },
    {
        title: "Cleaning Procedures",
        viewHref: "/staff-documents/cleaning-procedures.pdf",
        downloadHref: "/staff-documents/cleaning-procedures.pdf",
    },
    {
        title: "Equipment Handling",
        viewHref: "/staff-documents/equipment-handling.pdf",
        downloadHref: "/staff-documents/equipment-handling.pdf",
    },
];

export default async function TechnicianDashboard() {
    const [pendingBookings, staffMembers, assignments] = await Promise.all([
        prisma.booking.findMany({
            where: {
                status: BookingStatus.SUBMITTED,
            },
            orderBy: [
                { booking_date: "asc" },
                { start_time: "asc" },
            ],
            include: {
                user: true,
                room: true,
                bookingDocuments: true,  // was documents
                bookingItems: {
                    include: {
                        equipment: true,
                    },
                },
            },
        }),
        prisma.user.findMany({
            where: {
                role: "STAFF",
                is_active: true,
            },
            orderBy: {
                first_name: "asc",
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
            },
        }),
        prisma.bookingTask.findMany({
            include: {
                user: true,  // was assignee
                booking: {
                    include: {
                        user: true,
                        room: true,
                        bookingItems: {
                            include: {
                                equipment: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        }),
    ]);

    const bookingCards = pendingBookings.map((booking) => ({
        id: booking.id,
        title: getBookingTitle(booking.room.name, booking.booking_date),
        lesson: booking.lesson || "No lesson provided",
        dateLabel: formatDateLabel(booking.booking_date),
        timeLabel: formatTimeLabel(booking.start_time, booking.end_time),
        durationLabel: formatDurationLabel(booking.start_time, booking.end_time),
        studentName:
            `${booking.user.first_name ?? ""} ${booking.user.last_name ?? ""}`.trim() ||
            booking.user.email,
        roomName: booking.room.name,
        otherRequirements: booking.description || "No additional notes provided.",
        documents: booking.bookingDocuments.map((doc) => ({
            id: doc.id,
            fileName: doc.file_name,
            filePath: doc.file_path,
        })),
        equipmentItems: booking.bookingItems.map((item) => ({
            id: item.id,
            name: item.equipment.name,
            quantity: item.quantity_requested,
        })),
    }));

    const staffOptions = staffMembers.map((staffMember) => ({
        id: staffMember.id,
        name:
            `${staffMember.first_name ?? ""} ${staffMember.last_name ?? ""}`.trim() ||
            `Staff ${staffMember.id}`,
    }));

    const assignmentCards = assignments.map((assignment) => ({
        id: assignment.id,
        title: getBookingTitle(
            assignment.booking.room.name,
            assignment.booking.booking_date,
        ),
        lesson: assignment.booking.lesson || "No lesson provided",
        taskType: assignment.task_type,
        assigneeName:
            `${assignment.user.first_name ?? ""} ${assignment.user.last_name ?? ""}`.trim() ||
            assignment.user.email,
        status: assignment.status,
        studentName:
            `${assignment.booking.user.first_name ?? ""} ${assignment.booking.user.last_name ?? ""}`.trim() ||
            assignment.booking.user.email,
        roomName: assignment.booking.room.name,
        dateLabel: formatDateLabel(assignment.booking.booking_date),
        timeLabel: formatTimeLabel(assignment.booking.start_time, assignment.booking.end_time),
        durationLabel: formatDurationLabel(assignment.booking.start_time, assignment.booking.end_time),
        otherRequirements: assignment.booking.description || "No additional notes provided.",
        equipmentItems: assignment.booking.bookingItems.map((item) => ({
            id: item.id,
            name: item.equipment.name,
            quantity: item.quantity_requested,
        })),
        equipmentPicked: assignment.equipment_picked || "",
        missingEquipment: assignment.missing_equipment || "",
        taskNotes: assignment.task_notes || "",
    }));

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                showLogout={true}
                links={[
                    { href: "/dashboard/technician", label: "Home", primary: true },
                    { href: "/dashboard/technician/catalogue", label: "Order Catalogue" },
                    { href: "/dashboard/technician/editCatalogue", label: "Edit Catalogue" },
                ]}
            />

            <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(184,0,80,0.12),transparent_28%),linear-gradient(180deg,#fdf7fa_0%,#f3f4f6_45%,#eef1f4_100%)] px-6 py-10">
                <section className="mx-auto flex max-w-375 flex-col gap-8">
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                        <span className="inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-900">
                            Senior technician view
                        </span>
                        <h1 className="mt-4 text-3xl font-bold text-gray-900">
                            Senior Technician Dashboard
                        </h1>
                        <p className="mt-3 max-w-3xl text-gray-600">
                            Review requested bookings, assign junior technicians, and track setup and strip down tasks from one compact workspace.
                        </p>
                    </div>

                    <TechnicianBookingBoard
                        bookings={bookingCards}
                        staffMembers={staffOptions}
                        assignments={assignmentCards}
                    />

                    <div className="grid gap-6 xl:grid-cols-2">
                        <DocumentResourcePanel
                            title="COSHH Data Sheet"
                            description="Review the COSHH reference before approving or preparing bookings that depend on specialist products or equipment."
                            items={coshhResources}
                        />

                        <DocumentResourcePanel
                            title="Important Forms"
                            description="Keep the main setup, cleaning, and equipment handling guidance close to the booking confirmation and task workflow."
                            items={importantFormResources}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}
