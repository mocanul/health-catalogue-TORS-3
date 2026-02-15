"use client"
import LogoutButton from "@/components/logoutButton"

export default function AdminDashboard() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-10 bg-white rounded-xl shadow-lg text-center">
                <LogoutButton />
                <h1 className="text-3xl font-bold mb-4">
                    ADMIN DASHBOARD
                </h1>
                <p className="text-gray-600">
                    Authentication successful.
                </p>
            </div>
        </main>
    )
}
