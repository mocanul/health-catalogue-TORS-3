"use client";

import Head from "next/head";
import Link from "next/link";
import { useState } from "react"

export default function FirstLogin() {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log(password);
  };
  return (
    <div>
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </Head>
        
        <div className="flex min-h-screen flex-col">
            <nav className="flex items-center justify-between border-b bg-[#B80050]">
                <img alt="Sheffield Hallam: Knowledge Applied" className="w-30 md:w-35 lg:w-40" src="/SHU_logo_bnw.png"/>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4">

                <div className="w-75 md:w-100 lg:w-125 rounded-xl bg-white p-12 shadow-2xl border flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                        Set your Password
                    </h1>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-[#B80050] transition">
                                {showPassword ? "Hide" : "Show"}
                            </button>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="confirmPassword" className="mb-2 text-sm font-semibold text-slate-700">
                                Confirm Password
                            </label>

                            <input
                                id="confirmPassword"
                                type={"password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="confirm-password"
                                required
                                className="w-full rounded-md border px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#B80050] focus:border-[#B80050] transition"
                            />
                        </div>

                        <button
                                type="submit"
                                className="mt-2 rounded-md bg-[#B80050] px-3 py-3 text-white font-semibold hover:bg-pink-900 transition disabled:opacity-60 disabled:cursor-not-allowed">
                            Confirm    
                        </button>
                    </form>
                </div>
            </main>
        </div>
    </div>
  ) 
}