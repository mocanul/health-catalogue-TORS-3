import Navbar from "@/components/Navbar";
import DocumentResourcePanel from "@/components/documentResourcePanel";

const studentSafetyResources = [
    {
        title: "Safety and Health Risk Assessment Form",
        viewHref: "/student-forms/standard-activity-risk-assessment-template.pdf",
        downloadHref: "/student-forms/standard-activity-risk-assessment-template.pdf",
    },
];

const coshhResources = [
    {
        title: "COSHH Data Sheet",
        viewHref: "/staff-documents/torsshhncs26-coshh-ra-baseline-massage-milk.pdf",
        downloadHref: "/staff-documents/torsshhncs26-coshh-ra-baseline-massage-milk.pdf",
    },
];

export default function StudentDashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                showLogout={true}
                links={[
                    { href: "/dashboard/student", label: "Home", primary: true },
                    { href: "/dashboard/student/bookings", label: "Bookings" },
                    { href: "/dashboard/student/catalogue", label: "Catalogue" },
                ]}
            />

            <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(184,0,80,0.12),transparent_28%),linear-gradient(180deg,#fdf7fa_0%,#f3f4f6_45%,#eef1f4_100%)] px-6 py-10">
                <section className="mx-auto flex max-w-6xl flex-col gap-8">
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                        <span className="inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-900">
                            Student view
                        </span>
                        <h1 className="mt-4 text-3xl font-bold text-gray-900">
                            Student Dashboard
                        </h1>
                        <p className="mt-3 max-w-3xl text-gray-600">
                            Use the bookings tab to check the latest technician decision on your submitted requests, or open the catalogue to prepare a new booking.
                        </p>
                    </div>

                    <section className="grid gap-6 xl:grid-cols-2">
                        <DocumentResourcePanel
                            title="Safety and Health Risk"
                            description="Open the student risk assessment form before submitting a booking that needs supporting safety documentation."
                            items={studentSafetyResources}
                        />

                        <DocumentResourcePanel
                            title="COSHH Data Sheet"
                            description="Keep the COSHH reference close when your booking depends on specialist products, substances, or handling guidance."
                            items={coshhResources}
                        />
                    </section>
                </section>
            </main>
        </div>
    );
}
