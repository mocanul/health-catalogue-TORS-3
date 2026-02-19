import Navbar from "@/components/Navbar"
import Catalogue from "@/components/catalogueBase"

export default function Home() {

<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  return (
      <div className="flex min-h-screen flex-col">
        <Navbar showLogout={true} links={[
          {href: "/dashboard/admin", label: "Activity"},
          {href: "/dashboard/admin/catalogue", label: "Order Catalogue", primary: true},
          {href: "/dashboard/admin/editCatalogue", label: "Edit Catalogue"},
          {href: "/dashboard/admin/users", label: "Users"}
        ]}/>

        <Catalogue/>
      
      </div>
  )
}