"use client"

import { useState, KeyboardEvent } from "react"

export default function AskForEmail() {

    //email variable
    const [email, setEmail] = useState<string>("");

    //when user presses enter, store input into email value and send to API
    async function getEmail(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            const value = e.currentTarget.value;
            setEmail(value);

            try {
                const response = await fetch("/api/auth/first-login/request-pass", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: value })
                });

                const data = await response.json();
                if (response.ok) {
                    console.log("User ID:", data.userId);
                } else {
                    console.error("Error:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 px-4">
            {email && (
                <p className="mb-4 font-bold text-green-600"> If account exists, you will receive an email with password setup link shortly.</p>
            )}
            <div className="rounded-xl bg-white p-10 shadow-2xl border">
                <form>
                    <h1 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                        Password Setup
                    </h1>
                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-2 text-sm font-semibold text-slate-700">
                            Enter email:
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            onKeyDown={getEmail}
                            className="rounded-md border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#B80050] focus:border-[#B80050] transition"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}