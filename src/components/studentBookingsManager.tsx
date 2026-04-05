"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type EquipmentItem = {
    id: number;
    equipmentId: number;
    name: string;
    quantity: number;
};

type StudentBooking = {
    id: number;
    roomId: number;
    roomName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    lesson: string;
    otherRequirements: string;
    status: "SUBMITTED" | "APPROVED" | "REJECTED";
    reviewNotes: string | null;
    equipmentItems: EquipmentItem[];
};

type RoomOption = {
    id: number;
    name: string;
};

type StudentBookingsManagerProps = {
    bookings: StudentBooking[];
    rooms: RoomOption[];
};

type EditableBooking = {
    id: number;
    roomId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    lesson: string;
    otherRequirements: string;
    equipmentItems: Array<{
        id: number;
        equipmentId: number;
        name: string;
        quantity: string;
    }>;
};

function formatDateLabel(dateValue: string) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(dateValue));
}

function formatClockTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    return new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(2000, 0, 1, hours, minutes));
}

function formatTimeLabel(startTime: string, endTime: string) {
    return `${formatClockTime(startTime)} to ${formatClockTime(endTime)}`;
}

function getStatusCopy(status: StudentBooking["status"]) {
    if (status === "APPROVED") {
        return {
            label: "Approved",
            badgeClassName: "bg-green-100 text-green-800",
            panelClassName: "border-green-200 bg-green-50/70",
            message: "Your booking has been approved by the technician team.",
        };
    }

    if (status === "REJECTED") {
        return {
            label: "Denied",
            badgeClassName: "bg-red-100 text-red-800",
            panelClassName: "border-red-200 bg-red-50/70",
            message: "Your booking was denied. Check the technician note below before resubmitting.",
        };
    }

    return {
        label: "Submitted",
        badgeClassName: "bg-amber-100 text-amber-800",
        panelClassName: "border-amber-200 bg-amber-50/70",
        message: "Your booking has been submitted and is waiting for technician review.",
    };
}

function buildEditableBooking(booking: StudentBooking): EditableBooking {
    return {
        id: booking.id,
        roomId: String(booking.roomId),
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        lesson: booking.lesson,
        otherRequirements: booking.otherRequirements,
        equipmentItems: booking.equipmentItems.map((item) => ({
            id: item.id,
            equipmentId: item.equipmentId,
            name: item.name,
            quantity: String(item.quantity),
        })),
    };
}

export default function StudentBookingsManager({
    bookings,
    rooms,
}: StudentBookingsManagerProps) {
    const router = useRouter();
    const [activeBooking, setActiveBooking] = useState<EditableBooking | null>(null);
    const [confirmBooking, setConfirmBooking] = useState<EditableBooking | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [submittingId, setSubmittingId] = useState<number | null>(null);

    const roomNameLookup = useMemo(
        () => new Map(rooms.map((room) => [room.id, room.name])),
        [rooms],
    );

    function closeEditModal() {
        setActiveBooking(null);
        setConfirmBooking(null);
        setErrorMessage("");
    }

    function validateBooking(booking: EditableBooking) {
        if (!booking.roomId) {
            return "Select a room.";
        }

        if (!booking.bookingDate) {
            return "Select a booking date.";
        }

        if (!booking.startTime || !booking.endTime) {
            return "Select both a start and end time.";
        }

        if (booking.endTime <= booking.startTime) {
            return "End time must be after the start time.";
        }

        const hasInvalidQuantity = booking.equipmentItems.some((item) => {
            const quantity = Number(item.quantity);
            return Number.isNaN(quantity) || quantity < 0;
        });

        if (hasInvalidQuantity) {
            return "Equipment quantities must be zero or more.";
        }

        return "";
    }

    async function submitResubmission() {
        if (!confirmBooking) {
            return;
        }

        const validationError = validateBooking(confirmBooking);

        if (validationError) {
            setErrorMessage(validationError);
            setConfirmBooking(null);
            return;
        }

        setSubmittingId(confirmBooking.id);
        setErrorMessage("");

        try {
            const response = await fetch("/api/student-bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: confirmBooking.id,
                    roomId: Number(confirmBooking.roomId),
                    bookingDate: confirmBooking.bookingDate,
                    startTime: confirmBooking.startTime,
                    endTime: confirmBooking.endTime,
                    lesson: confirmBooking.lesson.trim(),
                    otherRequirements: confirmBooking.otherRequirements.trim(),
                    equipmentItems: confirmBooking.equipmentItems.map((item) => ({
                        equipmentId: item.equipmentId,
                        quantity: Number(item.quantity),
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || "Failed to resubmit booking.");
                return;
            }

            closeEditModal();
            router.refresh();
        } catch {
            setErrorMessage("Failed to resubmit booking.");
        } finally {
            setSubmittingId(null);
        }
    }

    return (
        <>
            <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex flex-col gap-4 border-b border-pink-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Booking status</h2>
                        <p className="mt-2 text-gray-600">
                            Open any booking to review the current decision and resubmit changes back to the technician team.
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tracked bookings</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">{bookings.length}</p>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {bookings.length === 0 && (
                        <div className="rounded-2xl border-2 border-dashed border-pink-100 bg-pink-50/40 p-8 text-gray-600">
                            You do not have any submitted, approved, or denied bookings yet.
                        </div>
                    )}

                    {bookings.map((booking) => {
                        const statusCopy = getStatusCopy(booking.status);

                        return (
                            <article
                                key={booking.id}
                                className="rounded-2xl border border-pink-100 bg-[linear-gradient(135deg,_rgba(255,255,255,1)_0%,_rgba(252,244,248,1)_100%)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {booking.roomName} - {formatDateLabel(booking.bookingDate)}
                                            </h3>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusCopy.badgeClassName}`}>
                                                {statusCopy.label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                            <span className="rounded-full bg-gray-100 px-3 py-1">
                                                {formatTimeLabel(booking.startTime, booking.endTime)}
                                            </span>
                                            <span className="rounded-full bg-gray-100 px-3 py-1">
                                                {booking.lesson || "No lesson provided"}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveBooking(buildEditableBooking(booking));
                                            setConfirmBooking(null);
                                            setErrorMessage("");
                                        }}
                                        className="rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                                    >
                                        Edit booking
                                    </button>
                                </div>

                                <div className={`mt-4 rounded-2xl border px-4 py-4 ${statusCopy.panelClassName}`}>
                                    <p className="text-sm font-semibold text-gray-900">Status update</p>
                                    <p className="mt-1 text-sm text-gray-700">{statusCopy.message}</p>
                                    {booking.status === "REJECTED" && booking.reviewNotes && (
                                        <div className="mt-3 rounded-xl bg-white/70 px-4 py-3 text-sm text-gray-700">
                                            <p className="font-semibold text-gray-900">Technician note</p>
                                            <p className="mt-1">{booking.reviewNotes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">Room</p>
                                        <p className="mt-1">{booking.roomName}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Other requirements</p>
                                        <p className="mt-1">{booking.otherRequirements || "No additional notes provided."}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm font-semibold text-gray-900">Requested equipment</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {booking.equipmentItems.length === 0 && (
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                                                No equipment requested
                                            </span>
                                        )}
                                        {booking.equipmentItems.map((item) => (
                                            <span
                                                key={item.id}
                                                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                                            >
                                                {item.name} x {item.quantity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {activeBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
                    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Edit booking</h2>
                                <p className="mt-2 text-gray-600">
                                    Update the booking details, then resubmit it as a fresh request for technician review.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-gray-900">Room</span>
                                <select
                                    value={activeBooking.roomId}
                                    onChange={(event) =>
                                        setActiveBooking((current) =>
                                            current ? { ...current, roomId: event.target.value } : current,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Select a room</option>
                                    {rooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-gray-900">Session</span>
                                <input
                                    type="text"
                                    value={activeBooking.lesson}
                                    onChange={(event) =>
                                        setActiveBooking((current) =>
                                            current ? { ...current, lesson: event.target.value } : current,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    placeholder="Enter the lesson or session name"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-gray-900">Booking date</span>
                                <input
                                    type="date"
                                    value={activeBooking.bookingDate}
                                    onChange={(event) =>
                                        setActiveBooking((current) =>
                                            current ? { ...current, bookingDate: event.target.value } : current,
                                        )
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-gray-900">Start time</span>
                                    <input
                                        type="time"
                                        value={activeBooking.startTime}
                                        onChange={(event) =>
                                            setActiveBooking((current) =>
                                                current ? { ...current, startTime: event.target.value } : current,
                                            )
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-gray-900">End time</span>
                                    <input
                                        type="time"
                                        value={activeBooking.endTime}
                                        onChange={(event) =>
                                            setActiveBooking((current) =>
                                                current ? { ...current, endTime: event.target.value } : current,
                                            )
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-gray-900">Other requirements</span>
                                <textarea
                                    value={activeBooking.otherRequirements}
                                    onChange={(event) =>
                                        setActiveBooking((current) =>
                                            current ? { ...current, otherRequirements: event.target.value } : current,
                                        )
                                    }
                                    rows={4}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    placeholder="Add any other requirements for the booking"
                                />
                            </label>
                        </div>

                        <section className="mt-6 rounded-2xl border border-gray-200 p-5">
                            <h3 className="text-lg font-bold text-gray-900">Equipment quantities</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Change the requested quantities here. Set a quantity to 0 to remove that item from the booking.
                            </p>
                            <div className="mt-4 space-y-4">
                                {activeBooking.equipmentItems.length === 0 && (
                                    <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                        No equipment items were attached to this booking.
                                    </p>
                                )}
                                {activeBooking.equipmentItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-3 rounded-xl border border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-600">Requested equipment item</p>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.quantity}
                                            onChange={(event) =>
                                                setActiveBooking((current) => {
                                                    if (!current) {
                                                        return current;
                                                    }

                                                    const nextItems = [...current.equipmentItems];
                                                    nextItems[index] = {
                                                        ...nextItems[index],
                                                        quantity: event.target.value,
                                                    };

                                                    return {
                                                        ...current,
                                                        equipmentItems: nextItems,
                                                    };
                                                })
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 sm:w-28"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {errorMessage && (
                            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
                        )}

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const validationError = validateBooking(activeBooking);

                                    if (validationError) {
                                        setErrorMessage(validationError);
                                        return;
                                    }

                                    setConfirmBooking(activeBooking);
                                }}
                                className="rounded-md bg-pink-950 px-4 py-2 font-semibold text-white transition hover:bg-pink-900"
                            >
                                Review resubmission
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmBooking && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900">Resubmit booking?</h2>
                        <p className="mt-3 text-gray-600">
                            This will send the edited booking back to the technician team as a new review request.
                        </p>
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                            <p className="font-semibold">Please confirm</p>
                            <p className="mt-1">
                                The booking status will return to Submitted, technician notes will be cleared, and any existing task assignments for this booking will be removed until it is reviewed again.
                            </p>
                            <p className="mt-3">
                                Room: {roomNameLookup.get(Number(confirmBooking.roomId)) || "Unknown room"}
                            </p>
                            <p>Date: {formatDateLabel(confirmBooking.bookingDate)}</p>
                            <p>Time: {formatTimeLabel(confirmBooking.startTime, confirmBooking.endTime)}</p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmBooking(null)}
                                className="rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                            >
                                Go back
                            </button>
                            <button
                                type="button"
                                onClick={submitResubmission}
                                disabled={submittingId === confirmBooking.id}
                                className="rounded-md bg-pink-950 px-4 py-2 font-semibold text-white transition hover:bg-pink-900 disabled:opacity-50"
                            >
                                Confirm resubmit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
