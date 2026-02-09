import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { utapi } from "@/lib/utapi";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Upload to UploadThing server-side
        const response = await utapi.uploadFiles(file);

        if (response.error) {
            console.error("UploadThing error:", response.error);
            return NextResponse.json({ error: "Failed to upload to storage" }, { status: 500 });
        }

        const url = response.data.url;

        // Update user profile with new avatar URL
        await prisma.user.update({
            where: { email: session.user.email },
            data: { image: url },
        });

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
