import Navbar from "@/components/Navbar"
import Bookings from "@/components/bookingTable"

export default function Home() {

  return (
      <div className="flex min-h-screen flex-col">
        <Navbar showLogout={true} links={[
          {href: "/dashboard/technician", label: "Home"},
          {href: "/dashboard/technician/bookings", label: "Bookings", primary: true},
          {href: "/dashboard/technician/catalogue", label: "Order Catalogue"},
          {href: "/dashboard/technician/editCatalogue", label: "Edit Catalogue"}
        ]}/>

        <Bookings/>

      </div>
  )
}