"use client";

import Navbar from "@/components/Navbar";
import Timetable from "@/components/modals/timetable";

export default function TimetablePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                showLogout={true}
                links={[
                    { href: "/dashboard/student", label: "Home" },
                    { href: "/dashboard/student/catalogue", label: "Catalogue" },
                    { href: "/dashboard/student/timetable", label: "Timetable", primary: true },
                ]}
            />

            <main className="min-h-screen bg-gray-100 p-6">
                <Timetable />
            </main>
        </div>
    );
}
