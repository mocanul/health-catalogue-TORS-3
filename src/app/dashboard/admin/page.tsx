"use client"
import LogoutButton from "@/components/logoutButton"
import Image from "next/image"
import { useRouter } from "next/navigation"


export default function AdminDashboard() {

    const router = useRouter();

    function handleUsers() {

        router.push("admin/users")
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
                    <button className="rounded-md px-6 py-3 text-xl font-bold text-white bg-pink-900 transition">
                        Activity
                    </button>

                    <button className="rounded-md px-6 py-3 text-xl font-bold text-white hover:bg-pink-900 transition"
                        onClick={handleUsers}>
                        Users
                    </button>

                    <LogoutButton />
                </div>
            </nav>
            <div className="flex border-2 h-full">

                <div className="flex flex-row h-full border-2 w-full border-amber-400">
                    <div className="w-full border-2 border-red-500">

                    </div>
                    <div className="w-full border-2 border-blue-400">

                    </div>
                </div>
            </div>
            <div className="h-full border-2 border-green-400">

            </div>
        </div>
    )
}
