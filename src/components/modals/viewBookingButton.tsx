"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ViewBookingButton({booking, role}: {booking: any, role: string}) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const editBookingButton = () => {
        if(role === "ADMIN"){
            router.push('/dashboard/admin/catalogue?bookingId=${booking.id}')
        }
        else if(role === "TECHNICIAN"){
            router.push('/dashboard/technician/catalogue?bookingId=${booking.id}')
        }
        else if(role === "STAFF"){
            router.push('/dashboard/staff/catalogue?bookingId=${booking.id}')
        }
        else if(role === "STUDENT"){
            router.push('/dashboard/student/catalogue?bookingId=${booking.id}')
        }
    }

    return (
        <div>
            <button
                onClick={() => setOpen(true)}
                className="bg-[#B80050] px-5 py-1 text-white rounded font-medium text-sm"
            >
                View
            </button>

            {open && (
                <div className="fixed inset-0 bg-gray-50 bg-opacity-10 flex justify-center items-center">
                    <div className="max-w-[90%] max-h-[90%] w-full h-full bg-white p-6 rounded-lg shadow-lg overflow-auto">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-semibold mb-4">
                                Booking Details
                            </h2>

                            <p><strong>Name:</strong> {booking.user?.first_name} {booking.user?.last_name}</p>
                            <p><strong>Email:</strong> {booking.user?.email}</p>
                            <p><strong>Room:</strong> {booking.room?.name}</p>
                            <p><strong>Date:</strong> {new Date(booking.booking_date).toDateString()}</p>
                            <p><strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
                            <p><strong>Status:</strong> {booking.status}</p>

                            <div className="flex gap-5 justify-center">
                                <button
                                    onClick={editBookingButton}
                                    className="mt-4 bg-[#B80050] border text-white px-4 py-2 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="mt-4 bg-gray-700 border px-4 py-2 rounded"
                                >
                                    Close
                                </button>
                            </div>

                            {booking.bookingItems && booking.bookingItems.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-2">Equipment</h3>
                                    <div className="space-y-2">
                                        {booking.bookingItems.map((item: any) => (
                                            <div key={item.id}>
                                                <p><strong>{item.equipment?.name}</strong></p>
                                                <p className="text-sm text-gray-600">Requested: {item.quantity_requested}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}