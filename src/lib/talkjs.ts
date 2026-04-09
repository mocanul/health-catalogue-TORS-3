import crypto from "crypto";

const TALKJS_BASE_URL = "https://api.talkjs.com";

function base64UrlEncode(input: string | Buffer) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function requiredEnv(name: string) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export function getTalkJsAppId() {
    return requiredEnv("TALKJS_APP_ID");
}

function getTalkJsSecretKey() {
    return requiredEnv("TALKJS_SECRET_KEY");
}

function createTalkJsJwt(payload: Record<string, string | number>) {
    const header = {
        alg: "HS256",
        typ: "JWT",
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createHmac("sha256", getTalkJsSecretKey())
        .update(unsignedToken)
        .digest();

    return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

export function createTalkJsUserToken(userId: string) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 60 * 60;

    return createTalkJsJwt({
        tokenType: "user",
        iss: getTalkJsAppId(),
        sub: userId,
        exp: expiresAt,
    });
}

function createTalkJsAppToken() {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 10 * 60;

    return createTalkJsJwt({
        tokenType: "app",
        iss: getTalkJsAppId(),
        exp: expiresAt,
    });
}

export function toTalkJsUserId(userId: number) {
    return `tors-user-${userId}`;
}

export function toTalkJsConversationId(bookingId: number) {
    return `tors-booking-${bookingId}`;
}

export async function talkJsApiFetch(path: string, init?: RequestInit) {
    const response = await fetch(`${TALKJS_BASE_URL}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${createTalkJsAppToken()}`,
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TalkJS API error (${response.status}): ${errorText}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}
