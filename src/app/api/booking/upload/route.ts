import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/auth/session";
import cloudinary from "@/lib/cloudinary";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

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
    const fileExtension = file.name.split(".").pop();
    const safeExtension = fileExtension ? `.${fileExtension}` : "";
    const fileName = `user_${user.id}_${Date.now()}${safeExtension}`;
    const hasCloudinaryConfig =
        !!process.env.CLOUDINARY_CLOUD_NAME &&
        !!process.env.CLOUDINARY_API_KEY &&
        !!process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinaryConfig) {
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64, {
            folder: "hs_forms",
            public_id: `user_${user.id}_${Date.now()}.${fileExtension}`,
            resource_type: "raw",
        });

        return NextResponse.json({ url: result.secure_url });
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "hs_forms");
    await mkdir(uploadDirectory, { recursive: true });

    const savedFilePath = path.join(uploadDirectory, fileName);
    await writeFile(savedFilePath, buffer);

    return NextResponse.json({ url: `/uploads/hs_forms/${fileName}` });
}
