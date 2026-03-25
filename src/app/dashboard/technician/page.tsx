"use client";

import Navbar from "@/components/Navbar";

export default function TechnicianDashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                showLogout={true}
                links={[
                    { href: "/dashboard/technician", label: "Home", primary: true },
                    { href: "/dashboard/technician/catalogue", label: "Order Catalogue" },
                    { href: "/dashboard/technician/editCatalogue", label: "Edit Catalogue" },
                ]}
            />

            <main className="min-h-screen bg-gray-100 px-6 py-10">
                <section className="mx-auto flex max-w-7xl flex-col gap-8">
                    <div className="rounded-2xl bg-white p-8 shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Technician Dashboard
                        </h1>
                        <p className="mt-3 max-w-2xl text-gray-600">
                            Review pending booking confirmations and keep track of technician tasks from one place.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <section className="rounded-2xl bg-white p-6 shadow-lg lg:col-span-2">
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Booking Confirmation List
                                </h2>
                                <p className="mt-2 text-gray-600">
                                    Pending bookings for technician approval will appear here.
                                </p>
                            </div>

                            {/* Leave this body empty for now so the approval list can be added later. */}
                            <div className="mt-6 min-h-[420px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50" />
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-lg">
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Technician Tasks
                                </h2>
                                <p className="mt-2 text-gray-600">
                                    Assigned setup and strip down tasks will appear here for technicians to review and tick off.
                                </p>
                            </div>

                            {/* This panel stays ready for the future task checklist. */}
                            <div className="mt-6 min-h-[420px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50" />
                        </section>
                    </div>
                </section>
            </main>
        </div>
    );
}
