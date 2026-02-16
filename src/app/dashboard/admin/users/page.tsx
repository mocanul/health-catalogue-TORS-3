"use client"
import Image from "next/image"
import LogoutButton from "@/components/logoutButton"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type User = {
    id: string;
    email: string;
    role: string;
}

function UsersFetcher() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch("/api/users");

                if (!res.ok) {
                    throw new Error("Failed to fetch users");
                }

                const data: User[] = await res.json();
                setUsers(data);

                console.log(data); // optional
            } catch (error) {
                console.error(error);
            }
        }

        fetchUsers();
    }, []); //empty dependency array = run once on mount

    return null; //no UI rendered
}



export default function AdminUsersPage() {
    const router = useRouter()

    async function viewActivity() {

        router.push("/dashboard/admin")
        router.refresh()
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

            <div className="flex items-center align-top h-full">
                <table className="w-full border-2 ">
                    <tr className="border">
                        <th className="p-3 text-center">ID</th>
                        <th className="p-3 text-center">First Name</th>
                        <th className="p-3 text-center">Last name</th>
                        <th className="p-3 text-center">Email</th>
                        <th className="p-3 text-center">Role</th>
                        <th className="p-3 text-center">Action</th>
                    </tr>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="p-3 text-center"> {user.id}</td>
                                <td className="p-3 text-center"> FName</td>
                                <td className="p-3 text-center"> LName</td>
                                <td className="p-3 text-center"> student@email.com</td>
                                <td className="p-3 text-center"> Role</td>
                                <td className="p-3 text-center">
                                    <button className="bg-[#B80050] px-5 text-white">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}