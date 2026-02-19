"use client"
import { useRouter } from "next/navigation"

//end session for user and take back to landing page
export default function LogoutButton() {
    const router = useRouter()

    async function handleLogout() {
        await fetch("/api/auth/logout", {
            method: "POST",
        })

        router.push("/")
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="rounded-md px-6 py-3 ml-10 text-xl font-bold text-white bg-pink-950 hover:bg-pink-900 transition">
            Logout
        </button>
    )
}