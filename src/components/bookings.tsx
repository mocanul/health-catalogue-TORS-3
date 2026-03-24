import { prisma } from "@/lib/prisma";

export default async function Bookings() {
  const booking = await prisma.booking.findMany();

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

                            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white cursor-pointer">
                                <option value="all">All Categories</option>
                                <option value="AAA">AAA</option>
                                <option value="BBB">BBB</option>
                                <option value="CCC">CCC</option>
                            </select>
                        </div>
                    </div>

                    {/* Table wrapper controls width + scroll */}
                    <div className="w-full overflow-x-auto">
                        <div className="max-h-120 overflow-y-auto">
                            <div className="w-full max-w-6xl rounded-lg shadow-md flex flex-col overflow-hidden">
                                <table className="w-full border">
                                    <thead className="sticky top-0 bg-pink-50">
                                        <tr className="border-b pb-3">
                                            <th className="p-3 text-center border-gray-500">id</th>
                                            <th className="p-3 text-center border-gray-200">Created by</th>
                                            <th className="p-3 text-center border-gray-200">Room id</th>
                                            <th className="p-3 text-center border-gray-200">Description</th>
                                            <th className="p-3 text-center border-gray-200">Booking date</th>
                                            <th className="p-3 text-center border-gray-500">User</th>
                                            <th className="p-3 text-center border-gray-500">Room</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {booking.map(item => (
                                        <tr key={item.id}>
                                        <td className="p-3 text-center border-gray-500">{item.id}</td>
                                        <td className="p-3 text-center border-gray-500">{item.created_by}</td>
                                        <td className="p-3 text-center border-gray-500">{item.room_id}</td>
                                        <td className="p-3 text-center border-gray-500">{item.description}</td>
                                        <td className="p-3 text-center border-gray-500">
                                            {new Date(item.booking_date).toLocaleString()}
                                        </td>
                                        <td className="p-3 text-center border-gray-500">{item.user}</td>
                                        <td className="p-3 text-center border-gray-500">{item.room}</td>
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