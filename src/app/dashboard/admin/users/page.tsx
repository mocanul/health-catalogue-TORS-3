"use client"
import Image from "next/image"
import LogoutButton from "@/components/logoutButton"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Search } from "lucide-react";
import AddUser from "@/components/modals/newUserModal"
import EditUserModal from "@/components/modals/editUserModal"

type User = {
    id: string;
    first_name: string,
    last_name: string,
    email: string;
    role: string;
}


export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch("/api/admin/users");

                if (!res.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data: User[] = await res.json();
                setUsers(data);

                console.log(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchUsers();
    }, []);//empty dependency array = run once

    async function viewActivity() {

        router.push("/dashboard/admin")
        router.refresh()
    }

    function openEdit(user: User) {
        setSelectedUser(user);
        setIsEditOpen(true);
    }

    return (
        <div className="flex h-full flex-col">
            <nav className="flex items-center justify-between border-b bg-[#B80050]">
                <Image
                    src="/SHU_logo_bnw.png"
                    alt="SHU logo"
                    width={330}
                    height={330}
                    className="w-60 h-auto"
                />

                <div className="flex items-end h-full gap-5 pr-6 pb-1">
                    <button className="rounded-md px-6 py-3 text-xl font-bold text-white hover:bg-pink-900 transition"
                        onClick={viewActivity}>
                        Activity
                    </button>

                    <button className="rounded-md px-6 py-3 text-xl font-bold text-white bg-pink-900 transition">
                        Users
                    </button>

                    <LogoutButton />
                </div>
            </nav>

            <div className="flex justify-center mt-10">
                <div className="w-full max-w-6xl rounded-lg shadow-md flex flex-col overflow-hidden">



                    <div className="bg-pink-100 px-3 sm:px-4 py-3 border-b">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-base sm:text-lg">
                                User Accounts
                            </h3>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="bg-[#B80050] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-900 transition">
                                Add User +
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                                />
                            </div>

                            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white cursor-pointer">
                                <option value="all">All Roles</option>
                                <option value="donor">Students</option>
                                <option value="charity">Staff</option>
                                <option value="admin">Technicians</option>
                            </select>
                        </div>
                    </div>

                    {/* table wrapper controls width + scroll */}
                    <div className="w-full overflow-x-auto">
                        <div className="max-h-130 overflow-y-auto">
                            <table className="w-full border">
                                <thead className="sticky top-0 bg-pink-50">
                                    <tr className="border-b pb-3">
                                        <th className="p-3 text-center border-gray-500">ID</th>
                                        <th className="p-3 text-center border-gray-200">Full name</th>
                                        <th className="p-3 text-center border-gray-200">Email</th>
                                        <th className="p-3 text-center border-gray-200">Role</th>
                                        <th className="p-3 text-center border-gray-200">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b">
                                            <td className="p-3 text-center ">{user.id}</td>
                                            <td className="p-3 text-center ">{user.first_name} {user.last_name}</td>
                                            <td className="p-3 text-center border-gray-500">{user.email}</td>
                                            <td className="p-3 text-center border-gray-500">{user.role}</td>
                                            <td className="p-3 text-center border-gray-500">
                                                <button className="bg-[#B80050] px-5 py-1 text-white rounded font-medium text-sm"
                                                    onClick={() => openEdit(user)}>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {users.length === 0 && (
                                        <tr>
                                            <td className="p-3 text-center" colSpan={6}>
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AddUser
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <EditUserModal
                open={isEditOpen}
                user={selectedUser}
                onClose={() => setIsEditOpen(false)}
                onSaved={(updated) => {
                    //update table without refetch
                    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
                }}
            />
        </div>
    )
}