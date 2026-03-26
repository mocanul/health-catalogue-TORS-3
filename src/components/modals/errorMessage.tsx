//reusable error message modal

"use client";

type Props = {
    open: boolean;
    title?: string;
    message: string;
    buttonText?: string;
    onClose: () => void;
};

export default function ErrorModal({
    open,
    title = "Error",
    message,
    buttonText = "OK",
    onClose,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                </div>

                <div className="px-5 py-4">
                    <p className="text-sm text-gray-700">{message}</p>
                </div>

                <div className="flex justify-end border-t border-gray-200 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-[#B80050] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9a0044] cursor-pointer"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}