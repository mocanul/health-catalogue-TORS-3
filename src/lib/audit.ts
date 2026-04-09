import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AuditActor = {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: UserRole;
};

type AuditLogInput = {
    actor: AuditActor;
    actionType: string;
    actionDescription: string;
    targetType: string;
    targetId: number;
    targetName?: string | null;
    relatedUserName?: string | null;
    oldValue?: Prisma.InputJsonValue | null;
    newValue?: Prisma.InputJsonValue | null;
};

type AuditClient = Prisma.TransactionClient | typeof prisma;

export function getAuditActorName(actor: Pick<AuditActor, "first_name" | "last_name" | "email">) {
    const fullName = `${actor.first_name ?? ""} ${actor.last_name ?? ""}`.trim();
    return fullName || actor.email;
}

export function getRoleLabel(role: UserRole) {
    switch (role) {
        case "ADMIN":
            return "Admin";
        case "TECHNICIAN":
            return "Senior Tech";
        case "STAFF":
            return "Staff";
        case "STUDENT":
            return "Student";
        default:
            return role;
    }
}

export async function createAuditLog(
    input: AuditLogInput,
    client: AuditClient = prisma,
) {
    await client.auditLog.create({
        data: {
            user_id: input.actor.id,
            user_name: getAuditActorName(input.actor),
            user_role: input.actor.role,
            action_type: input.actionType,
            action_description: input.actionDescription,
            target_type: input.targetType,
            target_id: input.targetId,
            target_name: input.targetName ?? null,
            related_user_name: input.relatedUserName ?? null,
            old_value: input.oldValue ?? Prisma.JsonNull,
            new_value: input.newValue ?? Prisma.JsonNull,
        },
    });
}
