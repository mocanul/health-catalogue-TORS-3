"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    inviteId: number;
};

export default function AcceptDeclineButtons({ inviteId }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleResponse = async (status: "ACCEPTED" | "REJECTED") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/booking/contributor/invite/${inviteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                console.error("Failed to respond to invite", errorData);
                return;
            }

            router.refresh();
        } catch (error) {
            console.error("Failed to respond to invite", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center gap-2">
            <button
                onClick={() => handleResponse("ACCEPTED")}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
                Accept
            </button>
            <button
                onClick={() => handleResponse("REJECTED")}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
                Decline
            </button>
        </div>
    );
}