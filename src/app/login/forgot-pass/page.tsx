"use client"

import Link from "next/link"
import { useState } from "react"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/auth/forgot-pass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setError(data?.error ?? "Something went wrong. Please try again.")
                return
            }

            setSubmitted(true)
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="flex flex-col w-full max-w-md">
                <Link
                    href="/login"
                    className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#B80050] transition"
                >
                    ← Back to login
                </Link>

                <div className="rounded-xl bg-white p-10 shadow-2xl border">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Reset Password</h1>
                    <p className="text-sm text-slate-500 text-center mb-8">
                        Enter your email and we'll send you a reset link.
                    </p>

                    {submitted ? (
                        <p className="text-center text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md px-4 py-3">
                            If an account exists for that email, you'll receive a reset link shortly.
                        </p>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-md bg-[#B80050] py-3 text-white font-semibold hover:bg-pink-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}