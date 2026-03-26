import Navbar from "@/components/Navbar";
import Catalogue from "@/components/catalogueBase";

export default async function Home() {  // <-- add async here

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar showLogout={true} links={[
        { href: "/dashboard/student", label: "Home" },
        { href: "/dashboard/student/bookings", label: "Bookings" },
        { href: "/dashboard/student/catalogue", label: "Catalogue", primary: true }
      ]} />

      <Catalogue />
    </div>
  )
}