import Navbar from "@/components/Navbar"
import Bookings from "@/components/bookingTable"

export default async function StudentDashboard() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar showLogout={true} links={[
                {href: "/dashboard/student", label: "Home"},
                {href: "/dashboard/student/bookings", label: "Bookings", primary: true},
                {href: "/dashboard/student/catalogue", label: "Catalogue"}
            ]} />
            <Bookings/>
        </div>
    )
}