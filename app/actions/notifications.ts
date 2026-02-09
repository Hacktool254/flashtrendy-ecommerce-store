"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function checkNewOrders(since: Date) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const newOrders = await prisma.order.findMany({
        where: {
            createdAt: {
                gt: since,
            },
            status: "PROCESSING",
        },
        include: {
            user: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return newOrders;
}

export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const notifications = await prisma.notification.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });

    return notifications;
}

export async function getUnreadCount() {
    const session = await auth();
    if (!session?.user?.id) return 0;

    const count = await prisma.notification.count({
        where: {
            userId: session.user.id,
            read: false,
        },
    });

    return count;
}

export async function markAsRead(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await prisma.notification.update({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                read: true,
            },
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Failed to mark notification as read" };
    }
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                read: false,
            },
            data: {
                read: true,
            },
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { error: "Failed to mark all as read" };
    }
}

export async function createNotification(userId: string, data: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title: data.title,
                message: data.message,
                type: data.type,
                link: data.link,
            },
        });
        return { success: true, notification };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return { error: "Failed to create notification" };
    }
}

export async function notifyAdmins(data: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}) {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: "ADMIN",
            },
            select: {
                id: true,
            },
        });

        const notifications = await Promise.all(
            admins.map((admin) =>
                prisma.notification.create({
                    data: {
                        userId: admin.id,
                        title: data.title,
                        message: data.message,
                        type: data.type,
                        link: data.link,
                    },
                })
            )
        );

        return { success: true, count: notifications.length };
    } catch (error) {
        console.error("Failed to notify admins:", error);
        return { error: "Failed to notify admins" };
    }
}
