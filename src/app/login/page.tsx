"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Login() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)


    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            //connect to login backend
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setError(data?.error ?? "Login failed")
                setLoading(false)
                return
            }

            //fetch user information
            const meRes = await fetch("/api/auth/me", {
                method: "GET",
                cache: "no-store",
            })

            if (!meRes.ok) {
                setError("Authentication validation failed")
                setLoading(false)
                return
            }

            const me = await meRes.json()

            //based on role, redirect to dashboard
            switch (me.role) {
                case "ADMIN":
                    router.push("/dashboard/admin")
                    break
                case "STAFF":
                    router.push("/dashboard/staff")
                    break
                case "TECHNICIAN":
                    router.push("/dashboard/technician")
                    break
                case "STUDENT":
                    router.push("/dashboard/student")
                    break
                default:
                    setError("Invalid role assigned to account")
                    setLoading(false)
                    return
            }

            router.refresh()
        } catch {
            setError("Network error. Please try again.")
            setLoading(false)
        }
    }


    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="flex flex-col w-full max-w-md">
                <Link
                    href="/"
                    className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#B80050] transition"
                >
                    <span>←</span> Back to home
                </Link>

                <div className="rounded-xl bg-white p-10 shadow-2xl border">
                    <h1 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                        Login to TORS
                    </h1>

                    {error && (
                        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                        <div className="flex flex-col">
                            <label htmlFor="email" className="mb-2 text-sm font-semibold text-slate-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                                className="rounded-md border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#B80050] focus:border-[#B80050] transition"
                            />
                        </div>

                        <div className="flex flex-col relative">
                            <label htmlFor="password" className="mb-2 text-sm font-semibold text-slate-700">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="w-full rounded-md border px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#B80050] focus:border-[#B80050] transition"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-[#B80050] transition"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 rounded-md bg-[#B80050] py-3 text-white font-semibold hover:bg-pink-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>
                    <div className="flex flex-col pt-3">
                        <a href="/login/request-pass-setup" className="underline text-blue-600 hover:text-purple-700">Request password setup</a>
                        <a href="/login/forgot-pass" className="underline text-blue-600 hover:text-purple-700">Forgot  Password</a>
                    </div>
                </div>
            </div>
        </main>
    )
}