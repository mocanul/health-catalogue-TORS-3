"use client"
import Navbar from "@/components/Navbar"

export default function TechnicianDashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar showLogout={true} links={[
                {href: "/dashboard/technician", label: "Home", primary: true},
                {href: "/dashboard/student/catalogue", label: "Order Catalogue"},
                {href: "/dashboard/student/editCatalogue", label: "Edit Catalogue"}
            ]}/>

            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="p-10 bg-white rounded-xl shadow-lg text-center">
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