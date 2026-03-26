import Navbar from "@/components/Navbar"
import Bookings from "@/components/bookingTable"

export default function Home() {

  return (
      <div className="flex min-h-screen flex-col">
        <Navbar showLogout={true} links={[
            {href: "/dashboard/admin", label: "Home"},
            {href: "/dashboard/admin/bookings", label: "Bookings", primary: true},
            {href: "/dashboard/admin/catalogue", label: "Order Catalogue"},
            {href: "/dashboard/admin/editCatalogue", label: "Edit Catalogue"},
            {href: "/dashboard/admin/users", label: "Users"}
        ]}/>

        <Bookings/>

      </div>
  )
}