import Navbar from "@/components/Navbar"
import Bookings from "@/components/bookingTable"

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar showLogout={true} links={[
        { href: "/dashboard/staff", label: "Home" },
        { href: "/dashboard/staff/bookings", label: "Bookings", primary: true },
        { href: "/dashboard/staff/catalogue", label: "Catalogue" }
      ]} />

      <Bookings />

    </div>
  )
}