import Link from "next/link";

export default function Login() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">

            <div className="flex flex-col w-full max-w-md">

                <Link href="/" className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#B80050] transition">
                    <span>←</span> Back to home
                </Link>

                <div className="rounded-xl bg-white p-10 shadow-2xl border">

                    <h1 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                        Login to TORS
                    </h1>

                    <form className="flex flex-col gap-6">

                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-semibold text-slate-700">
                                Email
                            </label>
                            <input
                                type="email"
                                className="rounded-md border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#B80050] focus:border-[#B80050] transition"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-semibold text-slate-700">
                                Password
                            </label>
                            <input
                                type="password"
                                className="rounded-md border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#B80050] focus:border-[#B80050] transition"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-2 rounded-md bg-[#B80050] py-3 text-white font-semibold hover:bg-pink-900 transition"
                        >
                            Log In
                        </button>

                    </form>

                </div>
            </div>
        </main>
    )
}