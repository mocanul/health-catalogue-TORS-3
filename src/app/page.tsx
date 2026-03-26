import Navbar from "@/components/Navbar"
import Image from "next/image"

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar links={[
        { href: "https://www.shu.ac.uk/myhallam", label: "My Hallam"},
        { href: "https://www.shu.ac.uk/myhallam/support-at-hallam/tors", label: "About"},
        { href: "/login", label: "Login", primary: true}
      ]}/>

      <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4">
        <Image
          src="/TORS_logo.png"
          width={300}
          height={300}
          alt="T.O.R.S"
          className="w-50 md:w-55 lg:w-60 py-6"
        />
        
        <div className="w-75 md:w-100 lg:w-125 rounded-xl bg-white p-12 shadow-2xl border flex flex-col items-center justify-center text-center">
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-slate-800 mb-4">
            Technical Operations Resources & Services
          </h1>

          <p className="text-sm md:text-base lg:text-lg text-[#B80050] font-medium">
            The T.O.R.S booking page provides Sheffield Hallam healthcare and staff with a simple way to book clinical teaching spaces, simulation rooms, and specialist equipment.
          </p><br></br>
          <p className="text-sm md:text-base lg:text-lg text-[#B80050] font-medium">
            Log in to check availability of rooms and equipment, manage bookings, and prepare for practical sessions.
          </p>
        </div>
      </main>
    </div>
  )
}