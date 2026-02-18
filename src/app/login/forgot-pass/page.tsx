export default function ForgotPass() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="rounded-xl bg-white p-10 shadow-2xl border">
                <form>
                    <h1 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                        Forgot Password
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
                            className="rounded-md border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#B80050] focus:border-[#B80050] transition"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}