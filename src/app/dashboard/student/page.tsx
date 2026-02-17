"use client"
import LogoutButton from "@/components/logoutButton"
import Link from "next/link"

export default function StudentDashboard() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-10 bg-white rounded-xl shadow-lg text-center">
                <LogoutButton/>
                <h1 className="text-3xl font-bold mb-4">
                    STUDENT DASHBOARD
                </h1>

                <Link href="/dashboard/student/firstLogin">
                    first Login
                </Link>

                <Link href="/dashboard/student/catalogue">
                    Catalogue
                </Link>

                <p className="text-gray-600">
                    Authentication successful.
                </p>
            </div>
        </main>
    )
}