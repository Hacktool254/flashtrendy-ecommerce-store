"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to manage your wishlist" };
    }

    try {
        const existingEntry = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId,
                },
            },
        });

        if (existingEntry) {
            await prisma.wishlist.delete({
                where: {
                    id: existingEntry.id,
                },
            });
            revalidatePath("/dashboard/wishlist");
            return { success: true, action: "removed" };
        } else {
            await prisma.wishlist.create({
                data: {
                    userId: session.user.id,
                    productId,
                },
            });
            revalidatePath("/dashboard/wishlist");
            return { success: true, action: "added" };
        }
    } catch (error) {
        console.error("Failed to toggle wishlist:", error);
        return { error: "Failed to update wishlist" };
    }
}

export async function getWishlist() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    try {
        const wishlist = await prisma.wishlist.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                product: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return wishlist;
    } catch (error) {
        console.error("Failed to get wishlist:", error);
        return [];
    }
}
