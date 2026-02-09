"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: { user: true },
        });

        // Send order status update email and notification
        try {
            const { sendOrderStatusUpdateEmail } = await import("@/app/actions/emails");
            const { createNotification } = await import("@/app/actions/notifications");

            await Promise.all([
                sendOrderStatusUpdateEmail(order),
                createNotification(order.userId, {
                    title: "Order Status Updated",
                    message: `Your order #${order.id.slice(-8)} is now ${status.toLowerCase()}`,
                    type: "ORDER",
                    link: `/dashboard/orders/${order.id}`
                })
            ]);
        } catch (error) {
            console.error("Failed to send status update notification:", error);
        }

        revalidatePath("/admin/orders");
        revalidatePath(`/dashboard/orders`);
        return { success: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { error: "Failed to update order status" };
    }
}

export async function deleteOrder(orderId: string) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.order.delete({
            where: { id: orderId },
        });

        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error) {
        console.error("Error deleting order:", error);
        return { error: "Failed to delete order" };
    }
}
