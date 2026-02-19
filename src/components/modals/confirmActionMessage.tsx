"use client";

import { AlertCircle, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ActionType = "delete" | "confirm" | "warning" | "success";

type Props = {
    open: boolean;
    title: string;
    message: string;
    actionType?: ActionType;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isDangerous?: boolean; //highlights confirm button in red for destructive actions
};

const actionConfig: Record<ActionType, { icon: LucideIcon; bgColor: string; buttonColor: string }> = {
    delete: {
        icon: Trash2,
        bgColor: "bg-red-50",
        buttonColor: "bg-red-600 hover:bg-red-700",
    },
    confirm: {
        icon: CheckCircle,
        bgColor: "bg-blue-50",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    warning: {
        icon: AlertTriangle,
        bgColor: "bg-yellow-50",
        buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    success: {
        icon: AlertCircle,
        bgColor: "bg-green-50",
        buttonColor: "bg-green-600 hover:bg-green-700",
    },
};

export default function ConfirmActionMessage({
    open,
    title,
    message,
    actionType = "confirm",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
    isDangerous = false,
}: Props) {
    if (!open) return null;

    const config = actionConfig[actionType];
    const Icon = config.icon;
    const buttonColor = isDangerous ? "bg-red-600 hover:bg-red-700" : config.buttonColor;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <button
                aria-label="Close confirmation dialog"
                onClick={onCancel}
                disabled={isLoading}
                className="absolute inset-0 bg-black/40"
            />

            {/* modal */}
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="relative z-10 w-96 max-w-[92vw] rounded-lg bg-white shadow-xl"
            >
                {/* header */}
                <div className={`flex items-center justify-between border-b px-4 py-3 ${config.bgColor}`}>
                    <div className="flex items-center gap-3">
                        <Icon size={20} className="text-gray-700" />
                        <h2 id="confirm-title" className="text-base font-semibold text-gray-900">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-md p-2 hover:bg-gray-200 disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* body */}
                <div className="px-4 py-4">
                    <p className="text-sm text-gray-700">{message}</p>
                </div>

                {/* footer */}
                <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-4 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`rounded-md px-4 py-2 text-sm font-medium text-white ${buttonColor} disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
