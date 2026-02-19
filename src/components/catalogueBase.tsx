import { prisma } from "@/lib/prisma";

export default async function Catalogue() {
  const equipment = await prisma.equipment.findMany();

    return (
        <main>
            <div className="flex justify-center mt-10">
                <div className="w-full max-w-6xl rounded-lg shadow-md flex flex-col overflow-hidden">
                    <div className="bg-pink-100 px-3 sm:px-4 py-3 border-b">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-base sm:text-lg">
                                Equipment Catalogue
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
                                            <th className="p-3 text-center border-gray-500">Item Name</th>
                                            <th className="p-3 text-center border-gray-200">Description</th>
                                            <th className="p-3 text-center border-gray-200">Category</th>
                                            <th className="p-3 text-center border-gray-200">Quantity Available</th>
                                            <th className="p-3 text-center border-gray-200">Add to Order</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {equipment.map(item => (
                                        <tr key={item.id}>
                                        <td className="p-3 text-center border-gray-500">{item.name}</td>
                                        <td className="p-3 text-center border-gray-500">{item.description}</td>
                                        <td className="p-3 text-center border-gray-500">{item.category}</td>
                                        <td className="p-3 text-center border-gray-500">{item.quantity_available}</td>
                                        <td className="p-3 text-center border-gray-500"><button className="bg-[#B80050] px-5 py-1 text-white rounded font-medium text-sm">
                                                Add to Cart
                                            </button>
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