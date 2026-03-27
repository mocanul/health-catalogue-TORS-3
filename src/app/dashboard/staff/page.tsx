import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import DocumentResourcePanel from "@/components/documentResourcePanel";
import StaffTaskChecklist from "@/components/staffTaskChecklist";
import { prisma } from "@/lib/prisma";
import { validateSession } from "@/lib/auth/session";

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

export default async function StaffDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const sessionUser = token ? await validateSession(token) : null;

    const taskFilter =
        sessionUser?.role === "STAFF"
            ? { assigned_to: sessionUser.id }
            : undefined;

    const tasks = await prisma.bookingTask.findMany({
        where: taskFilter,
        include: {
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
            created_at: "asc",
        },
    });

    const taskCards = tasks.map((task) => ({
        id: task.id,
        title: getBookingTitle(task.booking.room.name, task.booking.booking_date),
        lesson: task.booking.lesson || "No lesson provided",
        taskType: task.task_type,
        status: task.status,
        studentName:
            `${task.booking.user.first_name ?? ""} ${task.booking.user.last_name ?? ""}`.trim() ||
            task.booking.user.email,
        roomName: task.booking.room.name,
        dateLabel: formatDateLabel(task.booking.booking_date),
        timeLabel: formatTimeLabel(task.booking.start_time, task.booking.end_time),
        durationLabel: formatDurationLabel(task.booking.start_time, task.booking.end_time),
        otherRequirements: task.booking.description || "No additional notes provided.",
        equipmentItems: task.booking.bookingItems.map((item) => ({
            id: item.id,
            name: item.equipment.name,
            quantity: item.quantity_requested,
        })),
        equipmentPicked: task.equipment_picked || "",
        missingEquipment: task.missing_equipment || "",
        taskNotes: task.task_notes || "",
    }));

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar showLogout={true} links={[
                { href: "/dashboard/staff", label: "Home", primary: true },
                { href: "/dashboard/staff/bookings", label: "Bookings" },
                { href: "/dashboard/staff/catalogue", label: "Catalogue" }
            ]} />

            <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(184,0,80,0.12),transparent_28%),linear-gradient(180deg,#fdf7fa_0%,#f3f4f6_45%,#eef1f4_100%)] px-6 py-10">
                <section className="relative isolate mx-auto flex max-w-7xl flex-col gap-8">
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                            Junior technician view
                        </span>
                        <h1 className="mt-4 text-3xl font-bold text-gray-900">
                            Staff Dashboard
                        </h1>
                        <p className="mt-3 max-w-3xl text-gray-600">
                            View only the setup and strip down tasks assigned to you, open the linked booking details, and keep the COSHH and important setup documents close by.
                        </p>
                    </div>

                    <StaffTaskChecklist tasks={taskCards} />

                    <div className="grid gap-6 xl:grid-cols-2">
                        <DocumentResourcePanel
                            title="COSHH Data Sheet"
                            description="Open the COSHH reference before preparing rooms or handling products linked to your assigned tasks."
                            items={coshhResources}
                        />

                        <DocumentResourcePanel
                            title="Important Forms"
                            description="Keep the setup, cleaning, and equipment handling guidance beside the junior technician task list."
                            items={importantFormResources}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}
