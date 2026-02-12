import Image from "next/image";
import Link from "next/link";


export default function Home() {

  return (
    <body className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between border-b bg-[#B80050]">
        <Image
          src="/SHU_logo_bnw.png"
          alt="SHU logo"
          width={330}
          height={330}
          className="w-60 h-auto"
        />

        <div className="flex items-end h-full pr-6 pb-1">
          <Link 
            href="https://www.shu.ac.uk/myhallam"
            className="rounded-md px-6 py-3 text-xl font-bold text-white hover:bg-pink-900 transition">
            My Hallam
          </Link>

          <Link
            href="https://www.shu.ac.uk/myhallam/support-at-hallam/tors"
            className="rounded-md px-6 py-3 text-xl font-bold text-white hover:bg-pink-900 transition">
            About
          </Link>

          <Link
            href="/login"
            className="rounded-md px-6 py-3 ml-10 text-xl font-bold text-white bg-pink-950 hover:bg-pink-900 transition"
          >
            Login
          </Link>
        </div>
      </nav>

      <main className="flex flex-col h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
        <Image
          src="/TORS_logo.png"
          alt="TORS logo"
          height={330}
          width={330}
          className="w-60 h-auto"
        />

        <div className="w-125 rounded-xl bg-white p-12 shadow-2xl border flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-semibold text-slate-800 mb-4">
            Technical Operations Resources & Services
          </h1>

          <p className="text-lg text-[#B80050] font-medium">
            The T.O.R.S booking page provides Sheffield Hallam healthcare students and staff with a simple way to book clinical teaching spaces, simulation rooms, and specialist equipment.
          </p><br></br>
          <p className="text-lg text-[#B80050] font-medium">
            Log in to check availability of rooms and equipment, manage bookings, and prepare for practical sessions.
          </p>
        </div>
      </main>
    </body>
  )
}