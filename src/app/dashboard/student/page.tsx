"use client"
import Navbar from "@/components/Navbar"

export default function StudentDashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar showLogout={true} links={[
                { href: "/dashboard/student", label: "Home", primary: true },
                { href: "/dashboard/student/catalogue", label: "Catalogue" }
            ]} />

            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="p-10 bg-white rounded-xl shadow-lg text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        STUDENT DASHBOARD
                    </h1>
                    <p className="text-gray-600">
                        Authentication successful.
                    </p>
                </div>
            </main>
        </div>
    )
}