"use client";

import { useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    onSelect: (date: string, startTime: string, endTime: string) => void;
};

const TIME_SLOTS = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00"
];

export default function SelectDateTime({ open, onClose, onSelect }: Props) {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

    if (!open) return null;

    const handleSlotClick = (slot: string) => {
        setSelectedSlots((prev) => {
            //deselect if already selected
            if (prev.includes(slot)) {
                const idx = prev.indexOf(slot);
                if (idx > 0 && idx < prev.length - 1) return [slot];
                return prev.filter((s) => s !== slot);
            }

            // Start fresh if no slots selected
            if (prev.length === 0) return [slot];

            //check if slot selected is adjacent to another selected slot
            const slotIdx = TIME_SLOTS.indexOf(slot);
            const firstIdx = TIME_SLOTS.indexOf(prev[0]);
            const lastIdx = TIME_SLOTS.indexOf(prev[prev.length - 1]);

            //must be adjacent and not exceed 3 selections
            if (slotIdx === lastIdx + 1 && prev.length < 3) {
                return [...prev, slot];
            }
            if (slotIdx === firstIdx - 1 && prev.length < 3) {
                return [slot, ...prev];
            }

            //if not adjacent reset selection
            return [slot];
        });
    };

    const isSelected = (slot: string) => selectedSlots.includes(slot);

    const isFirst = (slot: string) => slot === selectedSlots[0];
    const isLast = (slot: string) => slot === selectedSlots[selectedSlots.length - 1];
    const isMiddle = (slot: string) => isSelected(slot) && !isFirst(slot) && !isLast(slot);

    const startTime = selectedSlots[0] ?? null;
    const endTime = selectedSlots.length > 0
        ? `${String(parseInt(selectedSlots[selectedSlots.length - 1]) + 1).padStart(2, "0")}:00`
        : null;

    const canConfirm = selectedDate !== "" && selectedSlots.length > 0;

    //minimum date is today
    const today = new Date().toISOString().split("T")[0];

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 flex flex-col gap-4 h-120"
                onClick={(e) => e.stopPropagation()}
            >
                {/* header */}
                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-semibold text-gray-800">Select Date & Time</h2>
                    <button
                        onClick={onClose}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/*date picker*/}
                <div className="flex flex-col gap-1 shrink-0">
                    <label className="text-xs font-medium text-gray-500">Date</label>
                    <input
                        type="date"
                        min={today}
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedSlots([]);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                    />
                </div>

                <hr className="border-t border-gray-100 shrink-0" />

                {/*time slots*/}
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500">Time Slot</label>
                        {selectedSlots.length > 0 && (
                            <span className="text-xs text-[#B80050] font-medium">
                                {startTime} – {endTime} ({selectedSlots.length} {selectedSlots.length === 1 ? "hour" : "hours"})
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => handleSlotClick(slot)}
                                className={`py-3 text-xs font-medium rounded-lg border transition-all cursor-pointer
                                    ${isSelected(slot)
                                        ? "bg-[#B80050] text-white border-[#B80050]"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-[#B80050] hover:text-[#B80050]"
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>

                    <p className="text-xs text-gray-400">
                        Select up to 3 consecutive time slots.
                    </p>
                </div>

                {/*confirm date&time*/}
                <button
                    disabled={!canConfirm}
                    onClick={() => {
                        if (canConfirm && startTime && endTime) {
                            onSelect(selectedDate, startTime, endTime);
                            onClose();
                        }
                    }}
                    className="w-full bg-[#B80050] hover:bg-[#9a0044] disabled:opacity-40 disabled:cursor-not-allowed
                    text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                    Confirm Date & Time
                </button>
            </div>
        </div>
    );
}