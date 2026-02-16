"use client";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function AddUser({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="relative z-10 w-105 h-70 bg-white rounded-xl shadow-lg border flex flex-col">

                <div className="px-5 py-4 border-b bg-pink-50 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Add New User</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-3">

                        <div>
                            <label className="block text-xs font-medium mb-1">First Name</label>
                            <input className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400" />
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">Last Name</label>
                            <input className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400" />
                        </div>

                        <div className="col-span-2 grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Email</label>
                                <input type="email" className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1">Role</label>
                                <select className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-2 focus:ring-pink-400 bg-white">
                                    <option value="donor">Student</option>
                                    <option value="charity">Staff</option>
                                    <option value="admin">Technician</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="px-3 py-1.5 text-sm border rounded-md">
                            Cancel
                        </button>
                        <button className="px-3 py-1.5 text-sm bg-[#B80050] text-white rounded-md hover:bg-pink-900 transition">
                            Create
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
