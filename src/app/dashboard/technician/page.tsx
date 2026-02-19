"use client"
import LogoutButton from "@/components/logoutButton"
import Link from "next/link"

export default function TechnicianDashboard() {
    return (
        <div>
            <Link
                href="/dashboard/technician/catalogue"
                className="rounded-md px-2 md:px-6 lg:px-6 py-3 font-bold text-white hover:bg-pink-900 transition">
                Ordering Catalogue
            </Link>

            <Link
                href="/dashboard/technician/editCatalogue"
                className="rounded-md px-2 md:px-6 lg:px-6 py-3 font-bold text-white hover:bg-pink-900 transition">
                Editing Catalogue
            </Link>

            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="p-10 bg-white rounded-xl shadow-lg text-center">
                    <LogoutButton />

                    <Link href="/dashboard/student/catalogue">
                        Catalogue
                    </Link>

                    <h1 className="text-3xl font-bold mb-4">
                        TECHNICIAN DASHBOARD
                    </h1>
                    <p className="text-gray-600">
                        Authentication successful.
                    </p>
                </div>
            </main>
        </div>
    )
}