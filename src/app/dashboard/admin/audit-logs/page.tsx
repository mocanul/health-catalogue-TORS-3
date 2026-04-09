import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth/requestUser";
import { UserRole } from "@prisma/client";

type AuditLogPageProps = {
    searchParams: Promise<{
        role?: string;
        action?: string;
        date?: string;
        search?: string;
    }>;
};

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "TECHNICIAN", "STAFF", "STUDENT"];

const ACTION_OPTIONS = [
    "TASK_CLOSED",
    "TASK_UPDATED",
    "BOOKING_CREATED",
    "BOOKING_UPDATED",
    "BOOKING_APPROVED",
    "BOOKING_DENIED",
    "CATALOGUE_CREATED",
    "CATALOGUE_UPDATED",
    "CATALOGUE_STOCK_UPDATED",
    "CATALOGUE_DELETED",
] as const;

function formatDateTime(value: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(value);
}

function formatRole(role: UserRole | null) {
    if (!role) {
        return "Unknown";
    }

    return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatActionType(actionType: string) {
    return actionType
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");
}

function getAffectedValue(targetName: string | null, relatedUserName: string | null, targetType: string, targetId: number) {
    if (relatedUserName) {
        return relatedUserName;
    }

    if (targetName) {
        return targetName;
    }

    return `${targetType} #${targetId}`;
}

export default async function AuditLogsPage({ searchParams }: AuditLogPageProps) {
    await requirePageUser(["ADMIN"]);

    const filters = await searchParams;
    const roleFilter = ROLE_OPTIONS.includes(filters.role as UserRole) ? (filters.role as UserRole) : undefined;
    const actionFilter = ACTION_OPTIONS.includes(filters.action as (typeof ACTION_OPTIONS)[number])
        ? filters.action
        : undefined;
    const searchFilter = filters.search?.trim();
    const dateFilter = filters.date?.trim();

    const where: {
        user_role?: UserRole;
        action_type?: string;
        OR?: Array<{
            user_name?: { contains: string; mode: "insensitive" };
            action_description?: { contains: string; mode: "insensitive" };
            related_user_name?: { contains: string; mode: "insensitive" };
            target_name?: { contains: string; mode: "insensitive" };
        }>;
        created_at?: { gte: Date; lt: Date };
    } = {};

    if (roleFilter) {
        where.user_role = roleFilter;
    }

    if (actionFilter) {
        where.action_type = actionFilter;
    }

    if (searchFilter) {
        where.OR = [
            {
                user_name: {
                    contains: searchFilter,
                    mode: "insensitive",
                },
            },
            {
                action_description: {
                    contains: searchFilter,
                    mode: "insensitive",
                },
            },
            {
                related_user_name: {
                    contains: searchFilter,
                    mode: "insensitive",
                },
            },
            {
                target_name: {
                    contains: searchFilter,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (dateFilter) {
        const start = new Date(`${dateFilter}T00:00:00`);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.created_at = {
            gte: start,
            lt: end,
        };
    }

    const logs = await prisma.auditLog.findMany({
        where,
        orderBy: {
            created_at: "desc",
        },
        take: 500,
    });

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                showLogout={true}
                links={[
                    { href: "/dashboard/admin", label: "Activity" },
                    { href: "/dashboard/admin/bookings", label: "Bookings" },
                    { href: "/dashboard/admin/catalogue", label: "Order Catalogue" },
                    { href: "/dashboard/admin/editCatalogue", label: "Edit Catalogue" },
                    { href: "/dashboard/admin/audit-logs", label: "Audit Logs", primary: true },
                    { href: "/dashboard/admin/users", label: "Users" },
                ]}
            />

            <main className="min-h-screen bg-gray-100 px-6 py-10">
                <div className="mx-auto max-w-7xl rounded-3xl border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-pink-100 bg-pink-50/70 px-4 py-4 sm:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                                <p className="mt-2 text-gray-600">
                                    Read-only system activity for staff, technicians, and admins. Newest records appear first.
                                </p>
                            </div>
                        </div>

                        <form className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-[220px_220px_180px_minmax(260px,1fr)_auto]">
                            <select
                                name="role"
                                defaultValue={roleFilter ?? ""}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="">All roles</option>
                                {ROLE_OPTIONS.map((role) => (
                                    <option key={role} value={role}>
                                        {formatRole(role)}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="action"
                                defaultValue={actionFilter ?? ""}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="">All actions</option>
                                {ACTION_OPTIONS.map((action) => (
                                    <option key={action} value={action}>
                                        {formatActionType(action)}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                name="date"
                                defaultValue={dateFilter ?? ""}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />

                            <input
                                type="text"
                                name="search"
                                defaultValue={searchFilter ?? ""}
                                placeholder="Search by user, action, or affected person"
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#B80050] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#980043]"
                                >
                                    Apply
                                </button>
                                <a
                                    href="/dashboard/admin/audit-logs"
                                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Reset
                                </a>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr className="text-sm text-gray-700">
                                    <th className="px-4 py-4 text-left font-semibold">Name</th>
                                    <th className="px-4 py-4 text-left font-semibold">Role</th>
                                    <th className="px-4 py-4 text-left font-semibold">Action</th>
                                    <th className="px-4 py-4 text-left font-semibold">Affected item or person</th>
                                    <th className="px-4 py-4 text-left font-semibold">Action type</th>
                                    <th className="px-4 py-4 text-left font-semibold">Date and time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-gray-600">
                                            No audit logs matched the selected filters.
                                        </td>
                                    </tr>
                                )}

                                {logs.map((log) => (
                                    <tr key={log.id} className="border-t border-gray-100 text-sm text-gray-700">
                                        <td className="px-4 py-4 font-medium text-gray-900">{log.user_name}</td>
                                        <td className="px-4 py-4">{formatRole(log.user_role)}</td>
                                        <td className="px-4 py-4">{log.action_description}</td>
                                        <td className="px-4 py-4">
                                            {getAffectedValue(log.target_name, log.related_user_name, log.target_type, log.target_id)}
                                        </td>
                                        <td className="px-4 py-4">{formatActionType(log.action_type)}</td>
                                        <td className="px-4 py-4">{formatDateTime(log.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
