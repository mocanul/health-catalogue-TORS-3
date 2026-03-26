"use client";

import Navbar from "@/components/Navbar";

const documentSections = [
    {
        title: "COSHH Data Sheet",
        description:
            "Use this sheet to review COSHH information before completing setup or strip down tasks.",
        documents: [
            {
                name: "Baseline Massage Milk COSHH",
                viewHref: "/student-forms/torsshhncs26-coshh-ra-baseline-massage-milk.pdf",
                downloadHref: "/student-forms/torsshhncs26-coshh-ra-baseline-massage-milk.docx",
            },
        ],
        accentClass: "border-blue-200 bg-blue-50",
    },
    {
        title: "Important Forms",
        description:
            "Quick access to the main setup, cleaning, and equipment handling documents for junior technicians.",
        documents: [
            {
                name: "Setup Guide",
                viewHref: "/staff-documents/setup-guide.pdf",
                downloadHref: "/staff-documents/setup-guide.pdf",
            },
            {
                name: "Cleaning Procedures",
                viewHref: "/staff-documents/cleaning-procedures.pdf",
                downloadHref: "/staff-documents/cleaning-procedures.pdf",
            },
            {
                name: "Equipment Handling",
                viewHref: "/staff-documents/equipment-handling.pdf",
                downloadHref: "/staff-documents/equipment-handling.pdf",
            },
        ],
        accentClass: "border-pink-200 bg-pink-50",
    },
];

function handlePrint(filePath: string) {
    const printWindow = window.open(filePath, "_blank", "noopener,noreferrer");

    if (!printWindow) {
        return;
    }

    // Printing is triggered after the PDF opens in a new tab.
    printWindow.addEventListener("load", () => {
        printWindow.print();
    });
}

export default function StaffDashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                showLogout={true}
                links={[
                    {href: "/dashboard/staff", label: "Home", primary: true},
                    {href: "/dashboard/bookings/staff", label: "Bookings"}
                ]}
            />

            <main className="min-h-screen bg-gray-100 px-6 py-10">
                <section className="mx-auto flex max-w-7xl flex-col gap-8">
                    <div className="rounded-2xl bg-white p-8 shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Staff Dashboard
                        </h1>
                        <p className="mt-3 max-w-3xl text-gray-600">
                            Review assigned setup and strip down work, then use the linked guidance documents when preparing rooms and equipment.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <section className="rounded-2xl bg-white p-6 shadow-lg lg:col-span-2">
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Task Checklist
                                </h2>
                                <p className="mt-2 text-gray-600">
                                    Today&apos;s assigned room setups and strip downs will appear here in order.
                                </p>
                            </div>

                            <div className="mt-6 min-h-115 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50" />
                        </section>

                        <div className="flex flex-col gap-6">
                            {documentSections.map((section) => (
                                <section
                                    key={section.title}
                                    className={`rounded-2xl border p-6 shadow-lg ${section.accentClass}`}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {section.title}
                                    </h2>
                                    <p className="mt-2 text-gray-700">
                                        {section.description}
                                    </p>

                                    <div className="mt-6 space-y-5">
                                        {section.documents.map((document) => (
                                            <article
                                                key={document.name}
                                                className="rounded-xl bg-white p-4 shadow-sm"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {document.name}
                                                </h3>

                                                <div className="mt-4 flex flex-wrap gap-3">
                                                    <a
                                                        href={document.viewHref}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex rounded-md bg-pink-950 px-4 py-2 font-semibold text-white transition hover:bg-pink-900"
                                                    >
                                                        View
                                                    </a>

                                                    <button
                                                        type="button"
                                                        onClick={() => handlePrint(document.viewHref)}
                                                        className="inline-flex rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                                                    >
                                                        Print
                                                    </button>

                                                    <a
                                                        href={document.downloadHref}
                                                        download
                                                        className="inline-flex rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
