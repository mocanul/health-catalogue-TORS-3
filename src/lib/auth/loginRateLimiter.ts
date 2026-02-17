import { prisma } from "@/lib/prisma";

//login attempts constraints
const maxAttempts = 5;
const lockMinutes = 5;

//decides whether login can proceed or not 
//this is decided based on the amount of attempts, which given the logic it ll return true or false
export type LoginRateResult = | { allowed: true } | {
    allowed: false;
    retryAfterSec: number
}; //indicates after how long the user can try again

//normalizes email
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

//checks if user account is limited
export async function checkLoginRateLimit(
    email: string
): Promise<LoginRateResult> {
    const fails = await prisma.loginAttempt.findMany({

        //where email and failed login attempt
        where: {
            email,
            success: false,
        },

        //oldest attempt will be the last of the 5 attempts taken from db
        orderBy: {
            attempted_at: "desc",
        },

        //only extracts 5 failed login attempts
        take: maxAttempts,
        select: {
            attempted_at: true,
        },
    });

    //if failed attempts are less than 5, allow login
    if (fails.length < maxAttempts) {
        return { allowed: true };
    }

    //if the oldest login attempt out of all 5 is less then 5 minutes ago
    //calculate when the lock should expire based on the oldest attempt
    const oldestOfLastFive = fails[fails.length - 1].attempted_at;

    //calculates 5 minutes from oldest attempt
    const lockUntil = new Date(oldestOfLastFive.getTime() + lockMinutes * 60_000);

    //if new date(now) passes 5 minutes
    //allow user to login
    if (lockUntil <= new Date()) {
        return { allowed: true };
    }

    //calculate how long left until user can login
    const retryAfterSec = Math.ceil(
        (lockUntil.getTime() - Date.now()) / 1000
    );

    //if date(now) is within lock time
    //return false, now allowing user to log in
    return {
        allowed: false,
        retryAfterSec,
    };
}
