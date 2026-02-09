"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function addAddress(data: z.infer<typeof addressSchema>) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to add an address" };
    }

    const result = addressSchema.safeParse(data);
    if (!result.success) {
        return { error: "Invalid address data" };
    }

    try {
        // If setting as default, unset other default addresses
        if (result.data.isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        await prisma.address.create({
            data: {
                userId: session.user.id,
                ...result.data,
            },
        });

        revalidatePath("/dashboard/addresses");
        return { success: true };
    } catch (error) {
        console.error("Failed to add address:", error);
        return { error: "Failed to add address" };
    }
}

export async function updateAddress(id: string, data: z.infer<typeof addressSchema>) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to update an address" };
    }

    const result = addressSchema.safeParse(data);
    if (!result.success) {
        return { error: "Invalid address data" };
    }

    try {
        const existingAddress = await prisma.address.findUnique({
            where: { id },
        });

        if (!existingAddress || existingAddress.userId !== session.user.id) {
            return { error: "Address not found" };
        }

        // If setting as default, unset other default addresses
        if (result.data.isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId: session.user.id,
                    isDefault: true,
                    id: { not: id }
                },
                data: { isDefault: false },
            });
        }

        await prisma.address.update({
            where: { id },
            data: result.data,
        });

        revalidatePath("/dashboard/addresses");
        return { success: true };
    } catch (error) {
        console.error("Failed to update address:", error);
        return { error: "Failed to update address" };
    }
}

export async function deleteAddress(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to delete an address" };
    }

    try {
        const existingAddress = await prisma.address.findUnique({
            where: { id },
        });

        if (!existingAddress || existingAddress.userId !== session.user.id) {
            return { error: "Address not found" };
        }

        await prisma.address.delete({
            where: { id },
        });

        revalidatePath("/dashboard/addresses");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete address:", error);
        return { error: "Failed to delete address" };
    }
}

export async function setDefaultAddress(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to set default address" };
    }

    try {
        const existingAddress = await prisma.address.findUnique({
            where: { id },
        });

        if (!existingAddress || existingAddress.userId !== session.user.id) {
            return { error: "Address not found" };
        }

        await prisma.$transaction([
            prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false },
            }),
            prisma.address.update({
                where: { id },
                data: { isDefault: true },
            }),
        ]);

        revalidatePath("/dashboard/addresses");
        return { success: true };
    } catch (error) {
        console.error("Failed to set default address:", error);
        return { error: "Failed to set default address" };
    }
}
