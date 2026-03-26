import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const user = await validateSession(token);
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const fileExtension = file.name.split(".").pop();

    const result = await cloudinary.uploader.upload(base64, {
        folder: "hs_forms",
        public_id: `user_${user.id}_${Date.now()}.${fileExtension}`,
        resource_type: "raw",
    });

    return NextResponse.json({ url: result.secure_url });
}