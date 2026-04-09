"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { printHtmlContent } from "@/lib/clientPrint";
import BookingChatButton from "@/components/bookingChatButton";

type StaffOption = {
    id: number;
    name: string;
};

type BookingDocument = {
    id: number;
    fileName: string;
    filePath: string;
};

type EquipmentItem = {
    id: number;
    name: string;
    quantity: number;
};

type PendingBooking = {
    id: number;
    title: string;
    lesson: string;
    dateLabel: string;
    timeLabel: string;
    durationLabel: string;
    studentName: string;
    roomName: string;
    otherRequirements: string;
    documents: BookingDocument[];
    equipmentItems: EquipmentItem[];
};

type AssignmentSummary = {
    id: number;
    bookingId: number;
    title: string;
    lesson: string;
    taskType: string;
    assigneeName: string;
    status: string;
    studentName: string;
    roomName: string;
    dateLabel: string;
    timeLabel: string;
    durationLabel: string;
    otherRequirements: string;
    equipmentItems: EquipmentItem[];
    equipmentPicked: string;
    missingEquipment: string;
    taskNotes: string;
};

type TechnicianBookingBoardProps = {
    bookings: PendingBooking[];
    staffMembers: StaffOption[];
    assignments: AssignmentSummary[];
};

type EquipmentDetails = {
    title: string;
    studentName: string;
    roomName: string;
    lesson: string;
    dateLabel: string;
    timeLabel: string;
    durationLabel: string;
    equipmentItems: EquipmentItem[];
    otherRequirements: string;
};

function formatTaskType(taskType: string) {
    return taskType === "SETUP" ? "Setup" : "Strip down";
}

function formatStatus(status: string) {
    return status.replace("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

function getStatusClasses(status: string) {
    if (status === "COMPLETED") {
        return "bg-green-100 text-green-800";
    }

    if (status === "IN_PROGRESS") {
        return "bg-amber-100 text-amber-800";
    }

    return "bg-slate-100 text-slate-700";
}

function buildEquipmentDocument(details: EquipmentDetails) {
    const rows = details.equipmentItems.length > 0
        ? details.equipmentItems
            .map(
                (item) => `
                    <tr>
                        <td style="padding:10px 12px;border:1px solid #d1d5db;">${item.name}</td>
                        <td style="padding:10px 12px;border:1px solid #d1d5db;">${item.quantity}</td>
                    </tr>
                `,
            )
            .join("")
        : `
            <tr>
                <td colspan="2" style="padding:10px 12px;border:1px solid #d1d5db;">No equipment requested.</td>
            </tr>
        `;

    return `
        <!doctype html>
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>${details.title} Equipment List</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 32px; color: #111827;">
                <h1 style="margin: 0 0 20px;">${details.title}</h1>
                <div style="line-height: 1.8; margin-bottom: 24px;">
                    <div><strong>Student:</strong> ${details.studentName}</div>
                    <div><strong>Room:</strong> ${details.roomName}</div>
                    <div><strong>Session:</strong> ${details.lesson}</div>
                    <div><strong>Date:</strong> ${details.dateLabel}</div>
                    <div><strong>Time:</strong> ${details.timeLabel}</div>
                    <div><strong>Duration:</strong> ${details.durationLabel}</div>
                </div>
                <h2 style="margin: 0 0 12px;">Equipment List</h2>
                <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px;">
                    <thead>
                        <tr style="background:#f3f4f6;">
                            <th style="padding:10px 12px;border:1px solid #d1d5db;text-align:left;">Equipment</th>
                            <th style="padding:10px 12px;border:1px solid #d1d5db;text-align:left;">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <h2 style="margin: 0 0 12px;">Other Requirements</h2>
                <p style="margin: 0;">${details.otherRequirements}</p>
            </body>
        </html>
    `;
}

function downloadEquipmentList(details: EquipmentDetails) {
    const lines = [
        details.title,
        `Student: ${details.studentName}`,
        `Room: ${details.roomName}`,
        `Session: ${details.lesson}`,
        `Date: ${details.dateLabel}`,
        `Time: ${details.timeLabel}`,
        `Duration: ${details.durationLabel}`,
        "",
        "Equipment List",
        ...(details.equipmentItems.length > 0
            ? details.equipmentItems.map((item) => `${item.name} - Qty ${item.quantity}`)
            : ["No equipment requested."]),
        "",
        `Other requirements: ${details.otherRequirements}`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${details.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-equipment-list.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function DetailGrid({
    lesson,
    dateLabel,
    timeLabel,
    durationLabel,
    studentName,
    roomName,
    otherRequirements,
}: {
    lesson: string;
    dateLabel: string;
    timeLabel: string;
    durationLabel: string;
    studentName: string;
    roomName: string;
    otherRequirements: string;
}) {
    return (
        <dl className="mt-4 grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
            <div><dt className="font-semibold text-gray-900">Session</dt><dd className="mt-1">{lesson}</dd></div>
            <div><dt className="font-semibold text-gray-900">Date</dt><dd className="mt-1">{dateLabel}</dd></div>
            <div><dt className="font-semibold text-gray-900">Time</dt><dd className="mt-1">{timeLabel}</dd></div>
            <div><dt className="font-semibold text-gray-900">Duration</dt><dd className="mt-1">{durationLabel}</dd></div>
            <div><dt className="font-semibold text-gray-900">Booking under</dt><dd className="mt-1">{studentName}</dd></div>
            <div><dt className="font-semibold text-gray-900">Room</dt><dd className="mt-1">{roomName}</dd></div>
            <div className="sm:col-span-2">
                <dt className="font-semibold text-gray-900">Other requirements</dt>
                <dd className="mt-1">{otherRequirements}</dd>
            </div>
        </dl>
    );
}

function EquipmentTable({ details }: { details: EquipmentDetails }) {
    return (
        <section className="rounded-2xl border border-gray-200 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-gray-900">Equipment list</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => printHtmlContent(buildEquipmentDocument(details))}
                        className="rounded-md border border-gray-400 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                    >
                        Print
                    </button>
                    <button
                        type="button"
                        onClick={() => downloadEquipmentList(details)}
                        className="rounded-md border border-gray-400 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                    >
                        Download
                    </button>
                </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border-b border-gray-200 px-4 py-3 text-left">Equipment</th>
                            <th className="border-b border-gray-200 px-4 py-3 text-left">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.equipmentItems.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-4 py-4 text-gray-600">No equipment requested.</td>
                            </tr>
                        )}
                        {details.equipmentItems.map((item) => (
                            <tr key={item.id}>
                                <td className="border-t border-gray-200 px-4 py-3">{item.name}</td>
                                <td className="border-t border-gray-200 px-4 py-3">{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
export default function TechnicianBookingBoard({
    bookings,
    staffMembers,
    assignments,
}: TechnicianBookingBoardProps) {
    const router = useRouter();
    const [activeBooking, setActiveBooking] = useState<PendingBooking | null>(null);
    const [activeTask, setActiveTask] = useState<AssignmentSummary | null>(null);
    const [declineBooking, setDeclineBooking] = useState<PendingBooking | null>(null);
    const [declineNote, setDeclineNote] = useState("");
    const [setupAssigneeId, setSetupAssigneeId] = useState("");
    const [stripdownAssigneeId, setStripdownAssigneeId] = useState("");
    const [taskStatus, setTaskStatus] = useState("PENDING");
    const [equipmentPicked, setEquipmentPicked] = useState("");
    const [missingEquipment, setMissingEquipment] = useState("");
    const [taskNotes, setTaskNotes] = useState("");
    const [submittingId, setSubmittingId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    async function reviewBooking(
        bookingId: number,
        action: "approve" | "decline",
        note?: string,
        setupId?: string,
        stripdownId?: string,
    ) {
        setSubmittingId(bookingId);
        setErrorMessage("");

        try {
            const response = await fetch("/api/booking-review", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId,
                    action,
                    note,
                    setupAssigneeId: setupId ? Number(setupId) : null,
                    stripdownAssigneeId: stripdownId ? Number(stripdownId) : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || "Something went wrong.");
                return false;
            }

            router.refresh();
            return true;
        } catch {
            setErrorMessage("Something went wrong.");
            return false;
        } finally {
            setSubmittingId(null);
        }
    }

    async function saveTaskDetails(taskId: number) {
        setSubmittingId(taskId);
        setErrorMessage("");

        try {
            const response = await fetch("/api/task-status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    status: taskStatus,
                    equipmentPicked,
                    missingEquipment,
                    taskNotes,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || "Something went wrong.");
                return false;
            }

            router.refresh();
            return true;
        } catch {
            setErrorMessage("Something went wrong.");
            return false;
        } finally {
            setSubmittingId(null);
        }
    }

    const inProgressAssignments = assignments.filter((assignment) => assignment.status === "IN_PROGRESS").length;

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
            <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex flex-col gap-4 border-b border-pink-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Booking Confirmation List</h2>
                        <p className="mt-2 max-w-2xl text-gray-600">
                            Review submitted bookings, check the documents, and assign junior technicians before approving where needed.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Awaiting review</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{bookings.length}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Staff available</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{staffMembers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {bookings.length === 0 && (
                        <div className="rounded-2xl border-2 border-dashed border-pink-100 bg-pink-50/40 p-8 text-gray-600">
                            No submitted bookings are waiting for review.
                        </div>
                    )}

                    {bookings.map((booking) => (
                        <article key={booking.id} className="rounded-2xl border border-pink-100 bg-[linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(252,244,248,1)_100%)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-xl font-bold text-gray-900">{booking.title}</h3>
                                        <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-900">
                                            Submitted
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                        <span className="rounded-full bg-gray-100 px-3 py-1">{booking.studentName}</span>
                                        <span className="rounded-full bg-gray-100 px-3 py-1">{booking.dateLabel}</span>
                                        <span className="rounded-full bg-gray-100 px-3 py-1">{booking.timeLabel}</span>
                                        <span className="rounded-full bg-gray-100 px-3 py-1">{booking.durationLabel}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">Session:</span> {booking.lesson}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <BookingChatButton
                                        bookingId={booking.id}
                                        heading={`Booking chat for ${booking.title}`}
                                        subheading="Message the student directly about this booking."
                                        buttonLabel="Open chat"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => reviewBooking(booking.id, "approve")}
                                        disabled={submittingId === booking.id}
                                        className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeclineBooking(booking);
                                            setDeclineNote("");
                                            setErrorMessage("");
                                        }}
                                        disabled={submittingId === booking.id}
                                        className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveBooking(booking);
                                            setSetupAssigneeId("");
                                            setStripdownAssigneeId("");
                                            setErrorMessage("");
                                        }}
                                        className="rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                                    >
                                        More info
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="border-b border-pink-100 pb-5">
                    <h2 className="text-2xl font-bold text-gray-900">Technician Tasks</h2>
                    <p className="mt-2 text-gray-600">
                        Approved setup and strip down work stays here so the booking details and equipment list remain easy to access.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">All tasks</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{assignments.length}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">In progress</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{inProgressAssignments}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {assignments.length === 0 && (
                        <div className="rounded-2xl border-2 border-dashed border-pink-100 bg-pink-50/40 p-6 text-gray-600">
                            No technician-linked tasks yet.
                        </div>
                    )}

                    {assignments.map((assignment) => (
                        <button
                            key={assignment.id}
                            type="button"
                            onClick={() => {
                                setActiveTask(assignment);
                                setTaskStatus(assignment.status);
                                setEquipmentPicked(assignment.equipmentPicked);
                                setMissingEquipment(assignment.missingEquipment);
                                setTaskNotes(assignment.taskNotes);
                                setErrorMessage("");
                            }}
                            className="w-full rounded-2xl border border-pink-100 bg-[linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(252,244,248,1)_100%)] p-4 text-left shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:border-pink-200 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        {formatTaskType(assignment.taskType)} for {assignment.assigneeName}
                                    </p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(assignment.status)}`}>
                                    {formatStatus(assignment.status)}
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                                <span className="rounded-full bg-gray-100 px-3 py-1">{assignment.dateLabel}</span>
                                <span className="rounded-full bg-gray-100 px-3 py-1">{assignment.timeLabel}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>
            {activeBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
                    <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{activeBooking.title}</h2>
                                <p className="mt-2 text-gray-600">{activeBooking.studentName} · {activeBooking.roomName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveBooking(null)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <section className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-lg font-bold text-gray-900">Booking details</h3>
                                <DetailGrid {...activeBooking} />
                            </section>

                            <section className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-lg font-bold text-gray-900">Safety and risk documents</h3>
                                <div className="mt-4 space-y-3">
                                    {activeBooking.documents.length === 0 && (
                                        <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                            No uploaded assessment files were attached to this booking.
                                        </p>
                                    )}
                                    {activeBooking.documents.map((document) => (
                                        <a
                                            key={document.id}
                                            href={document.filePath}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                                        >
                                            <span>{document.fileName}</span>
                                            <span>View</span>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <EquipmentTable details={activeBooking} />

                            <section className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-lg font-bold text-gray-900">Assign junior technician</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Assign setup and strip down tasks to staff members before approving if needed.
                                </p>
                                <div className="mt-4 space-y-4">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-gray-900">Setup task</span>
                                        <select
                                            value={setupAssigneeId}
                                            onChange={(event) => setSetupAssigneeId(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="">Unassigned</option>
                                            {staffMembers.map((staffMember) => (
                                                <option key={staffMember.id} value={staffMember.id}>{staffMember.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-gray-900">Strip down task</span>
                                        <select
                                            value={stripdownAssigneeId}
                                            onChange={(event) => setStripdownAssigneeId(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="">Unassigned</option>
                                            {staffMembers.map((staffMember) => (
                                                <option key={staffMember.id} value={staffMember.id}>{staffMember.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </section>
                        </div>

                        {errorMessage && (
                            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
                        )}

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <BookingChatButton
                                bookingId={activeBooking.id}
                                heading={`Booking chat for ${activeBooking.title}`}
                                subheading="Message the student directly while you review this booking."
                                buttonLabel="Open chat"
                            />
                            <button
                                type="button"
                                onClick={() => setActiveBooking(null)}
                                className="rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const success = await reviewBooking(
                                        activeBooking.id,
                                        "approve",
                                        undefined,
                                        setupAssigneeId,
                                        stripdownAssigneeId,
                                    );

                                    if (success) {
                                        setActiveBooking(null);
                                        setSetupAssigneeId("");
                                        setStripdownAssigneeId("");
                                    }
                                }}
                                disabled={submittingId === activeBooking.id}
                                className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                                Approve booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
                    <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">{activeTask.title}</h2>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(activeTask.status)}`}>
                                        {formatStatus(activeTask.status)}
                                    </span>
                                </div>
                                <p className="mt-2 text-gray-600">
                                    {formatTaskType(activeTask.taskType)} · {activeTask.assigneeName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTask(null)}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <section className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-lg font-bold text-gray-900">Task booking details</h3>
                                <DetailGrid {...activeTask} />
                            </section>

                            <EquipmentTable details={activeTask} />
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <section className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-lg font-bold text-gray-900">Task progress</h3>
                                <div className="mt-4 space-y-4">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-gray-900">Status</span>
                                        <select
                                            value={taskStatus}
                                            onChange={(event) => setTaskStatus(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="PENDING">Not completed</option>
                                            <option value="IN_PROGRESS">In progress</option>
                                            <option value="COMPLETED">Completed</option>
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-gray-900">Equipment picked</span>
                                        <textarea
                                            value={equipmentPicked}
                                            onChange={(event) => setEquipmentPicked(event.target.value)}
                                            rows={5}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                            placeholder="Write the equipment picked and quantity of each item..."
                                        />
                                    </label>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-lg font-bold text-gray-900">Task notes</h3>
                                <div className="mt-4 space-y-4">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-gray-900">Equipment missing</span>
                                        <textarea
                                            value={missingEquipment}
                                            onChange={(event) => setMissingEquipment(event.target.value)}
                                            rows={3}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                            placeholder="Record any missing equipment..."
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-gray-900">Room and equipment notes</span>
                                        <textarea
                                            value={taskNotes}
                                            onChange={(event) => setTaskNotes(event.target.value)}
                                            rows={5}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                            placeholder="Write any notes about the room setup or equipment..."
                                        />
                                    </label>
                                </div>
                            </section>
                        </div>

                        {errorMessage && (
                            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
                        )}

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <BookingChatButton
                                bookingId={activeTask.bookingId}
                                heading={`Booking chat for ${activeTask.title}`}
                                subheading="Use this chat to coordinate with the student about setup or strip down details."
                                buttonLabel="Open chat"
                            />
                            <button
                                type="button"
                                onClick={() => setActiveTask(null)}
                                className="rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const success = await saveTaskDetails(activeTask.id);

                                    if (success) {
                                        setActiveTask(null);
                                    }
                                }}
                                disabled={submittingId === activeTask.id}
                                className="rounded-md bg-pink-950 px-4 py-2 font-semibold text-white transition hover:bg-pink-900 disabled:opacity-50"
                            >
                                Save task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {declineBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900">Decline booking</h2>
                        <p className="mt-2 text-gray-600">
                            Add the reason this booking is being declined so it can be shown back to the student.
                        </p>
                        <textarea
                            value={declineNote}
                            onChange={(event) => setDeclineNote(event.target.value)}
                            rows={5}
                            className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2"
                            placeholder="Explain why the booking was declined..."
                        />
                        {errorMessage && (
                            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeclineBooking(null);
                                    setDeclineNote("");
                                    setErrorMessage("");
                                }}
                                className="rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!declineBooking) {
                                        return;
                                    }

                                    const success = await reviewBooking(declineBooking.id, "decline", declineNote);

                                    if (success) {
                                        setDeclineBooking(null);
                                        setDeclineNote("");
                                    }
                                }}
                                disabled={submittingId === declineBooking.id}
                                className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                            >
                                Confirm decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


