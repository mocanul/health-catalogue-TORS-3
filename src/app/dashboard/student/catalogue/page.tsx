import Navbar from "@/components/Navbar"
import Catalogue from "@/components/catalogueBase"

export default function Home() {

<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  return (
      <div className="flex min-h-screen flex-col">
        <Navbar showLogout={true} links={[
          {href: "/dashboard/student", label: "Home"},
          {href: "/dashboard/student/catalogue", label: "Catalogue", primary: true}
        ]}/>

          <Catalogue/>
      </div>
  )
}