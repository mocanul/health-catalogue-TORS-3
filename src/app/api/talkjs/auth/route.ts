import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";
import { createTalkJsUserToken, toTalkJsUserId } from "@/lib/talkjs";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;
        const sessionUser = token ? await validateSession(token) : null;

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
        }

        const talkToken = createTalkJsUserToken(toTalkJsUserId(sessionUser.id));

        return new NextResponse(talkToken, {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create TalkJS token." },
            { status: 500 },
        );
    }
}
