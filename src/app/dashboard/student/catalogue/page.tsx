import Navbar from "@/components/Navbar";
import Catalogue from "@/components/catalogueBase";
import Booking from "@/components/booking"

export default async function Home() {




  return (
    <div className="flex min-h-screen flex-col">
      <Navbar showLogout={true} links={[
        { href: "/dashboard/student", label: "Home" },
        { href: "/dashboard/student/catalogue", label: "Catalogue", primary: true }
      ]} />

      <div className="flex flex-row flex-1">
        <Catalogue />
        <Booking />
      </div>
    </div>
  );
}