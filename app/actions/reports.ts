"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Helper to convert an array of objects to a CSV string
 */
function convertToCSV(data: any[]) {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map((obj) =>
        headers
            .map((header) => {
                let val = obj[header];
                if (val === null || val === undefined) val = "";
                // Escape quotes and wrap in quotes if contains comma
                const stringVal = String(val).replace(/"/g, '""');
                return `"${stringVal}"`;
            })
            .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
}

export async function exportProductsCSV() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const products = await prisma.product.findMany({
        include: {
            category: true,
        },
    });

    const data = products.map((p) => ({
        ID: p.id,
        Name: p.name,
        SKU: p.sku || "",
        Category: p.category.name,
        Price: Number(p.price).toFixed(2),
        Stock: p.stock,
        CreatedAt: p.createdAt.toISOString(),
    }));

    return convertToCSV(data);
}

export async function exportOrdersCSV() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const orders = await prisma.order.findMany({
        include: {
            user: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const data = orders.map((o) => ({
        OrderID: o.id,
        CustomerName: o.user.name || "N/A",
        CustomerEmail: o.user.email,
        Total: Number(o.total).toFixed(2),
        Status: o.status,
        Date: o.createdAt.toISOString(),
    }));

    return convertToCSV(data);
}

export async function exportCustomersCSV() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const users = await prisma.user.findMany({
        where: {
            role: "USER",
        },
        include: {
            orders: true,
        },
    });

    const data = users.map((u) => ({
        CustomerID: u.id,
        Name: u.name || "N/A",
        Email: u.email,
        TotalOrders: u.orders.length,
        TotalSpent: u.orders.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2),
        JoinedAt: u.createdAt.toISOString(),
    }));

    return convertToCSV(data);
}
