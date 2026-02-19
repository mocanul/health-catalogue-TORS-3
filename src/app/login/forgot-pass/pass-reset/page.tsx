"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react"

export default function FirstLogin() {

    //gets token therefore getting the router to the first-login page
    const searchParams = useSearchParams();

    //next router for navigation
    const router = useRouter();

    //one time token from email link
    //used for the URL to the first-login page
    const token = searchParams.get("token");

    //input states for password
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)

    //UI states
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    //submit handler
    //calls first-login API 
    //handles states
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        //clear errors
        setError(null);

        //if token is missing throw error
        if (!token) {
            setError("Invalid or missing token. Please use the link from your email.");
            return;
        }

        //check if passwords match, if not throw error
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        //submitting state
        setSubmitting(true);

        //send token and password to API
        try {
            const res = await fetch("/api/auth/first-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const payload = await res.json().catch(() => null);

            //show error message to user
            if (!res.ok) {
                const msg = payload?.error || payload?.message || "Failed to set password. The link may be expired.";
                throw new Error(msg);
            }

            setDone(true);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err?.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <div className="flex min-h-screen flex-col">
            <nav className="flex items-center justify-between border-b bg-[#B80050]">
                {/*eslint-disable-next-line @next/next/no-img-element*/}
                <img alt="Sheffield Hallam: Knowledge Applied" className="w-30 md:w-35 lg:w-40" src="/SHU_logo_bnw.png" />
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="w-75 md:w-100 lg:w-125 rounded-xl bg-white p-12 shadow-2xl border flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                        Set your Password
                    </h1>

                    {!token && (
                        <div className="mb-4 w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            Invalid link (missing token). Please use the password setup link
                            from your email.
                        </div>
                    )}

                    {done ? (
                        <div className="w-full rounded-md border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-800">
                            Password set successfully. You can now{" "}
                            <button type="button" onClick={() => router.push("/login")} className="font-semibold underline underline-offset-2">
                                log in
                            </button>
                            .
                        </div>
                    ) : (
                        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
                            <div className="flex flex-col">
                                <label htmlFor="password" className="mb-2 text-sm font-semibold text-slate-700">
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
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

                                {password.length > 0 && password.length < 8 && (
                                    <p className="mt-1 text-xs text-red-600">
                                        Password must be at least 8 characters.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="confirmPassword" className="mb-2 text-sm font-semibold text-slate-700">
                                    Confirm Password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="w-full rounded-md border px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#B80050] focus:border-[#B80050] transition"
                                />

                                {confirmPassword.length > 0 && password !== confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600">
                                        Passwords do not match.
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="mt-2 rounded-md bg-[#B80050] px-3 py-3 text-white font-semibold hover:bg-pink-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Confirming..." : "Confirm"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}