import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { validateSession } from "@/lib/auth/session";

export type SessionUser = Awaited<ReturnType<typeof validateSession>>;

export async function getRequestUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
        return null;
    }

    return validateSession(token);
}

export async function requirePageUser(allowedRoles?: UserRole[]) {
    const user = await getRequestUser();

    if (!user) {
        redirect("/login");
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        redirect("/login");
    }

    return user;
}
