"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { error: "Failed to update user role" };
    }
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
        return { error: "Cannot delete your own account" };
    }

    try {
        await prisma.user.delete({
            where: { id: userId },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { error: "Failed to delete user" };
    }
}
