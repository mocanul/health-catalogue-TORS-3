import Image from "next/image";
import Link from "next/link";


export default function Home() {

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between border-b bg-[#B80050]">
        <Image
          src="/SHU_logo_bnw.png"
          alt="SHU logo"
          width={330}
          height={330}
          className="w-60 h-auto"
        />

        <div className="flex items-end h-full pr-6 pb-1">
          <button className="rounded-md px-6 py-3 text-xl font-bold text-white hover:bg-pink-900 transition">
            My Hallam
          </button>

          <button className="rounded-md px-6 py-3 text-xl font-bold text-white hover:bg-pink-900 transition">
            About
          </button>

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
            Landing page content
          </h1>

          <span className="text-lg text-[#B80050] font-medium">
            Coming soon
          </span>
        </div>
      </main>
    </div>
  )
}
