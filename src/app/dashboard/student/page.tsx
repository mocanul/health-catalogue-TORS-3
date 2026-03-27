"use client";
export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";

const studentResources = [
    {
        title: "Safety and Risk Assessment Form",
        description:
            "This form must be completed before a student can create a booking.",
        viewHref: "/student-forms/standard-activity-risk-assessment-template.pdf",
        downloadHref: "/student-forms/standard-activity-risk-assessment-template.docx",
        viewLabel: "View form",
        downloadLabel: "Download form",
        accentClass: "border-pink-200 bg-pink-50",
    },
    {
        title: "COSHH Data Sheet",
        description:
            "Use this document to review the COSHH information available for student bookings.",
        viewHref: "/student-forms/torsshhncs26-coshh-ra-baseline-massage-milk.pdf",
        downloadHref: "/student-forms/torsshhncs26-coshh-ra-baseline-massage-milk.docx",
        viewLabel: "View COSHH sheet",
        downloadLabel: "Download COSHH sheet",
        accentClass: "border-blue-200 bg-blue-50",
    },
];

export default function StudentDashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar showLogout={true} links={[
                { href: "/dashboard/student", label: "Home", primary: true },
                { href: "/dashboard/student/bookings", label: "Bookings" },
                { href: "/dashboard/student/catalogue", label: "Catalogue" }
            ]} />

            <main className="min-h-screen bg-gray-100 px-6 py-10">
                <section className="mx-auto flex max-w-6xl flex-col gap-8">
                    <div className="rounded-2xl bg-white p-8 shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Student Dashboard
                        </h1>
                        <p className="mt-3 max-w-2xl text-gray-600">
                            Download the required booking documents below before
                            submitting your request.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {studentResources.map((resource) => (
                            <article
                                key={resource.title}
                                className={`rounded-2xl border p-6 shadow-sm ${resource.accentClass}`}
                            >
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {resource.title}
                                </h2>

                                <p className="mt-3 min-h-16 text-gray-700">
                                    {resource.description}
                                </p>

                                {/* View opens the PDF in a new tab, while download keeps the editable document file. */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <a
                                        href={resource.viewHref}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex rounded-md bg-pink-950 px-4 py-2 font-semibold text-white transition hover:bg-pink-900"
                                    >
                                        {resource.viewLabel}
                                    </a>

                                    <a
                                        href={resource.downloadHref}
                                        download
                                        className="inline-flex rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                                    >
                                        {resource.downloadLabel}
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

