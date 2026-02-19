import Navbar from "@/components/Navbar"
import Catalogue from "@/components/catalogueEditor"

export default function Home() {

<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  return (
      <div className="flex min-h-screen flex-col">
        <Navbar showLogout={true} links={[
          {href: "/dashboard/technician", label: "Home"},
          {href: "/dashboard/student/catalogue", label: "Order Catalogue"},
          {href: "/dashboard/student/editCatalogue", label: "Edit Catalogue", primary: true}
        ]}/>

        <Catalogue/>
      
      </div>
  )
}