import { prisma } from "@/lib/prisma";

export default async function Bookings() {
    const booking = await prisma.booking.findMany({
        include:{
            user:{
                select:{
                    first_name: true,
                    last_name: true,
                    email: true
                }
            },
            room:{
                select:{
                    name: true,
                    building: true
                }
            }
        },
        orderBy:[
            {booking_date: "asc"},
            {start_time: "asc"}
        ]
    });
    

    return (
        <main>
            <div className="flex justify-center mt-10">
                <div className="w-full max-w-6xl rounded-lg shadow-md flex flex-col overflow-hidden">
                    <div className="bg-pink-100 px-3 sm:px-4 py-3 border-b">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-base sm:text-lg">
                                Bookings
                            </h3>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by Item Name"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"/>
                            </div>
                        </div>
                    </div>

                    {/* Table wrapper controls width + scroll */}
                    <div className="w-full overflow-x-auto">
                        <div className="max-h-120 overflow-y-auto">
                            <div className="w-full max-w-6xl rounded-lg shadow-md flex flex-col overflow-hidden">
                                <table className="w-full border">
                                    <thead className="sticky top-0 bg-pink-50">
                                        <tr className="border-b pb-3">
                                            <th className="p-3 text-center border-gray-200">First Name</th>
                                            <th className="p-3 text-center border-gray-500">Last Name</th>
                                            <th className="p-3 text-center border-gray-500">Email</th>
                                            <th className="p-3 text-center border-gray-200">Room</th>
                                            <th className="p-3 text-center border-gray-200">Building</th>
                                            <th className="p-3 text-center border-gray-200">Description</th>
                                            <th className="p-3 text-center border-gray-200">Booking Date</th>
                                            <th className="p-3 text-center border-gray-500">Start Time</th>
                                            <th className="p-3 text-center border-gray-500">End Time</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {booking.map(item => (
                                        <tr key={item.id}>
                                        <td className="p-3 text-center border-gray-500">{item.user?.first_name}</td>
                                        <td className="p-3 text-center border-gray-500">{item.user?.last_name}</td>
                                        <td className="p-3 text-center border-gray-500">{item.user?.email}</td>
                                        <td className="p-3 text-center border-gray-500">{item.room?.name}</td>
                                        <td className="p-3 text-center border-gray-500">{item.room?.building}</td>
                                        <td className="p-3 text-center border-gray-500">{item.description}</td>
                                        <td className="p-3 text-center border-gray-500">
                                            {item.booking_date.toDateString()}
                                        </td>
                                        <td className="p-3 text-center border-gray-500">
                                            {item.start_time.toISOString().slice(11, 16)}
                                        </td>
                                        <td className="p-3 text-center border-gray-500">
                                            {item.end_time.toISOString().slice(11, 16)}
                                        </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}