"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().min(1, "Price is required"),
    images: z.array(z.string()).min(1, "At least one image is required"),
    categoryId: z.string().min(1, "Category is required"),
    stock: z.string().min(1, "Stock is required"),
});

export async function createProduct(data: z.infer<typeof productSchema>) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        const validatedFields = productSchema.safeParse(data);

        if (!validatedFields.success) {
            return { error: "Invalid fields" };
        }

        const { name, description, price, images, categoryId, stock } = validatedFields.data;

        await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                images,
                categoryId,
                stock: parseInt(stock),
            },
        });

        revalidatePath("/admin/products");
        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Error creating product:", error);
        return { error: "Failed to create product" };
    }
}

export async function updateProduct(id: string, data: z.infer<typeof productSchema>) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        const validatedFields = productSchema.safeParse(data);

        if (!validatedFields.success) {
            return { error: "Invalid fields" };
        }

        const { name, description, price, images, categoryId, stock } = validatedFields.data;

        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                images,
                categoryId,
                stock: parseInt(stock),
            },
        });

        revalidatePath("/admin/products");
        revalidatePath(`/products/${id}`);
        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Error updating product:", error);
        return { error: "Failed to update product" };
    }
}

export async function deleteProduct(id: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.product.delete({
            where: { id },
        });

        revalidatePath("/admin/products");
        revalidatePath("/products");
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { error: "Failed to delete product" };
    }
}
