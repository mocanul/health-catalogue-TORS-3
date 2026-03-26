"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { printHtmlContent } from "@/lib/clientPrint";
import { createPortal } from "react-dom";

type EquipmentItem = {
    id: number;
    name: string;
    quantity: number;
};

type StaffTask = {
    id: number;
    title: string;
    lesson: string;
    taskType: string;
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

function buildEquipmentDocument(task: StaffTask) {
    const rows = task.equipmentItems.length > 0
        ? task.equipmentItems
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
                <title>${task.title} Equipment List</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 32px; color: #111827;">
                <h1 style="margin: 0 0 20px;">${task.title}</h1>
                <div style="line-height: 1.8; margin-bottom: 24px;">
                    <div><strong>Student:</strong> ${task.studentName}</div>
                    <div><strong>Room:</strong> ${task.roomName}</div>
                    <div><strong>Session:</strong> ${task.lesson}</div>
                    <div><strong>Date:</strong> ${task.dateLabel}</div>
                    <div><strong>Time:</strong> ${task.timeLabel}</div>
                    <div><strong>Duration:</strong> ${task.durationLabel}</div>
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
                <p style="margin: 0;">${task.otherRequirements}</p>
            </body>
        </html>
    `;
}

function downloadEquipmentList(task: StaffTask) {
    const lines = [
        task.title,
        `Student: ${task.studentName}`,
        `Room: ${task.roomName}`,
        `Session: ${task.lesson}`,
        `Date: ${task.dateLabel}`,
        `Time: ${task.timeLabel}`,
        `Duration: ${task.durationLabel}`,
        "",
        "Equipment List",
        ...(task.equipmentItems.length > 0
            ? task.equipmentItems.map((item) => `${item.name} - Qty ${item.quantity}`)
            : ["No equipment requested."]),
        "",
        `Other requirements: ${task.otherRequirements}`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${task.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-equipment-list.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function StaffTaskChecklist({ tasks }: { tasks: StaffTask[] }) {
    const router = useRouter();
    const [taskList, setTaskList] = useState(tasks);
    const [activeTask, setActiveTask] = useState<StaffTask | null>(null);
    const [taskStatus, setTaskStatus] = useState("PENDING");
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

    async function updateTaskStatus(taskId: number, status: string) {
        setUpdatingTaskId(taskId);
        await fetch("/api/task-status", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId, status }),
        });
        setUpdatingTaskId(null);
        router.refresh();
    }

    return (
        <section className="relative z-0 rounded-3xl border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="border-b border-pink-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Task Checklist</h2>
                <p className="mt-2 text-gray-600">
                    Open each assigned task to view the linked booking details, equipment list, and progress notes.
                </p>
            </div>

            <div className="mt-6 space-y-4">
                {taskList.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-pink-100 bg-pink-50/40 p-8 text-gray-600">
                        No junior technician tasks are assigned yet.
                    </div>
                )}

                {taskList.map((task) => (
                    <button
                        key={task.id}
                        type="button"
                        onClick={() => {
                            setActiveTask(task);
                            setTaskStatus(task.status);
                        }}
                        className="w-full rounded-2xl border border-pink-100 bg-[linear-gradient(135deg,_rgba(255,255,255,1)_0%,_rgba(252,244,248,1)_100%)] p-5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:border-pink-200 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
                    >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(task.status)}`}>
                                        {formatStatus(task.status)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    {formatTaskType(task.taskType)} · {task.dateLabel} · {task.timeLabel}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {activeTask && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
                    <div className="relative z-[1000] max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
                        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">{activeTask.title}</h2>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(activeTask.status)}`}>
                                        {formatStatus(activeTask.status)}
                                    </span>
                                </div>
                                <p className="mt-2 text-gray-600">
                                    {formatTaskType(activeTask.taskType)} · {activeTask.roomName}
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
                                <dl className="mt-4 grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
                                    <div><dt className="font-semibold text-gray-900">Session</dt><dd className="mt-1">{activeTask.lesson}</dd></div>
                                    <div><dt className="font-semibold text-gray-900">Date</dt><dd className="mt-1">{activeTask.dateLabel}</dd></div>
                                    <div><dt className="font-semibold text-gray-900">Time</dt><dd className="mt-1">{activeTask.timeLabel}</dd></div>
                                    <div><dt className="font-semibold text-gray-900">Duration</dt><dd className="mt-1">{activeTask.durationLabel}</dd></div>
                                    <div><dt className="font-semibold text-gray-900">Booking under</dt><dd className="mt-1">{activeTask.studentName}</dd></div>
                                    <div><dt className="font-semibold text-gray-900">Room</dt><dd className="mt-1">{activeTask.roomName}</dd></div>
                                    <div className="sm:col-span-2">
                                        <dt className="font-semibold text-gray-900">Other requirements</dt>
                                        <dd className="mt-1">{activeTask.otherRequirements}</dd>
                                    </div>
                                </dl>
                            </section>

                            <section className="rounded-2xl border border-gray-200 p-5">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-lg font-bold text-gray-900">Equipment list</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => printHtmlContent(buildEquipmentDocument(activeTask))}
                                            className="rounded-md border border-gray-400 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                                        >
                                            Print
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => downloadEquipmentList(activeTask)}
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
                                            {activeTask.equipmentItems.length === 0 && (
                                                <tr>
                                                    <td colSpan={2} className="px-4 py-4 text-gray-600">No equipment requested.</td>
                                                </tr>
                                            )}
                                            {activeTask.equipmentItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="border-t border-gray-200 px-4 py-3">{item.name}</td>
                                                    <td className="border-t border-gray-200 px-4 py-3">{item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <section className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-lg font-bold text-gray-900">Task status</h3>
                                <label className="mt-4 block">
                                    <span className="mb-2 block text-sm font-semibold text-gray-900">Status</span>
                                    <select
                                        value={taskStatus}
                                        onChange={(event) => {
                                            setTaskStatus(event.target.value);
                                        }}
                                        disabled={updatingTaskId === activeTask.id}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                                    >
                                        <option value="PENDING">Not completed</option>
                                        <option value="IN_PROGRESS">In progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </label>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await updateTaskStatus(activeTask.id, taskStatus);
                                            setTaskList((currentTasks) =>
                                                currentTasks.map((task) =>
                                                    task.id === activeTask.id
                                                        ? { ...task, status: taskStatus }
                                                        : task,
                                                ),
                                            );
                                            setActiveTask({ ...activeTask, status: taskStatus });
                                        }}
                                        disabled={updatingTaskId === activeTask.id}
                                        className="rounded-md bg-pink-950 px-4 py-2 font-semibold text-white transition hover:bg-pink-900 disabled:opacity-50"
                                    >
                                        Save task status
                                    </button>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-gray-200 p-5">
                                <h3 className="text-lg font-bold text-gray-900">Previous technician notes</h3>
                                <div className="mt-4 space-y-3 text-sm text-gray-700">
                                    <div>
                                        <p className="font-semibold text-gray-900">Equipment picked</p>
                                        <p className="mt-1">{activeTask.equipmentPicked || "No equipment picked notes recorded."}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Equipment missing</p>
                                        <p className="mt-1">{activeTask.missingEquipment || "No missing equipment recorded."}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Room and equipment notes</p>
                                        <p className="mt-1">{activeTask.taskNotes || "No room or equipment notes recorded."}</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </section>
    );
}



