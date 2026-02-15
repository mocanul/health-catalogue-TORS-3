// middleware.ts
import { NextRequest, NextResponse } from "next/server"

//proxy runs at runtime, before any code of any page is initiated
//blocking access before anything can happen
//using api/me route.ts, we read cookie

//protected roots by middleware
const protectedRoot = "/dashboard"
type role = "STUDENT" | "STAFF" | "TECHNICIAN" | "ADMIN"

const roleGates: Array<{ prefix: string; allowed: role[] }> = [
    { prefix: "/dashboard/admin", allowed: ["ADMIN"] },
    { prefix: "/dashboard/staff", allowed: ["STAFF"] },
    { prefix: "/dashboard/technician", allowed: ["TECHNICIAN"] },
    { prefix: "/dashboard/student", allowed: ["STUDENT"] },
]

function isProtectedPath(pathname: string) {
    return pathname === protectedRoot || pathname.startsWith(protectedRoot + "/")
}

function roleAllowed(pathname: string, role: role) {
    const gate = roleGates.find((g) => pathname === g.prefix || pathname.startsWith(g.prefix + "/"))
    if (!gate) return true
    return gate.allowed.includes(role)
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    //skip next internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/robots") ||
        pathname.startsWith("/sitemap")
    ) {
        return NextResponse.next()
    }

    const sessionToken = req.cookies.get("session")?.value

    //if no cookie, redirect to login
    if (isProtectedPath(pathname) && !sessionToken) {
        const url = req.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("next", pathname)
        return NextResponse.redirect(url)
    }

    //only validate if cookie exists
    //redirect user to designated dashboard
    const shouldValidate =
        Boolean(sessionToken) && (isProtectedPath(pathname) || pathname === "/login")

    if (!shouldValidate) return NextResponse.next()

    try {
        const meUrl = new URL("/api/auth/me", req.url)

        const res = await fetch(meUrl, {
            method: "GET",
            headers: { cookie: req.headers.get("cookie") ?? "" }, // forward cookies
            cache: "no-store",
        })

        //invalid session
        if (!res.ok) {
            if (isProtectedPath(pathname)) {
                const url = req.nextUrl.clone()
                url.pathname = "/login"
                url.searchParams.set("next", pathname)

                const redirectRes = NextResponse.redirect(url)
                redirectRes.cookies.set("session", "", { path: "/", maxAge: 0 })
                return redirectRes
            }
            return NextResponse.next()
        }

        const me = (await res.json()) as { role?: role }

        //if cookie already exists for user, automatically redirect to their designated dashboard
        if (pathname === "/login") {
            const url = req.nextUrl.clone()

            //role-based landing
            switch (me.role) {
                case "ADMIN":
                    url.pathname = "/dashboard/admin"
                    break
                case "STAFF":
                    url.pathname = "/dashboard/staff"
                    break
                case "TECHNICIAN":
                    url.pathname = "/dashboard/technician"
                    break
                default:
                    url.pathname = "/dashboard/student"
            }

            return NextResponse.redirect(url)
        }

        //role gate
        if (isProtectedPath(pathname) && me.role && !roleAllowed(pathname, me.role)) {
            const url = req.nextUrl.clone()
            //send users to their allowed dashboard
            switch (me.role) {
                case "ADMIN":
                    url.pathname = "/dashboard/admin"
                    break
                case "STAFF":
                    url.pathname = "/dashboard/staff"
                    break
                case "TECHNICIAN":
                    url.pathname = "/dashboard/technician"
                    break
                default:
                    url.pathname = "/dashboard/student"
            }
            return NextResponse.redirect(url)
        }

        return NextResponse.next()
    } catch {
        //redirect to login page if auth fails
        if (isProtectedPath(pathname)) {
            const url = req.nextUrl.clone()
            url.pathname = "/login"
            url.searchParams.set("next", pathname)
            return NextResponse.redirect(url)
        }
        return NextResponse.next()
    }
}

//run middleware on all pages except /api
export const config = {
    matcher: ["/((?!api).*)"],
}
